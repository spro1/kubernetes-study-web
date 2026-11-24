import React, {useEffect} from 'react';
import Content from '@theme-original/DocItem/Content';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import LessonContext from '@site/src/components/lesson/LessonContext';
import TRACKS from '@site/src/data/tracks';
import {setLast, useProgress, markDone} from '@site/src/progress';
import styles from './styles.module.css';

// 레슨 페이지 위에 트랙·순번·진도 막대를 붙이고, 레슨 id 를 StepDiagram 에 넘긴다.
export default function ContentWrapper(props) {
  const {metadata} = useDoc();
  const {i18n} = useDocusaurusContext();
  const en = i18n.currentLocale === 'en';
  const {done, ready} = useProgress();
  const id = metadata.id;
  const [dir, name] = id.split('/');
  const track = TRACKS.find((t) => t.dir === dir);
  const index = track ? track.lessons.indexOf(name) : -1;

  useEffect(() => {
    if (index >= 0) setLast(id);
  }, [id, index]);

  if (!track || index < 0) return <Content {...props} />;

  const doneCount = track.lessons.filter((l) => done.has(`${dir}/${l}`)).length;
  const isDone = done.has(id);
  return (
    <LessonContext.Provider value={id}>
      <div className={styles.head} style={{'--c': track.color}}>
        <span className={styles.track}>{en ? track.en : track.ko}</span>
        <span className={styles.pos}>
          {en ? `Lesson ${index + 1} of ${track.lessons.length}` : `${track.lessons.length}개 중 ${index + 1}번째 레슨`}
        </span>
        <div className={styles.bar} aria-hidden="true">
          {track.lessons.map((l, k) => (
            <span key={l} className={[k === index && styles.here, ready && done.has(`${dir}/${l}`) && styles.filled].filter(Boolean).join(' ')} />
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
