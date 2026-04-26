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
  spotifyUrl: string;
  appleMusicUrl: string;
  tag: string;
};

export type BookEntry = {
  title: string;
  author: string;
  goodreadsUrl: string;
  tag: string;
};

export type ContactLink = {
  label: string;
  href: string;
  value: string;
};

export type HomeRoute = {
  href: string;
  label: string;
  description: string;
};

export const siteMeta = {
  name: "Constantin Unterkofler",
  shortName: "CU",
  role: "Senior Software Engineer",
  location: "Berlin, Germany",
  description:
    "Personal portfolio of Constantin Unterkofler, a Senior Software Engineer building thoughtful digital products and scalable web experiences.",
  shortBlurb:
    "Senior Software Engineer in Berlin, building thoughtful digital products and scalable web experiences.",
};

export const headerNavItems: NavItem[] = [
  { href: "/about", label: "About me" },
  { href: "/contact", label: "Contact" },
];

export const footerNavItems: NavItem[] = [
  { href: "/play", label: "Let's play" },
  { href: "/read", label: "Let's read" },
];

export const homeRoutes: HomeRoute[] = [
  {
    href: "/about",
    label: "About me",
    description: "Biography, current role, and a short editorial CV sheet.",
  },
  {
    href: "/play",
    label: "Play",
    description: "Recent tunes and studies arranged as restrained tune sheets.",
  },
  {
    href: "/read",
    label: "Read",
    description: "Books that stayed in rotation, presented as reading slips.",
  },
  {
    href: "/contact",
    label: "Contact",
    description: "A small set of direct links for email, GitHub, and LinkedIn.",
  },
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
    spotifyUrl:
      "https://open.spotify.com/search/Lines%20and%20Spaces%20Joe%20Lovano",
    appleMusicUrl:
      "https://music.apple.com/us/search?term=Lines%20and%20Spaces%20Joe%20Lovano",
    tag: "Sample entry / modal lines / phrasing study",
  },
  {
    title: "Darn That Dream",
    artist: "Jimmy Van Heusen",
    spotifyUrl: "https://open.spotify.com/search/Darn%20That%20Dream",
    appleMusicUrl: "https://music.apple.com/us/search?term=Darn%20That%20Dream",
    tag: "Sample entry / ballad feel / voice leading",
  },
  {
    title: "Just the Two of Us",
    artist: "Bill Withers",
    spotifyUrl:
      "https://open.spotify.com/search/Just%20the%20Two%20of%20Us%20Bill%20Withers",
    appleMusicUrl:
      "https://music.apple.com/us/search?term=Just%20the%20Two%20of%20Us%20Bill%20Withers",
    tag: "Sample entry / groove pocket / neo-soul touch",
  },
  {
    title: "Footprints",
    artist: "Wayne Shorter",
    spotifyUrl: "https://open.spotify.com/search/Footprints%20Wayne%20Shorter",
    appleMusicUrl:
      "https://music.apple.com/us/search?term=Footprints%20Wayne%20Shorter",
    tag: "Sample entry / modal harmony / comping language",
  },
];

export const bookEntries: BookEntry[] = [
  {
    title: "A Philosophy of Software Design",
    author: "John Ousterhout",
    goodreadsUrl:
      "https://www.goodreads.com/search?q=A+Philosophy+of+Software+Design",
    tag: "Sample shelf / engineering craft",
  },
  {
    title: "Ways of Seeing",
    author: "John Berger",
    goodreadsUrl: "https://www.goodreads.com/search?q=Ways+of+Seeing",
    tag: "Sample shelf / visual thinking",
  },
  {
    title: "The Creative Act",
    author: "Rick Rubin",
    goodreadsUrl: "https://www.goodreads.com/search?q=The+Creative+Act",
    tag: "Sample shelf / creative practice",
  },
  {
    title: "The Fire Next Time",
    author: "James Baldwin",
    goodreadsUrl: "https://www.goodreads.com/search?q=The+Fire+Next+Time",
    tag: "Sample shelf / language and perspective",
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
    eyebrow: "Portfolio",
    title: siteMeta.name,
    intro: siteMeta.shortBlurb,
    metaDescription: siteMeta.description,
  },
  about: {
    eyebrow: "About me",
    title: "About me",
    intro: "A short biography and an editorial CV sheet.",
    metaDescription:
      "Biography and CV for Constantin Unterkofler, Senior Software Engineer based in Berlin.",
  },
  play: {
    eyebrow: "Play",
    title: "Play",
    intro:
      "Recent tunes and studies gathered as restrained tune sheets with room to swap in the live rotation later.",
    metaDescription:
      "A rotating set of guitar tunes and studies, presented as restrained tune sheets.",
  },
  read: {
    eyebrow: "Read",
    title: "Read",
    intro:
      "Books collected as reading slips, seeded with sample entries until the current stack is filled in.",
    metaDescription:
      "A reading list of books and notes, presented as editorial reading slips.",
  },
  contact: {
    eyebrow: "Contact",
    title: "Contact",
    intro:
      "A short list of direct contact routes. Current values are placeholders isolated in the content layer.",
    metaDescription:
      "Contact details for Constantin Unterkofler via email, GitHub, and LinkedIn.",
  },
};
