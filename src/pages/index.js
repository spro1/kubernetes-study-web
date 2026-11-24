import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import StepDiagram from '@site/src/components/StepDiagram';
import TRACKS from '@site/src/data/tracks';
import {useProgress, resetProgress} from '@site/src/progress';
import styles from './index.module.css';

// 첫 화면에서 바로 만져 보는 맛보기 레슨. 전체 버전은 docs/k8s/pod-startup.mdx.
const LAYOUT = {
  width: 1000,
  height: 400,
  groups: [
    {x: 190, y: 40, w: 440, h: 340, tone: 'mgmt'},
    {x: 660, y: 120, w: 200, h: 260, tone: 'biz', from: 3},
  ],
  nodes: [
    {id: 'user', icon: 'user', tone: 'ext', x: 90, y: 200, show: true},
    {id: 'api', icon: 'gate', tone: 'cp', x: 300, y: 200},
    {id: 'etcd', icon: 'db', tone: 'store', x: 300, y: 320},
    {id: 'sched', icon: 'target', tone: 'cp', x: 530, y: 110},
    {id: 'kubelet', icon: 'agent', tone: 'node', x: 760, y: 190},
    {id: 'pod', icon: 'pod', tone: 'app', size: 'sm', x: 760, y: 320},
  ],
  steps: [
    {kind: '시작', flows: [{from: 'user', to: 'api', type: 'request'}], focus: ['api']},
    {kind: '원리', flows: [{from: 'api', to: 'etcd', type: 'request'}, {from: 'api', to: 'user', type: 'response'}], focus: ['etcd'], badges: {etcd: 'Pod'}},
    {kind: '원리', flows: [{from: 'api', to: 'sched', type: 'watch'}, {from: 'sched', to: 'api', type: 'request', bend: 0.12}], focus: ['sched']},
    {kind: '원리', flows: [{from: 'api', to: 'kubelet', type: 'watch', bend: -0.1}, {from: 'kubelet', to: 'pod', type: 'request'}], focus: ['kubelet', 'pod'], status: {pod: 'ok'}, badges: {pod: 'Running'}},
    {kind: '정리', flows: [{from: 'kubelet', to: 'api', type: 'response', bend: 0.1}], focus: ['api']},
  ],
};

