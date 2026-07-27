import type { StaticImageData } from "next/image";
import coverElevatorMusic from "@/content/covers/elevator-music.jpg";
import coverLiveAtRonnieScotts from "@/content/covers/live-at-ronnie-scotts.jpg";
import coverOhCherie from "@/content/covers/oh-cherie.jpg";
import coverSongsInTheKeyOfLife from "@/content/covers/songs-in-the-key-of-life.jpg";
import coverTheFearlessFlyers from "@/content/covers/the-fearless-flyers.jpg";
import coverUndercurrent from "@/content/covers/undercurrent.jpg";
import workFielmann from "@/content/work/fielmann.png";
import workFussballde from "@/content/work/fussballde.png";
import workHarrods from "@/content/work/harrods.png";
import workLevi from "@/content/work/levi.png";
import workTennet from "@/content/work/tennet.png";

export type NavItem = {
  href: string;
  label: string;
};

type CvEntry = {
  organization: string;
  role: string;
  years: string;
};

export type CvSection = {
  title: string;
  entries: CvEntry[];
};

type ContentImage = {
  src: StaticImageData;
  alt: string;
};

export type TrackEntry = {
  title: string;
  artist: string;
  album: string;
  musicalKey: string;
  cover: ContentImage;
  spotifyUrl: string;
  appleMusicUrl: string;
};

export type WorkEntry = {
  client: string;
  url: string;
  description: string;
  techStack: string[];
  image: ContentImage;
};

export type ContactLink = {
  label: string;
  href: string;
  value: string;
};

const identity = {
  name: "Constantin Unterkofler",
  shortName: "CU",
  description:
    "Personal portfolio of Constantin Unterkofler, a Senior Software Engineer building thoughtful digital products and scalable web experiences.",
};

const aboutIntroduction =
  "I’m a Senior Software Engineer passionate about building thoughtful digital products and scalable web experiences. Italian-German, grew up in Bolzano, Italy, now based in Berlin. I studied Philosophy and Cultural Studies before earning a degree in Software Engineering. Currently I work at Jung von Matt. Outside of work, I play guitar with a love for funk, neo-soul, pop, and jazz.";

const cvSections: CvSection[] = [
  {
    title: "Work",
    entries: [
      {
        organization: "Jung von Matt TECH",
        role: "Senior Software Engineer",
        years: "2026–",
      },
      {
        organization: "Jung von Matt TECH",
        role: "Software Engineer",
        years: "2021–2026",
      },
      {
        organization: "WESOUND",
        role: "Junior Software Engineer",
        years: "2020–21",
      },
      {
        organization: "WESOUND",
        role: "Project & Office Manager",
        years: "2018–20",
      },
    ],
  },
  {
    title: "Education",
    entries: [
      {
        organization: "CODE University of Applied Sciences",
        role: "BSc Software Engineering",
        years: "2021–26",
      },
      {
        organization: "Humboldt University Berlin",
        role: "BA Cultural Studies & Philosophy",
        years: "2017–21",
      },
    ],
  },
];

