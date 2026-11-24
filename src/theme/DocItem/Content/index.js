import React, {useEffect} from 'react';
import Content from '@theme-original/DocItem/Content';
import Head from '@docusaurus/Head';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import LessonContext from '@site/src/components/lesson/LessonContext';
import TRACKS from '@site/src/data/tracks';
import {setLast, useProgress, markDone} from '@site/src/progress';
import styles from './styles.module.css';

// 레슨 페이지 위에 트랙·순번·진도 막대를 붙이고, 레슨 id 를 StepDiagram 에 넘긴다.
export default function ContentWrapper(props) {
  const {metadata} = useDoc();
  const {i18n, siteConfig} = useDocusaurusContext();
  const en = i18n.currentLocale === 'en';
  const {done, ready} = useProgress();
  const id = metadata.id;
  const track = TRACKS.find((t) => t.lessons.includes(id));
  const index = track ? track.lessons.indexOf(id) : -1;

  useEffect(() => {
    if (index >= 0) setLast(id);
  }, [id, index]);

  if (!track || index < 0) return <Content {...props} />;

  const doneCount = track.lessons.filter((l) => done.has(l)).length;
  const trackIndex = TRACKS.indexOf(track);
  // 검색엔진용 구조화 데이터: 이 페이지가 무료 대화형 학습 자료이고 어느 코스(트랙)에 속하는지 알린다.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: metadata.title,
    description: metadata.description,
    url: `${siteConfig.url}${metadata.permalink}`,
    inLanguage: i18n.currentLocale,
    learningResourceType: 'Interactive animated lesson',
    educationalLevel: trackIndex < 3 ? 'Beginner' : trackIndex < 7 ? 'Intermediate' : 'Advanced',
    timeRequired: 'PT10M',
    isAccessibleForFree: true,
    about: ['Kubernetes', 'Cloud native'],
    isPartOf: {'@type': 'Course', name: `${en ? track.en : track.ko} · K8s Flow`, url: `${siteConfig.url}${siteConfig.baseUrl}${i18n.currentLocale === i18n.defaultLocale ? '' : `${i18n.currentLocale}/`}lessons`},
    provider: {'@type': 'Organization', name: 'K8s Flow', url: `${siteConfig.url}${siteConfig.baseUrl}`},
  };
  const isDone = done.has(id);
  return (
    <LessonContext.Provider value={id}>
      <Head>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Head>
      <div className={styles.head} style={{'--c': track.color}}>
        <span className={styles.track}>{en ? track.en : track.ko}</span>
        <span className={styles.pos}>
          {en ? `Lesson ${index + 1} of ${track.lessons.length}` : `${track.lessons.length}개 중 ${index + 1}번째 레슨`}
        </span>
        <div className={styles.bar} aria-hidden="true">
          {track.lessons.map((l, k) => (
            <span key={l} className={[k === index && styles.here, ready && done.has(l) && styles.filled].filter(Boolean).join(' ')} />
          ))}
        </div>
        <span className={styles.count}>
          {ready && (en ? `${doneCount}/${track.lessons.length} done` : `${doneCount}/${track.lessons.length} 완료`)}
        </span>
        {ready && (isDone ? (
          <span className={styles.doneBadge}>✓ {en ? 'Completed' : '완료한 레슨'}</span>
        ) : (
          <button type="button" className={styles.markBtn} onClick={() => markDone(id)}>
            {en ? 'Mark as done' : '완료로 표시'}
          </button>
        ))}
      </div>
      <Content {...props} />
    </LessonContext.Provider>
  );
}
