// 학습 진도. 이 브라우저의 localStorage 에만 남는다(로그인 없음). 저장이 막힌 환경에서도 페이지는 그대로 동작한다.
import {useEffect, useState} from 'react';

const KEY = 'k8sflow:done';
const LAST = 'k8sflow:last';
const QUIZ = 'k8sflow:quiz'; // {레슨 id: 가장 많이 맞힌 개수/문항 수}
const EVENT = 'k8sflow:progress';

function read(key, fallback) {
  try {
    return JSON.parse(window.localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export const getDone = () => new Set(read(KEY, []));
export const getLast = () => read(LAST, null);
export const getQuiz = () => read(QUIZ, {});

// 퀴즈 점수는 가장 좋았던 결과만 남긴다. 다 맞히면 레슨도 완료로 친다.
export function saveQuiz(id, right, total) {
  const quiz = getQuiz();
  if (!quiz[id] || right > quiz[id].right) write(QUIZ, {...quiz, [id]: {right, total}});
  if (right === total) markDone(id);
}

export function markDone(id) {
  const done = getDone();
  if (done.has(id)) return;
  done.add(id);
  write(KEY, [...done]);
}

export function setLast(id) {
  if (getLast() !== id) write(LAST, id);
}

export function resetProgress() {
  write(KEY, []);
  write(LAST, null);
  write(QUIZ, {});
}

// SSR 단계에서는 빈 값, 브라우저에 올라온 뒤 실제 진도로 바뀐다.
export function useProgress() {
  const [state, setState] = useState({done: new Set(), last: null, quiz: {}, ready: false});
  useEffect(() => {
    const sync = () => setState({done: getDone(), last: getLast(), quiz: getQuiz(), ready: true});
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return state;
}
