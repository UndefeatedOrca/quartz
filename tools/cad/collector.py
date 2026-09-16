"""Local-only bridge for transferring public bibliography from the browser.

Run this while collecting rendered EBSCO result batches; paste the JSON array
into http://127.0.0.1:8766. No cookies or authentication data are accepted.
"""
import json
import html
import time
import urllib.request
import urllib.error
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import urlsplit

DEST = Path(__file__).resolve().parent / 'data/ebsco-records.json'
PAGE = b'''<!doctype html><html><head><meta charset="utf-8"><title>CAD local bibliography collector</title></head>
<body><h1>CAD local bibliography collector</h1><p>Paste public bibliographic records only.</p>
<form method="post" action="/metadata" accept-charset="UTF-8"><textarea name="records" aria-label="Bibliographic records" rows="20" cols="100"></textarea><br><button>Save batch</button></form></body></html>'''


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/queue':
            from archive import Archive
            records = [dict(id=r['id'], title=r['title'], volume=r['volume'], url=s['url'])
                       for r in Archive().manifest['records'] if not r.get('local_path')
                       for s in r['sources'] if s.get('provider', '').startswith('EBSCO')]
            body = ('<!doctype html><meta charset="utf-8"><pre>' + html.escape(json.dumps(records, ensure_ascii=False)) + '</pre>').encode()
            self.send_response(200); self.send_header('Content-Type', 'text/html; charset=utf-8'); self.end_headers(); self.wfile.write(body); return
        if self.path == '/download':
            body = b'''<!doctype html><meta charset="utf-8"><h1>CAD PDF transfer</h1><form method="post" action="/download" accept-charset="UTF-8"><textarea name="records" aria-label="PDF transfer"></textarea><button>Save PDF</button></form>'''
            self.send_response(200); self.send_header('Content-Type','text/html; charset=utf-8'); self.end_headers(); self.wfile.write(body); return
        self.send_response(200); self.send_header('Content-Type', 'text/html; charset=utf-8'); self.end_headers(); self.wfile.write(PAGE)

    def do_POST(self):
        from urllib.parse import parse_qs
        try:
            if self.path not in ('/metadata', '/download') or self.headers.get('Origin') != 'http://127.0.0.1:8766':
                raise ValueError('Local origin required')
            length = int(self.headers['Content-Length'])
            if length > 1000000: raise ValueError('Batch too large')
            records = json.loads(parse_qs(self.rfile.read(length).decode())['records'][0])
            if self.path == '/download':
                message = self.transfer(records)
                self.send_response(200); self.send_header('Content-Type','text/html; charset=utf-8'); self.end_headers(); self.wfile.write(('<!doctype html><meta charset="utf-8"><p>'+html.escape(message)+'</p>').encode()); return
            old = json.loads(DEST.read_text(encoding='utf-8')) if DEST.exists() else []
            by_id = {r['source_id']: r for r in old}
            for r in records:
                allowed = {'title', 'authors', 'volume', 'date', 'pages', 'source_id', 'url', 'provider', 'authors_incomplete'}
                if set(r) - allowed: raise ValueError('Unknown fields')
                url = urlsplit(r['url'])
                if url.hostname != 'research.ebsco.com' or url.query or url.fragment:
                    raise ValueError('Only stable EBSCO record links allowed')
                if not isinstance(r['volume'], int) or not r['title']: raise ValueError('Invalid record')
                by_id[r['source_id']] = r
            DEST.parent.mkdir(parents=True, exist_ok=True)
            temp = DEST.with_suffix('.tmp')
            temp.write_text(json.dumps(list(by_id.values()), ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
            temp.replace(DEST)
            message = f'Saved {len(records)} records; {len(by_id)} unique records total.'
            self.send_response(200)
        except Exception as exc:
            message = str(exc); self.send_response(400)
        self.send_header('Content-Type', 'text/plain'); self.end_headers(); self.wfile.write(message.encode())

    def transfer(self, request):
        from archive import Archive, ROOT, inspect_pdf, read, save, digest
        url = urlsplit(request['url'])
        if url.scheme != 'https' or url.hostname != 'content.ebscohost.com' or url.path != '/cds/retrieve':
            raise ValueError('Only the PDF asset already loaded by EBSCO is accepted')
        archive = Archive()
        record = archive.record(request['id'])
        if record.get('local_path') and (archive.content / record['local_path']).exists():
            if digest(archive.content / record['local_path']) != record['sha256']:
                raise ValueError('Existing PDF checksum changed; review before proceeding')
            return 'Already present: ' + record['id']
        state_path = archive.data / 'acquisition-state.json'
        state = read(state_path, {'source': 'EBSCO', 'paused': False, 'records': {}})
        if state['paused']:
            raise ValueError('Source paused; refresh browser access and explicitly resume the collector')
        def checkpoint(status, **details):
            state['records'][record['id']] = dict(status=status, **details)
            save(state_path, state)
        staging = ROOT / 'private/cad'
        staging.mkdir(parents=True, exist_ok=True)
        target = staging / (record['id'] + '.pdf')
        partial = target.with_suffix('.part')
        # The temporary signed URL is never persisted or included in logs/errors.
        for attempt in range(4):
            checkpoint('downloading', attempt=attempt+1)
            try:
                with urllib.request.urlopen(request['url'], timeout=40) as response:
                    with partial.open('wb') as out:
                        while chunk := response.read(1024*1024): out.write(chunk)
                inspect_pdf(partial)
                partial.replace(target)
                break
            except urllib.error.HTTPError as exc:
                if exc.code in (401,403,429):
                    state['paused'] = True
                    checkpoint('access_restricted', http_status=exc.code)
                    raise ValueError(f'Source paused: HTTP {exc.code}; refresh access before retrying') from None
                if attempt == 3:
                    checkpoint('failed', http_status=exc.code)
                    raise ValueError(f'Transfer failed: HTTP {exc.code}') from None
                time.sleep(2 ** attempt)
            except Exception:
                if attempt == 3:
                    checkpoint('failed', reason='Transfer or PDF validation failed')
                    raise ValueError('Transfer failed; source or PDF needs review') from None
                time.sleep(2 ** attempt)
        try:
            archive.import_pdf(record['id'], target)
            checkpoint('acquired')
            archive.report()
            return 'Imported: ' + record['id']
        except ValueError as exc:
            checkpoint('review_required', reason=str(exc))
            return 'Staged for review: ' + record['id'] + '; ' + str(exc)


class LocalServer(HTTPServer):
    def server_bind(self):
        # Avoid reverse DNS lookup on Windows networks with unavailable DNS.
        self.socket.bind(self.server_address)
        self.server_address = self.socket.getsockname()
        self.server_name, self.server_port = self.server_address


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--resume-source', action='store_true', help='Use only after restoring browser access')
    args = parser.parse_args()
    if args.resume_source:
        from archive import DATA, read, save
        path = DATA / 'acquisition-state.json'
        state = read(path, {'source': 'EBSCO', 'records': {}})
        state['paused'] = False
        save(path, state)
    print('Starting CAD collector at http://127.0.0.1:8766', flush=True)
    LocalServer(('127.0.0.1', 8766), Handler).serve_forever()
