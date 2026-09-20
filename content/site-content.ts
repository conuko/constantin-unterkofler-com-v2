import type { StaticImageData } from "next/image";
import coverALittleLife from "@/content/books/a-little-life.jpg";
import coverDieDunkleSeiteDesMondes from "@/content/books/die-dunkle-seite-des-mondes.jpg";
import coverPresumedInnocent from "@/content/books/presumed-innocent.jpg";
import coverTheBlackEcho from "@/content/books/the-black-echo.webp";
import coverTheThreeBodyProblem from "@/content/books/the-three-body-problem.jpg";
import coverTomorrowAndTomorrowAndTomorrow from "@/content/books/tomorrow-and-tomorrow-and-tomorrow.jpg";
import coverElevatorMusic from "@/content/covers/elevator-music.jpg";
import coverLiveAtRonnieScotts from "@/content/covers/live-at-ronnie-scotts.jpg";
import coverOhCherie from "@/content/covers/oh-cherie.jpg";
import coverSongsInTheKeyOfLife from "@/content/covers/songs-in-the-key-of-life.jpg";
import coverTheFearlessFlyers from "@/content/covers/the-fearless-flyers.jpg";
import coverUndercurrent from "@/content/covers/undercurrent.jpg";
import { greetings } from "@/content/greetings";
import packageJson from "../package.json";

export type NavItem = {
  href: string;
  label: string;
};

type PublicationStatus = "published" | "unpublished";

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

export type PersonalRating = 0 | 1 | 2 | 3 | 4 | 5;

export type BookEntry = {
  title: string;
  author: string;
  completedAt: `${number}-${number}`;
  personalRating: PersonalRating;
  cover: ContentImage;
};

export type WorkEntry = {
  client: string;
  url?: string;
  primaryMetadata: string;
  description: string;
  descriptionReview?: "owner";
  techStack: string[];
  marks: WorkMark[];
};

export type WorkMark = {
  src: `/marks/${string}.svg`;
  filename: `${string}.svg`;
  alt: string;
  width: number;
  height: number;
};

export type SpecificationField = {
  label: string;
  value: string;
};

export type ContactLink = {
  label: string;
  href: string;
  value: string;
};

export type SiteConsoleContent = {
  identity: {
    name: string;
    role: string;
    location: string;
  };
  repositoryUrl: string;
  records: { index: string; label: string; meta: string }[];
};

const identity = {
  name: "Constantin Unterkofler",
  shortName: "CU",
  description:
    "Personal portfolio of Constantin Unterkofler, a Software Engineer building thoughtful digital products and scalable web experiences.",
};

const closingRecord = {
  copyrightYear: 2026,
  buildStamp: packageJson.version,
};

const aboutIntroduction =
  "I’m a Software Engineer working where client needs, product thinking and engineering meet. At Jung von Matt, I partner closely with client teams from early discovery and technical direction through hands-on delivery and production handover, turning complex requirements into clear product decisions and scalable digital products. Italian-German, I grew up in Bolzano and studied Philosophy and Cultural Studies before earning a degree in Software Engineering. That path still shapes how I ask questions, connect perspectives and make technology understandable.";

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

const bookEntries: BookEntry[] = [
  {
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    author: "Gabrielle Zevin",
    completedAt: "2026-08",
    personalRating: 5,
    cover: {
      src: coverTomorrowAndTomorrowAndTomorrow,
      alt: "Tomorrow, and Tomorrow, and Tomorrow cover with colorful stacked lettering over stylized ocean waves",
    },
  },
  {
    title: "The Black Echo",
    author: "Michael Connelly",
    completedAt: "2026-06",
    personalRating: 4,
    cover: {
      src: coverTheBlackEcho,
      alt: "The Black Echo cover with Michael Connelly's name above a silhouetted figure in a tunnel",
    },
  },
  {
    title: "The Three-Body Problem",
    author: "Liu Cixin",
    completedAt: "2026-05",
    personalRating: 4,
    cover: {
      src: coverTheThreeBodyProblem,
      alt: "The Three-Body Problem cover with a translucent pyramid beneath three celestial bodies",
    },
  },
  {
    title: "A Little Life",
    author: "Hanya Yanagihara",
    completedAt: "2026-04",
    personalRating: 4,
    cover: {
      src: coverALittleLife,
      alt: "A Little Life cover with a blue-toned close-up portrait",
    },
  },
  {
    title: "Presumed Innocent",
    author: "Scott Turow",
    completedAt: "2026-02",
    personalRating: 3,
    cover: {
      src: coverPresumedInnocent,
      alt: "Presumed Innocent cover with Scott Turow's name above a shadowed profile",
    },
  },
  {
    title: "Die dunkle Seite des Mondes",
    author: "Martin Suter",
    completedAt: "2026-02",
    personalRating: 5,
    cover: {
      src: coverDieDunkleSeiteDesMondes,
      alt: "Die dunkle Seite des Mondes cover with a colorful forest illustration on a cream field",
    },
  },
];

