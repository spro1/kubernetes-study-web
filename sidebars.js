const TRACKS = require('./src/data/tracks');

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
module.exports = {
  lessons: [
    'index',
    'roadmap',
    'glossary',
    ...TRACKS.map((t) => ({
      type: 'category',
      label: t.en, // 한국어 이름은 i18n/ko/docusaurus-plugin-content-docs/current.json (scripts/build-lesson-index.js 가 채운다)
      collapsed: true,
      items: t.lessons,
    })),
  ],
};
