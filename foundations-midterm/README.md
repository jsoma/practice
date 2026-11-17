# Foundations midterm practice

Practice questions for the Foundations midterm. Questions keep coming until you stop. Each topic ("family") has a few versions of the same kind of question.

What comes next:
1. A topic you missed, five questions after you missed it, as a different version if one exists.
2. A topic you got right that's due again. Reviews come 1, 2, 4, then 8 days apart.
3. A topic you haven't seen yet. At least one question in three is a new topic until you've seen them all.

Progress is saved in the browser. The home page shows one bar segment per topic, colored by your last answer. "See wrong answers" lists the topics where your last answer was wrong. The scheduling is in `practice.js`.

## Questions

New questions go in `variants.js`. The older ones are in `bank.js` and `code-questions.js`, and `questions.js` combines everything. There are four kinds:

- **mc**: four choices, with the first one correct. Choices are shuffled when shown.
- **code**: the student writes code. It's compared to the `accepted` list after removing spaces and normalizing quotes, and it isn't run, so other working code can be marked wrong.
- **output**: the student types what the code prints.
- **short**: a short explanation, checked for keywords. Each group of keywords is worth a point. This is a rough check and the page says so.

Adding a question to an existing family gives that topic more variety. A new family is a new topic.

## Answer logging

Each browser gets a random ID, not tied to a name. Answers are sent to a Google Sheet through a small Apps Script (`apps-script/Code.gs`). The web app URL is in `config.js`. Leave it empty to turn logging off.

Setting up a new sheet:

1. Make a Google Sheet. Open Extensions → Apps Script, paste in `Code.gs`, and save.
2. Deploy → New deployment → Web app. Execute as **Me**, access **Anyone**.
3. Put the URL in `config.js`. Test it with:
   `curl -L -H 'Content-Type: text/plain' -d '{"event":"visit"}' '<url>'`
   It should print `ok`.

Apps Script deployments are tied to a saved version. If you change the script, edit the deployment and pick "New version", or the URL keeps running the old code.

To analyze, use File → Download → CSV from the sheet. Each answer is a row in the `events` tab, with the question, what the student typed, the score, and seconds spent on it. `retry` is TRUE when the student had seen that topic before, and `question_count` is how many questions they'd answered at that point.
