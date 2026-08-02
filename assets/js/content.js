/*
  MAIN CONTENT FILE
  -----------------
  Edit this file to change your profile text, character records, gallery entries,
  fursuit projects, commission options, and links. Page visibility still lives in
  /config/pages.js.
*/
window.SHIN_SITE = {
  site: {
    name: "Shin Cabinet",
    shortName: "SC",
    artistName: "Shin",
    handle: "@shincabinet",
    intro: "Furry illustration, character design, and a growing fursuit workshop.",
    profileBlurb: "A personal archive for expressive character art, reference work, experiments, and costume-making progress.",
    email: "commissions@example.com",
    commissionStatus: "Closed — price guide available",
    commissionNote: "Preparing a limited opening. Prices below are starting rates in USD for personal-use artwork.",
    fursuitStatus: "Portfolio work",
    fursuitNote: "Personal builds and process studies; public suit commissions are not open yet.",
    specialties: ["Character art", "Reference sheets", "Furry illustration", "Fursuit development"],
    notices: [],
    socialLinks: [
      { label: "Toyhouse", url: "https://toyhou.se/" },
      { label: "Bluesky", url: "https://bsky.app/" },
      { label: "X / Twitter", url: "https://x.com/" }
    ]
  },

  characters: [
    {
      id: "shin",
      name: "Shin",
      pronouns: "he / him",
      species: "Fox / wolf",
      role: "Primary character",
      category: "primary",
      featured: true,
      image: "/assets/images/characters/shin.webp",
      tagline: "Warm rust, dark fur, gold eyes, and deliberately irregular markings.",
      bio: "Shin is the central character and visual anchor for the site. His design mixes clean graphic shapes with rougher marbled markings, expressive hair, and details intended to translate into both drawings and a future fursuit.",
      palette: ["#C94B2B", "#F2DDAE", "#342027", "#E7A31A", "#177E80"],
      tags: ["Main character", "Fox", "Wolf", "Fursuit planned"],
      facts: [
        { label: "Design mood", value: "Warm / expressive" },
        { label: "Primary colors", value: "Rust + cream" },
        { label: "Physical build", value: "Planned" }
      ],
      toyhouse: "https://toyhou.se/"
    }
  ],

  artworks: [
    {
      id: "michiru-speed",
      title: "Cheetah Speed",
      category: "illustration",
      character: "Michiru study",
      year: "2026",
      image: "/assets/images/gallery/thumbs/michiru-cheetah-speed.webp",
      full: "/assets/images/gallery/full/michiru-cheetah-speed.webp",
      alt: "Colorful furry character running with long sweeping tails",
      featured: true,
      mature: false
    },
    {
      id: "shin-chibi-pose",
      title: "Shin Chibi Pose",
      category: "chibi",
      character: "Shin",
      year: "2026",
      image: "/assets/images/gallery/thumbs/shin-chibi-pose.webp",
      full: "/assets/images/gallery/full/shin-chibi-pose.webp",
      alt: "Chibi illustration of Shin standing with arms open",
      featured: true,
      mature: false
    },
    {
      id: "shin-lounge",
      title: "Shin Lounge",
      category: "illustration",
      character: "Shin",
      year: "2026",
      image: "/assets/images/gallery/thumbs/shin-lounge.webp",
      full: "/assets/images/gallery/full/shin-lounge.webp",
      alt: "Shin reclining in a relaxed pose",
      featured: true,
      mature: false
    },
    {
      id: "shin-icon",
      title: "Shin Icon",
      category: "chibi",
      character: "Shin",
      year: "2026",
      image: "/assets/images/gallery/thumbs/shin-chibi-icon-card.webp",
      full: "/assets/images/gallery/full/shin-chibi-icon-card.webp",
      alt: "Front-facing chibi icon of Shin on a lightly gridded background",
      featured: true,
      mature: false
    },
    {
      id: "shin-icon-transparent",
      title: "Shin Icon Cutout",
      category: "chibi",
      character: "Shin",
      year: "2026",
      image: "/assets/images/gallery/thumbs/shin-chibi-icon-transparent.webp",
      full: "/assets/images/gallery/full/shin-chibi-icon-transparent.webp",
      alt: "Transparent front-facing chibi icon of Shin",
      featured: true,
      mature: false
    },
    {
      id: "michiru-chibi-icon",
      title: "Michiru Chibi Icon",
      category: "chibi",
      character: "Michiru study",
      year: "2026",
      image: "/assets/images/gallery/thumbs/michiru-chibi-icon.webp",
      full: "/assets/images/gallery/full/michiru-chibi-icon.webp",
      alt: "Front-facing chibi icon of a blue-haired furry character",
      featured: false,
      mature: false
    },
    {
      id: "faputa-test",
      title: "Faputa Study",
      category: "illustration",
      character: "Faputa study",
      year: "2026",
      image: "/assets/images/gallery/thumbs/faputa-test.webp",
      full: "/assets/images/gallery/full/faputa-test.webp",
      alt: "Detailed white and red creature character posed against a transparent background",
      featured: false,
      mature: false
    },
    {
      id: "shin-character-card",
      title: "Shin Character Card",
      category: "reference",
      character: "Shin",
      year: "2026",
      image: "/assets/images/gallery/thumbs/shin-character-card.webp",
      full: "/assets/images/gallery/full/shin-character-card.webp",
      alt: "Character card showing multiple drawings and details for Shin",
      featured: false,
      mature: true
    },
    {
      id: "kaizer-one-more-time",
      title: "One More Time?",
      category: "mature",
      character: "Kaizer",
      year: "2026",
      image: "/assets/images/gallery/thumbs/kaizer-one-more-time.webp",
      full: "/assets/images/gallery/full/kaizer-one-more-time.webp",
      alt: "Suggestive furry character illustration with a speech bubble",
      featured: false,
      mature: true
    },
    {
      id: "shin-crazy",
      title: "Crazy",
      category: "mature",
      character: "Shin",
      year: "2026",
      image: "/assets/images/gallery/thumbs/shin-crazy.webp",
      full: "/assets/images/gallery/full/shin-crazy.webp",
      alt: "Adult-humor two-panel furry character comic",
      featured: false,
      mature: true
    },
    {
      id: "shin-pet-play",
      title: "Pet Play",
      category: "mature",
      character: "Shin",
      year: "2026",
      image: "/assets/images/gallery/thumbs/shin-pet-play.webp",
      full: "/assets/images/gallery/full/shin-pet-play.webp",
      alt: "Adult-themed furry character illustration with harness and leash",
      featured: false,
      mature: true
    }
  ],

  fursuitProjects: [
    {
      title: "Shin Mini Partial",
      status: "Planning",
      phase: "Head-base development",
      image: "/assets/images/characters/shin.webp",
      description: "Translating Shin's face shape, hair silhouette, markings, and expression language into a wearable head, handpaws, and tail."
    },
    {
      title: "Workshop Setup",
      status: "In progress",
      phase: "Tools + workflow",
      image: "/assets/images/gallery/thumbs/shin-character-card.webp",
      description: "Organizing printing, sewing, trimming, storage, and photography into a repeatable build process."
    }
  ],

  fursuitServices: [
    {
      name: "Character translation",
      text: "Working out which shapes and markings must be simplified, enlarged, or moved so the design reads in costume form.",
      availability: "Design studies"
    },
    {
      name: "3D head-base work",
      text: "Sculpting and printing bases with attention to vision, airflow, assembly, durability, and future repairs.",
      availability: "Portfolio development"
    },
    {
      name: "Mini partial construction",
      text: "Developing heads, paws, and tails as one consistent character rather than unrelated components.",
      availability: "Not open publicly"
    }
  ],

  fursuitProcess: [
    { number: "01", title: "Design", text: "Resolve the silhouette, markings, materials, and practical constraints." },
    { number: "02", title: "Prototype", text: "Test the sculpt, fit, patterns, vision, and movement before finish work." },
    { number: "03", title: "Build", text: "Print, sew, assemble, shave, line, and reinforce the components." },
    { number: "04", title: "Document", text: "Photograph the result and keep material and repair notes for later." }
  ],

  commissions: [
    {
      name: "Chibi icon",
      eyebrow: "Profile image",
      price: "$35+",
      image: "/assets/images/commissions/chibi-icon.webp",
      description: "A compact, expressive head icon with clean color and a transparent or simple graphic background.",
      includes: ["One character", "One sketch revision round", "Transparent PNG + display-ready file"]
    },
    {
      name: "Chibi full body",
      eyebrow: "Small character art",
      price: "$50+",
      image: "/assets/images/commissions/chibi-fullbody.webp",
      description: "A simplified full-body pose built around clear expression, silhouette, and character markings.",
      includes: ["One character", "Simple pose or prop", "Transparent PNG"]
    },
    {
      name: "Full-body character",
      eyebrow: "Finished character art",
      price: "$80+",
      image: "/assets/images/gallery/full/faputa-test.webp",
      description: "A polished full-body drawing with clean linework, finished color, and light shading.",
      includes: ["One character", "Pose approval", "Transparent or plain background"]
    },
    {
      name: "Dynamic illustration",
      eyebrow: "Pose + graphic backdrop",
      price: "$110+",
      image: "/assets/images/commissions/illustration.webp",
      description: "A more involved composition with stronger movement, effects, props, or a designed background.",
      includes: ["One character", "Composition sketch", "Simple graphic background"]
    },
    {
      name: "Character card",
      eyebrow: "Design showcase",
      price: "$175+",
      image: "/assets/images/commissions/character-card.webp",
      mature: true,
      description: "A presentation sheet combining a main pose with supporting expressions, details, or alternate drawings.",
      includes: ["One main full body", "Two to four supporting details", "Custom layout"]
    },
    {
      name: "Comic or two-character scene",
      eyebrow: "Narrative work",
      price: "$190+",
      image: "/assets/images/commissions/comic.webp",
      mature: true,
      description: "A short sequential piece or interaction-focused scene. Final pricing depends heavily on panel and character count.",
      includes: ["Up to two characters", "One to two panels", "Simple background treatment"]
    }
  ],

  process: [
    { number: "01", title: "Request", text: "Send references, the commission type, pose or mood, intended use, and any hard requirements." },
    { number: "02", title: "Quote + deposit", text: "I confirm the scope, final price, estimated queue window, and collect a 50% deposit." },
    { number: "03", title: "Sketch approval", text: "You receive the composition sketch and one focused revision round before rendering begins." },
    { number: "04", title: "Finish + delivery", text: "The remaining balance is paid before the unwatermarked full-resolution files are delivered." }
  ]
};
