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
    commissionStatus: "Closed while the site is being set up",
    commissionNote: "Update this status in assets/js/content.js before publishing.",
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
      name: "Portrait",
      eyebrow: "Head or bust",
      price: "Set your price",
      description: "An expressive portrait with clean color and either a transparent or lightly designed background.",
      includes: ["One character", "Sketch approval", "Full-resolution file"]
    },
    {
      name: "Full-body illustration",
      eyebrow: "Character-focused",
      price: "Set your price",
      description: "A complete pose with finished color, shading, and a simple environmental or graphic backdrop.",
      includes: ["One full-body character", "Sketch approval", "Full-resolution file"]
    },
    {
      name: "Reference sheet",
      eyebrow: "Design utility",
      price: "Set your price",
      description: "A readable character sheet for future artists, makers, and costume construction.",
      includes: ["Required views", "Palette", "Detail callouts"]
    }
  ],

  process: [
    { number: "01", title: "Request", text: "Send the character, format, intended use, and important details." },
    { number: "02", title: "Quote", text: "You receive the scope, price, queue position, and payment terms." },
    { number: "03", title: "Sketch", text: "The pose and major design decisions are approved before finishing." },
    { number: "04", title: "Delivery", text: "Final files are sent after approval and payment completion." }
  ]
};
