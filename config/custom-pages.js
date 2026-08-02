/*
  CONTENT FOR GENERIC PAGES
  -------------------------
  These drafts stay saved even when their matching page is disabled in
  config/pages.js. Supported section types: text, cards, gallery, timeline,
  links, and callout.
*/
window.SHIN_CUSTOM_PAGES = {
  "about": {
    "hero": {
      "eyebrow": "About",
      "title": "A home for the work.",
      "intro": "Shin Cabinet collects character art, design notes, fursuit development, and the unfinished process between them."
    },
    "sections": [
      {
        "type": "text",
        "eyebrow": "The idea",
        "title": "Characters across different mediums",
        "paragraphs": [
          "A character should still feel like themselves whether they are drawn as a loose sketch, organized into a reference sheet, or translated into a physical costume. The work here focuses on expressive faces, readable markings, strong silhouettes, and details that survive that translation.",
          "This page is disabled by default. Its draft stays here until you are ready to publish it."
        ]
      },
      {
        "type": "cards",
        "eyebrow": "Areas of work",
        "title": "What belongs here",
        "items": [
          { "title": "Character art", "text": "Illustration, reference sheets, expression studies, and personal work.", "meta": "Drawing" },
          { "title": "Fursuit craft", "text": "Head bases, paws, tails, sewing, finishing, and wearability tests.", "meta": "Making" },
          { "title": "Process notes", "text": "Models, prototypes, material tests, revisions, and lessons worth keeping.", "meta": "Archive" }
        ]
      },
      {
        "type": "callout",
        "eyebrow": "Current focus",
        "title": "Build the work before selling the image of a studio.",
        "text": "Use this space for a short honest note about what you are making now."
      }
    ]
  },
  "build-log": {
    "hero": {
      "eyebrow": "Fursuits / Build log",
      "title": "Workshop notes",
      "intro": "A chronological place for prototypes, mistakes, revisions, material tests, and completed milestones."
    },
    "sections": [
      {
        "type": "timeline",
        "eyebrow": "Current build",
        "title": "Shin mini partial",
        "items": [
          { "number": "01", "title": "Digital sculpt", "text": "Resolve the silhouette, vision, ventilation, wall thickness, and print segmentation." },
          { "number": "02", "title": "Print and assembly", "text": "Test fit, join sections, reinforce stress points, and preserve repair access." },
          { "number": "03", "title": "Pattern and fur", "text": "Plan marking breaks, test pile direction, sew, fit, and shave." },
          { "number": "04", "title": "Finish and document", "text": "Install details, photograph the result, and record materials and maintenance notes." }
        ]
      },
      {
        "type": "gallery",
        "eyebrow": "Bench photos",
        "title": "Progress snapshots",
        "items": [
          { "title": "Character target", "image": "/assets/images/gallery/thumbs/shin-character-card.webp", "alt": "Shin character card", "text": "Replace this with the latest build photo when the physical work begins." },
          { "title": "Silhouette reference", "image": "/assets/images/gallery/thumbs/shin-chibi-pose.webp", "alt": "Shin chibi pose", "text": "Use visual references to keep proportions and expression consistent." }
        ]
      }
    ]
  }
};
