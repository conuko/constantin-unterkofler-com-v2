import { greetings } from "@/content/greetings";
import packageJson from "../package.json";

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
    "Personal portfolio of Constantin Unterkofler, a Senior Software Engineer in Berlin building products end to end with a designer's eye for detail.",
};

const closingRecord = {
  copyrightYear: 2026,
  buildStamp: packageJson.version,
};

const aboutIntroduction = [
  "I’m a Senior Software Engineer who works best close to the people using what I build. At Jung von Matt, I partner closely with client teams from early discovery and technical direction through hands-on delivery and production handover, turning complex requirements into clear product decisions and scalable digital products.",
  "I care about the details that decide whether software feels right: how fast it responds, how it moves, and whether everyone can use it.",
  "Growing up Italian-German in Bolzano, I built my first website with JavaScript, HTML and CSS at 16. I later chose to study Philosophy and Cultural Studies before finding my way back to Software Engineering. That path still shapes how I ask questions, connect perspectives and turn an unclear problem into a clear decision.",
];

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

const workEntries: WorkEntry[] = [
  {
    client: "Fielmann",
    url: "https://www.fielmann.de/",
    primaryMetadata: "Commerce platform",
    description:
      "Set up Fielmann's e-commerce platform for Germany, Austria and Switzerland and kept it running in production for more than a year and a half as part of their engineering team, with one goal: bring the in-store experience of glasses, contact lenses and prescriptions into a software product. Later helped launch it in a new market with Fielmann Italy.",
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
    client: "Levi's",
    url: "https://www.scayle.com/customers/levi-strauss/",
    primaryMetadata: "Commerce migration",
    description:
      "Moving Levi's storefront off a legacy Vue 2 / Hybris stack onto Vue 3 / Nuxt 4 and the SCAYLE Commerce Engine, working inside SCAYLE's and Levi's engineering teams. A migration only succeeds if shoppers never notice it, so the work is as much about sequencing and feature parity as it is about new code.",
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
    client: "SB Migrate",
    url: "https://github.com/jungvonmatt/storyblok-migrations",
    primaryMetadata: "Open-source CLI",
    description:
      "Built SB Migrate for Fielmann: a CLI that extends Storyblok's own with type-safe, version-controlled migrations for schemas and content, including automatic rollbacks. Fielmann used it to move the huge schema library of its DACH shop to the new Fielmann Italy shop. It was later released as an open-source npm package.",
    techStack: [
      "TypeScript",
      "Node.js",
      "Commander.js",
      "Inquirer.js",
      "Storyblok CLI",
      "Storyblok API",
      "Vitest",
    ],
    marks: [
      {
        src: "/marks/sb-migrate.svg",
        filename: "sb-migrate.svg",
        alt: "SB Migrate terminal prompt mark",
        width: 240,
        height: 160,
      },
    ],
  },
  {
    client: "TenneT",
    url: "https://www.tennet.eu/",
    primaryMetadata: "Web platform",
    description:
      "Worked across the stack on TenneT's corporate website and its Transparency Data API: a Turborepo monorepo for the site, and a NestJS service on PostgreSQL with a Swagger / OpenAPI specification as the contract for everyone consuming the data.",
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
    client: "Harrods",
    url: "https://www.scayle.com/customers/harrods/",
    primaryMetadata: "Commerce delivery",
    description:
      "Built complex new features with SCAYLE's and Harrods' engineering teams and helped shape the storefront's architecture. Then made sure Harrods' own team could run it without us: technical workshops, architecture documentation and a full knowledge transfer.",
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
    client: "SCAYLE / ABOUT YOU",
    url: "https://www.scayle.com/",
    primaryMetadata: "Commerce platform",
    description:
      "Built and maintained storefronts on the SCAYLE Commerce Engine across several client projects. Helped turn the problems that kept coming back into reusable component patterns, CMS integrations and shared tooling, so other delivery teams could start from solved problems instead of rebuilding them.",
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
    client: "Movielingo",
    url: "https://github.com/Movielingo",
    primaryMetadata: "Language-learning app",
    description:
      "Built Movielingo, an open-source vocabulary-learning app based on movies and series. It helps people learn the words used in what they want to watch, using spaced repetition to move vocabulary into long-term memory.",
    techStack: ["Flutter", "Firebase", "Python", "spaCy"],
    marks: [
      {
        src: "/marks/sb-migrate.svg",
        filename: "sb-migrate.svg",
        alt: "Terminal prompt icon for Movielingo",
        width: 240,
        height: 160,
      },
    ],
  },
  {
    client: "FIFA",
    url: "https://publications.fifa.com/en/talent-development/",
    primaryMetadata: "Web platform",
    description:
      "Contributed to FIFA Publications, a multilingual hub for FIFA's global reports and studies: performance-optimized AMP pages that get readers to the content fast, fed by a Contentful pipeline that editors publish through.",
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
        role: "Senior Software Engineer",
        organization: {
          name: "Jung von Matt",
          url: "https://www.jvm.com/",
        },
      },
      specification: [
        {
          label: "Role",
          value: "Senior Software Engineer, Jung von Matt TECH",
        },
        { label: "Based", value: "Berlin · 52.5200° N, 13.4050° E" },
        {
          label: "Focus",
          value:
            "Building products end to end, from the user problem to production, with a designer's eye for detail: interfaces that are fast, accessible and coherent.",
        },
        {
          label: "Stack",
          value:
            "Frontend and Backend: TypeScript · React · Next.js · Vue · Nuxt · Node.js · NestJS · Tailwind CSS · React Native · Expo · Flutter · Python · DBs: PostgreSQL · Prisma · Redis · Infrastructure: Docker · Turborepo · AWS Services · GitHub Actions · Datadog",
        },
      ] satisfies SpecificationField[],
    },
  },
  about: {
    route: "/about",
    sectionCode: "A",
    sheetMeta: "Sheet A · 06 records",
    title: "About me",
    width: "reading",
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
    route: "/work",
    sectionCode: "W",
    sheetMeta: "Sheet W · 08 records",
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
        "At Jung von Matt, I join client engineering teams and work on their product as if it were our own. My part usually spans the first technical decisions and architecture, building across the stack, and keeping it running in production until the client team takes over. I build for what makes people come back: speed, reliability and a clear interface. Below are projects for international brands including FIFA, Harrods, Levi's, SCAYLE / ABOUT YOU and Fielmann.",
      entries: workEntries,
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

function specificationValue(label: string): string {
  const field = portfolioPages.home.content.specification.find(
    (candidate) => candidate.label === label,
  );

  if (!field) {
    throw new Error(`Missing Home specification field: ${label}`);
  }

  return field.value;
}

const siteConsoleContent: SiteConsoleContent = {
  identity: {
    name: identity.name,
    role: specificationValue("Role"),
    location: specificationValue("Based"),
  },
  repositoryUrl: "https://github.com/conuko/constantin-unterkofler-com-v2",
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
