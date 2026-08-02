/*
  CONTENT FOR GENERIC PAGES
  -------------------------
  Keep draft content here even while its matching page is disabled in config/pages.js.
  The generic renderer supports: text, cards, gallery, timeline, links, and callout sections.
*/
window.SHIN_CUSTOM_PAGES = {
  "about": {
    "hero": {
      "eyebrow": "Cabinet / About",
      "title": "Built around characters.",
      "intro": "Shin Cabinet is a flexible home for character art, costume craft, fabrication experiments, and the process connecting all three."
    },
    "sections": [
      {
        "type": "text",
        "eyebrow": "The studio",
        "title": "One visual language, several mediums",
        "paragraphs": [
          "The same character-design decisions should survive a digital illustration, a reference sheet, and a physical fursuit. The studio focuses on readable silhouettes, intentional markings, expressive faces, and materials that support the design rather than fight it.",
          "This page is intentionally disabled by default. Its content remains here until you are ready to publish it."
        ]
      },
      {
        "type": "cards",
        "eyebrow": "Departments",
        "title": "What belongs in the cabinet",
        "items": [
          { "title": "Character Art", "text": "Illustration, reference sheets, expression studies, and visual development.", "meta": "Digital" },
          { "title": "Fursuit Craft", "text": "Head bases, handpaws, tails, pattern development, sewing, and finishing.", "meta": "Physical" },
          { "title": "Fabrication", "text": "3D modeling, printing, prototyping, mechanisms, and repeatable build documentation.", "meta": "Workshop" }
        ]
      },
      {
        "type": "callout",
        "eyebrow": "Current direction",
        "title": "Build the portfolio before opening the full queue.",
        "text": "Use this space for a concise studio mission, current milestone, or availability statement.",
        "button": { "label": "View current work", "page": "gallery" }
      }
    ]
  },
  "build-log": {
    "hero": {
      "eyebrow": "Cabinet / Fursuits / Build Log",
      "title": "Workshop notes.",
      "intro": "A chronological archive of prototypes, mistakes, revisions, material tests, and finished milestones."
    },
    "sections": [
      {
        "type": "timeline",
        "eyebrow": "Current build",
        "title": "Marbled fox mini partial",
        "items": [
          { "number": "01", "title": "Digital sculpt", "text": "Resolve silhouette, vision, ventilation, wall thickness, and print segmentation." },
          { "number": "02", "title": "Print + assembly", "text": "Test fit, join sections, reinforce stress points, and document repair access." },
          { "number": "03", "title": "Pattern + fur", "text": "Create intentional marking breaks, test pile direction, sew, fit, and shave." },
          { "number": "04", "title": "Finish + archive", "text": "Install final details, photograph the result, record materials, and document maintenance." }
        ]
      },
      {
        "type": "gallery",
        "eyebrow": "Bench photos",
        "title": "Progress snapshots",
        "items": [
          { "title": "Sculpt checkpoint", "image": "/assets/images/gallery/art-06.svg", "alt": "Placeholder fursuit sculpt checkpoint", "text": "Replace with a real progress photo and short note." },
          { "title": "Pattern test", "image": "/assets/images/gallery/art-04.svg", "alt": "Placeholder fursuit pattern test", "text": "Document what changed and why." },
          { "title": "Expression test", "image": "/assets/images/gallery/art-07.svg", "alt": "Placeholder fursuit expression test", "text": "Track successful and failed experiments." }
        ]
      }
    ]
  }
};