const trackEntries: TrackEntry[] = [
  {
    title: "Oh Chérie",
    artist: "DAS MAER",
    album: "Oh Chérie",
    musicalKey: "Am",
    cover: {
      src: coverOhCherie,
      alt: "Oh Chérie cover with three red cherries on a blue background",
    },
    spotifyUrl: "https://open.spotify.com/search/Oh%20Ch%C3%A9rie%20DAS%20MAER",
    appleMusicUrl:
      "https://music.apple.com/us/search?term=Oh%20Ch%C3%A9rie%20DAS%20MAER",
  },
  {
    title: "Airplane Mode",
    artist: "Cory Wong",
    album: "Elevator Music for an Elevated Mood",
    musicalKey: "Db",
    cover: {
      src: coverElevatorMusic,
      alt: "Cory Wong playing guitar on the Elevator Music for an Elevated Mood cover",
    },
    spotifyUrl: "https://open.spotify.com/search/Airplane%20Mode%20Cory%20Wong",
    appleMusicUrl:
      "https://music.apple.com/us/search?term=Airplane%20Mode%20Cory%20Wong",
  },
  {
    title: "Isn't She Lovely",
    artist: "Stevie Wonder",
    album: "Songs in the Key of Life",
    musicalKey: "E",
    cover: {
      src: coverSongsInTheKeyOfLife,
      alt: "Songs in the Key of Life cover with warm concentric circles around Stevie Wonder",
    },
    spotifyUrl:
      "https://open.spotify.com/search/Isn't%20She%20Lovely%20Stevie%20Wonder",
    appleMusicUrl:
      "https://music.apple.com/us/search?term=Isn't%20She%20Lovely%20Stevie%20Wonder",
  },
  {
    title: "Darn That Dream",
    artist: "Bill Evans / Jim Hall",
    album: "Undercurrent",
    musicalKey: "G",
    cover: {
      src: coverUndercurrent,
      alt: "Undercurrent album cover showing a woman floating underwater",
    },
    spotifyUrl:
      "https://open.spotify.com/search/Darn%20That%20Dream%20Bill%20Evans%20Jim%20Hall",
    appleMusicUrl:
      "https://music.apple.com/us/search?term=Darn%20That%20Dream%20Bill%20Evans%20Jim%20Hall",
  },
  {
    title: "Ace of Aces",
    artist: "The Fearless Flyers",
    album: "The Fearless Flyers",
    musicalKey: "E",
    cover: {
      src: coverTheFearlessFlyers,
      alt: "The Fearless Flyers cover collage of the band playing guitar and drums",
    },
    spotifyUrl:
      "https://open.spotify.com/search/Ace%20of%20Aces%20Fearless%20Flyers",
    appleMusicUrl:
      "https://music.apple.com/us/search?term=Ace%20of%20Aces%20Fearless%20Flyers",
  },
  {
    title: "Stratus",
    artist: "Jeff Beck",
    album: "Live at Ronnie Scott's",
    musicalKey: "Em",
    cover: {
      src: coverLiveAtRonnieScotts,
      alt: "Jeff Beck playing guitar on the Live at Ronnie Scott's cover",
    },
    spotifyUrl: "https://open.spotify.com/search/Stratus%20Jeff%20Beck",
    appleMusicUrl:
      "https://music.apple.com/us/search?term=Stratus%20Jeff%20Beck",
  },
];

const workEntries: WorkEntry[] = [
  {
    client: "Levi's",
    url: "https://www.levi.com/",
    description:
      "Currently collaborating with the team at SCAYLE to migrate Levi's legacy Vue 2 codebase into a modern Vue 3 / Nuxt 4 e-commerce application powered by the SCAYLE Commerce Engine.",
    techStack: [
      "Vue 3",
      "Nuxt 4",
      "TypeScript",
      "Constructor",
      "Contentstack",
      "Tailwind CSS",
      "SCAYLE",
    ],
    image: {
      src: workLevi,
      alt: "Levi's homepage featuring the A New Shape of Blue denim campaign",
    },
  },
  {
    client: "Harrods",
    url: "https://www.harrods.com/",
    description:
      "Worked with the SCAYLE and Harrods teams to deliver new features and prepare a full client handover — including technical workshops, architectural documentation, and knowledge transfer.",
    techStack: [
      "Vue 3",
      "Nuxt 3",
      "TypeScript",
      "Contentful",
      "Algolia",
      "Tailwind CSS",
      "SCAYLE",
    ],
    image: {
      src: workHarrods,
      alt: "Harrods homepage featuring two fashion models in a summer garden",
    },
  },
  {
    client: "Fielmann",
    url: "https://www.fielmann.de/",
    description:
      "Set up and maintained the e-commerce platform across DACH, embedded in the client team for over 1.5 years. Also supported the launch of the Fielmann Italy shop.",
    techStack: [
      "Vue 3",
      "Nuxt 3",
      "TypeScript",
      "Storyblok",
      "Tailwind CSS",
      "SCAYLE",
    ],
    image: {
      src: workFielmann,
      alt: "Fielmann homepage featuring two people wearing sunglasses",
    },
  },
  {
    client: "TenneT",
    url: "https://www.tennet.eu/",
    description:
      "Turborepo-based monorepo powering TenneT's corporate website, careers platform, and Storybook design system — unifying shared components, design tokens, and Contentful tooling.",
    techStack: [
      "Next.js",
      "TypeScript",
      "Turborepo",
      "Contentful",
      "Tailwind CSS",
      "Storybook",
    ],
    image: {
      src: workTennet,
      alt: "TenneT Germany homepage with a wind turbine and solar panels in a green landscape",
    },
  },
  {
    client: "fussball.de",
    url: "https://next.fussball.de/",
    description:
      "Migrating a legacy platform into a modern Next.js application within a monorepo architecture using Turborepo for the shared code and the site code for the Fussball.de and BFV.de sites.",
    techStack: [
      "Next.js",
      "TypeScript",
      "Turborepo",
      "CSS Modules",
      "Storybook",
    ],
    image: {
      src: workFussballde,
      alt: "FUSSBALL.DE community homepage with an amateur football news feed and league subscriptions",
    },
  },
];

