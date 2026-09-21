"use client";

import type { CSSProperties } from "react";

/** How far the intro has got. `pending` is the state before the first open. */
export type ConsoleBannerIntro = "pending" | "typing" | "done";

type ConsoleBannerProps = {
  intro: ConsoleBannerIntro;
  /** Called once the banner has finished typing. */
  onIntroEnd: () => void;
};

/* The greeting in ANSI Shadow, the figlet face the banner has been set in
 * since it was exported from https://ascii-motion.app.
 *
 * `bannerColumns` is the width of the widest row. The reveal steps once per
 * column, so it has to know how many there are; counting it from the art
 * keeps it honest if the greeting is ever reworded. */
const bannerGreeting = "Hello there!";
const bannerArt = `██╗  ██╗███████╗██╗     ██╗      ██████╗     ████████╗██╗  ██╗███████╗██████╗ ███████╗██╗
██║  ██║██╔════╝██║     ██║     ██╔═══██╗    ╚══██╔══╝██║  ██║██╔════╝██╔══██╗██╔════╝██║
███████║█████╗  ██║     ██║     ██║   ██║       ██║   ███████║█████╗  ██████╔╝█████╗  ██║
██╔══██║██╔══╝  ██║     ██║     ██║   ██║       ██║   ██╔══██║██╔══╝  ██╔══██╗██╔══╝  ╚═╝
██║  ██║███████╗███████╗███████╗╚██████╔╝       ██║   ██║  ██║███████╗██║  ██║███████╗██╗
╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝ ╚═════╝        ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝╚═╝`;
const bannerColumns = Math.max(
  ...bannerArt.split("\n").map((row) => row.length),
);

/**
 * The console's login banner.
 *
 * A shell prints its motd before the first prompt; this one says hello. It
 * types itself left to right the first time the window opens — after that the
 * session already has it and it stays as it landed.
 *
 * It is `role="img"` rather than `aria-hidden`: the greeting is the one thing
 * the boot text under it does not also say, so it is announced as its own two
 * words instead of as ninety columns of box-drawing characters.
 *
 * Motion lives in `app/motion.css` (`.console-banner-word`). What travels from
 * here is the column count, because that is data about the art rather than a
 * timing.
 */
export function ConsoleBanner({ intro, onIntroEnd }: ConsoleBannerProps) {
  return (
    <div className="console-banner" data-intro={intro}>
      <pre
        role="img"
        aria-label={bannerGreeting}
        className="console-banner-word"
        style={{ "--console-banner-columns": bannerColumns } as CSSProperties}
        onAnimationEnd={onIntroEnd}
      >
        {bannerArt}
      </pre>
    </div>
  );
}