// 언어별 문구. 맛보기 레슨은 LAYOUT 의 같은 순서 배열에 글자만 입힌다.
const TEXT = {
  ko: {
    pageTitle: '쿠버네티스를 그림으로 배우기: 단계별 애니메이션 레슨',
    description: '쿠버네티스가 실제로 어떻게 움직이는지 단계별 애니메이션 다이어그램으로 배운다',
    eyebrow: '무료 · 오픈 소스 · 설치 없이 브라우저에서',
    title: ['kubectl apply 한 줄 뒤에서', '무슨 일이 일어나는지', '눈으로 따라가 본다'],
    lead: (n) => `클라우드 기초부터 쿠버네티스 내부, GPU·NPU와 LLM 서빙, 자격증 범위까지 ${n}개 레슨. 단계마다 구성요소가 나타나고 요청이 흐른다.`,
    start: '첫 레슨 시작 →', all: '전체 레슨', star: '⭐ GitHub',
    stats: (n, k) => [[n, '레슨'], [k, '트랙'], ['10분', '레슨 하나']],
    demoTitle: '여기서 바로 눌러 보자',
    demoLead: '오른쪽 다음 버튼을 누르거나 ▶ 자동 진행을 켜면 파드가 뜨는 과정이 이어진다.',
    resume: '이어서 학습하기 →', progressTitle: '내 진도', progress: (d, n) => `${n}개 중 ${d}개 완료`, reset: '진도 초기화', localNote: '진도는 이 브라우저에만 저장된다.',
    tracksTitle: '학습 트랙', tracksLead: '위에서부터 보면 앞 트랙이 다음 트랙의 바탕이 된다.', lessons: (n) => `레슨 ${n}개`,
    starTitle: '쓸 만했다면 Star 하나',
    starLead: 'Star가 쌓이면 다음 레슨을 만들 이유가 생긴다. 틀린 내용 제보나 다뤘으면 하는 주제도 이슈로 남겨 달라.',
    starBtn: '⭐ Star 누르기', issueBtn: '이슈 남기기',
    features: [
      ['🎬', '움직이는 다이어그램', '요청이 어느 구성요소를 거치는지 패킷이 흐르는 모습으로 보여 준다.'],
      ['🪜', '한 단계씩, 10분 안팎', '레슨마다 8~9단계다. 직접 넘기거나 자동 진행으로 영상처럼 본다.'],
      ['🧭', '원리와 운영 포인트', '단계마다 핵심 개념, 주의할 점, 상태 값 변화가 함께 나온다.'],
      ['🎓', 'KCNA·CKA·CKAD·CKS', '시험에 나오는 흐름 대부분을 다룬다. 시험별로 볼 트랙은 전체 레슨 페이지에 정리했다.'],
    ],
    demo: {
      meta: {duration: '약 2분', level: '맛보기'},
      groups: ['컨트롤 플레인', '워커 노드'],
      nodes: [['사용자', 'kubectl'], ['API 서버', '모든 요청의 입구'], ['etcd', '상태 저장소'], ['스케줄러', '노드 고르기'], ['kubelet', '노드 관리자'], ['nginx', 'Pod']],
      metrics: ['파드 상태', '배정된 노드'],
      steps: [
        {short: '제출', title: 'kubectl apply로 원하는 상태를 보낸다', text: '"nginx 파드를 띄워 줘"라는 요청이 API 서버로 간다. API 서버는 인증, 인가, 검증을 차례로 거친다.', keyIdea: '쿠버네티스 구성요소끼리는 API 서버를 거쳐서만 이야기한다.', flows: ['kubectl apply'], values: {state: '없음'}},
        {short: '기록', title: 'etcd에 기록하고 "created"를 돌려준다', text: '이때 컨테이너는 아직 하나도 없다. 원하는 상태가 기록됐을 뿐이다.', flows: ['저장', 'created'], values: {state: 'Pending'}},
        {short: '노드 선택', title: '스케줄러가 파드를 둘 노드를 고른다', text: '스케줄러는 노드가 정해지지 않은 파드를 지켜보다가(watch) 자원이 넉넉한 노드를 골라 API 서버에 적는다.', flows: ['새 파드 감지', 'bind → node-2'], values: {node: 'node-2'}},
        {short: '실행', title: 'kubelet이 컨테이너를 띄운다', text: 'node-2의 kubelet이 자기 노드에 배정된 파드를 보고 이미지를 받아 컨테이너를 실행한다.', flows: ['내 노드 파드 감지', '실행'], values: {state: 'Running'}},
        {short: '정리', title: '누구도 직접 명령하지 않는다', text: '구성요소마다 API 서버의 기록을 지켜보며 제 몫만 처리한다. 그래서 하나가 잠깐 멈췄다 돌아와도 밀린 일을 이어서 한다.', keyIdea: '"created"는 기록됐다는 뜻이다. 실행 중이 되려면 스케줄링, 이미지 받기, 실행이 더 남았다.', flows: ['Running 보고']},
      ],
    },
  },
  en: {
    pageTitle: 'Learn Kubernetes Visually: Animated, Step-by-Step Lessons',
    description: 'Learn how Kubernetes really works through step-by-step animated diagrams',
    eyebrow: 'Free · Open source · Runs in your browser',
    title: ['What happens after', 'kubectl apply?', 'Watch it, step by step'],
    lead: (n) => `${n} animated lessons, from cloud basics to Kubernetes internals, GPUs/NPUs, LLM serving and certification topics. Each step brings in components and sends requests across the diagram.`,
    start: 'Start the first lesson →', all: 'All lessons', star: '⭐ GitHub',
    stats: (n, k) => [[n, 'lessons'], [k, 'tracks'], ['10 min', 'per lesson']],
    demoTitle: 'Try it right here',
    demoLead: 'Press Next on the right, or turn on ▶ Autoplay, to watch a Pod come to life.',
    resume: 'Continue learning →', progressTitle: 'Your progress', progress: (d, n) => `${d} of ${n} lessons done`, reset: 'Reset progress', localNote: 'Progress is saved in this browser only.',
    tracksTitle: 'Learning tracks', tracksLead: 'Go top to bottom: each track builds on the one before it.', lessons: (n) => `${n} lessons`,
    starTitle: 'Found it useful? Leave a star',
    starLead: 'Stars tell us which lessons to build next. Bug reports and topic requests are welcome as issues.',
    starBtn: '⭐ Star on GitHub', issueBtn: 'Open an issue',
    features: [
      ['🎬', 'Animated diagrams', 'Watch packets travel through each component a request actually touches.'],
      ['🪜', 'One step at a time', 'Each lesson has 8–9 steps. Click through or let autoplay run it like a video.'],
      ['🧭', 'Concepts and operations', 'Every step shows the key idea, the pitfalls, and how state values change.'],
      ['🎓', 'KCNA · CKA · CKAD · CKS', 'Most exam flows are covered. The lessons page maps each exam to the tracks to start with.'],
    ],
    demo: {
      meta: {duration: '~2 min', level: 'Preview'},
      groups: ['Control plane', 'Worker node'],
      nodes: [['User', 'kubectl'], ['API server', 'front door'], ['etcd', 'state store'], ['Scheduler', 'picks a node'], ['kubelet', 'node agent'], ['nginx', 'Pod']],
      metrics: ['Pod status', 'Assigned node'],
      steps: [
        {short: 'Submit', title: 'kubectl apply sends the desired state', text: 'A request saying "run an nginx Pod" goes to the API server, which checks authentication, authorization and validation.', keyIdea: 'Kubernetes components only talk to each other through the API server.', flows: ['kubectl apply'], values: {state: 'none'}},
        {short: 'Record', title: 'Stored in etcd, "created" returned', text: 'No container exists yet. Only the desired state has been recorded.', flows: ['store', 'created'], values: {state: 'Pending'}},
        {short: 'Schedule', title: 'The scheduler picks a node', text: 'The scheduler watches for Pods without a node, picks one with enough resources, and writes the choice back to the API server.', flows: ['new Pod seen', 'bind → node-2'], values: {node: 'node-2'}},
        {short: 'Run', title: 'kubelet starts the container', text: 'The kubelet on node-2 sees a Pod assigned to it, pulls the image and runs the container.', flows: ['Pod for my node', 'run'], values: {state: 'Running'}},
        {short: 'Recap', title: 'Nobody gives direct orders', text: 'Each component watches the records in the API server and does its own part. If one stops for a moment, it picks up where it left off.', keyIdea: '"created" means recorded. Scheduling, image pull and startup still lie ahead before the Pod is running.', flows: ['report Running']},
      ],
    },
  },
};


