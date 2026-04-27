import type { StaticImageData } from "next/image";
import coverFromTheSoul from "@/content/covers/from-the-soul.jpg";
import coverBirthOfTheCool from "@/content/covers/birth-of-the-cool.jpg";
import coverWinelight from "@/content/covers/winelight.jpg";
import coverAdamsApple from "@/content/covers/adams-apple.jpg";
import workLevi from "@/content/work/levi.png";
import workHarrods from "@/content/work/harrods.png";
import workFielmann from "@/content/work/fielmann.png";
import workTennet from "@/content/work/tennet.png";
import workFussballde from "@/content/work/fussballde.png";

export type NavItem = {
  href: string;
  label: string;
};

export type CvEntry = {
  organization: string;
  role: string;
  years: string;
};

export type TrackEntry = {
  title: string;
  artist: string;
  album: string;
  musicalKey: string;
  cover: StaticImageData;
  spotifyUrl: string;
  appleMusicUrl: string;
};

export type WorkEntry = {
  client: string;
  url: string;
  description: string;
  techStack: string[];
  image: StaticImageData;
};

export type ContactLink = {
  label: string;
  href: string;
  value: string;
};

export const siteMeta = {
  name: "Constantin Unterkofler",
  shortName: "CU",
  description:
    "Personal portfolio of Constantin Unterkofler, a Senior Software Engineer building thoughtful digital products and scalable web experiences.",
  shortBlurb: "Senior Software Engineer at Jung von Matt Tech.",
};

export const headerNavItems: NavItem[] = [
  { href: "/about", label: "About me" },
  { href: "/contact", label: "Contact" },
];

export const footerNavItems: NavItem[] = [
  { href: "/work", label: "Work" },
  { href: "/play", label: "Play" },
];

export const aboutParagraphs = [
  "I’m a Senior Software Engineer passionate about building thoughtful digital products and scalable web experiences. Italian-German, grew up in Bolzano, Italy, now based in Berlin. I studied Philosophy and Cultural Studies before earning a degree in Software Engineering. Currently I work at JvM TECH. Outside of work, I play guitar with a love for funk, neo-soul, pop, and jazz.",
];

export const cvEntries: CvEntry[] = [
  {
    organization: "Jung von Matt TECH",
    role: "Senior Software Engineer",
    years: "2021–",
  },
  {
    organization: "WESOUND",
    role: "Project Manager & Software Engineer",
    years: "2015–21",
  },
  {
    organization: "CODE University of Applied Sciences",
    role: "BSc Software Engineering",
    years: "2021–25",
  },
  {
    organization: "Humboldt University Berlin",
    role: "BA Cultural Studies & Philosophy",
    years: "2017–21",
  },
];

export const trackEntries: TrackEntry[] = [
  {
    title: "Lines and Spaces",
    artist: "Joe Lovano",
    album: "From the Soul",
    musicalKey: "C",
    cover: coverFromTheSoul,
    spotifyUrl:
      "https://open.spotify.com/search/Lines%20and%20Spaces%20Joe%20Lovano",
    appleMusicUrl:
      "https://music.apple.com/us/search?term=Lines%20and%20Spaces%20Joe%20Lovano",
  },
  {
    title: "Darn That Dream",
    artist: "Miles Davis",
    album: "Birth of the Cool",
    musicalKey: "G",
    cover: coverBirthOfTheCool,
    spotifyUrl:
      "https://open.spotify.com/search/Darn%20That%20Dream%20Miles%20Davis",
    appleMusicUrl:
      "https://music.apple.com/us/search?term=Darn%20That%20Dream%20Miles%20Davis",
  },
  {
    title: "Just the Two of Us",
    artist: "Grover Washington Jr., Bill Withers",
    album: "Winelight",
    musicalKey: "Db",
    cover: coverWinelight,
    spotifyUrl:
      "https://open.spotify.com/search/Just%20the%20Two%20of%20Us%20Grover%20Washington",
    appleMusicUrl:
      "https://music.apple.com/us/search?term=Just%20the%20Two%20of%20Us%20Grover%20Washington",
  },
  {
    title: "Footprints",
    artist: "Wayne Shorter",
    album: "Adam's Apple",
    musicalKey: "Cm",
    cover: coverAdamsApple,
    spotifyUrl: "https://open.spotify.com/search/Footprints%20Wayne%20Shorter",
    appleMusicUrl:
      "https://music.apple.com/us/search?term=Footprints%20Wayne%20Shorter",
  },
];

export const workEntries: WorkEntry[] = [
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
    image: workLevi,
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
    image: workHarrods,
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
    image: workFielmann,
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
    image: workTennet,
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
    image: workFussballde,
  },
];

export const contactLinks: ContactLink[] = [
  {
    label: "Email",
    href: "mailto:hello@replace-me.com",
    value: "hello@replace-me.com",
  },
  {
    label: "GitHub",
    href: "https://github.com/replace-me",
    value: "github.com/replace-me",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/replace-me/",
    value: "linkedin.com/in/replace-me",
  },
];

export const pageCopy = {
  home: {
    title: siteMeta.name,
    intro: siteMeta.shortBlurb,
    metaDescription: siteMeta.description,
  },
  about: {
    title: "About me",
    metaDescription:
      "Biography and CV for Constantin Unterkofler, Senior Software Engineer based in Berlin.",
  },
  play: {
    title: "What I currently play",
    metaDescription: "A rotating set of guitar tunes and studies.",
  },
  work: {
    title: "Work",
    intro:
      "At Jung von Matt TECH, I work hands-on within client teams to build and scale digital products, commerce platforms, and modern web applications for international brands including BMW, FIFA, Harrods, Levi's, SCAYLE / ABOUT YOU, Fielmann, and the DFB. Below you'll find some of my personal highlights.",
    metaDescription:
      "Client project highlights by Constantin Unterkofler — commerce platforms, web applications, and digital products for international brands.",
  },
  contact: {
    title: "Contact",
    metaDescription:
      "Contact details for Constantin Unterkofler via email, GitHub, and LinkedIn.",
  },
};
