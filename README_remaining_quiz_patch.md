# Remaining Chapters Quiz Patch

This patch adds/normalizes quiz JSON files for Python Basic chapters 00, 03, 04, 05, 06, and 07 using the same schema style as lesson 1 in chapter-01.

Included fields per quiz:
- title
- description
- passingScore
- isPublished
- questions
- type
- question
- codeSnippet
- options with ids a/b/c/d
- correctOptionIds
- correctAnswerText
- acceptedAnswers
- explanation
- difficulty
- points
- tags

Each affected lessons.json is updated with quizFile.