// LAYOUT 에 언어별 글자를 입혀 StepDiagram props 로 만든다.
function buildDemo(d) {
  const metricIds = ['state', 'node'];
  return {
    width: LAYOUT.width,
    height: LAYOUT.height,
    meta: d.meta,
    groups: LAYOUT.groups.map((g, k) => ({...g, label: d.groups[k]})),
    nodes: LAYOUT.nodes.map((n, k) => ({...n, label: d.nodes[k][0], sub: d.nodes[k][1]})),
    metrics: metricIds.map((id, k) => ({id, label: d.metrics[k]})),
    steps: LAYOUT.steps.map((s, k) => {
      const {flows: labels, ...rest} = d.steps[k];
      return {...s, ...rest, flows: s.flows.map((f, j) => ({...f, label: labels[j]}))};
    }),
  };
}

export default function Home() {
  const {siteConfig, i18n} = useDocusaurusContext();
  const t = TEXT[i18n.currentLocale] ?? TEXT.en;
  const {done, last, ready} = useProgress();
  const total = TRACKS.reduce((n, tr) => n + tr.lessons.length, 0);
  const started = ready && (done.size > 0 || last);
  // 다음에 볼 레슨: 마지막으로 본 레슨이 끝났으면 순서상 다음 미완료 레슨.
  const order = TRACKS.flatMap((tr) => tr.lessons);
  const nextId = last && !done.has(last) ? last : order.find((id) => !done.has(id)) ?? order[0];
  const repo = `https://github.com/${siteConfig.organizationName}/${siteConfig.projectName}`;
  return (
    <Layout title={t.pageTitle} description={t.description}>
      <Head>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {'@type': 'WebSite', name: 'K8s Flow', url: `${siteConfig.url}${siteConfig.baseUrl}`, inLanguage: ['en', 'ko']},
              {
                '@type': 'Course',
                name: 'K8s Flow: Kubernetes, animated',
                description: t.description,
                url: `${siteConfig.url}${siteConfig.baseUrl}`,
                inLanguage: i18n.currentLocale,
                isAccessibleForFree: true,
                educationalLevel: 'Beginner to Advanced',
                about: ['Kubernetes', 'Cloud computing', 'GPU', 'LLM serving'],
                provider: {'@type': 'Organization', name: 'K8s Flow', sameAs: repo},
                hasCourseInstance: {'@type': 'CourseInstance', courseMode: 'online', courseWorkload: `PT${total * 10}M`},
                offers: {'@type': 'Offer', price: 0, priceCurrency: 'USD', category: 'Free'},
              },
            ],
          })}
        </script>
      </Head>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>{t.eyebrow}</span>
        <h1 className={styles.title}>
          {t.title[0]}<br /><span className={styles.grad}>{t.title[1]}</span><br />{t.title[2]}
        </h1>
        <p className={styles.lead}>{t.lead(total)}</p>
        <div className={styles.ctas}>
          {started ? (
            <Link className={styles.primary} to={`/${nextId}`}>{t.resume}</Link>
          ) : (
            <Link className={styles.primary} to={`/${TRACKS[0].lessons[0]}`}>{t.start}</Link>
          )}
          <Link className={styles.secondary} to="/lessons">{t.all}</Link>
          <Link className={styles.secondary} href={repo}>{t.star}</Link>
        </div>
        {started && (
          <div className={styles.myProgress}>
            <div className={styles.myProgressHead}>
              <b>{t.progressTitle}</b>
              <span>{t.progress(done.size, total)}</span>
            </div>
            <div className={styles.meter}><span style={{width: `${(done.size / total) * 100}%`}} /></div>
            <div className={styles.myProgressFoot}>
              <span>{t.localNote}</span>
              <button type="button" onClick={resetProgress}>{t.reset}</button>
            </div>
          </div>
        )}
        <div className={styles.stats}>
          {t.stats(total, TRACKS.length).map(([b, l]) => (
            <div key={l} className={styles.stat}><b>{b}</b><span>{l}</span></div>
          ))}
        </div>
      </header>

      <main>
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>{t.demoTitle}</h2>
            <p>{t.demoLead}</p>
          </div>
          <StepDiagram {...buildDemo(t.demo)} />
        </section>

        <section className={styles.section}>
          <div className={styles.features}>
            {t.features.map(([icon, title, desc]) => (
              <div key={title} className={styles.feature}>
                <span className={styles.featureIcon} aria-hidden="true">{icon}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>{t.tracksTitle}</h2>
            <p>{t.tracksLead}</p>
          </div>
          <div className={styles.tracks}>
            {TRACKS.map((tr, k) => {
              const d = tr.lessons.filter((l) => done.has(l)).length;
              const first = tr.lessons.find((l) => !done.has(l)) ?? tr.lessons[0];
              const en = i18n.currentLocale !== 'ko';
              return (
                <Link key={tr.key} to={`/${first}`} className={styles.track} style={{'--c': tr.color}}>
                  <div className={styles.trackTop}>
                    <span className={styles.trackNo}>{String(k + 1).padStart(2, '0')}</span>
                    <span className={styles.count}>{ready && d > 0 ? `${d}/${tr.lessons.length}` : t.lessons(tr.lessons.length)}</span>
                  </div>
                  <h3>{en ? tr.en : tr.ko}</h3>
                  <p>{en ? tr.enDesc : tr.koDesc}</p>
                  <div className={styles.trackMeter}><span style={{width: `${(d / tr.lessons.length) * 100}%`}} /></div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className={styles.starBox}>
          <h2>{t.starTitle}</h2>
          <p>{t.starLead}</p>
          <div className={styles.ctas}>
            <Link className={styles.primary} href={repo}>{t.starBtn}</Link>
            <Link className={styles.secondary} href={`${repo}/issues`}>{t.issueBtn}</Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
