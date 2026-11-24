#!/usr/bin/env node
// src/data/tracks.js 를 기준으로 레슨 목록과 번호를 다시 만든다. 레슨을 추가하거나 순서를 바꾼 뒤 실행한다.
//   node scripts/build-lesson-index.js
// 하는 일:
//   1. docs/index.mdx, i18n/ko/.../current/index.mdx 의 카드 목록을 트랙 순서대로 다시 쓴다.
//   2. 각 레슨의 sidebar_label 앞 번호("03 · ")를 트랙 안 순서로 맞춘다.
//   3. 레슨 끝의 "Next lesson / 다음 레슨" 줄을 지운다(순서는 사이드바와 아래쪽 이전/다음 버튼이 맡는다).
//   4. 한국어 사이드바 트랙 이름(current.json)을 채운다.
// 카드에 쓰는 글은 각 레슨 front matter 의 summary·icon, StepDiagram 의 meta(duration·level)와 단계 수다.

const fs = require('fs');
const path = require('path');
const TRACKS = require('../src/data/tracks');

const ROOT = path.join(__dirname, '..');
const LOCALES = {
  en: {
    dir: 'docs',
    head: `---
id: index
slug: /lessons
title: All Lessons
sidebar_label: All lessons
description: Every K8s Flow lesson, from cloud basics to Kubernetes internals, GPUs/NPUs and LLM serving, in recommended order.
hide_table_of_contents: true
---

# All lessons

Flows that are hard to follow in text, shown as **diagrams that move one step at a time**. Each lesson takes about 10 minutes. Press **Next** to bring in components and send requests across the diagram, or turn on **▶ Autoplay** and watch it like a video.

The tracks go from easy to hard. New to Kubernetes? Start at the top. Already comfortable? Jump to whatever you are curious about. Finished lessons get a ✓.
`,
    tail: `## Preparing for a certification?

The lessons are grouped by topic, but they cover most of the flows on the CNCF exams.

| Exam | Start with |
| --- | --- |
| KCNA | Foundations, Cloud basics, Kubernetes core |
| CKAD | Kubernetes core, Running workloads, Networking & service mesh |
| CKA | Running workloads, Networking & service mesh, Cluster operations, Kubernetes internals |
| CKS · KCSA | Security & multi-tenancy, plus NetworkPolicy and RBAC |

## How to use a lesson

| Action | How |
| --- | --- |
| Next / previous step | Buttons in the right panel, or click the lesson once and use <kbd>←</kbd> <kbd>→</kbd> |
| Jump to a step | The numbered timeline under the diagram |
| Autoplay | **▶ Autoplay** above the diagram, or <kbd>A</kbd> |
| Replay / pause the animation | Buttons above the diagram, or <kbd>R</kbd> · <kbd>P</kbd> |
| Line colors | Blue = request, purple = response/report, dashed teal = watch |

If your system has "reduce motion" turned on, you will see lines and text without moving packets.
`,
    tracksTitle: (t) => t.en,
    tracksDesc: (t) => t.enDesc,
  },
  ko: {
    dir: 'i18n/ko/docusaurus-plugin-content-docs/current',
    head: `---
id: index
slug: /lessons
title: 전체 레슨
sidebar_label: 전체 레슨
description: 클라우드 기초부터 쿠버네티스 내부, GPU·NPU와 LLM 서빙까지 K8s Flow 레슨 전체를 권장 순서대로 모았다.
hide_table_of_contents: true
---

# 전체 레슨

글로 읽으면 헷갈리는 흐름을 **한 단계씩 움직이는 다이어그램**으로 따라간다. 레슨 하나는 10분 안팎이다. **다음**을 누를 때마다 구성요소가 나타나고 요청이 흐른다. **▶ 자동 진행**을 켜면 영상처럼 볼 수도 있다.

트랙은 쉬운 것부터 어려운 것 순서다. 처음이라면 위에서부터, 익숙하다면 궁금한 흐름부터 골라 보자. 끝낸 레슨에는 ✓가 붙는다.
`,
    tail: `## 자격증을 준비한다면

레슨은 주제별로 묶었지만 CNCF 시험에 나오는 흐름 대부분을 다룬다.

| 시험 | 먼저 볼 트랙 |
| --- | --- |
| KCNA | 기초, 클라우드 기초, 쿠버네티스 핵심 |
| CKAD | 쿠버네티스 핵심, 워크로드 운영, 네트워크와 서비스 메시 |
| CKA | 워크로드 운영, 네트워크와 서비스 메시, 클러스터 운영, 쿠버네티스 내부 |
| CKS · KCSA | 보안과 멀티테넌시, 그리고 네트워크 정책과 RBAC |

## 레슨 보는 법

| 조작 | 방법 |
| --- | --- |
| 다음·이전 단계 | 오른쪽 패널의 버튼, 또는 레슨 영역을 한 번 누른 뒤 <kbd>←</kbd> <kbd>→</kbd> |
| 원하는 단계로 이동 | 다이어그램 아래 단계 타임라인의 번호 |
| 자동 진행 | 다이어그램 위 **▶ 자동 진행** 버튼, 또는 <kbd>A</kbd> |
| 애니메이션 다시 보기·멈춤 | 다이어그램 위 버튼, 또는 <kbd>R</kbd> · <kbd>P</kbd> |
| 선 색 | 파랑 = 요청, 보라 = 응답·보고, 청록 점선 = 지켜보기(watch) |

시스템 설정에서 '동작 줄이기'를 켜 두면 움직이는 점 없이 선과 설명만 보인다.
`,
    tracksTitle: (t) => t.ko,
    tracksDesc: (t) => t.koDesc,
  },
};