const workEntries: WorkEntry[] = [
  {
    client: "Levi's",
    url: "https://www.scayle.com/customers/levi-strauss/",
    primaryMetadata: "Commerce migration",
    description:
      "Currently working within SCAYLE and Levi's engineering teams to migrate the legacy Vue 2 / Hybris architecture into a modern Vue 3 / Nuxt 4 e-commerce application powered by the SCAYLE Commerce Engine.",
    techStack: [
      "Vue 3",
      "Nuxt 4",
      "TypeScript",
      "Constructor",
      "Contentstack",
      "SCAYLE Commerce Engine",
      "Storefront SDK",
    ],
    marks: [
      {
        src: "/marks/levi.svg",
        filename: "levi.svg",
        alt: "Levi's red Batwing mark",
        width: 722,
        height: 300,
      },
    ],
  },
  {
    client: "Harrods",
    url: "https://www.scayle.com/customers/harrods/",
    primaryMetadata: "Commerce delivery",
    description:
      "Worked within the SCAYLE and Harrods engineering teams to deliver complex new features, help with shaping the software architecture, and prepare a full client handover — including technical workshops, architectural documentation, and knowledge transfer.",
    techStack: [
      "Vue 3",
      "Nuxt 3",
      "TypeScript",
      "Contentful",
      "Algolia",
      "SCAYLE Commerce Engine",
      "Storefront SDK",
    ],
    marks: [
      {
        src: "/marks/harrods.svg",
        filename: "harrods.svg",
        alt: "Harrods green wordmark",
        width: 115,
        height: 49,
      },
    ],
  },
  {
    client: "Fielmann",
    url: "https://www.scayle.com/case-studies/fielmann/",
    primaryMetadata: "Commerce platform",
    description:
      "Set up and maintained the e-commerce platform across DACH, embedded in the client engineering team for over 1.5 years. Also supported the launch of the Fielmann Italy shop.",
    techStack: [
      "Vue 3",
      "Nuxt 3",
      "TypeScript",
      "Storyblok",
      "SCAYLE Commerce Engine",
      "Storefront SDK",
    ],
    marks: [
      {
        src: "/marks/fielmann.svg",
        filename: "fielmann.svg",
        alt: "Fielmann black wordmark",
        width: 115,
        height: 56,
      },
    ],
  },
  {
    client: "SCAYLE / ABOUT YOU",
    url: "https://www.scayle.com/",
    primaryMetadata: "Commerce platform",
    description:
      "Built and maintained commerce storefronts on the SCAYLE Commerce Engine across multiple client projects, contributing reusable component patterns, CMS integrations, and shared tooling used across delivery teams.",
    techStack: [
      "Vue 3",
      "Nuxt 3",
      "TypeScript",
      "Storyblok",
      "Tailwind CSS",
      "SCAYLE",
    ],
    marks: [
      {
        src: "/marks/scayle.svg",
        filename: "scayle.svg",
        alt: "SCAYLE wordmark with green directional accents",
        width: 2036,
        height: 471,
      },
      {
        src: "/marks/about-you.svg",
        filename: "about-you.svg",
        alt: "ABOUT YOU black-and-white wordmark",
        width: 242,
        height: 48,
      },
    ],
  },
  {
    client: "FIFA",
    url: "https://publications.fifa.com/en/talent-development/",
    primaryMetadata: "Web platform",
    description:
      "Contributed to the FIFA Publications platform — a multilingual content hub delivering global reports and studies, with performance-optimized AMP pages and a Contentful-powered content pipeline.",
    techStack: ["JavaScript", "AMP", "Contentful", "Python"],
    marks: [
      {
        src: "/marks/fifa.svg",
        filename: "fifa.svg",
        alt: "FIFA blue wordmark",
        width: 677,
        height: 223,
      },
    ],
  },
  {
    client: "TenneT",
    url: "https://www.tennet.eu/",
    primaryMetadata: "Web platform",
    description:
      "Turborepo-based monorepo powering TenneT's corporate website, together with a Nest.js powered Transparency Data API, a PostgreSQL database, and a Swagger / OpenAPI specification for the API.",
    techStack: [
      "Next.js",
      "TypeScript",
      "Turborepo",
      "NestJS",
      "PostgreSQL",
      "Swagger / OpenAPI",
    ],
    marks: [
      {
        src: "/marks/tennet.svg",
        filename: "tennet.svg",
        alt: "TenneT blue-and-green wordmark",
        width: 154,
        height: 29,
      },
    ],
  },
  {
    client: "fussball.de",
    url: "https://next.fussball.de/",
    primaryMetadata: "Platform migration",
    description:
      "Migrating a legacy platform into a modern Next.js application within a monorepo architecture using Turborepo for the shared code and the site code for the Fussball.de and BFV.de sites.",
    techStack: [
      "Next.js",
      "TypeScript",
      "Turborepo",
      "CSS Modules",
      "Storybook",
    ],
    marks: [
      {
        src: "/marks/fussball-de.svg",
        filename: "fussball-de.svg",
        alt: "fussball.de green field mark",
        width: 545,
        height: 360,
      },
    ],
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
    publicationStatus: "published" satisfies PublicationStatus,
    route: "/",
    sectionCode: "",
    sheetMeta: "",
    title: "Constantin",
    width: "reading",
    metadata: {
      title: "Home",
      description: identity.description,
    },
    content: {
      greetings,
      introduction: {
        role: "Software Engineer",
        organization: {
          name: "Jung von Matt",
          url: "https://www.jvm.com/",
        },
      },
      specification: [
        { label: "Role", value: "Software Engineer, Jung von Matt TECH" },
        { label: "Based", value: "Berlin · 52.5200° N, 13.4050° E" },
        {
          label: "Focus",
          value:
            "Full stack engineering · Embedded client partnerships · E-commerce platforms · Making complex software feel simple",
        },
        {
          label: "Stack",
          value:
            "TypeScript · React / Next · Vue / Nuxt · Node.js / NestJS · PostgreSQL / Prisma · Redis · Docker · Tailwind CSS · Turborepo · React Native / Expo · Go",
        },
      ] satisfies SpecificationField[],
    },
  },
  about: {
    publicationStatus: "published" satisfies PublicationStatus,
    route: "/about",
    sectionCode: "A",
    sheetMeta: "Sheet A · 06 records",
    title: "About me",
    width: "reading",
    metadata: {
      title: "About me",
      description:
        "Biography and CV for Constantin Unterkofler, Software Engineer based in Berlin.",
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
    publicationStatus: "published" satisfies PublicationStatus,
    route: "/contact",
    sectionCode: "C",
    sheetMeta: "Sheet C · 03 routes",
    title: "Contact",
    width: "reading",
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
      introduction: "Reach me via email, GitHub, or LinkedIn.",
      entries: contactLinks,
    },
  },
  work: {
    publicationStatus: "published" satisfies PublicationStatus,
    route: "/work",
    sectionCode: "W",
    sheetMeta: "Sheet W · 07 records",
    title: "Work",
    width: "collection",
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
        "At Jung von Matt, I work embedded in client engineering teams to build and scale digital products and solve complex commerce and platform challenges. My role often spans the early technical work, architecture, implementation, and handover. Below are a few projects I have contributed to for international brands including BMW, FIFA, Harrods, Levi's, SCAYLE / ABOUT YOU, Fielmann, and the DFB.",
      entries: workEntries,
    },
  },
  read: {
    publicationStatus: "unpublished" satisfies PublicationStatus,
    route: "/read",
    sectionCode: "R",
    sheetMeta: "Sheet R · 06 records",
    title: "What I recently read",
    width: "collection",
    metadata: {
      title: "Read",
      description:
        "The six books most recently completed by Constantin Unterkofler, with personal ratings.",
    },
    primaryWayfinding: {
      label: "Read",
      order: 4,
    },
    content: {
      introduction:
        "I like to read books. Here are a couple of my recent reads. More to come.",
      entries: bookEntries,
    },
  },
  play: {
    publicationStatus: "unpublished" satisfies PublicationStatus,
    route: "/play",
    sectionCode: "P",
    sheetMeta: "Sheet P · 06 records",
    title: "What I currently play",
    width: "collection",
    metadata: {
      title: "Play",
      description: "A rotating set of guitar tunes and studies.",
    },
    primaryWayfinding: {
      label: "Play",
      order: 5,
    },
    content: {
      introduction:
        "When I'm not coding, you'll usually find me with a guitar in hand – whether that's tracking in the studio or playing live on stage with Das Maer and other local Berlin artists. Here’s a rotating selection of current tunes I'm playing and studying.",
      entries: trackEntries,
    },
  },
} as const;

const primaryWayfinding: NavItem[] = Object.values(portfolioPages)
  .filter((page) => page.publicationStatus === "published")
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

function specificationValue(label: string): string {
  const field = portfolioPages.home.content.specification.find(
    (candidate) => candidate.label === label,
  );

  if (!field) {
    throw new Error(`Missing Home specification field: ${label}`);
  }

  return field.value;
}

const githubLink = contactLinks.find((link) => link.label === "GitHub");

if (!githubLink) {
  throw new Error("Missing GitHub contact link");
}

const siteConsoleContent: SiteConsoleContent = {
  identity: {
    name: identity.name,
    role: specificationValue("Role"),
    location: specificationValue("Based"),
  },
  repositoryUrl: githubLink.href,
  records: workEntries.map((entry, index) => ({
    index: `W–${String(index + 1).padStart(2, "0")}`,
    label: entry.client,
    meta: entry.primaryMetadata.toLowerCase(),
  })),
};

export const portfolioContent = {
  identity,
  closingRecord,
  pages: portfolioPages,
  primaryWayfinding,
  console: siteConsoleContent,
} as const;
