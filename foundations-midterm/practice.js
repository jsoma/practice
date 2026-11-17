// Endless practice with simple spaced repetition, scheduled per family.
// A miss comes back a few questions later. Each right answer pushes the
// family further out: 1 day, 2 days, 4 days, then 8.

export const RELEARN_AFTER = 5;
// At least one question in this many is a topic you haven't seen, while any are left.
export const NEW_EVERY = 3;
const DAY = 24 * 60 * 60 * 1000;
const INTERVALS = [DAY, 2 * DAY, 4 * DAY, 8 * DAY];

export const emptyProgress = () => ({count: 0, families: {}, current: null, history: []});

export function familiesOf(bank) {
  const map = new Map();
  for (const q of bank) {
    if (!map.has(q.family)) map.set(q.family, []);
    map.get(q.family).push(q);
  }
  return map;
}

// Record an answer and reschedule its family.
export function recordResult(progress, question, right, now = Date.now()) {
  const f = progress.families[question.family] ??= {box: 0, seen: 0, right: 0, firstCount: progress.count};
  f.seen++;
  f.last = right ? 'right' : 'wrong';
  f.lastAt = now;
  f.lastQuestion = question.id;
  f.shown = {...f.shown, [question.id]: progress.count};
  if (right) {
    f.right++;
    f.dueAt = now + INTERVALS[Math.min(f.box, INTERVALS.length - 1)];
    f.dueCount = null;
    f.box++;
  } else {
    f.box = 0;
    f.dueAt = null;
    f.dueCount = progress.count + 1 + RELEARN_AFTER;
  }
  progress.count++;
}

// Choose the next question. Order: a new topic if none in the last few questions,
// misses that are due, families due by date, unseen families, then whatever is
// due soonest.
export function pickNext(progress, bank, now = Date.now(), rng = Math.random) {
  const families = familiesOf(bank);
  const lastFamily = progress.history.at(-1)?.family;
  const names = [...families.keys()].filter(name => name !== lastFamily || families.size === 1);
  const record = name => progress.families[name];
  const random = list => list[Math.floor(rng() * list.length)];

  const relearn = names.filter(n => record(n)?.dueCount != null && record(n).dueCount <= progress.count);
  const dated = names.filter(n => record(n)?.dueAt != null && record(n).dueAt <= now);
  const unseen = names.filter(n => !record(n));
  const lastNew = Math.max(-1, ...Object.values(progress.families).map(f => f.firstCount ?? -1));
  let name;
  if (unseen.length && progress.count - lastNew >= NEW_EVERY) name = random(unseen);
  else if (relearn.length) name = relearn.sort((a, b) => record(a).dueCount - record(b).dueCount)[0];
  else if (dated.length) name = random(dated);
  else if (unseen.length) name = random(unseen);
  else {
    // Pending misses (small counts) sort ahead of dated reviews (timestamps).
    const soonest = n => record(n).dueCount ?? record(n).dueAt;
    name = names.sort((a, b) => soonest(a) - soonest(b))[0];
  }

  // Within a family, show the version seen longest ago (or never).
  const shown = record(name)?.shown ?? {};
  const options = families.get(name);
  const oldest = Math.min(...options.map(q => shown[q.id] ?? -1));
  return random(options.filter(q => (shown[q.id] ?? -1) === oldest));
}

export function summary(progress, bank) {
  const families = [...familiesOf(bank).keys()];
  const seen = families.filter(n => progress.families[n]);
  return {
    total: families.length,
    seen: seen.length,
    right: seen.filter(n => progress.families[n].last === 'right').length,
    answered: progress.count,
  };
}
