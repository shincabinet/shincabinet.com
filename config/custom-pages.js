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
          { "title": "Character target", "image": "/assets/images/gallery/full/shin-character-card.webp?v=1", "alt": "Shin character card", "text": "Replace this with the latest build photo when the physical work begins." },
          { "title": "Silhouette reference", "image": "/assets/images/gallery/full/shin-chibi-pose.webp?v=1", "alt": "Shin chibi pose", "text": "Use visual references to keep proportions and expression consistent." }
        ]
      }
    ]
  }
,
  "tos": {
    "hero": {
      "eyebrow": "Additional Info / TOS",
      "title": "Terms of Service",
      "intro": "The short version of how art commissions are handled."
    },
    "sections": [
      {
        "type": "terms",
        "items": [
          { "title": "Usage", "text": "Commissions are for personal use unless commercial rights are specifically quoted." },
          { "title": "Deposit", "text": "A 50% deposit is required to reserve a commission slot." },
          { "title": "Revisions", "text": "One sketch revision round is included. Large changes after approval cost extra." },
          { "title": "Turnaround", "text": "Typical turnaround is 3–8 weeks after work begins." },
          { "title": "Adult work", "text": "Adult work is limited to adult clients and adult characters." }
        ]
      },
      {
        "type": "callout",
        "eyebrow": "Questions",
        "title": "Need something clarified?",
        "text": "Use the Contacts page before commissioning if you need to check whether a request fits these terms."
      }
    ]
  },
  "contacts": {
    "hero": {
      "eyebrow": "Additional Info / Contacts",
      "title": "Contacts",
      "intro": "Socials, galleries, support pages, and direct contact in one place."
    },
    "sections": [
      {
        "type": "contacts",
        "eyebrow": "Find me online",
        "title": "Shin Cabinet"
      }
    ]
  }
};
