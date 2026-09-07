"use client";

import * as m from "motion/react-m";
import {
  NotebookLabel,
  NotebookRecordGroup,
  NotebookRecordRow,
  NotebookRecordRowBody,
  NotebookRowIndex,
  NotebookSectionHeading,
} from "@/components/notebook-primitives";
import type { CvSection } from "@/content/site-content";
import {
  notebookRecordRowsReveal,
  notebookSectionGroupReveal,
  notebookSectionReveal,
} from "@/lib/notebook-motion";

type CvProps = {
  sectionCode: string;
  sections: CvSection[];
};

function formatRecordIndex(sectionCode: string, position: number) {
  return `${sectionCode}–${String(position).padStart(2, "0")}`;
}

/**
 * The CV registers section by section: Work heading, Work entries, Education
 * heading, Education entries. Rows are indexed continuously across sections.
 */
export function Cv({ sectionCode, sections }: CvProps) {
  let position = 0;

  return (
    <NotebookRecordGroup
      variants={notebookSectionGroupReveal}
      className="flex w-full flex-col gap-10"
    >
      {sections.map((section) => (
        <m.section
          key={section.title}
          variants={notebookSectionReveal}
          className="w-full"
        >
          <NotebookSectionHeading>{section.title}</NotebookSectionHeading>
          <m.ol variants={notebookRecordRowsReveal} className="mt-3">
            {section.entries.map((entry) => {
              position += 1;

              return (
                <NotebookRecordRow key={`${entry.organization}-${entry.years}`}>
                  <NotebookRecordRowBody>
                    <NotebookRowIndex>
                      {formatRecordIndex(sectionCode, position)}
                    </NotebookRowIndex>
                    <div className="order-last min-w-0 basis-full sm:order-none sm:flex-1 sm:basis-auto">
                      <h3 className="font-semibold text-sm">
                        {entry.organization}
                      </h3>
                      <p className="text-ink-muted text-sm">{entry.role}</p>
                    </div>
                    <NotebookLabel className="ml-auto tabular-nums sm:ml-0 sm:w-24 sm:text-right">
                      {entry.years}
                    </NotebookLabel>
                  </NotebookRecordRowBody>
                </NotebookRecordRow>
              );
            })}
          </m.ol>
        </m.section>
      ))}
    </NotebookRecordGroup>
  );
}
