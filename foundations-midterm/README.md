# Foundations midterm practice

A practice quiz for the Foundations midterm. Students get one question at a time, check their answer, and review what they got wrong at the end.

Each quiz has one question from every family. Questions in the same family test the same thing, so retaking the quiz gives you different versions instead of the same questions.

## Questions

New questions go in `variants.js`. The older ones are in `bank.js` and `code-questions.js`, and `questions.js` combines everything. There are four kinds:

- **mc**: four choices, with the first one correct. Choices are shuffled when shown.
- **code**: the student writes code. It's compared to the `accepted` list after removing spaces and normalizing quotes, and it isn't run, so other working code can be marked wrong.
- **output**: the student types what the code prints.
- **short**: a short explanation, checked for keywords. Each group of keywords is worth a point. This is a rough check and the page says so.

Adding a question to an existing family doesn't make the quiz longer. A new family adds a question to every quiz.

## Answer logging

Each browser gets a random ID, not tied to a name. Answers are sent to a Google Sheet through a small Apps Script (`apps-script/Code.gs`). The web app URL is in `config.js`. Leave it empty to turn logging off.

Setting up a new sheet:

1. Make a Google Sheet. Open Extensions → Apps Script, paste in `Code.gs`, and save.
2. Deploy → New deployment → Web app. Execute as **Me**, access **Anyone**.
3. Put the URL in `config.js`. Test it with:
   `curl -L -H 'Content-Type: text/plain' -d '{"event":"visit"}' '<url>'`
   It should print `ok`.

Apps Script deployments are tied to a saved version. If you change the script, edit the deployment and pick "New version", or the URL keeps running the old code.

To analyze, use File → Download → CSV from the sheet. Each answer is a row in the `events` tab, with the question, what the student typed, the score, and seconds spent on it.
