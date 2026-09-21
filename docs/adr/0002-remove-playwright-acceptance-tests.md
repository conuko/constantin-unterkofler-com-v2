# Remove Playwright acceptance tests from the personal portfolio

The portfolio does not maintain a Playwright browser-automation setup. The
dependency, browser installation, configuration, acceptance spec, generated
artifact ignores, and `test:acceptance` script were removed. Automated coverage
is intentionally limited to fast in-process tests run by `pnpm test`; visual
and interaction changes are checked directly in the development server when
they are made.

This keeps routine local and agent-assisted work proportionate to a personal
portfolio, avoiding browser provisioning and slow end-to-end runs without
creating a second test command or an implicit expectation that browser
acceptance coverage exists.
