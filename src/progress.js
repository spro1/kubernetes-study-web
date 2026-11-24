// 학습 진도. 이 브라우저의 localStorage 에만 남는다(로그인 없음). 저장이 막힌 환경에서도 페이지는 그대로 동작한다.
import {useEffect, useState} from 'react';

const KEY = 'k8sflow:done';
const LAST = 'k8sflow:last';
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
}

// SSR 단계에서는 빈 값, 브라우저에 올라온 뒤 실제 진도로 바뀐다.
export function useProgress() {
  const [state, setState] = useState({done: new Set(), last: null, ready: false});
  useEffect(() => {
    const sync = () => setState({done: getDone(), last: getLast(), ready: true});
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
