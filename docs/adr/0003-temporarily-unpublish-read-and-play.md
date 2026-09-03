# Temporarily unpublish Read and Play

Read and Play remain curated local Portfolio Content, but they are not public
Portfolio Pages for now. Their `publicationStatus` in `content/site-content.ts`
is the single publication decision: only published records project into primary
wayfinding, and the Read and Play route modules return Next.js `notFound()` for
their direct URLs. This preserves the content and presentation modules for a
deliberate future reactivation while preventing navigation, indexing, and
direct public access today.

Re-enable both records only when the portfolio owner explicitly decides to
publish them again; change their status to `published` and remove their route
guards in the same change.
