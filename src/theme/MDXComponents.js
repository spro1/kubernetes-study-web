import React from 'react';
import MDXComponents from '@docusaurus/theme-classic/lib/theme/MDXComponents';
import StepDiagram from '@site/src/components/StepDiagram';
import LessonCard, {LessonGrid} from '@site/src/components/LessonCard';
import Quiz from '@site/src/components/Quiz';

// 표를 가로 스크롤 상자로 감싼다.
function Table(props) {
  return (
    <div className="tableWrap">
      <table {...props} />
    </div>
  );
}

// 전역 등록 — 문서 안에서 import 없이 바로 쓴다.
export default {...MDXComponents, table: Table, StepDiagram, LessonCard, LessonGrid, Quiz};
