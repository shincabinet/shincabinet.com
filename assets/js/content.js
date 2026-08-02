/*
  EDIT THIS FILE FIRST.
  Every homepage card, character, artwork, service, notice, and commission option is data-driven.
  Replace placeholders, save, commit, and push—no build step required.
*/
window.SHIN_SITE = {
  site: {
    name: "Shin Cabinet",
    shortName: "SHIN",
    artistName: "Your Artist Name",
    handle: "@shincabinet",
    intro: "Expressive furry illustration, character design, and fursuit work—kept in one carefully curated cabinet.",
    profileBlurb: "Character-focused illustration, design, and physical costume craft. Digital ideas are developed with real-world silhouettes, materials, and movement in mind.",
    email: "commissions@example.com",
    commissionStatus: "Open",
    commissionNote: "Booking a small art queue",
    fursuitStatus: "Portfolio builds",
    fursuitNote: "Not accepting full public fursuit commissions yet.",
    specialties: ["Furry art", "Character design", "Fursuit development", "3D fabrication"],
    notices: [
      { label: "Art queue", value: "Open", tone: "open" },
      { label: "Fursuit queue", value: "Portfolio only", tone: "limited" },
      { label: "Current focus", value: "Building the first mini partial", tone: "neutral" }
    ],
    socialLinks: [
      { label: "Toyhouse", url: "https://toyhou.se/" },
      { label: "Bluesky", url: "https://bsky.app/" },
      { label: "X / Twitter", url: "https://x.com/" }
    ]
  },

  characters: [
    {
      id: "ember", name: "Ember", pronouns: "he / him", species: "Marbled fox", role: "Primary sona", category: "primary", featured: true,
      image: "/assets/images/characters/ember.svg", tagline: "Bright energy, sharp silhouettes, organized chaos.",
      bio: "Ember is the face of the cabinet: expressive, ambitious, and built around high-contrast marbling that reads clearly in illustration and costume work.",
      palette: ["#F47A24", "#FFB55A", "#1B1720", "#F7EADC"], tags: ["Fox", "Marbled", "Main sona", "Fursuit planned"],
      facts: [{label:"Height",value:"6′0″"},{label:"Demeanor",value:"Bold / playful"},{label:"Design use",value:"Primary brand character"}], toyhouse: "https://toyhou.se/"
    },
    {
      id: "violet", name: "Violet", pronouns: "she / her", species: "Canine spirit", role: "Story character", category: "supporting", featured: true,
      image: "/assets/images/characters/violet.svg", tagline: "Soft colors, loud opinions, immaculate accessories.",
      bio: "Violet balances cozy shapes with theatrical details. Her design showcases fashion-forward character art and polished reference sheets.",
      palette: ["#A387FF", "#E8DFFF", "#30263E", "#FFB7D5"], tags: ["Canine", "Fashion", "Pastel"],
      facts: [{label:"Story role",value:"Lead support"},{label:"Demeanor",value:"Dramatic / warm"},{label:"Design focus",value:"Wardrobe"}], toyhouse: "https://toyhou.se/"
    },
    {
      id: "moss", name: "Moss", pronouns: "they / them", species: "Highland ox", role: "Design study", category: "guest", featured: true,
      image: "/assets/images/characters/moss.svg", tagline: "Chunky shapes and graphic natural patterns.",
      bio: "Moss explores how complex fur markings can become simple, deliberate shapes that translate cleanly into physical fabrication.",
      palette: ["#B9D36A", "#ECE2C4", "#4A3B30", "#E8794E"], tags: ["Ox", "Natural", "Fursuit-ready"],
      facts: [{label:"Build type",value:"Mini partial concept"},{label:"Demeanor",value:"Grounded / gentle"},{label:"Design focus",value:"Pattern readability"}], toyhouse: "https://toyhou.se/"
    },
    {
      id: "nova", name: "Nova", pronouns: "any pronouns", species: "Cyber jackal", role: "Experimental character", category: "supporting", featured: true,
      image: "/assets/images/characters/nova.svg", tagline: "Synthetic glow with a handmade heart.",
      bio: "Nova creates space for angular forms, emissive accents, and technology-inspired costume concepts without losing an expressive face.",
      palette: ["#50E6FF", "#8C74FF", "#151826", "#F6F1E8"], tags: ["Jackal", "Cyber", "Glow"],
      facts: [{label:"Era",value:"Near-future"},{label:"Demeanor",value:"Curious / restless"},{label:"Design focus",value:"Lighting"}], toyhouse: "https://toyhou.se/"
    }
  ],

  artworks: [
    { id:"marbled-reference", title:"Marbled Reference", category:"reference", character:"Ember", year:"2026", image:"/assets/images/gallery/art-01.svg", alt:"Placeholder artwork for a marbled fox character reference sheet", size:"wide" },
    { id:"late-shift", title:"Late Shift", category:"illustration", character:"Ember", year:"2026", image:"/assets/images/gallery/art-02.svg", alt:"Placeholder illustration with orange and violet lighting", size:"tall" },
    { id:"violet-lookbook", title:"Violet Lookbook", category:"reference", character:"Violet", year:"2026", image:"/assets/images/gallery/art-03.svg", alt:"Placeholder fashion reference sheet for a purple canine", size:"standard" },
    { id:"moss-pattern", title:"Pattern Language", category:"design", character:"Moss", year:"2026", image:"/assets/images/gallery/art-04.svg", alt:"Placeholder graphic fur-pattern design study", size:"standard" },
    { id:"neon-jackal", title:"Neon Jackal", category:"illustration", character:"Nova", year:"2026", image:"/assets/images/gallery/art-05.svg", alt:"Placeholder cyber jackal portrait", size:"tall" },
    { id:"paw-study", title:"Paw Construction Study", category:"costume", character:"Workshop", year:"2026", image:"/assets/images/gallery/art-06.svg", alt:"Placeholder costume paw construction sheet", size:"wide" },
    { id:"expressions", title:"Expression Sprint", category:"design", character:"Mixed cast", year:"2026", image:"/assets/images/gallery/art-07.svg", alt:"Placeholder character expression study", size:"standard" },
    { id:"commission-sample", title:"Commission Sample", category:"commission", character:"Client character", year:"2026", image:"/assets/images/gallery/art-08.svg", alt:"Placeholder finished furry art commission", size:"standard" }
  ],

  fursuitProjects: [
    { title:"Marbled Fox Mini Partial", status:"In development", phase:"Digital sculpt", image:"/assets/images/gallery/art-06.svg", description:"A first complete pipeline test covering head-base modeling, printing, sewing, finishing, and photography." },
    { title:"Handpaw Pattern Study", status:"Prototype", phase:"Pattern refinement", image:"/assets/images/gallery/art-04.svg", description:"Testing finger shape, lining access, seam durability, and readable paw-pad silhouettes." },
    { title:"Expression System", status:"Research", phase:"Concept design", image:"/assets/images/gallery/art-07.svg", description:"Exploring interchangeable or mechanically assisted expressions without sacrificing comfort." }
  ],
  fursuitServices: [
    { name:"Character-to-suit design", text:"Translate a 2D character into markings, shapes, and materials that remain readable in motion.", availability:"Available for art commissions" },
    { name:"3D head-base development", text:"Digital sculpting and print-oriented development with airflow, vision, assembly, and repair in mind.", availability:"Portfolio development" },
    { name:"Mini partial fabrication", text:"Head, handpaws, and tail developed as one visually consistent character package.", availability:"Not publicly open yet" }
  ],
  fursuitProcess: [
    { number:"01", title:"Translate", text:"Resolve the character into a buildable silhouette, marking plan, and material list." },
    { number:"02", title:"Prototype", text:"Model or pattern the structural pieces and test fit before expensive finish work." },
    { number:"03", title:"Fabricate", text:"Print, sew, assemble, shave, line, and reinforce with maintenance in mind." },
    { number:"04", title:"Finish", text:"Fit-test, photograph, document care, and archive the build for future repairs." }
  ],

  commissions: [
    { name:"Portrait", eyebrow:"Head + shoulders", price:"From $75", description:"A polished character portrait with expressive posing and a simple graphic background.", includes:["One character","Clean linework + color","Web-size and full-size files"] },
    { name:"Full Illustration", eyebrow:"Most popular", price:"From $165", description:"A complete character piece with a deliberate pose, lighting pass, and designed backdrop.", includes:["One full-body character","Rendered lighting","Simple or abstract scene"] },
    { name:"Reference Sheet", eyebrow:"Design-focused", price:"From $240", description:"A readable character reference prepared for artists, makers, and future commissions.", includes:["Front + back views","Palette and details","One expression or accessory callout"] }
  ],
  process: [
    { number:"01", title:"Request", text:"Send your character, desired format, deadline, and any must-have details." },
    { number:"02", title:"Quote", text:"You receive a written scope, price, queue position, and payment schedule." },
    { number:"03", title:"Sketch", text:"Composition and design decisions are locked before final rendering begins." },
    { number:"04", title:"Delivery", text:"Final files are delivered after approval and the remaining balance is paid." }
  ]
};
