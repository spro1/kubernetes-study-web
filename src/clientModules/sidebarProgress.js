// 사이드바 레슨 링크에 완료 표시(✓)를 단다. 사이드바는 테마 컴포넌트라 직접 고치지 않고 클래스만 붙인다.
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import siteConfig from '@generated/docusaurus.config';
import {getDone} from '../progress';
import TRACKS from '../data/tracks';

const TRACK_DIRS = [...new Set(TRACKS.flatMap((t) => t.lessons.map((l) => l.split('/')[0])))];

function paint() {
  const done = getDone();
  document.querySelectorAll('.theme-doc-sidebar-menu a.menu__link[href]:not(.menu__link--sublist)').forEach((a) => {
    const parts = new URL(a.href).pathname.replace(siteConfig.baseUrl, '').split('/').filter(Boolean);
    const at = parts.findIndex((p) => TRACK_DIRS.includes(p));
    const id = at >= 0 ? parts.slice(at, at + 2).join('/') : null;
    a.classList.toggle('lesson-done', !!id && done.has(id));
  });
}

if (ExecutionEnvironment.canUseDOM) {
  window.addEventListener('k8sflow:progress', paint);
  // 사이드바 카테고리를 펼칠 때 새로 그려지는 링크도 칠한다.
  new MutationObserver(() => paint()).observe(document.documentElement, {childList: true, subtree: true});
}

export function onRouteDidUpdate() {
  if (ExecutionEnvironment.canUseDOM) paint();
}
