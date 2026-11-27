import React, {useContext, useEffect, useState} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import LessonContext from './lesson/LessonContext';
import {saveQuiz, useProgress} from '../progress';
import styles from './Quiz.module.css';

/**
 * 레슨 끝 확인 퀴즈. 보기를 고르면 바로 정답과 이유를 보여 준다.
 *
 * 사용 예 (MDX, import 없이 전역 등록):
 *   <Quiz questions={[
 *     {q: '질문', options: ['보기 1', '보기 2', '보기 3'], answer: 1, why: '정답인 이유'},
 *   ]} />
 *
 * answer: options 의 0부터 시작하는 번호.
 * title: 제목을 바꾸거나 null 로 숨긴다. save={false} 면 점수를 진도에 남기지 않는다(한 페이지에 퀴즈가 여럿일 때).
 */
const TEXT = {
  ko: {title: '확인 퀴즈', right: '정답', wrong: '오답', score: (r, n) => `${n}문제 중 ${r}개 맞힘`, best: (r, n) => `최고 ${r}/${n}`, reset: '다시 풀기'},
  en: {title: 'Check yourself', right: 'Correct', wrong: 'Not quite', score: (r, n) => `${r} of ${n} correct`, best: (r, n) => `Best ${r}/${n}`, reset: 'Try again'},
};

export default function Quiz({questions = [], title, save = true}) {
  const t = TEXT[useDocusaurusContext().i18n.currentLocale] ?? TEXT.en;
  const [picked, setPicked] = useState({});
  const answered = Object.keys(picked).length;
  const right = questions.filter((q, i) => picked[i] === q.answer).length;
  const lessonId = useContext(LessonContext);
  const progress = useProgress();
  const best = save ? progress.quiz[lessonId] : null;
  const finished = questions.length > 0 && answered === questions.length;
  useEffect(() => {
    if (save && finished && lessonId) saveQuiz(lessonId, right, questions.length);
  }, [save, finished, lessonId, right, questions.length]);

  return (
    <section className={styles.quiz} aria-label={title || t.title}>
      {title !== null && (
        <h2 className={styles.title}>
          {title ?? t.title}
          {best && <span className={styles.best}>{t.best(best.right, best.total)}</span>}
        </h2>
      )}
      <ol className={styles.list}>
        {questions.map((q, i) => {
          const done = picked[i] != null;
          const ok = picked[i] === q.answer;
          return (
            <li key={i} className={styles.item}>
              <fieldset className={styles.fieldset} disabled={done}>
                <legend className={styles.q}>{q.q}</legend>
                {q.options.map((o, j) => (
                  <label
                    key={j}
                    className={`${styles.opt} ${done && j === q.answer ? styles.correct : ''} ${done && j === picked[i] && !ok ? styles.incorrect : ''}`}>
                    <input type="radio" name={`quiz-${i}`} checked={picked[i] === j} onChange={() => setPicked({...picked, [i]: j})} />
                    <span>{o}</span>
                  </label>
                ))}
              </fieldset>
              {done && (
                <p className={ok ? styles.whyOk : styles.whyBad} role="status">
                  <strong>{ok ? t.right : t.wrong}.</strong> {q.why}
                </p>
              )}
            </li>
          );
        })}
      </ol>
      {finished && (
        <div className={styles.footer}>
          <span>{t.score(right, questions.length)}</span>
          <button type="button" className="button button--sm button--secondary" onClick={() => setPicked({})}>
            {t.reset}
          </button>
        </div>
      )}
    </section>
  );
}
