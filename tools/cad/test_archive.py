"""Run with python -m unittest discover -s tools/cad -p 'test_*.py'."""
import io
import tempfile
import unittest
import urllib.error
from pathlib import Path
from unittest.mock import patch
from reportlab.pdfgen.canvas import Canvas
import archive
from archive import Archive, digest, inspect_pdf
from collector import Handler


def pdf(path, title='A sufficiently specific article title', author='Jane Smith', pages=1):
    canvas = Canvas(str(path))
    for page in range(pages):
        canvas.drawString(50, 700, title)
        canvas.drawString(50, 670, author)
        canvas.drawString(50, 640, str(page+1))
        canvas.showPage()
    canvas.save()
    return path


class ArchiveTests(unittest.TestCase):
    def test_display_titles_preserve_source_and_filename(self):
        from prepare_display_titles import sentence_case
        title = 'DEBATE IN CEDA: LESSONS FROM ALFRED C. SNIDER'
        self.assertEqual(sentence_case(title), 'Debate in CEDA: Lessons from Alfred C. Snider')
        self.seed(title=title)
        self.a.import_pdf('test:1', pdf(self.root/'one.pdf', title))
        record = self.a.record('test:1')
        original_path = record['local_path']
        self.a.display_titles[record['id']] = sentence_case(title)
        self.a.render([36])
        self.assertIn(sentence_case(title), (self.a.content/'CAD36.md').read_text())
        self.assertEqual(record['title'], title)
        self.assertEqual(record['local_path'], original_path)

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.a = Archive(self.root/'content', self.root/'data')
        self.a.content.mkdir()
        (self.a.content/'index.md').write_text('Archive prose\n', encoding='utf-8')

    def source(self, sid='test:1', title='A sufficiently specific article title', author='Smith, Jane', pages='1-2'):
        return dict(source_id=sid, title=title, authors=author, volume=36, pages=pages, url='https://example.org/article', provider='Test')

    def seed(self, **kw):
        self.a.reconcile([self.source(**kw)])
        return self.a.record(kw.get('sid','test:1'))

    def test_duplicate_and_variant_records(self):
        self.seed()
        self.a.reconcile([self.source(), self.source(sid='test:2', title='A SUFFICIENTLY SPECIFIC ARTICLE TITLE!')])
        self.assertEqual(len(self.a.manifest['records']),1)
        self.assertEqual(len(self.a.manifest['records'][0]['sources']),2)

    def test_same_title_different_authors(self):
        self.seed(title='Response')
        self.seed(sid='test:2',title='Response',author='Jones, James',pages='3-4')
        self.assertEqual(len(self.a.manifest['records']),2)
        f=pdf(self.root/'one.pdf','Response','Jane Smith')
        with self.assertRaisesRegex(ValueError,'author'):
            self.a.import_pdf('test:2',f)

    def test_filename_collision_and_rerun(self):
        self.seed()
        self.seed(sid='test:2',author='Jones, James',pages='3-4')
        f=pdf(self.root/'one.pdf')
        self.assertTrue(self.a.import_pdf('test:1',f))
        self.assertFalse(self.a.import_pdf('test:1',f))
        other=pdf(self.root/'two.pdf',author='James Jones')
        self.a.import_pdf('test:2',other)
        self.assertNotEqual(self.a.record('test:1')['local_path'],self.a.record('test:2')['local_path'])

    def test_corrupt_pdf_and_original_checksum(self):
        self.seed()
        bad=self.root/'bad.pdf'; bad.write_bytes(b'<html>Login</html>')
        with self.assertRaises(ValueError): self.a.import_pdf('test:1',bad)
        f=pdf(self.root/'one.pdf'); self.a.import_pdf('test:1',f)
        r=self.a.record('test:1'); r['baseline_sha256']=r['sha256']
        pdf(self.a.content/r['local_path'],author='Changed')
        self.assertIn('Original checksum changed',str(self.a.validate()))

    def test_review_is_bound_to_checksum(self):
        self.seed(title='Different title')
        f=pdf(self.root/'one.pdf')
        self.a.review('test:1',f,'Visually verified original title and Jane Smith byline on page 1.')
        pdf(f,author='Changed author')
        with self.assertRaises(ValueError):self.a.import_pdf('test:1',f)

    def test_render_preserves_prose_and_is_idempotent(self):
        self.seed();self.a.import_pdf('test:1',pdf(self.root/'one.pdf'))
        page=self.a.content/'CAD36.md'
        page.write_text('---\ntitle: Volume 36\n---\nProse before\n| Link | Title | Author |\n| --- | --- | --- |\nProse after\n',encoding='utf-8')
        self.a.render([36]); first=page.read_bytes()
        self.a.render([36]);self.assertEqual(first,page.read_bytes())
        self.assertIn(b'Prose before',first); self.assertIn(b'Prose after',first)
        self.assertEqual(self.a.validate(links=True),[])
        page.write_text(page.read_text().replace('.pdf)', '-absent.pdf)'),encoding='utf-8')
        self.assertTrue(self.a.validate(links=True))

    def test_extraction_offset_and_parent_integrity(self):
        self.seed();parent=pdf(self.a.content/'issue.pdf',pages=3)
        self.a.record('test:1')['extraction']=dict(parent_path='issue.pdf',parent_sha256=digest(parent),pdf_start=2,pdf_end=3,printed_pages='1-2',evidence='Printed page = PDF page - 1, checked against contents.')
        self.a.extract('test:1')
        info,_=inspect_pdf(self.a.content/self.a.record('test:1')['local_path'])
        self.assertEqual(info['pdf_pages'],2)
        self.assertFalse(self.a.extract('test:1'))
        pdf(parent,author='Changed')
        with self.assertRaisesRegex(ValueError,'checksum'):self.a.extract('test:1')

    def test_transfer_retry_interruption_and_resume(self):
        self.seed(); data=pdf(self.root/'one.pdf').read_bytes()
        handler=object.__new__(Handler)
        request={'id':'test:1','url':'https://content.ebscohost.com/cds/retrieve?content=temporary-secret'}
        with patch('archive.Archive',return_value=self.a),patch('archive.ROOT',self.root),patch('collector.time.sleep') as sleep,patch('collector.urllib.request.urlopen',side_effect=[OSError('interrupted'),io.BytesIO(data)]) as fetch:
            self.assertTrue(handler.transfer(request).startswith('Imported'))
            self.assertTrue(handler.transfer(request).startswith('Already present'))
            self.assertEqual(fetch.call_count,2)
            sleep.assert_called_once_with(1)
        self.assertNotIn('temporary-secret',(self.a.data/'acquisition-state.json').read_text())

    def test_expired_session_pauses_source(self):
        self.seed();handler=object.__new__(Handler)
        request={'id':'test:1','url':'https://content.ebscohost.com/cds/retrieve?content=secret'}
        error=urllib.error.HTTPError(request['url'],403,'Forbidden',{},None)
        with patch('archive.Archive',return_value=self.a),patch('archive.ROOT',self.root),patch('collector.urllib.request.urlopen',side_effect=error) as fetch:
            with self.assertRaisesRegex(ValueError,'paused'):handler.transfer(request)
            with self.assertRaisesRegex(ValueError,'paused'):handler.transfer(request)
            self.assertEqual(fetch.call_count,1)

    def test_transient_failure_has_three_retries(self):
        self.seed();handler=object.__new__(Handler)
        with patch('archive.Archive',return_value=self.a),patch('archive.ROOT',self.root),patch('collector.time.sleep') as sleep,patch('collector.urllib.request.urlopen',side_effect=OSError('offline')) as fetch:
            with self.assertRaisesRegex(ValueError,'Transfer failed'):
                handler.transfer({'id':'test:1','url':'https://content.ebscohost.com/cds/retrieve?content=secret'})
            self.assertEqual(fetch.call_count,4)
            self.assertEqual([c.args[0] for c in sleep.call_args_list],[1,2,4])


if __name__=='__main__':unittest.main()
