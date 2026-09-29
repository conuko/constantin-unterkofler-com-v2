import { Fragment } from "react";
import {
  NotebookLabel,
  NotebookRecordGroup,
  NotebookRecordRow,
} from "@/components/notebook-primitives";
import type { SpecificationField } from "@/content/site-content";
import { cn } from "@/lib/utils/cn";

type SpecificationBlockProps = {
  fields: SpecificationField[];
};

const proseFields = new Set(["Focus", "Stack"]);

const stackGroupLabels = new Set([
  "Frontend and Backend",
  "DBs",
  "Infrastructure",
]);

/* A technology never breaks inside its name ("AWS Services", "GitHub
 * Actions"), and the separator holds on to the item before it with a
 * no-break space, so a wrapped line always starts on a name and never on a
 * stray "·". */
function StackItem({ children }: { children: string }) {
  return <span className="whitespace-nowrap">{children}</span>;
}

const stackSeparator = "\u00a0· ";

function renderStackValue(value: string) {
  return value.split(" · ").map((segment, index) => {
    const separator = index === 0 ? null : stackSeparator;
    const delimiterIndex = segment.indexOf(": ");
    const label =
      delimiterIndex === -1 ? null : segment.slice(0, delimiterIndex);

    if (label === null || !stackGroupLabels.has(label)) {
      return (
        <Fragment key={segment}>
          {separator}
          <StackItem>{segment}</StackItem>
        </Fragment>
      );
    }

    /* A group starts its own line, so it takes no separator. */
    return (
      <Fragment key={segment}>
        {index === 0 ? null : <br />}
        <NotebookLabel as="span" className="text-annotation">
          {label}:
        </NotebookLabel>{" "}
        <StackItem>{segment.slice(delimiterIndex + 2)}</StackItem>
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
      className="grid w-full grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2"
    >
      {fields.map((field) => (
        <NotebookRecordRow key={field.label} className="pt-3.5">
          <NotebookLabel>{field.label}</NotebookLabel>
          <p
            className={cn(
              "mt-2.5 font-mono text-sm leading-relaxed",
              proseFields.has(field.label) ? "text-pretty" : "text-balance",
            )}
          >
            {field.label === "Stack"
              ? renderStackValue(field.value)
              : field.value}
          </p>
        </NotebookRecordRow>
      ))}
    </NotebookRecordGroup>
  );
}
