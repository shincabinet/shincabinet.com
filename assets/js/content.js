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
    intro: "Furry art, character design, and commission information.",
    profileBlurb: "A personal archive of character art.",
    email: "",
    commissionStatus: "Closed",
    commissionNote: "Prices are starting rates in USD.",
    fursuitStatus: "Not published",
    fursuitNote: "This page is not published yet.",
    specialties: ["Character art", "Reference sheets", "Furry illustration"],
    notices: [],
    socialLinks: []
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

  // Kept empty until there is real fursuit portfolio work to publish.
  fursuitProjects: [],
  fursuitServices: [],
  fursuitProcess: [],

  commissions: [
    {
      name: "Chibi icon",
      price: "$25+",
      image: "/assets/images/commissions/chibi-icon.webp",
      description: "An expressive head icon with clean color and a transparent or simple background.",
      includes: ["One character", "Transparent PNG"]
    },
    {
      name: "Chibi full body",
      price: "$40+",
      image: "/assets/images/commissions/chibi-fullbody.webp",
      description: "A simplified full-body pose focused on expression, silhouette, and markings.",
      includes: ["One character", "Transparent PNG"]
    },
    {
      name: "Full-body character",
      price: "$65+",
      image: "/assets/images/gallery/full/faputa-test.webp",
      description: "A finished full-body drawing with clean lines, color, and light shading.",
      includes: ["One character", "Plain or transparent background"]
    },
    {
      name: "Character card",
      price: "$125+",
      image: "/assets/images/commissions/character-card.webp",
      mature: true,
      description: "A main pose with supporting expressions, details, or alternate drawings.",
      includes: ["One main full body", "Two to four supporting details"]
    }
  ]
};
