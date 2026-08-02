/*
  PAGE CONTROL CENTER
  -------------------
  Change `enabled` to publish/unpublish a page without deleting its files or content.

  enabled: true   = page can be opened
  menu: true      = show in the main navigation
  footer: true    = show in the footer
  homeCard.show   = show as a department card on the homepage

  Nest pages inside `children` to create a navigation hierarchy.
  A child is automatically unavailable whenever one of its parents is disabled.
*/
window.SHIN_PAGES = {
  "version": 1,
  "options": {
    "disabledBehavior": "notice",
    "disabledRedirect": "/",
    "disabledTitle": "This drawer is closed.",
    "disabledMessage": "This section is saved in the cabinet but is not currently published.",
    "navigationLabel": "Primary navigation",
    "siteUrl": "https://example.com",
    "cta": {
      "label": "Request a slot",
      "page": "commissions",
      "fallbackToEmail": true
    }
  },
  "items": [
    {
      "id": "home",
      "label": "Home",
      "path": "/",
      "enabled": true,
      "menu": false,
      "footer": false,
      "homeCard": { "show": false },
      "title": "Shin Cabinet — Characters, Art & Fursuits",
      "description": "Shin Cabinet is a furry art, character design, and fursuit-making studio archive.",
      "children": []
    },
    {
      "id": "characters",
      "label": "Characters",
      "path": "/characters/",
      "enabled": true,
      "menu": true,
      "footer": true,
      "homeCard": {
        "show": true,
        "order": 10,
        "eyebrow": "Profiles + palettes + lore"
      },
      "title": "Characters — Shin Cabinet",
      "description": "Browse original furry characters, profiles, palettes, tags, and reference links.",
      "children": []
    },
    {
      "id": "gallery",
      "label": "Gallery",
      "path": "/gallery/",
      "enabled": true,
      "menu": true,
      "footer": true,
      "homeCard": {
        "show": true,
        "order": 20,
        "eyebrow": "Illustration + design"
      },
      "title": "Gallery — Shin Cabinet",
      "description": "Browse furry illustrations, character designs, references, commissions, and costume studies.",
      "children": []
    },
    {
      "id": "fursuits",
      "label": "Fursuits",
      "path": "/fursuits/",
      "enabled": true,
      "menu": true,
      "footer": true,
      "homeCard": {
        "show": true,
        "order": 30,
        "eyebrow": "Builds + workshop"
      },
      "title": "Fursuits — Shin Cabinet",
      "description": "Fursuit projects, fabrication studies, build capabilities, and workshop process.",
      "children": [
        {
          "id": "build-log",
          "label": "Build Log",
          "path": "/fursuits/build-log/",
          "enabled": false,
          "menu": true,
          "footer": true,
          "homeCard": { "show": false },
          "title": "Fursuit Build Log — Shin Cabinet",
          "description": "Development notes, progress updates, tests, and lessons from current fursuit builds.",
          "children": []
        }
      ]
    },
    {
      "id": "commissions",
      "label": "Commission Info",
      "path": "/commissions/",
      "enabled": true,
      "menu": true,
      "footer": true,
      "homeCard": {
        "show": true,
        "order": 40,
        "eyebrow": "Availability + pricing"
      },
      "title": "Commission Info — Shin Cabinet",
      "description": "Commission prices, process, terms, frequently asked questions, and contact information.",
      "children": []
    },
    {
      "id": "about",
      "label": "About",
      "path": "/about/",
      "enabled": false,
      "menu": true,
      "footer": true,
      "homeCard": {
        "show": false,
        "order": 50,
        "eyebrow": "Artist + workshop"
      },
      "title": "About — Shin Cabinet",
      "description": "About the artist, studio, creative process, and goals behind Shin Cabinet.",
      "children": []
    }
  ]
};
