# Contributing to K8s Flow

Thanks for helping! Fixes, translations and new lessons are all welcome.

## Quick fixes

Found a typo, a wrong fact or a broken link? Use **Edit this page** at the bottom of any lesson, or open an issue with the lesson URL and what is wrong. Technical accuracy matters most here, so a link to the official docs that backs your fix is very helpful.

## Run it locally

```bash
npm install
npm start                 # English  → http://localhost:3000/kubernetes-study-web/
npm start -- --locale ko  # Korean
npm run build             # full build, also checks for broken links
```

## How a lesson is built

- English: `docs/<folder>/<lesson>.mdx`. Korean: `i18n/ko/docusaurus-plugin-content-docs/current/<folder>/<lesson>.mdx`. Both files share the same path.
- Each lesson is one `<StepDiagram nodes={...} steps={...} />` element. Its props are documented at the top of [`src/components/StepDiagram.jsx`](src/components/StepDiagram.jsx). Copying a similar lesson is the fastest way to start.
- Front matter needs `title`, `sidebar_label`, `description` (used for search results), `summary` (the lesson card text) and `icon` (one of the names in `src/components/lessonIcons.jsx`).
- Step `kind` values stay in Korean in every language (`시작`, `원리`, `주의`, `문제`, `장애`, `정리`). They are keys that set the step's color and label.
- Keep node labels short (about 16 characters, subtitles about 22). Longer text is shrunk to fit, but short reads better.

## Adding or moving a lesson

1. Write the lesson in both languages (or open an issue asking for help with one of them).
2. Add its id to the right track in [`src/data/tracks.js`](src/data/tracks.js). Tracks go from easy to hard, and so do the lessons inside a track.
3. Run `node scripts/build-lesson-index.js`. It rebuilds the lesson list pages, renumbers sidebar labels and fills in the Korean track names.
4. Run `npm run build` and open the lesson in both languages.

## Writing style

- Short sentences, present tense, one idea per step.
- Explain what happens and why. Then give one practical takeaway, such as what to check with `kubectl` or which metric to watch.
- Stay vendor-neutral. Name open-source tools as examples ("e.g. Cilium"), not as the only way.
- Korean lessons use plain 해라체.

## Translations

Want K8s Flow in another language? Open an issue first so we can set up the locale. UI strings live in `src/components/StepDiagram.jsx`, `src/components/LessonCard.jsx`, `src/theme/DocItem/Content/index.js` and `src/pages/index.js`. Lessons are translated file by file.

By contributing you agree that code is licensed under MIT and lesson content under CC BY 4.0 (see [LICENSE](LICENSE) and [LICENSE-CONTENT.md](LICENSE-CONTENT.md)).
