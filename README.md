# constantin-unterkofler.com

Personal portfolio of Constantin Unterkofler — Senior Software Engineer based in Berlin, building thoughtful digital products and scalable web experiences.

## Stack

- **Framework** — [Next.js 16](https://nextjs.org) (App Router)
- **Styling** — [Tailwind CSS 4](https://tailwindcss.com)
- **Linting & Formatting** — [Biome](https://biomejs.dev)
- **Language** — TypeScript, React 19

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [localhost:3000](http://localhost:3000) to view the site.

## Scripts

| Command | Description |
| ---------------- | -------------------------------- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm test` | Run the in-process and browser acceptance suites |
| `pnpm test:unit` | Run fast in-process tests once |
| `pnpm test:unit:watch` | Run fast in-process tests in watch mode |
| `pnpm test:acceptance` | Start the portfolio and run browser acceptance tests |
| `pnpm lint` | Run Biome checks |
| `pnpm format` | Auto-format with Biome |
| `pnpm typecheck` | Type-check without emitting |

## Browser acceptance tests

Install Chromium once after installing dependencies:

```bash
pnpm exec playwright install chromium
```

Then run the complete Portfolio Page acceptance workflow with one command:

```bash
pnpm test:acceptance
```

The workflow starts the portfolio automatically and exercises every Portfolio
Page at desktop and mobile sizes.

## Structure

```
app/          Pages (home, about, play, read, contact)
components/   Shared UI components
content/      Site copy, CV, and content data
```