const NEXT_LINE = /^(Next lesson|다음 레슨|이 트랙의 마지막 레슨|This is the last lesson)[^\n]*\n?/gm;
const fm = (src, key) => (new RegExp(`^${key}:\\s*(.*)$`, 'm').exec(src)?.[1] ?? '').trim().replace(/^['"]|['"]$/g, '');
const attr = (s) => s.replace(/"/g, '&quot;');

function lessonInfo(file) {
  const src = fs.readFileSync(file, 'utf8');
  const meta = /meta=\{\{([^}]*)\}\}/.exec(src)?.[1] ?? '';
  const steps = (src.match(/^\s+short: /gm) ?? []).length;
  return {
    src,
    title: fm(src, 'title'),
    summary: fm(src, 'summary') || fm(src, 'description'),
    icon: fm(src, 'icon') || 'spark',
    duration: /duration:\s*'([^']*)'/.exec(meta)?.[1] ?? '',
    level: /level:\s*'([^']*)'/.exec(meta)?.[1] ?? '',
    steps,
  };
}

let problems = 0;
for (const [locale, L] of Object.entries(LOCALES)) {
  const sections = TRACKS.map((t) => {
    const cards = t.lessons.map((id, k) => {
      const file = path.join(ROOT, L.dir, `${id}.mdx`);
      if (!fs.existsSync(file)) {
        console.error(`[${locale}] missing lesson file: ${id}`);
        problems++;
        return '';
      }
      const info = lessonInfo(file);
      const no = String(k + 1).padStart(2, '0');

      // 번호 맞추기 + 다음 레슨 줄 지우기
      let src = info.src.replace(/^sidebar_label:\s*(?:\d+\s*·\s*)?(.*)$/m, (_, label) => `sidebar_label: ${no} · ${label.trim()}`);
      src = src.replace(NEXT_LINE, '').replace(/\n{3,}$/, '\n\n').replace(/\s+$/, '\n');
      if (src !== info.src) fs.writeFileSync(file, src);

      return `  <LessonCard no="${no}" to="/${id}" track="${t.key}" icon="${info.icon}" title="${attr(info.title)}" duration="${attr(info.duration)}" steps={${info.steps}} level="${attr(info.level)}">
    ${info.summary}
  </LessonCard>`;
    });
    return `## ${L.tracksTitle(t)}\n\n${L.tracksDesc(t)}\n\n<LessonGrid>\n${cards.join('\n')}\n</LessonGrid>\n`;
  });
  fs.writeFileSync(path.join(ROOT, L.dir, 'index.mdx'), `${L.head}\n${sections.join('\n')}\n${L.tail}`);
}

// 한국어 사이드바 트랙 이름
const cj = path.join(ROOT, 'i18n/ko/docusaurus-plugin-content-docs/current.json');
const json = fs.existsSync(cj) ? JSON.parse(fs.readFileSync(cj, 'utf8')) : {};
for (const key of Object.keys(json)) if (key.startsWith('sidebar.lessons.category.')) delete json[key];
for (const t of TRACKS) {
  json[`sidebar.lessons.category.${t.en}`] = {message: t.ko, description: `The label for category '${t.en}' in sidebar 'lessons'`};
}
fs.writeFileSync(cj, `${JSON.stringify(json, null, 2)}\n`);

const total = TRACKS.reduce((n, t) => n + t.lessons.length, 0);
console.log(`${TRACKS.length} tracks, ${total} lessons${problems ? `, ${problems} problem(s)` : ''}`);
process.exit(problems ? 1 : 0);
