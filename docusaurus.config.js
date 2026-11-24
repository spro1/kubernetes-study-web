// @ts-check
const GITHUB_USER = 'spro1';
const REPO = 'kubernetes-study-web';
const REPO_URL = `https://github.com/${GITHUB_USER}/${REPO}`;
const KO = process.env.DOCUSAURUS_CURRENT_LOCALE === 'ko';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'K8s Flow',
  tagline: KO
    ? '쿠버네티스가 실제로 어떻게 움직이는지 단계별 애니메이션 다이어그램으로 배운다'
    : 'Learn how Kubernetes really works through step-by-step animated diagrams',
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
          showLastUpdateTime: false,
        },
        blog: false,
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
        {name: 'keywords', content: 'kubernetes, k8s, 쿠버네티스, cloud, 클라우드, CKA, CKAD, CKS, learning, animation, diagram'},
      ],
      colorMode: {defaultMode: 'light', respectPrefersColorScheme: true},
      navbar: {
        title: 'K8s Flow',
        logo: {alt: 'K8s Flow', src: 'img/favicon.svg'},
        items: [
          {type: 'docSidebar', sidebarId: 'lessons', label: 'Lessons', position: 'left'},
          {to: '/k8s/pod-startup', label: 'Start learning', position: 'left'},
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
        copyright: KO ? '도움이 됐다면 GitHub에서 ⭐ 를 눌러 주세요. Built with Docusaurus.' : 'If this helped, a ⭐ on GitHub keeps it going. Built with Docusaurus.',
      },
      prism: {
        theme: require('prism-react-renderer').themes.github,
        darkTheme: require('prism-react-renderer').themes.dracula,
      },
      tableOfContents: {minHeadingLevel: 2, maxHeadingLevel: 3},
    }),
};

module.exports = config;
