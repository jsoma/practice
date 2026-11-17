# Question files

Each file is a list of questions. Every question has:

- `id`: unique and never reused. Change it only if the question changes so much that old answers shouldn't count.
- `family`: the topic. Practice schedules by family, and questions in the same family should test the same thing.
- `type`: `mc`, `code`, `output` or `short`.
- `difficulty`: `easy`, `standard` or `stretch`.
- `stem`: the question. Backticks become inline code.
- `explanation`: shown after answering.
- `hint`: shown if the student asks.

Optional context shown above the question: `code` (a code block), `table` (`{headers, rows}`, shown as `df`), `bullets` (a list of facts).

By type:

- `mc`: `choices`, a list of four strings. **The first one is correct**; they're shuffled when shown.
- `code`: `accepted`, the answers that count. Spaces and quote style are ignored, and `print(...)` around an expression is accepted.
- `output`: `accepted`, what the code prints. Quotes around the student's answer are ignored.
- `short`: `groups`, each `[label, keyword, keyword, ...]`. One keyword from a group earns that group. Students can mark these right themselves.
