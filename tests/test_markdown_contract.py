import json
import pathlib
import subprocess
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]


def render_markdown(text):
    script = ROOT / 'assets/js/markdown.js'
    js = f"global.window={{}}; require({json.dumps(str(script))}); process.stdout.write(window.SHIN_MARKDOWN.render({json.dumps(text)}));"
    return subprocess.check_output(['node', '-e', js], text=True)


class MarkdownContractTests(unittest.TestCase):
    def test_markdown_escapes_raw_html_and_renders_basic_formatting(self):
        html = render_markdown('# Hello\n\n**bold** and *italic* <script>alert(1)</script>')
        self.assertIn('<h1>Hello</h1>', html)
        self.assertIn('<strong>bold</strong>', html)
        self.assertIn('<em>italic</em>', html)
        self.assertNotIn('<script>', html)
        self.assertIn('&lt;script&gt;', html)

    def test_markdown_rejects_javascript_links(self):
        html = render_markdown('[bad](javascript:alert(1)) [good](https://example.com)')
        self.assertNotIn('javascript:', html)
        self.assertIn('href="https://example.com"', html)

    def test_literature_page_config_and_templates_exist(self):
        pages = (ROOT / 'config/pages.js').read_text(encoding='utf-8')
        self.assertIn('"id": "literature"', pages)
        listing = (ROOT / 'literature/index.html').read_text(encoding='utf-8')
        self.assertIn('data-literature-grid', listing)
        template = (ROOT / 'tools/literature-template.html').read_text(encoding='utf-8')
        self.assertIn('data-literature-reader="{{ID}}"', template)
        self.assertIn('/assets/js/markdown.js', template)


if __name__ == '__main__':
    unittest.main()
