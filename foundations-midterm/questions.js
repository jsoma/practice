// Loads every question file and converts it to the shape the app uses.
import structures from './questions/structures.js';
import logic from './questions/logic.js';
import tools from './questions/tools.js';
import apis from './questions/apis.js';
import pandas from './questions/pandas.js';
import concepts from './questions/concepts.js';
import stories from './questions/stories.js';

export const BANK_VERSION = '2026-11-18';

function build(q) {
  const base = {...q};
  if (q.type === 'mc') {
    base.choices = q.choices.map((text, i) => ({id: String(i), text}));
    base.answer = '0';
  } else if (q.type === 'output') {
    base.type = 'code';
    base.output = true;
  } else if (q.type === 'short') {
    base.groups = q.groups.map(([label, ...any]) => ({label, any}));
  }
  return base;
}

export const bank = [...structures, ...logic, ...tools, ...apis, ...pandas, ...concepts, ...stories].map(build);
