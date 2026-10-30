# Test tools (not part of the site)

Run from this folder after `npm install` (jsdom and mathjax-full).

- `node run_cards.js .. [lesson-id]` renders every card of every lesson in jsdom and runs its `r(fig, ctl)`. Prints `errors 0` when clean.
- `node mathcheck.js .. [id,id,...]` parses every `\( \)` and `\[ \]` in eq, sheet and sym fields with MathJax. Add `--prose` to also check intu, how, say, num, note.
- `python3 shot.py '[["thesis-ch1-l5",6]]'` takes playwright screenshots of cards (lesson id, card index from 0) into `shots/`. MathJax is served from `node_modules`, so it works offline.

Rules for content: see the project doc `study/study_notebook.md`.
