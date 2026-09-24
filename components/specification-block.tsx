import { Fragment } from "react";
import {
  NotebookLabel,
  NotebookRecordGroup,
  NotebookRecordRow,
} from "@/components/notebook-primitives";
import type { SpecificationField } from "@/content/site-content";
import { notebookSectionSequence } from "@/lib/notebook-motion";

type SpecificationBlockProps = {
  fields: SpecificationField[];
};

const stackGroupLabels = new Set([
  "Frontend and Backend",
  "DBs",
  "Infrastructure",
]);

function renderStackValue(value: string) {
  return value.split(" · ").map((segment, index) => {
    const separator = index === 0 ? null : " · ";
    const delimiterIndex = segment.indexOf(": ");

    if (delimiterIndex === -1) {
      return (
        <Fragment key={segment}>
          {separator}
          {segment}
        </Fragment>
      );
    }

    const label = segment.slice(0, delimiterIndex);

    if (!stackGroupLabels.has(label)) {
      return (
        <Fragment key={segment}>
          {separator}
          {segment}
        </Fragment>
      );
    }

    return (
      <Fragment key={segment}>
        {index === 0 ? null : <br />}
        <NotebookLabel as="span" className="text-annotation">
          {label}:
        </NotebookLabel>{" "}
        {segment.slice(delimiterIndex + 2)}
      </Fragment>
    );
  });
}

/**
 * The home sheet's Specification Block: the four standing facts — role,
 * location, focus, stack — stated as fields rather than prose.
 *
 * Each field caps itself with a plain hairline, not a ticked one: the rule
 * separates the field from what is above it, it does not bound a record (see
 * Design.md §5). The values are measurements of a kind, so they are set in the
 * data face.
 *
 * Two columns from `sm` up, one below. Reading order is DOM order either way,
 * so the group's stagger needs nothing else.
 */
export function SpecificationBlock({ fields }: SpecificationBlockProps) {
  return (
    <NotebookRecordGroup
      as="ul"
      label="Profile"
      step={notebookSectionSequence.entryStagger}
      className="grid w-full grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2"
    >
      {fields.map((field) => (
        <NotebookRecordRow key={field.label} className="pt-3.5">
          <NotebookLabel>{field.label}</NotebookLabel>
          <p className="mt-2.5 font-mono text-sm">
            {field.label === "Stack"
              ? renderStackValue(field.value)
              : field.value}
          </p>
        </NotebookRecordRow>
      ))}
    </NotebookRecordGroup>
  );
}
