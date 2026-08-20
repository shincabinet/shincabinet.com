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
    intro: "Furry art, characters, and whatever else I’m working on.",
    profileBlurb: "A personal archive of character art.",
    email: "shincabinet@gmail.com",
    commissionStatus: "Closed",
    commissionNote: "Prices are starting rates in USD.",
    fursuitStatus: "Not published",
    fursuitNote: "This page is not published yet.",
    specialties: ["Character art", "Reference sheets", "Furry illustration"],
    notices: [],
    socialLinks: [],
    contacts: {
      email: "shincabinet@gmail.com",
      // Each link can have an optional `display` value. `display` is the text
      // visitors see; `url` is the actual destination when they click it.
      // Example: { label: "Discord", display: "@username", url: "https://discord.com/users/123..." }
      groups: [
        {
          label: "Preferred Contact",
          links: [
            { label: "Discord", url: "https://discord.com/users/1441935642539069490" }
          ]
        },
        {
          label: "Support / Commissions / Adopts",
          links: [
            { label: "Patreon", url: "https://www.patreon.com/shincabinet" },
            { label: "YCH.art", url: "https://ych.art/user/shincabinet" },
            { label: "Ko-fi", url: "https://ko-fi.com/shincabinet" }
          ]
        },
        {
          label: "NSFW",
          links: [
            { label: "Twitter 18+", url: "https://x.com/shincabinet" },
            { label: "e621", url: "https://e621.net/posts?tags=shincabinet" },
            { label: "FurAffinity", url: "https://www.furaffinity.net/user/shincabinet" }
          ]
        },
        {
          label: "SFW",
          links: [
            { label: "Twitter", url: "https://x.com/shindresser" },
            { label: "DeviantArt", url: "https://www.deviantart.com/shincabinet" }
          ]
        },
        {
          label: "Other",
          links: [
            { label: "Toyhou.se", url: "https://toyhou.se/shincabinet" },
            { label: "Telegram", url: "https://t.me/shincabinet" }
          ]
        }
      ]
    }
  },

  characters: [
    {
      id: "shin",
      path: "/characters/shin/",
      name: "Shin",
      pronouns: "he / him",
      species: "Fox / wolf",
      role: "Primary character",
      category: "primary",
      featured: true,

      // Reuse one canonical source wherever the same artwork appears.
      // The profile automatically falls back to `image`, so one file replacement updates
      // the directory card, profile header, gallery, homepage, and commission example.
      image: "/assets/images/gallery/full/shin-chibi-pose.webp?v=1",
      alt: "Chibi illustration of Shin standing with arms open",

      tagline: "Warm rust, dark fur, gold eyes, and deliberately irregular markings.",
      bio: [
        "My Sona <3"
      ],
      tags: ["Main character", "Fox", "Wolf", "Fursuit planned"],

      facts: [
        { label: "Design mood", value: "Warm / expressive" },
        { label: "Primary colors", value: "Rust + cream" },
        { label: "Physical build", value: "Planned" }
      ],

      // Palette entries may be plain hex strings or named swatches.
      palette: [
        { name: "Rust", hex: "#C94B2B" },
        { name: "Cream", hex: "#F2DDAE" },
        { name: "Dark fur", hex: "#342027" },
        { name: "Gold", hex: "#E7A31A" },
        { name: "Teal accent", hex: "#177E80" }
      ],

      // Optional profile sections. Leave an array empty and that section disappears.
      personality: [],
      designNotes: [],
      likes: [],
      dislikes: [],

      // References reuse canonical gallery files; `full` is optional and only needed if you
      // intentionally want a different preview image and full-size image.
      references: [
        {
          title: "Character card",
          image: "/assets/images/gallery/full/shin-character-card.webp?v=1",
          alt: "Character card showing multiple drawings and details for Shin",
          mature: true
        }
      ],

      // Optional outside links. The internal profile is now the primary character page.
      links: []
    }
  ],

  artworks: [
    {
      id: "michiru-speed",
      title: "Cheetah Speed",
      category: "illustration",
      character: "Michiru study",
      year: "2026",
      image: "/assets/images/gallery/full/michiru-cheetah-speed.webp?v=1",
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
      image: "/assets/images/gallery/full/shin-chibi-pose.webp?v=1",
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
      image: "/assets/images/gallery/full/shin-lounge.webp?v=1",
      alt: "Shin reclining in a relaxed pose",
      featured: true,
      mature: false
    },
    {
      id: "shin-icon-transparent",
      title: "Shin Icon Cutout",
      category: "chibi",
      character: "Shin",
      year: "2026",
      image: "/assets/images/gallery/full/shin-chibi-icon-transparent.webp?v=1",
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
      image: "/assets/images/gallery/full/michiru-chibi-icon.webp?v=1",
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
      image: "/assets/images/gallery/full/faputa-test.webp?v=1",
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
      image: "/assets/images/gallery/full/shin-character-card.webp?v=1",
      alt: "Character card showing multiple drawings and details for Shin",
      featured: false,
      mature: true
    },
    {
      id: "shin-pet-play",
      title: "Pet Play",
      category: "mature",
      character: "Shin",
      year: "2026",
      image: "/assets/images/gallery/full/shin-pet-play.webp?v=1",
      alt: "Adult-themed furry character illustration with harness and leash",
      featured: false,
      mature: true
    }
  ],

  /*
    ADOPTABLES
    ----------
    Add character designs here and they will appear automatically on /adoptable/.

    Example entry:
    {
      id: "design-name",
      name: "Design Name",
      price: "$60",
      status: "Available", // Available, Pending, or Sold
      image: "/assets/images/adoptables/design-name.webp",
      description: "A short note about the design.",
      url: "https://example.com/purchase-page"
    }
  */
  adoptables: [],

  // Kept empty until there is real fursuit portfolio work to publish.
  fursuitProjects: [],
  fursuitServices: [],
  fursuitProcess: [],

  commissions: [
    {
      name: "Chibi icon",
      price: "$25+",
      image: "/assets/images/gallery/full/michiru-chibi-icon.webp?v=1",
      description: "An expressive head icon with clean color and a transparent or simple background.",
      includes: ["One character", "Transparent PNG"]
    },
    {
      name: "Chibi full body",
      price: "$40+",
      image: "/assets/images/gallery/full/shin-chibi-pose.webp?v=1",
      description: "A simplified full-body pose focused on expression, silhouette, and markings.",
      includes: ["One character", "Transparent PNG"]
    },
    {
      name: "Full-body character",
      price: "$65+",
      image: "/assets/images/gallery/full/faputa-test.webp?v=1",
      description: "A finished full-body drawing with clean lines, color, and light shading.",
      includes: ["One character", "Plain or transparent background"]
    },
    {
      name: "Character card",
      price: "$125+",
      image: "/assets/images/gallery/full/shin-character-card.webp?v=1",
      mature: true,
      description: "A main pose with supporting expressions, details, or alternate drawings.",
      includes: ["One main full body", "Two to four supporting details"]
    }
  ]
};
