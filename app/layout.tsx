import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Space_Grotesk, Space_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { SiteConsoleProvider } from "@/components/console/console-provider";
import { SiteConsole } from "@/components/console/site-console";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { portfolioContent } from "@/content/site-content";
import "./globals.css";

const displayFont = Bebas_Neue({
  weight: ["400"],
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const bodyFont = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

/* Space Grotesk was drawn from Space Mono — same skeleton, same terminals.
 * The data face is the fixed-width cut of the text face already in use, not a
 * third voice.
 *
 * Regular only. The bold cut was drawn down on every page load — `next/font`
 * preloads every weight it is given — and the one rule that asked for it was
 * `.skip-link`, which sits off-screen until a keyboard reaches it. ~9 KB of
 * font on every visit for a link most visitors never focus; the skip link now
 * sets its own weight to 400. */
const monoFont = Space_Mono({
  weight: ["400"],
  variable: "--font-mono-face",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: portfolioContent.identity.name,
    template: `%s | ${portfolioContent.identity.name}`,
  },
  description: portfolioContent.identity.description,
};

/* Supporting browsers resize the layout viewport around the software keyboard,
 * which is all the Site Console needs from them; iOS does not, so the console
 * measures `visualViewport` itself. Scaling stays on the default — a page that
 * cannot be pinched is a page some readers cannot read. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
    >
      <body className="flex min-h-dvh flex-col bg-paper text-ink leading-relaxed">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>

          <SiteConsoleProvider>
            <div className="flex w-full flex-1 flex-col p-6">
              <SiteHeader
                identity={portfolioContent.identity}
                primaryWayfinding={portfolioContent.primaryWayfinding}
              />

              <main
                id="main-content"
                className="mx-auto w-full max-w-270 flex-1 pb-16"
              >
                {children}
              </main>

              <SiteFooter closingRecord={portfolioContent.closingRecord} />
            </div>

            {/* Mounted once at the root so the session survives navigation. */}
            <SiteConsole
              content={portfolioContent.console}
              wayfinding={portfolioContent.primaryWayfinding}
            />
          </SiteConsoleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
