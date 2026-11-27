import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {Icon} from './lessonIcons';
import {useProgress} from '../progress';
import TRACKS from '../data/tracks';
import styles from './LessonCard.module.css';

/**
 * 기술 흐름 목록 카드.
 *
 * 사용 예 (MDX, import 없이 전역 등록):
 *   <LessonGrid>
 *     <LessonCard no="01" to="/k8s/pod-startup" track="k8s" icon="pod"
 *       title="파드가 뜨기까지" duration="10분" steps={8} level="기초">
 *       한 줄 설명
 *     </LessonCard>
 *   </LessonGrid>
 *
 * track: src/data/tracks.js 의 key. to 를 비우면 '준비 중' 카드가 된다.
 */
export function LessonGrid({children}) {
  return <div className={styles.grid}>{children}</div>;
}

export default function LessonCard({no, to, track = 'k8s', icon, title, duration, steps, level, children}) {
  const en = useDocusaurusContext().i18n.currentLocale === 'en';
  const progress = useProgress();
  const id = to?.replace(/^\//, '');
  const done = progress.done.has(id);
  const quiz = progress.quiz[id];
  const body = (
    <>
      <div className={styles.top}>
        <span className={styles.iconTile}>{icon && <Icon name={icon} size={22} />}</span>
        {done ? (
          <span className={styles.done}>✓ {en ? 'Done' : '완료'}</span>
        ) : (
          no && <span className={styles.no}>{to ? no : en ? 'Soon' : '준비 중'}</span>
        )}
      </div>
      <p className={styles.title}>{title}</p>
      <div className={styles.summary}>{children}</div>
      <div className={styles.meta}>
        {[duration, steps && (en ? `${steps} steps` : `${steps}단계`), level, quiz && `${en ? 'Quiz' : '퀴즈'} ${quiz.right}/${quiz.total}`].filter(Boolean).map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </>
  );

  const cls = `${styles.card} ${to ? '' : styles.planned} ${done ? styles.isDone : ''}`;
  // 트랙 색은 src/data/tracks.js 한 곳에서 온다.
  const color = TRACKS.find((t) => t.key === track)?.color ?? '#2f62c9';
  const style = {'--lc-color': color, '--lc-soft': `color-mix(in srgb, ${color} 14%, var(--lc-bg))`};
  return to ? (
    <Link to={to} className={cls} style={style}>{body}</Link>
  ) : (
    <div className={cls} style={style} aria-disabled="true">{body}</div>
  );
}
