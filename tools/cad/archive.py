"""Resumable CAD inventory, reconciliation and verified PDF import. Python 3 + pypdf."""
import argparse
import hashlib
import json
import re
import shutil
import unicodedata
from pathlib import Path
from pypdf import PdfReader, PdfWriter

ROOT = Path(__file__).resolve().parents[2]
CONTENT = ROOT / 'content/policy/Debate/DebateArchive/CAD'
DATA = ROOT / 'tools/cad/data'


def norm(value):
    return re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode().lower())


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def save(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(value, indent=2, ensure_ascii=False) + '\n'
    if path.exists() and path.read_text(encoding='utf-8') == text:
        return
    temp = path.with_suffix('.tmp')
    temp.write_text(text, encoding='utf-8')
    temp.replace(path)


def read(path, default):
    return json.loads(path.read_text(encoding='utf-8')) if path.exists() else default


def key(volume, title):
    return 'cad-' + str(volume) + '-' + hashlib.sha256(norm(title).encode()).hexdigest()[:12]


def author_match(left, right):
    # Name order and punctuation differ between existing tables and EBSCO.
    words = lambda s: set(re.findall(r'[a-z]{3,}', s.lower())) - {'and', 'iii', 'more'}
    a, b = words(left), words(right)
    return bool(a & b) and len(a & b) >= min(len(a), len(b)) / 2


def table_rows(text):
    for line in text.splitlines():
        if not line.lstrip().startswith('|'):
            continue
        cells = [c.strip() for c in re.split(r'(?<!\\)\|', line.strip().strip('|'))]
        if len(cells) < 3 or not cells[1] or cells[1] == 'Title' or re.fullmatch(r'[-: ]+', cells[1]):
            continue
        yield cells[:3]


def inspect_pdf(path):
    if not path.read_bytes()[:1024].lstrip().startswith(b'%PDF-'):
        raise ValueError('Not a PDF (possibly a login page)')
    reader = PdfReader(path, strict=False)
    if reader.is_encrypted or not reader.pages:
        raise ValueError('Encrypted or empty PDF')
    # Resolve every page to detect truncated files; identity comes from opening pages.
    for page in reader.pages:
        _ = page.mediabox
    text = '\n'.join(page.extract_text() or '' for page in reader.pages[:2])
    return {'sha256': digest(path), 'pdf_pages': len(reader.pages)}, text


class Archive:
    def __init__(self, content=CONTENT, data=DATA):
        self.content, self.data = Path(content), Path(data)
        self.path = self.data / 'manifest.json'
        self.manifest = read(self.path, {'version': 1, 'records': [], 'coverage': {}})
        self.display_titles = read(self.data / 'display-titles.json', {})

    def persist(self):
        self.manifest['records'].sort(key=lambda r: (r['volume'], r['id']))
        save(self.path, self.manifest)

    def inventory(self):
        records = self.manifest['records']
        for page in sorted(self.content.glob('CAD*.md')):
            volume = int(re.fullmatch(r'CAD(\d+)\.md', page.name)[1])
            raw = page.read_text(encoding='utf-8-sig')
            date = re.search(r'^created:\s*(\S+)', raw, re.M)
            for link, title, authors in table_rows(raw):
                target = re.search(r'\]\(([^)]+\.pdf)\)', link) if 'in full issue' not in link else None
                local = f'{volume}/{target[1]}' if target else None
                existing = next((r for r in records if
                    (local and r.get('local_path') == local) or
                    (not local and r['volume'] == volume and norm(title) in [norm(r['title'])] + [norm(t) for t in r.get('alternate_titles', [])])), None)
                if existing is None:
                    record_id = key(volume, title)
                    if any(r['id'] == record_id for r in records):
                        record_id += '-' + hashlib.sha256((local or authors).encode()).hexdigest()[:8]
                    existing = {'id': record_id, 'volume': volume, 'title': title,
                                'authors': authors, 'sources': [], 'alternate_titles': [],
                                'status': 'missing', 'kind': 'full_issue' if 'Full Text' in link else 'article',
                                'local_date': date[1] if date else None}
                    records.append(existing)
                if local:
                    file = self.content / local
                    existing['local_path'] = local
                    if file.exists():
                        existing.setdefault('baseline_sha256', digest(file))
                        existing['sha256'] = digest(file)
                        if existing['status'] not in ('acquired', 'invalid', 'identity_mismatch'):
                            existing['status'] = 'present'
                    else:
                        existing['status'] = 'missing'
                elif 'see full text' in link.lower():
                    existing['status'] = 'full_issue_only'
                    existing['parent_path'] = f'{volume}/CAD{volume}.pdf'
            self.manifest['coverage'].setdefault(str(volume), {'status': 'unverified'})
        for volume in range(1, 39):
            self.manifest['coverage'].setdefault(str(volume), {'status': 'unverified', 'note': 'No local volume page'})
        self.persist()

    def reconcile(self, incoming):
        records = self.manifest['records']
        for source in incoming:
            volume, title = int(source['volume']), source['title']
            sid = source['source_id']
            hits = [r for r in records if any(s['source_id'] == sid for s in r['sources'])]
            if not hits:
                aliases = [title] + source.get('alternate_titles', [])
                hits = [r for r in records if r['volume'] == volume and
                        any(norm(t) == norm(a) for t in [r['title']] + r.get('alternate_titles', []) for a in aliases)
                        and author_match(r['authors'], source['authors'])
                        and (not r.get('pages') or not source.get('pages') or r['pages'] == source['pages'])]
                if len(hits) > 1:
                    hits = [r for r in hits if author_match(r['authors'], source['authors'])]
            if not hits:
                hits = [r for r in records if r['volume'] == volume and source.get('pages') and
                        r.get('pages') == source['pages'] and norm(r['authors']) == norm(source['authors'])]
            if len(hits) > 1:
                self.manifest.setdefault('exceptions', {})[sid] = 'Ambiguous record match'
                continue
            if hits:
                record = hits[0]
            else:
                identifier = key(volume, title)
                if any(r['id'] == identifier for r in records):
                    identifier += '-' + hashlib.sha256(sid.encode()).hexdigest()[:8]
                record = {'id': identifier, 'volume': volume, 'title': title,
                          'authors': source['authors'], 'sources': [], 'alternate_titles': [], 'status': 'missing', 'kind': source.get('kind', 'article')}
                records.append(record)
            if norm(record['title']) != norm(title):
                record['alternate_titles'] = sorted(set(record['alternate_titles'] + [record['title'], title]))
            # Imported metadata is explicitly curated; never retain temporary query tokens.
            for field in ('title', 'authors', 'pages', 'issue', 'date', 'kind', 'authors_incomplete'):
                if source.get(field):
                    if record.get('metadata_evidence') and field in ('title', 'authors', 'pages', 'authors_incomplete'):
                        continue
                    if field in ('title', 'authors') and record.get('local_path') and not source.get('alternate_titles'):
                        continue
                    record[field] = source[field]
            record['alternate_titles'] = sorted(set(record['alternate_titles'] + source.get('alternate_titles', [])))
            ref = {k: source[k] for k in ('source_id', 'url', 'provider', 'rights') if k in source}
            if '?' in ref.get('url', ''):
                raise ValueError('Source URLs must be stable links without query credentials')
            prior = next((s for s in record['sources'] if s['source_id'] == sid), {})
            record['sources'] = [s for s in record['sources'] if s['source_id'] != sid] + [{**prior, **ref}]
        self.persist()

    def record(self, identifier):
        return next(r for r in self.manifest['records'] if r['id'] == identifier or any(s['source_id'] == identifier for s in r['sources']))

    def import_pdf(self, identifier, file):
        record = self.record(identifier)
        info, text = inspect_pdf(Path(file))
        identity = norm(text)
        titles = [record['title']] + record.get('alternate_titles', [])
        # Long title prefixes tolerate PDF ligatures and punctuation extraction defects.
        reviewed = record.get('identity_review', {}).get('sha256') == info['sha256']
        if not reviewed and not any(norm(t)[:65] in identity for t in titles):
            raise ValueError('PDF identity uncertain: title not found in opening pages')
        if not reviewed and len(norm(record['title'])) < 25:
            # Generic titles such as Response and Book Reviews need a byline too.
            names = record['authors'].split(';')
            surnames = [norm(n.split(',')[0]) for n in names if ',' in n]
            if not surnames or not all(n in identity for n in surnames):
                raise ValueError('PDF identity uncertain: short title requires matching author names')
        if record.get('local_path') and (self.content / record['local_path']).exists():
            if digest(self.content / record['local_path']) == info['sha256']:
                return False
            raise ValueError('Existing PDF will not be overwritten')
        name = 'CAD' + str(record['volume']) + re.sub(r'[^A-Za-z0-9_-]', '', unicodedata.normalize('NFKD', record['title']).encode('ascii', 'ignore').decode())[:140] + '.pdf'
        dest = self.content / str(record['volume']) / name
        if dest.exists() and digest(dest) != info['sha256']:
            dest = dest.with_name(dest.stem + '-' + record['id'].split('-')[-1] + '.pdf')
        if dest.exists() and digest(dest) != info['sha256']:
            raise ValueError('Stable filename collision')
        dest.parent.mkdir(parents=True, exist_ok=True)
        if not dest.exists():
            temp = dest.with_suffix('.part')
            shutil.copyfile(file, temp)
            temp.replace(dest)
        record.update(info, local_path=dest.relative_to(self.content).as_posix(), status='acquired', identity_verified=True)
        self.persist()
        return True

    def review(self, identifier, file, evidence):
        """Record a human/visual check tied to exact bytes, never a blanket override."""
        if not evidence or len(evidence.strip()) < 20:
            raise ValueError('Describe verified title, authors, and printed pages')
        info, _ = inspect_pdf(Path(file))
        self.record(identifier)['identity_review'] = {'sha256': info['sha256'], 'evidence': evidence}
        self.persist()

    def extract(self, identifier):
        record = self.record(identifier)
        boundary = record.get('extraction')
        if not boundary or not boundary.get('evidence'):
            raise ValueError('Verified page boundaries and evidence are required')
        parent = self.content / boundary['parent_path']
        if digest(parent) != boundary['parent_sha256']:
            raise ValueError('Parent PDF checksum changed')
        first, last = boundary['pdf_start'], boundary['pdf_end']
        reader = PdfReader(parent)
        if not 1 <= first <= last <= len(reader.pages):
            raise ValueError('Invalid one-based PDF page range')
        if record.get('local_path'):
            return False
        stage = self.data / 'staging'
        stage.mkdir(parents=True, exist_ok=True)
        target = stage / (record['id'] + '.pdf')
        writer = PdfWriter()
        for page in reader.pages[first-1:last]: writer.add_page(page)
        with target.open('wb') as stream: writer.write(stream)
        result = self.import_pdf(identifier, target)
        target.unlink()
        return result

    def validate(self, links=False):
        errors = []
        ids = [r['id'] for r in self.manifest['records']]
        if len(ids) != len(set(ids)):
            errors.append({'error': 'Duplicate manifest identifiers'})
        paths = {r.get('local_path') for r in self.manifest['records']}
        for r in self.manifest['records']:
            if not r.get('local_path'):
                continue
            try:
                info, _ = inspect_pdf(self.content / r['local_path'])
                if r.get('baseline_sha256') and r['baseline_sha256'] != info['sha256']:
                    raise ValueError('Original checksum changed')
                if r.get('sha256') and r['sha256'] != info['sha256']:
                    raise ValueError('Validated checksum changed')
                r.update(info)
            except Exception as exc:
                errors.append({'id': r['id'], 'error': str(exc)})
        for file in self.content.rglob('*.pdf'):
            if file.relative_to(self.content).as_posix() not in paths:
                errors.append({'path': file.name, 'error': 'Unindexed PDF'})
        if links:
            linked = set()
            for page in self.content.glob('CAD*.md'):
                raw = page.read_text(encoding='utf-8-sig')
                names = re.findall(r'\]\(([^)]+\.pdf(?:#[^)]*)?)\)', raw)
                if len(names) != len(set(names)):
                    errors.append({'path': page.name, 'error': 'Duplicate PDF table links'})
                for name in names:
                    matches = list(self.content.rglob(Path(name.split('#')[0]).name))
                    if len(matches) != 1:
                        errors.append({'path': page.name, 'error': f'Unresolved or ambiguous PDF link: {name}'})
                    else: linked.add(matches[0].relative_to(self.content).as_posix())
            for path in paths - {None} - linked:
                errors.append({'path': path, 'error': 'PDF has no volume table link'})
            index = (self.content / 'index.md').read_text(encoding='utf-8')
            for volume in {r['volume'] for r in self.manifest['records']}:
                if f'![[CAD{volume}|' not in index:
                    errors.append({'volume': volume, 'error': 'Missing index transclusion'})
        self.manifest['validation_errors'] = errors
        self.persist()
        return errors

    def sync_downloads(self, directory):
        imported, unresolved = [], []
        hashes = {r.get('sha256') for r in self.manifest['records']}
        for file in sorted(Path(directory).glob('EBSCO-FullText-*.pdf')):
            if digest(file) in hashes:
                continue
            try:
                info, text = inspect_pdf(file)
                matches = [r for r in self.manifest['records'] if not r.get('local_path') and
                           any(norm(t)[:65] in norm(text) for t in [r['title']] + r.get('alternate_titles', []))]
                if len(matches) != 1:
                    raise ValueError(f'{len(matches)} possible identities; needs review')
                self.import_pdf(matches[0]['id'], file)
                imported.append(matches[0]['id'])
                hashes.add(info['sha256'])
            except Exception as exc:
                unresolved.append({'file': file.name, 'error': str(exc)})
        save(self.data / 'download-exceptions.json', unresolved)
        return {'imported': imported, 'unresolved': unresolved}

    def render(self, volumes):
        for volume in volumes:
            records = [r for r in self.manifest['records'] if r['volume'] == volume]
            if not records:
                continue
            page = self.content / f'CAD{volume}.md'
            original = page.read_text(encoding='utf-8-sig') if page.exists() else f'---\ntitle: Volume {volume}\ndraft: false\ntags:\n  - debate/journal\ndescription:\ncreated:\nmodified:\nholiday:\n---\n\n'
            lines = original.splitlines(keepends=True)
            table = [i for i, line in enumerate(lines) if line.lstrip().startswith('|')]
            start, end = (min(table), max(table)+1) if table else (len(lines), len(lines))
            def order(r):
                match = re.match(r'(\d+)', r.get('pages', ''))
                roman = {'i': -10, 'ii': -9, 'iii': -8, 'iv': -7, 'v': -6}
                old_titles = [norm(c[1]) for c in table_rows(original)]
                original_order = next((i for i,t in enumerate(old_titles) if t in [norm(r['title'])]+[norm(a) for a in r.get('alternate_titles', [])]), 999999)
                return (0 if r.get('kind') == 'full_issue' else 1, int(match[1]) if match else roman.get(r.get('pages', '').split('-')[0], 999999), original_order, records.index(r))
            rows = ['| Link | Title | Author |\n', '| --- | --- | --- |\n']
            for r in sorted(records, key=order):
                link = '#debate/journal/missing'
                if r.get('local_path') and (self.content / r['local_path']).exists():
                    label = 'different article — needs replacement' if r['status'] == 'identity_mismatch' else ('Full Text' if r.get('kind') == 'full_issue' else 'link')
                    link = f'[{label}]({Path(r["local_path"]).name})'
                elif r['status'] == 'full_issue_only':
                    link = f'[in full issue]({Path(r["parent_path"]).name}#page={r.get("pdf_start", 1)})' if r.get('parent_path') else 'see full text'
                title = self.display_titles.get(r['id'], r['title'])
                authors = r.get('display_authors', r['authors'])
                rows.append('| ' + ' | '.join([link, title.replace('|', '\\|'), authors.replace('|', '\\|')]) + ' |\n')
            output = ''.join(lines[:start] + rows + lines[end:])
            if output != original:
                page.write_text(output, encoding='utf-8')
        index = self.content / 'index.md'
        raw = index.read_text(encoding='utf-8')
        for volume in sorted(volumes):
            if f'![[CAD{volume}|' not in raw and (self.content / f'CAD{volume}.md').exists():
                block = f'# Volume {volume}\n![[CAD{volume}|CAD{volume}]]\n'
                later = re.search(r'^# Volume (' + '|'.join(str(v) for v in range(volume+1, 100)) + r')\s*$', raw, re.M)
                raw = raw[:later.start()] + block + raw[later.start():] if later else raw.rstrip() + '\n' + block
        if raw != index.read_text(encoding='utf-8'):
            index.write_text(raw, encoding='utf-8')

    def report(self):
        lines = ['# CAD coverage report', '', 'Coverage is unverified unless an authoritative complete issue inventory has been reconciled.', '', '| Volume | Local PDFs | Missing records | Full issue only | Unresolved identity | Coverage |', '| --- | --- | --- | --- | --- | --- |']
        counts = {s: sum(r['status'] == s for r in self.manifest['records']) for s in ('present', 'acquired', 'missing', 'full_issue_only', 'identity_mismatch')}
        lines[3:3] = ['', f'Original files: {sum("baseline_sha256" in r for r in self.manifest["records"])} (including {counts["identity_mismatch"]} known identity mismatches); acquired: {counts["acquired"]}; missing: {counts["missing"]}; covered within full issue: {counts["full_issue_only"]}.', '', 'See [source reconciliation](source-reconciliation.md) and [exceptions](exceptions.md) for evidence and remaining limitations.', '']
        for volume, coverage in sorted(self.manifest['coverage'].items(), key=lambda p: int(p[0])):
            rows = [r for r in self.manifest['records'] if r['volume'] == int(volume)]
            lines.append(f'| {volume} | {sum(bool(r.get("local_path")) for r in rows)} | {sum(r["status"] == "missing" for r in rows)} | {sum(r["status"] == "full_issue_only" for r in rows)} | {sum(r["status"] == "identity_mismatch" for r in rows)} | {coverage["status"]} |')
        lines += ['', '## Missing or unresolved records', '']
        for r in self.manifest['records']:
            if r['status'] not in ('present', 'acquired'):
                lines.append(f'- Volume {r["volume"]}: {r["title"]} — {r["status"]} (`{r["id"]}`)')
        lines += ['', '## Validation exceptions', '', json.dumps(self.manifest.get('validation_errors', []), indent=2), '', '## Matching exceptions', '', json.dumps(self.manifest.get('exceptions', {}), indent=2), '']
        self.data.mkdir(parents=True, exist_ok=True)
        (self.data / 'coverage.md').write_text('\n'.join(lines), encoding='utf-8')
        save(self.data / 'pending-downloads.json', [r for r in self.manifest['records'] if not r.get('local_path') or r['status'] == 'identity_mismatch'])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('operation', choices=['inventory', 'reconcile', 'import', 'review', 'extract', 'validate', 'render', 'report', 'sync-downloads'])
    parser.add_argument('--file', type=Path)
    parser.add_argument('--id')
    parser.add_argument('--evidence')
    parser.add_argument('--links', action='store_true', help='Also validate volume table and index links')
    parser.add_argument('--volumes', type=int, nargs='+')
    args = parser.parse_args()
    if args.operation in ('reconcile', 'import', 'review', 'sync-downloads') and not args.file:
        parser.error('--file is required for this operation')
    if args.operation in ('import', 'review', 'extract') and not args.id:
        parser.error('--id is required for this operation')
    if args.operation == 'review' and not args.evidence:
        parser.error('--evidence is required for review')
    archive = Archive()
    if args.operation == 'inventory': archive.inventory()
    elif args.operation == 'reconcile': archive.reconcile(read(args.file, []))
    elif args.operation == 'import': print('Imported' if archive.import_pdf(args.id, args.file) else 'Already present')
    elif args.operation == 'review': archive.review(args.id, args.file, args.evidence)
    elif args.operation == 'extract': print('Imported' if archive.extract(args.id) else 'Already present')
    elif args.operation == 'sync-downloads': print(json.dumps(archive.sync_downloads(args.file), indent=2))
    elif args.operation == 'validate':
        errors = archive.validate(links=args.links)
        print(json.dumps(errors, indent=2))
        archive.report()
        if errors: raise SystemExit(1)
    elif args.operation == 'render': archive.render(args.volumes or [])
    archive.report()


if __name__ == '__main__':
    main()
