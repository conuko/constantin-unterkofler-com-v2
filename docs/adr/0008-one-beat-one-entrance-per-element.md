# Count the entrance in one beat, and give each element one entrance

The entrance choreography from ADR-0004 kept its curves and durations through the technical revision, but its offsets had drifted into five tempos. The page header stepped every 40ms; the Site Header's column beside it ran 20ms out of phase on 80ms steps; rows stepped 60ms, records 80ms, record parts 45ms. On a wide sheet the header column and the page header are two streams in one view, so they read as two cascades sliding past each other rather than one sweep down the page. Every offset is now a whole number of one 40ms beat (`notebookBeat` in `lib/notebook-motion.ts`): the page header takes one row per beat and the Site Header's column ticks with it — toggle with the section code, each link with the next page-header row — rows and record parts stagger one beat, records two, and a new group waits three.

The CV's sequence was the one place the pause was in the wrong place. A section heading waited 120ms before its first row but the next section's heading followed the previous row after only 60ms, so each heading read as trailing the section above it instead of labelling its own. The heading now sits one beat above its first row and the three-beat pause falls before it. Each start is derived from the previous section's length instead of a fixed 360ms section stride, which also removes the case where a section of five rows or more landed its last row with or after the next heading.

Separately, three places stacked two entrances on one element. The Site Header's column settled while each link inside it settled too, so the links travelled 16px and faded twice over. A Work record translated while each of its parts settled, carrying its first parts twice as far as its last. A record row settled as a whole with its rule inside it, so the rule dropped 8px while it drew. Now no entrance rides on an ancestor's: the column and the record have none of their own, a row's content settles inside a wrapper while its rule draws in place — as the page header's rule and every record's rule already did — and every part travels 8px, once.

A media field's crop marks are its wrapper's `::before`, outside the field and so outside its entrance. They printed at first paint and stood alone on the blank sheet for up to a second on every Work load. They now run the field's entrance on the delay the wrapper already hands down. A pseudo-element is not an ancestor of the glass, so this does not reopen the backdrop problem ADR-0004's note in `app/motion.css` describes.

Nothing here touches paint timing. The identity mark still has no entrance and the page title still settles on `clip-path` alone (ADR-0006, ADR-0007); only when other elements start, and which element carries each entrance, changed.

## Considered and left

- **Shortening the title wipe.** It runs 900ms but is 92% open 320ms in; the last few pixels are imperceptible, so it is not visibly the last thing moving.
- **Route transitions.** A hard cut to the new sheet remains; ADR-0005's reasons for setting `experimental.viewTransition` aside still hold.
