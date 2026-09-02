import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
HTML = (ROOT / 'tools/site-manager.html').read_text(encoding='utf-8')


class SiteManagerUiContractTests(unittest.TestCase):
    def test_artwork_and_literature_sections_exist(self):
        self.assertIn('data-view="artwork"', HTML)
        self.assertIn('id="view-artwork"', HTML)
        self.assertIn('id="new-artwork"', HTML)
        self.assertIn('data-view="literature"', HTML)
        self.assertIn('id="view-literature"', HTML)
        self.assertIn('id="new-literature"', HTML)

    def test_artwork_editor_supports_linked_characters_and_alternatives(self):
        self.assertIn('Linked characters', HTML)
        self.assertIn('id="artwork-alternatives"', HTML)
        self.assertIn("/api/artwork/save", HTML)

    def test_literature_editor_uses_markdown_and_character_links(self):
        self.assertIn('id="l-body"', HTML)
        self.assertIn('literature-markdown-preview', HTML)
        self.assertIn("/api/literature/save", HTML)
        self.assertIn('/assets/js/markdown.js', HTML)

    def test_character_editor_no_longer_owns_reference_records(self):
        self.assertNotIn('<h3>Reference images</h3>', HTML)
        self.assertNotIn("references:getRows('#references-rows'", HTML)


if __name__ == '__main__':
    unittest.main()
