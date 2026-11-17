# Foundations midterm practice

Practice questions for the Foundations midterm. Questions keep coming until you stop. Each topic ("family") has a few versions of the same kind of question.

What comes next:
1. A topic you missed, five questions after you missed it, as a different version if one exists.
2. A topic you got right that's due again. Reviews come 1, 2, 4, then 8 days apart.
3. A topic you haven't seen yet. At least one question in three is a new topic until you've seen them all.

Progress is saved in the browser. The home page shows one bar segment per topic, colored by your last answer. "See wrong answers" lists the topics where your last answer was wrong. The scheduling is in `practice.js`.

## Questions

Questions live in `questions/`, one file per area: structures, logic, tools, APIs, pandas, concepts and stories. `questions/README.md` describes the format. `questions.js` loads them all.

Code answers are compared to a list of accepted answers rather than run, and short answers are checked for keywords. Both can miss a right answer, so students can mark those "I got this right," which counts it as right for scheduling.

## Answer logging

Each browser gets a random ID, not tied to a name. Answers are sent to a Google Sheet through a small Apps Script (`apps-script/Code.gs`). The web app URL is in `config.js`. Leave it empty to turn logging off.

Setting up a new sheet:

1. Make a Google Sheet. Open Extensions → Apps Script, paste in `Code.gs`, and save.
2. Deploy → New deployment → Web app. Execute as **Me**, access **Anyone**.
3. Put the URL in `config.js`. Test it with:
   `curl -L -H 'Content-Type: text/plain' -d '{"event":"visit"}' '<url>'`
   It should print `ok`.

Apps Script deployments are tied to a saved version. If you change the script, edit the deployment and pick "New version", or the URL keeps running the old code.

To analyze, use File → Download → CSV from the sheet. Each answer is a row in the `events` tab, with the question, what the student typed, the score, and seconds spent on it. `retry` is TRUE when the student had seen that topic before, and `question_count` is how many questions they'd answered at that point. An `override` row means the student marked that answer right themselves.
