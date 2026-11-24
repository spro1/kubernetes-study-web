import React, {useContext, useEffect, useLayoutEffect, useRef, useState} from 'react';
import LessonContext from './lesson/LessonContext';
import {markDone} from '../progress';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import ICONS, {Icon} from './lessonIcons';
import styles from './StepDiagram.module.css';

/**
 * 기술 흐름 화면. 다이어그램(가운데) + 단계 설명(오른쪽) + 단계 타임라인(아래).
 * "다음"을 누를 때마다 구성요소가 나타나고, 활성 연결 위로 요청이 흐른다.
 * 전체 예시는 docs/ 아래 레슨 파일들을 참고한다.
 *
 * nodes  : {id, label, sub, icon, tone, x, y, size, show}
 *          tone  'cp'(컨트롤 플레인·관리 서버) | 'node'(워커·실행) | 'store'(저장소) | 'ext'(바깥) | 'app'(애플리케이션)
 *          size  'md'(기본 150×62) | 'sm'(파드처럼 작은 것 104×44), w 로 폭만 바꿀 수 있다
 *          show  true 면 첫 단계부터 보인다. 아니면 처음 언급되는 단계에서 나타난다.
 * groups : {label, x, y, w, h, tone, from} 클러스터·노드 같은 영역 틀. tone 'mgmt' | 'biz' | 'plain'
 * steps  : {short, kind, title, text, keyIdea, changes,
 *           flows: [{from, to, label, type: 'request'|'response'|'watch', bend}],
 *           focus: [id], values: {metricId: 값 | {text, tone: 'bad'|'good'}},
 *           status: {id: 'ok'|'warn'|'error'|'off'|'gone'|null}, badges: {id: 글자|null}}
 *          changes 항목은 '+ '(추가) · '- '(제거) · '~ '(변경)으로 시작할 수 있다. 없으면 '+'.
 *          values·status·badges 는 단계마다 누적된다(null 로 지운다).
 * metrics: [{id, label}]   learn: [{text, at}]   meta: {duration, level}

 */
const SIZE = {md: {w: 150, h: 62}, sm: {w: 104, h: 44}};
const DEPTH = 8;
// 단계 성격별 색: 시작(중립) · 원리(파랑) · 주의(주황) · 문제·장애(빨강) · 정리(초록)
const KIND_TONE = {시작: 'neutral', 원리: 'info', 주의: 'warn', 문제: 'error', 장애: 'error', 정리: 'ok'};
const WARN_TONES = new Set(['warn', 'error']);
const tone_ = (s) => KIND_TONE[s.kind] ?? 'info';
const FLOW_TYPES = ['request', 'response', 'watch'];

// 화면 문구. 레슨 본문 번역은 i18n/en/ 아래 MDX 파일에 있다. step.kind 값은 한국어 키로 두고 여기서 표시 이름만 바꾼다.
const TEXT = {
  ko: {
    region: '기술 흐름', autoOn: '▶ 자동 진행', autoOff: '■ 자동 진행 끄기', replay: '↻ 다시 보기', play: '▶ 재생', pause: 'Ⅱ 일시정지',
    diagram: (n, t) => `${n}단계 다이어그램: ${t}`, request: '요청', response: '응답·보고', watch: '상태 지켜보기', upcoming: '다음 단계에서 등장',
    warn: '주의할 점', ok: '정리', key: '핵심', changes: '이번 단계에서 바뀐 것', back: '← 이전', next: '다음', restart: '처음부터 ↺',
    keys: ['단계', '자동 진행', '다시 보기', '일시정지'], steps: '이 레슨의 단계', stepsNav: '레슨 단계', nSteps: (n) => `${n}단계`, learn: '이 레슨에서 배우는 것',
    kinds: {},
  },
  en: {
    region: 'Animated flow', autoOn: '▶ Autoplay', autoOff: '■ Stop autoplay', replay: '↻ Replay', play: '▶ Play', pause: 'Ⅱ Pause',
    diagram: (n, t) => `Step ${n} diagram: ${t}`, request: 'Request', response: 'Response / report', watch: 'Watch', upcoming: 'Appears in a later step',
    warn: 'Watch out', ok: 'Summary', key: 'Key idea', changes: 'What changed in this step', back: '← Back', next: 'Next', restart: 'Start over ↺',
    keys: ['steps', 'autoplay', 'replay', 'pause'], steps: 'Steps in this lesson', stepsNav: 'Lesson steps', nSteps: (n) => `${n} steps`, learn: 'What you will learn',
    kinds: {시작: 'Start', 원리: 'How it works', 주의: 'Caution', 문제: 'Problem', 장애: 'Failure', 정리: 'Summary'},
  },
};

