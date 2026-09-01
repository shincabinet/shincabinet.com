from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
SITE_JS = (ROOT / 'assets/js/site.js').read_text(encoding='utf-8')
MANAGER_PY = (ROOT / 'tools/site_manager.py').read_text(encoding='utf-8')
MANAGER_HTML = (ROOT / 'tools/site-manager.html').read_text(encoding='utf-8')
CONTENT_JS = (ROOT / 'assets/js/content.js').read_text(encoding='utf-8')


class ImageRoutingTests(unittest.TestCase):
    def test_legacy_local_paths_are_never_rewritten_to_image_host(self):
        self.assertNotIn("removeprefix('/assets/images/')", MANAGER_PY)
        self.assertNotIn('pathAndQuery.replace(/^\\/assets\\/images\\//, "")', SITE_JS)
        self.assertNotIn('remoteImagesEnabled', SITE_JS)

    def test_runtime_does_not_generate_cloudflare_cdn_cgi_urls(self):
        self.assertNotIn('/cdn-cgi/image/', SITE_JS)
        self.assertNotIn('cloudflareTransformationsEnabled', SITE_JS)

    def test_manager_no_longer_exposes_legacy_remote_mapping_switches(self):
        self.assertNotIn('media-remote', MANAGER_HTML)
        self.assertNotIn('media-transform', MANAGER_HTML)
        self.assertNotIn('Map legacy /assets/images paths to image host', MANAGER_HTML)

    def test_media_config_only_needs_host_and_dynamic_max_dimension(self):
        media_match = re.search(r'"media"\s*:\s*\{(?P<body>.*?)\n\s*\}', CONTENT_JS, re.S)
        self.assertIsNotNone(media_match, 'site.media config missing')
        body = media_match.group('body')
        self.assertIn('"imageHost"', body)
        self.assertIn('"maxImageDimension"', body)
        self.assertNotIn('"remoteImagesEnabled"', body)
        self.assertNotIn('"cloudflareTransformationsEnabled"', body)

    def test_any_still_referenced_legacy_images_exist_locally(self):
        texts = '\n'.join(
            (ROOT / rel).read_text(encoding='utf-8')
            for rel in ('assets/js/content.js', 'config/custom-pages.js', 'config/pages.js')
        )
        refs = set(re.findall(
            r'/assets/images/[^\\"\\\'<>\\s]+?\\.(?:png|jpe?g|webp|gif|avif)(?:\\?[^\\"\\\'<>\\s]*)?',
            texts,
            re.I,
        ))
        missing = []
        for ref in refs:
            local = ROOT / ref.split('?', 1)[0].lstrip('/')
            if not local.is_file():
                missing.append(ref)
        self.assertEqual([], sorted(missing), f'Legacy image references missing locally: {missing}')


if __name__ == '__main__':
    unittest.main()
