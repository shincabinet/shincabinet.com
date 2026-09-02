import pathlib
import re
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
SITE_JS = (ROOT / 'assets/js/site.js').read_text(encoding='utf-8')
CSS = (ROOT / 'assets/css/styles.css').read_text(encoding='utf-8')


class PublicContentContractTests(unittest.TestCase):
    def test_relationship_helpers_exist(self):
        for name in ('linkedCharacters', 'artworksForCharacter', 'literatureForCharacter', 'characterLinksHtml'):
            self.assertRegex(SITE_JS, rf'function\s+{name}\s*\(')

    def test_character_profiles_do_not_render_character_owned_references(self):
        self.assertNotIn('character.references || []', SITE_JS)
        self.assertIn('artworksForCharacter(character.id, "reference")', SITE_JS)
        self.assertIn('literatureForCharacter(character.id)', SITE_JS)

    def test_media_dialog_has_linked_character_container(self):
        self.assertIn('data-art-dialog-characters', SITE_JS)
        self.assertIn('.art-dialog__characters', CSS)

    def test_gallery_only_renders_show_in_gallery_records(self):
        self.assertIn('artwork.showInGallery !== false', SITE_JS)


if __name__ == '__main__':
    unittest.main()