// 노드 크기. 글자가 길면 노드에 w 를 직접 준다.
const dims = (n) => ({...(SIZE[n.size] ?? SIZE.md), ...(n.w ? {w: n.w} : {})});

// 노드 상자 가장자리에서 선이 시작·끝나도록, 중심에서 target 방향으로 상자 경계까지 간다.
// top: 노드 위에 배지가 있으면 위쪽 경계를 그만큼 올려 선이 배지를 뚫지 않게 한다.
function edgePoint(n, target, pad = 7, top = 0) {
  const {w, h} = dims(n);
  const dx = target.x - n.x;
  const dy = target.y - n.y;
  const halfH = dy < 0 ? h / 2 + top : h / 2 + DEPTH;
  const t = Math.min(dx ? (w / 2 + pad) / Math.abs(dx) : Infinity, dy ? (halfH + pad) / Math.abs(dy) : Infinity);
  return {x: n.x + dx * t, y: n.y + dy * t};
}

// 라벨 알약 폭: 한글은 라틴 문자보다 넓게 잡는다.
const textWidth = (t) => [...t].reduce((w, c) => w + (c.charCodeAt(0) > 0x1100 ? 11.5 : 7), 0);
const asList = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const merge = (list) => {
  const out = {};
  list.forEach((o) => Object.entries(o ?? {}).forEach(([k, v]) => (v == null ? delete out[k] : (out[k] = v))));
  return out;
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = (e) => setReduced(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

function flowGeometry(a, b, bend = 0, badged = {}) {
  const ctrl = {x: (a.x + b.x) / 2 + (a.y - b.y) * bend, y: (a.y + b.y) / 2 + (b.x - a.x) * bend};
  const p1 = edgePoint(a, bend ? ctrl : b, 7, badged[a.id] ? 26 : 0);
  const p2 = edgePoint(b, bend ? ctrl : a, 7, badged[b.id] ? 26 : 0);
  const len = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
  // 왕복 흐름이 겹치지 않도록 진행 방향의 왼쪽으로 조금 띄운다.
  const nx = (p1.y - p2.y) / len;
  const ny = (p2.x - p1.x) / len;
  const s = {x: p1.x + nx * 6, y: p1.y + ny * 6};
  const e = {x: p2.x + nx * 6, y: p2.y + ny * 6};
  const c = bend ? {x: (s.x + e.x) / 2 + nx * len * bend * 2, y: (s.y + e.y) / 2 + ny * len * bend * 2} : null;
  const at = (t) =>
    c
      ? {x: (1 - t) ** 2 * s.x + 2 * (1 - t) * t * c.x + t * t * e.x, y: (1 - t) ** 2 * s.y + 2 * (1 - t) * t * c.y + t * t * e.y}
      : {x: s.x + (e.x - s.x) * t, y: s.y + (e.y - s.y) * t};
  return {d: c ? `M${s.x},${s.y} Q${c.x},${c.y} ${e.x},${e.y}` : `M${s.x},${s.y} L${e.x},${e.y}`, at, nx, ny};
}

const overlap = (a, b) =>
  Math.max(0, Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1)) * Math.max(0, Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1));

