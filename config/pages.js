/*
  PAGE CONTROL CENTER
  -------------------
  This file is valid JSON wrapped in a browser assignment and can be safely
  rewritten by tools/site_manager.py or tools/manage_pages.py.
*/
window.SHIN_PAGES = {
  "version": 2,
  "options": {
    "disabledBehavior": "notice",
    "disabledRedirect": "/",
    "disabledTitle": "This page is not published yet.",
    "disabledMessage": "The content is saved, but it is currently hidden.",
    "navigationLabel": "Primary navigation",
    "siteUrl": "https://shincabinet.com",
    "cta": {}
  },
  "items": [
    {
      "id": "home",
      "label": "Home",
      "path": "/",
      "enabled": true,
      "menu": false,
      "footer": false,
      "homeCard": {
        "show": false
      },
      "title": "Shin Cabinet — Furry Art & Characters",
      "description": "Furry art, original characters, gallery, and commission information by Shin.",
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
        "show": false
      },
      "title": "Characters — Shin Cabinet",
      "description": "Original furry characters and reference information from Shin Cabinet.",
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
        "show": false
      },
      "title": "Gallery — Shin Cabinet",
      "description": "Furry illustrations, character studies, references, and mature art from Shin Cabinet.",
      "children": []
    },
    {
      "id": "commissions",
      "label": "Commission Info",
      "path": "/commissions/",
      "enabled": true,
      "menu": true,
      "footer": true,
      "homeCard": {
        "show": false
      },
      "title": "Commission Info — Shin Cabinet",
      "description": "Commission prices and terms for Shin Cabinet.",
      "children": []
    },
    {
      "id": "adoptable",
      "label": "Adoptable",
      "path": "/adoptable/",
      "enabled": true,
      "menu": true,
      "footer": true,
      "homeCard": {
        "show": false
      },
      "title": "Adoptables — Shin Cabinet",
      "description": "Character designs currently available for adoption from Shin Cabinet.",
      "children": []
    },
    {
      "id": "additional-info",
      "label": "Additional Info",
      "path": "/additional-info/",
      "navOnly": true,
      "enabled": true,
      "menu": true,
      "footer": false,
      "homeCard": {
        "show": false
      },
      "children": [
        {
          "id": "tos",
          "label": "TOS",
          "path": "/tos/",
          "enabled": true,
          "menu": true,
          "footer": false,
          "homeCard": {
            "show": false
          },
          "title": "Terms of Service — Shin Cabinet",
          "description": "Commission terms of service for Shin Cabinet.",
          "children": []
        },
        {
          "id": "contacts",
          "label": "Contacts",
          "path": "/contacts/",
          "enabled": true,
          "menu": true,
          "footer": false,
          "homeCard": {
            "show": false
          },
          "title": "Contacts — Shin Cabinet",
          "description": "Contact information and social profiles for Shin Cabinet.",
          "children": []
        }
      ]
    },
    {
      "id": "fursuits",
      "label": "Fursuits",
      "path": "/fursuits/",
      "enabled": false,
      "menu": false,
      "footer": false,
      "homeCard": {
        "show": false
      },
      "title": "Fursuits — Shin Cabinet",
      "description": "Fursuit work from Shin Cabinet.",
      "children": [
        {
          "id": "build-log",
          "label": "Build Log",
          "path": "/fursuits/build-log/",
          "enabled": false,
          "menu": false,
          "footer": false,
          "homeCard": {
            "show": false
          },
          "title": "Fursuit Build Log — Shin Cabinet",
          "description": "Fursuit build notes from Shin Cabinet.",
          "children": []
        }
      ]
    },
    {
      "id": "about",
      "label": "About",
      "path": "/about/",
      "enabled": false,
      "menu": false,
      "footer": false,
      "homeCard": {
        "show": false
      },
      "title": "About — Shin Cabinet",
      "description": "About Shin Cabinet.",
      "children": []
    }
  ]
};
