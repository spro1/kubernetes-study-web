import React, {useState} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
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
 */
const TEXT = {
  ko: {title: '확인 퀴즈', right: '정답', wrong: '오답', score: (r, n) => `${n}문제 중 ${r}개 맞힘`, reset: '다시 풀기'},
  en: {title: 'Check yourself', right: 'Correct', wrong: 'Not quite', score: (r, n) => `${r} of ${n} correct`, reset: 'Try again'},
};

export default function Quiz({questions = []}) {
  const t = TEXT[useDocusaurusContext().i18n.currentLocale] ?? TEXT.en;
  const [picked, setPicked] = useState({});
  const answered = Object.keys(picked).length;
  const right = questions.filter((q, i) => picked[i] === q.answer).length;

  return (
    <section className={styles.quiz} aria-label={t.title}>
      <h2 className={styles.title}>{t.title}</h2>
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
      {answered === questions.length && questions.length > 0 && (
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