// 라벨 알약 자리: 선을 따라 몇 군데, 선 양옆 몇 거리를 시험해 노드·다른 라벨과 가장 덜 겹치는 곳을 고른다.
function placeLabel(geo, label, obstacles, lines, width, height) {
  const w = textWidth(label) + 20;
  const h = 22;
  let best = null;
  for (const t of [0.5, 0.4, 0.6, 0.3, 0.7]) {
    for (const off of [16, -16, 30, -30, 46, -46, 0]) {
      const p = geo.at(t);
      const x = p.x + geo.nx * off;
      const y = p.y + geo.ny * off;
      const box = {x1: x - w / 2, x2: x + w / 2, y1: y - h / 2, y2: y + h / 2};
      const outside = Math.max(0, -box.x1) + Math.max(0, box.x2 - width) + Math.max(0, -box.y1) + Math.max(0, box.y2 - height);
      // 겹침 넓이가 거의 같으면 선 가운데·가까운 자리를 고른다.
      const crossed = lines.filter((pt) => pt.x > box.x1 && pt.x < box.x2 && pt.y > box.y1 && pt.y < box.y2).length;
      const score = obstacles.reduce((a, o) => a + overlap(box, o), 0) + crossed * 120 + outside * 50 + Math.abs(t - 0.5) * 40 + Math.abs(off) * 0.8;
      if (!best || score < best.score) best = {score, x, y, box};
    }
  }
  return best;
}

