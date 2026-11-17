// Google Apps Script: receives quiz events and appends them to the "events" tab.
// Setup is in practice-mvp/README.md.
const COLUMNS = ['received_at', 'client_time', 'browser_id', 'session_id', 'event', 'quiz_id',
  'retry', 'question_id', 'family', 'type', 'difficulty', 'answer', 'earned', 'possible', 'skipped',
  'hinted', 'seconds', 'question_count', 'bank_version'];
const EVENTS = ['visit', 'start', 'answer', 'override', 'finish', 'active'];

// A leading apostrophe stores text exactly as typed: no formulas, dates or dropped zeros.
const asText = v => (typeof v === 'string' ? "'" + v : v);

function doPost(e) {
  let data;
  try { data = JSON.parse(e.postData.contents); } catch (err) { return ContentService.createTextOutput('bad'); }
  if (!data || !EVENTS.includes(data.event)) return ContentService.createTextOutput('ignored');
  const values = {
    received_at: new Date(), client_time: data.clientTime, browser_id: data.browserId,
    session_id: data.sessionId, event: data.event, quiz_id: data.quizId, retry: data.retry,
    question_id: data.questionId, family: data.family, type: data.type, difficulty: data.difficulty,
    answer: String(data.answer ?? '').slice(0, 4000), earned: data.earned, possible: data.possible,
    skipped: data.skipped, hinted: data.hinted, seconds: data.seconds,
    question_count: data.questionCount, bank_version: data.bankVersion,
  };
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return ContentService.createTextOutput('busy');
  try {
    const sheet = SpreadsheetApp.getActive().getSheetByName('events')
      ?? SpreadsheetApp.getActive().insertSheet('events');
    if (sheet.getLastRow() === 0) sheet.appendRow(COLUMNS);
    sheet.appendRow(COLUMNS.map(c => asText(values[c] ?? '')));
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
  return ContentService.createTextOutput('ok');
}
