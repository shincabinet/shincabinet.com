import importlib.util
import pathlib
import tempfile
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('site_manager_api', ROOT / 'tools' / 'site_manager.py')
sm = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(sm)


class SiteManagerContentApiTests(unittest.TestCase):
    def setUp(self):
        self.content = {
            'characters': [
                {'id': 'shinji', 'name': 'Shinji'},
                {'id': 'kite', 'name': 'Kite'},
            ],
            'artworks': [],
            'literature': [],
        }

    def test_upsert_and_delete_artwork(self):
        art = sm.upsert_artwork(self.content, {
            'id': 'Night Piece', 'title': 'Night Piece', 'type': 'artwork',
            'image': 'img_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            'characters': ['shinji', 'kite'], 'showInGallery': True,
        })
        self.assertEqual(art['id'], 'night-piece')
        self.assertEqual(self.content['artworks'][0]['characters'], ['shinji', 'kite'])
        removed = sm.delete_artwork_record(self.content, 'night-piece')
        self.assertTrue(removed)
        self.assertEqual(self.content['artworks'], [])

    def test_upsert_literature_generates_path_and_delete(self):
        work = sm.upsert_literature(self.content, {
            'id': 'Rainy Night', 'title': 'Rainy Night', 'characters': ['kite'],
            'body': '# Chapter One', 'published': True,
        })
        self.assertEqual(work['path'], '/literature/rainy-night/')
        self.assertTrue(sm.delete_literature_record(self.content, 'rainy-night'))
        self.assertEqual(self.content['literature'], [])

    def test_sitemap_includes_published_literature(self):
        self.content['literature'] = [
            {'id': 'one', 'path': '/literature/one/', 'published': True},
            {'id': 'hidden', 'path': '/literature/hidden/', 'published': False},
        ]
        pages = {'options': {'siteUrl': 'https://shincabinet.com'}, 'items': [
            {'id': 'literature', 'path': '/literature/', 'enabled': True, 'navOnly': False, 'children': []}
        ]}
        with tempfile.TemporaryDirectory() as tmp:
            old = sm.SITEMAP_FILE
            try:
                sm.SITEMAP_FILE = pathlib.Path(tmp) / 'sitemap.xml'
                sm.write_sitemap(pages, self.content)
                text = sm.SITEMAP_FILE.read_text()
            finally:
                sm.SITEMAP_FILE = old
        self.assertIn('https://shincabinet.com/literature/one/', text)
        self.assertNotIn('/literature/hidden/', text)

    def test_handler_dispatches_artwork_and_literature_endpoints(self):
        source = (ROOT / 'tools/site_manager.py').read_text(encoding='utf-8')
        for endpoint in ('/api/artwork/save', '/api/artwork/delete', '/api/literature/save', '/api/literature/delete'):
            self.assertIn(endpoint, source)


if __name__ == '__main__':
    unittest.main()
