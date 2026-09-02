import importlib.util
import json
import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('site_manager', ROOT / 'tools' / 'site_manager.py')
site_manager = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(site_manager)


class ContentModelTests(unittest.TestCase):
    def setUp(self):
        self.characters = [
            {'id': 'shinji', 'name': 'Shinji'},
            {'id': 'kite', 'name': 'Kite'},
        ]

    def test_normalize_artwork_uses_character_ids_and_reference_type(self):
        artwork = site_manager.normalize_artwork({
            'id': 'Ref Sheet',
            'title': 'Ref Sheet',
            'type': 'reference',
            'image': 'img_0123456789abcdef0123456789abcdef',
            'characters': ['Shinji', 'kite', 'unknown'],
        }, self.characters)
        self.assertEqual(artwork['id'], 'ref-sheet')
        self.assertEqual(artwork['type'], 'reference')
        self.assertEqual(artwork['characters'], ['shinji', 'kite'])
        self.assertFalse(artwork['showInGallery'])

    def test_normalize_literature_generates_path_and_filters_characters(self):
        work = site_manager.normalize_literature({
            'id': 'Rainy Night',
            'title': 'Rainy Night',
            'summary': 'A test',
            'characters': ['kite', 'missing'],
            'tags': [' fanfic ', '', 'fanfic'],
            'body': '# Chapter One\n\nHello.',
        }, self.characters)
        self.assertEqual(work['id'], 'rainy-night')
        self.assertEqual(work['path'], '/literature/rainy-night/')
        self.assertEqual(work['characters'], ['kite'])
        self.assertEqual(work['tags'], ['fanfic'])
        self.assertTrue(work['published'])

    def test_migrate_character_references_creates_central_reference_artwork(self):
        content = {
            'characters': [{
                'id': 'shinji', 'name': 'Shinji',
                'references': [{
                    'title': 'Shinji Ref',
                    'image': 'img_11111111111111111111111111111111',
                    'mature': False,
                }],
            }],
            'artworks': [],
        }
        count = site_manager.migrate_character_references(content)
        self.assertEqual(count, 1)
        self.assertNotIn('references', content['characters'][0])
        self.assertEqual(content['artworks'][0]['type'], 'reference')
        self.assertEqual(content['artworks'][0]['characters'], ['shinji'])
        self.assertFalse(content['artworks'][0]['showInGallery'])

    def test_checked_in_content_uses_central_artwork_records(self):
        text = (ROOT / "assets/js/content.js").read_text(encoding="utf-8")
        start = text.index("{", text.index("window.SHIN_SITE"))
        content = json.loads(text[start:text.rfind(";")])
        valid_ids = {c["id"] for c in content.get("characters", [])}
        self.assertTrue(content.get("artworks"))
        self.assertIn("literature", content)
        self.assertTrue(all("references" not in c for c in content.get("characters", [])))
        for artwork in content.get("artworks", []):
            self.assertIn(artwork.get("type"), {"artwork", "reference"})
            self.assertTrue(set(artwork.get("characters", [])).issubset(valid_ids))



if __name__ == '__main__':
    unittest.main()