export default function StepDiagram({nodes, steps, groups = [], metrics = [], learn = [], meta = {}, width = 960, height = 440}) {
  const [i, setI] = useState(0);
  const [replay, setReplay] = useState(0);
  const [paused, setPaused] = useState(false);
  const [auto, setAuto] = useState(false);
  const svgRef = useRef(null);
  const reduced = usePrefersReducedMotion();
  const t = TEXT[useDocusaurusContext().i18n.currentLocale] ?? TEXT.ko;
  const lessonId = useContext(LessonContext);

  // 마지막 단계까지 오면 레슨을 완료로 기록한다.
  useEffect(() => {
    if (lessonId && i === steps.length - 1) markDone(lessonId);
  }, [lessonId, i, steps.length]);

  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const step = steps[i];
  const next = steps[i + 1];
  const flows = step.flows ?? [];
  const focus = new Set(step.focus ?? []);
  const status = merge(steps.slice(0, i + 1).map((s) => s.status));
  const badges = merge(steps.slice(0, i + 1).map((s) => s.badges));
  const values = merge(steps.slice(0, i + 1).map((s) => s.values));
  const changed = new Set(Object.keys(step.values ?? {}));

  // 노드가 처음 등장하는 단계
  const firstSeen = Object.fromEntries(nodes.map((n) => [n.id, n.show ? 0 : Infinity]));
  steps.forEach((s, k) => {
    [
      ...(s.focus ?? []),
      ...(s.flows ?? []).flatMap((f) => [f.from, f.to]),
      ...Object.keys(s.status ?? {}),
      ...Object.keys(s.badges ?? {}),
    ].forEach((id) => {
      if (id in firstSeen) firstSeen[id] = Math.min(firstSeen[id], k);
    });
  });
  const isVisible = (id) => firstSeen[id] <= i && status[id] !== 'gone';

  // 곧 등장할 노드는 흐린 윤곽으로 미리 보여 준다(전체 지도). 다만 같은 자리를 지금 보이는 노드가
  // 쓰고 있으면(예: 교체되는 파드) 겹쳐 보이므로 그리지 않는다.
  const boxOf = (n) => {
    const {w, h} = dims(n);
    return {x1: n.x - w / 2, x2: n.x + w / 2, y1: n.y - h / 2, y2: n.y + h / 2 + DEPTH};
  };
  const visibleBoxes = nodes.filter((n) => isVisible(n.id)).map(boxOf);
  const isUpcoming = (n) =>
    firstSeen[n.id] > i && firstSeen[n.id] !== Infinity && status[n.id] !== 'gone' && !visibleBoxes.some((b) => overlap(b, boxOf(n)) > 0);
  const hasUpcoming = nodes.some(isUpcoming);
  // 이 레슨에서 실제로 쓰는 흐름 종류만 범례에 보인다.
  const usedTypes = new Set(steps.flatMap((s) => (s.flows ?? []).map((f) => f.type ?? 'request')));

  // 지금까지 오간 연결은 얇은 실선으로 남긴다(양 끝이 보일 때만). 오래전에 쓴 선일수록 옅게 해서 엉켜 보이지 않게 한다.
  const wires = new Map();
  steps.slice(0, i + 1).forEach((s, k) =>
    (s.flows ?? []).forEach((f) => {
      const key = [f.from, f.to].sort().join('|');
      wires.set(key, {f: wires.get(key)?.f ?? f, last: k});
    }),
  );
  const wireOpacity = (last) => [0.3, 0.3, 0.2, 0.12][Math.min(i - last, 3)];

  // 지금 단계에 관련된 노드. 나머지는 살짝 흐리게 해서 시선을 모은다.
  const involved = new Set([...focus, ...flows.flatMap((f) => [f.from, f.to])]);

  // 노드 글자가 상자보다 길면(주로 번역본) 글자 크기를 줄이고, 그래도 넘치면 폭에 맞춰 좁힌다.
  useLayoutEffect(() => {
    svgRef.current?.querySelectorAll('text[data-max]').forEach((el) => {
      const max = Number(el.dataset.max);
      el.removeAttribute('textLength');
      el.style.fontSize = '';
      let w = el.getBBox().width;
      if (w <= max) return;
      const size = parseFloat(getComputedStyle(el).fontSize);
      el.style.fontSize = `${size * Math.max(0.8, max / w)}px`;
      w = el.getBBox().width;
      if (w > max) {
        el.setAttribute('textLength', max);
        el.setAttribute('lengthAdjust', 'spacingAndGlyphs');
      }
    });
  }, [nodes]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg?.pauseAnimations) return;
    paused ? svg.pauseAnimations() : svg.unpauseAnimations();
  }, [paused, i, replay]);

  const go = (k) => {
    setI(Math.max(0, Math.min(steps.length - 1, k)));
  };

  // 자동 진행: 설명 길이에 맞춰 잠시 머문 뒤 다음 단계로 넘어가고, 마지막 단계에서 멈춘다.
  useEffect(() => {
    if (!auto || paused) return undefined;
    if (i >= steps.length - 1) {
      setAuto(false);
      return undefined;
    }
    const chars = asList(steps[i].text).join('').length + (steps[i].keyIdea ?? '').length;
    const t = setTimeout(() => setI(i + 1), Math.min(14000, 3500 + chars * 45));
    return () => clearTimeout(t);
  }, [auto, paused, i, steps]);

  // 키보드는 레슨 영역에 포커스가 있을 때만 받는다. 페이지 스크롤 키를 가로채지 않기 위해서다.
  const onKeyDown = (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'ArrowRight') go(i + 1);
    else if (e.key === 'ArrowLeft') go(i - 1);
    else if (e.key === 'r' || e.key === 'R') setReplay(replay + 1);
    else if (e.key === 'p' || e.key === 'P') setPaused(!paused);
    else if (e.key === 'a' || e.key === 'A') setAuto(!auto);
    else return;
    e.preventDefault();
  };

  const kindTone = KIND_TONE[step.kind] ?? 'info';
  const geos = flows.map((f) => flowGeometry(byId[f.from], byId[f.to], f.bend, badges));
  const obstacles = nodes.filter((n) => isVisible(n.id)).map((n) => {
    const {w, h} = dims(n);
    return {x1: n.x - w / 2 - 4, x2: n.x + w / 2 + 4, y1: n.y - h / 2 - (badges[n.id] ? 26 : 4), y2: n.y + h / 2 + DEPTH + 2};
  });

  return (
    <section className={styles.root} onKeyDown={onKeyDown} aria-label={t.region}>
      <div className={styles.stage}>
        <div className={styles.stageBar}>
          <div className={styles.metrics}>
            {metrics.map((m) => {
              const v = values[m.id];
              const text = v && typeof v === 'object' ? v.text : v;
              const tone = v && typeof v === 'object' ? v.tone : null;
              return (
                <div key={m.id} className={[styles.metric, text == null && styles.metricEmpty, changed.has(m.id) && styles.metricOn, tone && styles[`metric_${tone}`]].filter(Boolean).join(' ')}>
                  <span className={styles.metricLabel}>{m.label}</span>
                  <span className={styles.metricValue}>{text ?? '—'}</span>
                </div>
              );
            })}
          </div>
          <div className={styles.stageTools}>
            <button type="button" className={`${styles.tool} ${auto ? styles.toolOn : ''}`} onClick={() => { if (!auto && i === steps.length - 1) setI(0); setAuto(!auto); }} aria-pressed={auto}>
              {auto ? t.autoOff : t.autoOn}
            </button>
            <button type="button" className={styles.tool} onClick={() => setReplay(replay + 1)}>{t.replay}</button>
            {!reduced && (
              <button type="button" className={styles.tool} onClick={() => setPaused(!paused)} aria-pressed={paused}>
                {paused ? t.play : t.pause}
              </button>
            )}
          </div>
        </div>

        <div className={styles.canvasWrap}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            className={styles.canvas}
            role="img"
            aria-label={t.diagram(i + 1, step.title)}
          >
            <defs>
              {FLOW_TYPES.map((t) => (
                <marker key={t} id={`sd-arrow-${t}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M0,0 L10,5 L0,10 z" className={styles[`head_${t}`]} />
                </marker>
              ))}
            </defs>

            {groups.map((g, k) => (
              <g key={`g${k}`} className={`${styles.group} ${styles[`group_${g.tone ?? 'plain'}`]} ${(g.from ?? 0) > i ? styles.upcoming : ''}`}>
                <rect x={g.x} y={g.y} width={g.w} height={g.h} rx="16" />
                <rect x={g.x + 14} y={g.y - 11} width={textWidth(g.label) * 0.92 + 18} height="22" rx="6" className={styles.groupTab} />
                <text x={g.x + 23} y={g.y + 4} className={styles.groupLabel}>{g.label}</text>
              </g>
            ))}

            {[...wires.values()].filter(({f}) => isVisible(f.from) && isVisible(f.to)).map(({f, last}) => {
              const {d} = flowGeometry(byId[f.from], byId[f.to], f.bend, badges);
              return <path key={`w-${f.from}-${f.to}`} d={d} className={styles.wire} style={{opacity: wireOpacity(last)}} />;
            })}

            {nodes.map((n) => {
              const {w, h} = dims(n);
              const sm = n.size === 'sm';
              const st = status[n.id];
              const on = focus.has(n.id);
              const badge = badges[n.id];
              const tx = n.icon ? (sm ? 34 : 46) : w / 2;
              const dim = isVisible(n.id) && involved.size > 0 && !involved.has(n.id) && st !== 'error' && st !== 'warn';
              const bw = badge ? textWidth(badge) * 0.9 + 16 : 0;
              return (
                <g
                  key={n.id}
                  className={[
                    styles.node,
                    styles[`tone_${n.tone ?? 'ext'}`],
                    on && styles.nodeOn,
                    firstSeen[n.id] === i && i > 0 && styles.enter,
                    st && styles[`st_${st}`],
                    dim && styles.dim,
                    !isVisible(n.id) && (isUpcoming(n) ? styles.upcoming : styles.hidden),
                  ].filter(Boolean).join(' ')}
                  transform={`translate(${n.x - w / 2} ${n.y - h / 2})`}
                >
                  {on && !reduced && (
                    <rect x={-6} y={-6} width={w + 12} height={h + DEPTH + 12} rx={sm ? 14 : 16} className={styles.halo} />
                  )}
                  <g className={styles.lift} key={firstSeen[n.id] === i ? `in-${i}` : 'still'}>
                    <g className={st === 'error' ? styles.shake : undefined} key={`${st}-${i}`}>
                      <rect y={sm ? 5 : DEPTH} width={w} height={h} rx={sm ? 10 : 12} className={styles.side} />
                      <rect width={w} height={h} rx={sm ? 10 : 12} className={styles.face} />
                      {n.icon && ICONS[n.icon] && (
                        <g transform={sm ? `translate(10 ${h / 2 - 8.5}) scale(0.85)` : `translate(15 ${h / 2 - 10})`} className={styles.icon}>{ICONS[n.icon]}</g>
                      )}
                      <text x={tx} y={n.sub ? h / 2 - 3 : h / 2 + 5} data-max={n.icon ? w - tx - 13 : w - 16} className={`${sm ? styles.labelSm : styles.label} ${n.icon ? '' : styles.center}`}>{n.label}</text>
                      {n.sub && (
                        <text x={tx} y={h / 2 + (sm ? 12 : 14)} data-max={n.icon ? w - tx - 13 : w - 16} className={`${styles.sub} ${n.icon ? '' : styles.center}`}>{n.sub}</text>
                      )}
                      {st === 'error' && (
                        <g transform="translate(0 0)" className={styles.errMark}>
                          <circle r="10" />
                          <path d="M-4,-4 L4,4 M4,-4 L-4,4" />
                        </g>
                      )}
                      {badge && (
                        <g transform={`translate(${w / 2} -13)`} className={styles.badge}>
                          <rect x={-bw / 2} y="-10" width={bw} height="20" rx="10" />
                          <text y="4">{badge}</text>
                        </g>
                      )}
                    </g>
                  </g>
                </g>
              );
            })}

            {flows.map((f, k) => {
              const type = f.type ?? 'request';
              const geo = geos[k];
              const {d} = geo;
              // 다른 흐름 선 위에 라벨이 앉지 않도록, 다른 선을 따라 찍은 점들을 함께 피한다.
              const lines = geos.flatMap((g, j) => (j === k ? [] : Array.from({length: 21}, (_, q) => g.at(q / 20))));
              const spot = f.label && placeLabel(geo, f.label, obstacles, lines, width, height);
              if (spot) obstacles.push(spot.box);
              return (
                <g key={`${i}-${replay}-${k}`} className={styles.flowIn}>
                  <path d={d} pathLength={type === 'watch' ? undefined : 1} style={{animationDelay: `${k * 0.35}s`}} className={`${styles.flow} ${styles[`flow_${type}`]} ${reduced || type === 'watch' ? '' : styles.draw}`} markerEnd={`url(#sd-arrow-${type})`} />
                  {!reduced &&
                    [0, 0.7].map((delay) => (
                      <circle key={delay} r="5.5" className={`${styles.packet} ${styles[`packet_${type}`]}`}>
                        <animateMotion dur="1.4s" begin={`${k * 0.35 + delay}s`} repeatCount="indefinite" path={d} />
                      </circle>
                    ))}
                  {f.label && (
                    <g transform={`translate(${spot.x} ${spot.y})`}>
                      <rect x={-(textWidth(f.label) / 2 + 10)} y="-11" width={textWidth(f.label) + 20} height="22" rx="11" className={`${styles.pill} ${styles[`pill_${type}`]}`} />
                      <text y="4" className={styles.pillText}>{f.label}</text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div className={styles.legend}>
          {usedTypes.has('request') && <span><i className={styles.dot_request} />{t.request}</span>}
          {usedTypes.has('response') && <span><i className={styles.dot_response} />{t.response}</span>}
          {usedTypes.has('watch') && <span><i className={styles.dot_watch} />{t.watch}</span>}
          {hasUpcoming && <span><i className={styles.dot_upcoming} />{t.upcoming}</span>}
        </div>
      </div>

      <aside className={styles.panel}>
        <div className={styles.panelHead}>
          <span className={styles.stepNo}>STEP {i + 1} / {steps.length}</span>
          {step.kind && <span className={`${styles.kind} ${styles[`kind_${kindTone}`]}`}>{t.kinds[step.kind] ?? step.kind}</span>}
        </div>
        <div className={styles.progress} aria-hidden="true">
          <span style={{width: `${((i + 1) / steps.length) * 100}%`}} />
        </div>
        {/* 모든 단계 설명을 같은 칸에 겹쳐 두고 현재 것만 보인다 → 패널 높이가 가장 긴 단계에 고정돼 버튼이 움직이지 않는다 */}
        <div className={styles.bodyStack}>
          {steps.map((step, k) => (
        <div key={k === i ? `cur${i}` : k} className={`${styles.panelBody} ${k === i ? '' : styles.ghost}`} aria-live={k === i ? 'polite' : undefined} aria-hidden={k === i ? undefined : true}>
          <h3 className={styles.title}>{step.title}</h3>
          {asList(step.text).map((p, k) => (
            <p key={k} className={styles.text}>{p}</p>
          ))}
          {step.keyIdea && (
            <div className={`${styles.keyIdea} ${WARN_TONES.has(tone_(step)) ? styles.keyWarn : ''} ${tone_(step) === 'ok' ? styles.keyOk : ''}`}>
              <span className={styles.keyIcon}><Icon name={WARN_TONES.has(tone_(step)) ? 'alert' : tone_(step) === 'ok' ? 'bulb' : 'spark'} size={16} /></span>
              <div>
                <span className={styles.keyLabel}>{WARN_TONES.has(tone_(step)) ? t.warn : tone_(step) === 'ok' ? t.ok : t.key}</span>
                <p>{step.keyIdea}</p>
              </div>
            </div>
          )}
          {step.changes && (
            <>
              <p className={styles.changesLabel}>{t.changes}</p>
              <ul className={styles.changes}>
                {asList(step.changes).map((c, k) => {
                  const m = /^([+\-~]) /.exec(c);
                  const mark = m ? m[1] : '+';
                  return (
                    <li key={k}>
                      <span className={`${styles.mark} ${styles[`mark_${{'+': 'add', '-': 'del', '~': 'mod'}[mark]}`]}`}>{mark === '-' ? '−' : mark}</span>
                      {m ? c.slice(2) : c}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
          ))}
        </div>
        <div className={styles.nav}>
          <button type="button" className={styles.back} onClick={() => go(i - 1)} disabled={i === 0}>{t.back}</button>
          {next ? (
            <button type="button" className={`${styles.next} ${i === 0 && !reduced ? styles.nextHint : ''}`} onClick={() => go(i + 1)}>{t.next}: {next.short ?? next.title} →</button>
          ) : (
            <button type="button" className={styles.next} onClick={() => go(0)}>{t.restart}</button>
          )}
        </div>
        <p className={styles.keys}><kbd>←</kbd><kbd>→</kbd> {t.keys[0]} · <kbd>A</kbd> {t.keys[1]} · <kbd>R</kbd> {t.keys[2]} · <kbd>P</kbd> {t.keys[3]}</p>
      </aside>

      <nav className={styles.timeline} aria-label={t.stepsNav}>
        <div className={styles.timelineHead}>
          <span>{t.steps}</span>
          <span>{[meta.duration, meta.level, t.nSteps(steps.length)].filter(Boolean).join(' · ')}</span>
        </div>
        <ol className={styles.track}>
          {steps.map((s, k) => (
            <li key={k} className={`${styles.tick} ${k < i ? styles.done : ''} ${k === i ? styles.current : ''}`}>
              <button type="button" onClick={() => go(k)} aria-current={k === i ? 'step' : undefined}>
                <span className={styles.bubble}>{k < i ? '✓' : k + 1}</span>
                <span className={styles.tickLabel}>{s.short ?? s.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {learn.length > 0 && (
        <div className={styles.learn}>
          <p className={styles.learnHead}>{t.learn}</p>
          <ul>
            {learn.map((l, k) => (
              <li key={k} className={i >= l.at ? styles.learned : ''}>
                <span className={styles.check} aria-hidden="true">{i >= l.at ? '✓' : ''}</span>
                {l.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
