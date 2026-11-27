// @ts-check
const GITHUB_USER = 'spro1';
const REPO = 'kubernetes-study-web';
const REPO_URL = `https://github.com/${GITHUB_USER}/${REPO}`;
// 커리큘럼(src/data/tracks.js)의 첫 레슨
const FIRST_LESSON = `/${require('./src/data/tracks')[0].lessons[0]}`;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'K8s Flow',
  tagline: 'Learn how Kubernetes really works through step-by-step animated diagrams',
  favicon: 'img/favicon.svg',

  url: `https://${GITHUB_USER}.github.io`,
  baseUrl: `/${REPO}/`,
  organizationName: GITHUB_USER,
  projectName: REPO,
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  onDuplicateRoutes: 'throw',
  markdown: {hooks: {onBrokenMarkdownLinks: 'throw', onBrokenMarkdownImages: 'throw'}},

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ko'],
    localeConfigs: {en: {label: 'English', htmlLang: 'en'}, ko: {label: '한국어', htmlLang: 'ko'}},
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: 'docs',
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
          editUrl: `${REPO_URL}/edit/main/`,
          editLocalizedFiles: true, // 한국어 페이지의 '수정' 링크는 i18n/ko 파일로
          showLastUpdateTime: true, // 사이트맵 lastmod 에도 쓰인다(배포 시 git 전체 이력 필요)
        },
        blog: false,
        sitemap: {lastmod: 'date', changefreq: 'weekly', ignorePatterns: ['**/search']},
        theme: {customCss: './src/css/custom.css'},
      }),
    ],
  ],

  clientModules: [require.resolve('./src/clientModules/sidebarProgress.js')],

  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      ({
        hashed: true,
        language: ['en', 'ko'],
        docsRouteBasePath: '/',
        indexBlog: false,
        indexPages: false,
        highlightSearchTermsOnTargetPage: true,
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/social-card.png',
      metadata: [
        // 검색엔진 소유 확인 코드. GitHub 저장소 Settings → Variables 에 넣으면 배포 때 붙는다(.github/workflows/deploy.yml).
        ...[
          ['google-site-verification', process.env.GOOGLE_SITE_VERIFICATION],
          ['msvalidate.01', process.env.BING_SITE_VERIFICATION],
          ['naver-site-verification', process.env.NAVER_SITE_VERIFICATION],
        ]
          .filter(([, v]) => v)
          .map(([name, content]) => ({name, content})),
        {name: 'keywords', content: 'kubernetes, k8s, 쿠버네티스, cloud, 클라우드, CKA, CKAD, CKS, learning, animation, diagram'},
      ],
      colorMode: {defaultMode: 'light', respectPrefersColorScheme: true},
      navbar: {
        title: 'K8s Flow',
        logo: {alt: 'K8s Flow', src: 'img/favicon.svg'},
        items: [
          {type: 'docSidebar', sidebarId: 'lessons', label: 'Lessons', position: 'left'},
          {to: FIRST_LESSON, label: 'Start learning', position: 'left'},
          {to: '/roadmap', label: 'Roadmap', position: 'left'},
          {to: '/glossary', label: 'Glossary', position: 'left'},
          {type: 'localeDropdown', position: 'right'},
          {href: REPO_URL, label: '⭐ GitHub', position: 'right'},
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Lessons',
            items: [
              {label: 'All lessons', to: '/lessons'},
              {label: 'How a Pod starts', to: '/k8s/pod-startup'},
              {label: 'Cloud service models', to: '/cloud/service-models'},
            ],
          },
          {
            title: 'Project',
            items: [
              {label: 'GitHub', href: REPO_URL},
              {label: 'Issues & ideas', href: `${REPO_URL}/issues`},
            ],
          },
          {
            title: 'Official docs',
            items: [
              {label: 'Kubernetes docs', href: 'https://kubernetes.io/docs/home/'},
              {label: 'CNCF Landscape', href: 'https://landscape.cncf.io/'},
            ],
          },
        ],
        copyright: 'If this helped, a ⭐ on GitHub keeps it going. Built with Docusaurus.', // 한국어는 i18n/ko/docusaurus-theme-classic/footer.json
      },
      prism: {
        theme: require('prism-react-renderer').themes.github,
        darkTheme: require('prism-react-renderer').themes.dracula,
      },
      tableOfContents: {minHeadingLevel: 2, maxHeadingLevel: 3},
    }),
};

module.exports = config;
