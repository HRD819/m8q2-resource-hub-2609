# AGENTS.md

## Authority

Before making ANY change to this repository, read `SPEC.md` in full.

`SPEC.md` is the authoritative project specification. If existing code, demo files, README, comments, implementation choices, or assumptions conflict with `SPEC.md`, follow `SPEC.md` unless the user explicitly gives a newer instruction.

Do not silently reinterpret or weaken accessibility, Dropbox, or low-discoverability requirements.

## Core invariants

1. Accessibility First.
2. Dropbox is the single source of truth for actual teaching-material files.
3. Do not duplicate teaching materials into Google Drive, a CMS, the website repository, or another storage system.
4. The website stores descriptions, metadata, structure, and Dropbox links—not the teaching files themselves.
5. `1151 資訊組織` and `1151 參考資源` both start at `第 0 單元`.
6. The architecture must support future semesters and courses without hard-coding the current two courses.
7. Prefer semantic HTML and progressive enhancement.
8. Core student flows must work with keyboard and screen reader.
9. Target WCAG 2.2 AA.
10. Content must be maintained through structured content files rather than hand-editing generated HTML.
11. Avoid unnecessary frameworks, databases, CMSs, SPA architecture, and client-side complexity.
12. Teacher maintenance simplicity is a first-class requirement.
13. Production deployment defaults to GitHub Pages via GitHub Actions.
14. The site is not confidential, but must be low-discoverability/unlisted.
15. Do not add login/password gates unless the user explicitly changes the requirement.
16. Every production HTML page must include `noindex, nofollow`.
17. Do not use `robots.txt Disallow: /` as a substitute for noindex.
18. Production deploys only after build/validation/accessibility checks succeed.

## Start-of-task procedure

For every new Codex session/task:

1. Read `SPEC.md`.
2. Read `README.md`.
3. Inspect the current repository and relevant content files.
4. Check `IMPLEMENTATION_PLAN.md` and `DECISIONS.md`.
5. Preserve existing accessibility and noindex behavior.
6. For significant architecture changes, document the reason before implementation.
7. Do not ask the user to repeat requirements already defined in these files.

## Implementation rules

- Prefer content-driven static generation.
- Keep content/data separate from templates.
- Never manually edit generated output as the source of truth.
- Use native HTML elements before ARIA.
- Do not create vague links such as "click here" or bare "download".
- Keep focus indicators visible.
- Do not make information available only on hover or by color.
- Do not introduce a mouse-only interaction.
- Do not require JavaScript for the core course/material navigation path.
- Preserve stable, readable URLs.
- Validate required content fields and Dropbox URLs.
- Make recent updates derivable from content metadata when practical.
- Ensure noindex survives the production build.
- Avoid unnecessary sitemap/feed/SEO generation.
- Do not publicly link the site from project documentation unless needed for deployment verification.

## Content changes

When the user asks in natural language to add a material, course, or unit:

1. Identify the correct structured content file(s).
2. Add/update the metadata.
3. Do not copy the actual Dropbox-hosted teaching file into this repository.
4. Validate the content.
5. Build the site.
6. Run relevant accessibility/quality checks.
7. Verify noindex in generated production output.
8. Report what changed and any unresolved issue.

## Deployment rules

Preferred production flow:

`Codex change -> checks -> commit -> push -> GitHub Actions -> build -> GitHub Pages`

- Do not use manual FTP as the primary workflow.
- Do not deploy if checks/build fail.
- Keep deployment configuration version-controlled.
- Keep GitHub Pages base-path handling correct.
- Do not add authentication unless the user explicitly changes requirements.

## Required checks after implementation

Run the project's available checks, including as applicable:

- build
- tests
- content/schema validation
- HTML/semantic validation
- heading hierarchy checks
- link checks
- accessibility automated checks
- responsive checks
- noindex verification in generated HTML
- GitHub Pages base-path/deployment verification

Also preserve/manual-test checklist for:

- keyboard navigation
- skip link
- focus visibility
- meaningful link text
- landmarks
- NVDA + Chrome critical flow

If a check cannot be automated in the current environment, say so clearly in the completion report and leave a precise manual test instruction.

## Definition of done

A change is not done merely because it renders correctly.

It must:
- conform to `SPEC.md`;
- not regress accessibility;
- keep Dropbox as the teaching-file source of truth;
- keep maintenance content-driven;
- preserve low-discoverability/noindex requirements;
- build successfully;
- pass available validation/tests;
- document any meaningful new maintenance procedure.

## Documentation upkeep

Update `README.md` when commands, folder structure, content schema, deployment, or maintenance workflow changes.

Update `DECISIONS.md` for significant architectural decisions.

Update `IMPLEMENTATION_PLAN.md` as major MVP milestones are completed.

Never remove or weaken the authority of `SPEC.md` or this file without explicit user instruction.
