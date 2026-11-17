// The full bank, with families regrouped. Start shows one question per family.
import {families} from './bank.js';
import {codeQuestions} from './code-questions.js';
import {variants} from './variants.js';

// Several pandas families tested the same skill (e.g. as typed code and as
// multiple choice); they now share a family so a quiz shows one of them.
const regroup = {
  'code-pandas-head': 'pd-inspect', 'inspect-0': 'pd-inspect', 'inspect-1': 'pd-inspect',
  'code-pandas-column': 'pd-column', 'code-pandas-total': 'pd-column',
  'code-pandas-count': 'pd-count', 'pandas-count': 'pd-count', 'normalize-0': 'pd-count',
  'code-pandas-group': 'pd-group', 'pandas-group': 'pd-group',
  'code-pandas-filter': 'pd-filter', 'pandas-filter': 'pd-filter', 'exclude-0': 'pd-filter',
  'code-sort-top': 'pd-sort',
  'counts-0': 'pd-count-vs-total', 'counts-1': 'pd-count-vs-total',
  'exclude-1': 'pd-keep-original',
};

export const bank = [...codeQuestions, ...families, ...variants].map(q => {
  const family = q.family ?? q.id;
  return {...q, family: regroup[family] ?? family};
});
