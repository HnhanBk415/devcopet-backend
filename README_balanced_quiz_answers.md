# Balanced Quiz Answers Patch

This patch updates quiz JSON files for Python Basic chapters 03-07 so correct answers are distributed across `a`, `b`, `c`, and `d` instead of being mostly `a`.

What changed:
- Updated `correctOptionIds` to a balanced pattern.
- Updated `acceptedAnswers` to match.
- Updated `correctAnswerText` to match the correct option text.
- Reordered options by `id` so the UI still displays choices in normal A/B/C/D order.

After applying:
```bash
npm run seed
```

Then test quiz APIs or UI.