const contactLinks: ContactLink[] = [
  {
    label: "Email",
    href: "mailto:mail@constantinunterkofler.com",
    value: "mail@constantinunterkofler.com",
  },
  {
    label: "GitHub",
    href: "https://github.com/conuko",
    value: "github.com/conuko",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/constantin-unterkofler/",
    value: "linkedin.com/in/constantin-unterkofler",
  },
];

const portfolioPages = {
  home: {
    route: "/",
    title: identity.name,
    metadata: {
      title: "Home",
      description: identity.description,
    },
    content: {
      introduction: {
        role: "Senior Software Engineer",
        organization: {
          name: "Jung von Matt",
          url: "https://www.jvm.com/",
        },
      },
    },
  },
  about: {
    route: "/about",
    title: "About me",
    metadata: {
      title: "About me",
      description:
        "Biography and CV for Constantin Unterkofler, Senior Software Engineer based in Berlin.",
    },
    primaryWayfinding: {
      label: "About me",
      order: 1,
    },
    content: {
      introduction: aboutIntroduction,
      cvSections,
    },
  },
  contact: {
    route: "/contact",
    title: "Contact",
    metadata: {
      title: "Contact",
      description:
        "Contact details for Constantin Unterkofler via email, GitHub, and LinkedIn.",
    },
    primaryWayfinding: {
      label: "Contact",
      order: 2,
    },
    content: {
      entries: contactLinks,
    },
  },
  work: {
    route: "/work",
    title: "Work",
    metadata: {
      title: "Work",
      description:
        "Client project highlights by Constantin Unterkofler — commerce platforms, web applications, and digital products for international brands.",
    },
    primaryWayfinding: {
      label: "Work",
      order: 3,
    },
    content: {
      introduction:
        "At Jung von Matt, I work hands-on within client teams to build and scale digital products, commerce platforms, and modern web applications for international brands including BMW, FIFA, Harrods, Levi's, SCAYLE / ABOUT YOU, Fielmann, and the DFB. Below you'll find some of my personal highlights.",
      entries: workEntries,
    },
  },
  play: {
    route: "/play",
    title: "What I currently play",
    metadata: {
      title: "Play",
      description: "A rotating set of guitar tunes and studies.",
    },
    primaryWayfinding: {
      label: "Play",
      order: 4,
    },
    content: {
      entries: trackEntries,
    },
  },
} as const;

const primaryWayfinding: NavItem[] = Object.values(portfolioPages)
  .flatMap((page) =>
    "primaryWayfinding" in page
      ? [
          {
            href: page.route,
            label: page.primaryWayfinding.label,
            order: page.primaryWayfinding.order,
          },
        ]
      : [],
  )
  .sort((a, b) => a.order - b.order)
  .map(({ href, label }) => ({ href, label }));

export const portfolioContent = {
  identity,
  pages: portfolioPages,
  primaryWayfinding,
} as const;
