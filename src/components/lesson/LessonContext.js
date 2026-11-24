import {createContext} from 'react';

// 지금 보고 있는 레슨의 문서 id(예: 'k8s/pod-startup'). 레슨 페이지 밖(랜딩 데모 등)에서는 null.
export default createContext(null);
