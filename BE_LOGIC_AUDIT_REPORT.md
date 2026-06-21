# BE Logic Audit Report

## 1. API Mapping

### Course and lesson APIs

- `GET /courses`: returns published courses from `CoursesService.findAll`.
- `GET /courses/:courseId`: returns one published course by ObjectId or slug.
- `POST /courses/:courseId/reset-progress`: authenticated endpoint that deletes the current user's persisted lesson completion rows for the course.
- `GET /courses/:courseId/chapters`: authenticated endpoint that returns chapters with per-chapter lesson progress.
- `GET /chapters/:chapterId/lessons`: authenticated endpoint that returns lesson lock/completion state for a chapter.
- `GET /lessons/:lessonId`: authenticated endpoint that checks server-side unlock state and returns lesson data plus navigation metadata.
- `GET /lessons/:lessonId/quiz`: authenticated endpoint that verifies the lesson is unlocked before returning quiz questions.
- `POST /quizzes/:quizId/submit`: authenticated endpoint that verifies the lesson is unlocked, evaluates answers, and persists completion on pass.

### Roadmap APIs

- `GET /roadmaps/:courseSlug/easy`: returns easy roadmap nodes derived from published lessons.
- `GET /roadmaps/:courseSlug/medium`: returns medium roadmap only after easy is 100% complete.
- `GET /roadmaps/:courseSlug/hard`: returns hard roadmap only after easy is complete and medium is 100% complete.
- `POST /roadmaps/:courseSlug/:mode/reset-progress`: deletes current user's persisted roadmap progress for the selected mode.
- `GET /roadmaps/easy/nodes/:nodeId/challenge`: returns easy challenge only if the node is unlocked.
- `GET /roadmaps/medium/nodes/:nodeId/challenge`: returns medium challenge only if difficulty and node are unlocked.
- `GET /roadmaps/hard/nodes/:nodeId/challenge`: returns hard challenge only if difficulty and node are unlocked.
- `POST /roadmaps/*/nodes/:nodeId/challenge/submit`: validates payload server-side, marks completion only for correct submissions, and persists review data.

## 2. Course Progress Flow

Course lesson completion is stored in MongoDB collection generated from `LessonProgress` with `{ userId, lessonId, completed, quizScore }`. The unique index `{ userId, lessonId }` prevents duplicate progress rows.

Progress is restored by querying `LessonProgress` for completed lesson IDs, then deriving statuses in course order:

- completed row exists: `completed`
- first incomplete lesson after completed prefix: `available`
- remaining lessons: `locked`

Sidebar progress is restored by `ChaptersService.findByCourseId`, which computes `completedLessons`, `totalLessons`, and `percent` per chapter from persisted rows.

Missing persistence before this audit:

- no course reset endpoint existed
- lesson detail did not expose `nextLessonId` or `isNextLessonUnlocked`

Implemented:

- `POST /courses/:courseId/reset-progress`
- additive lesson detail fields: `currentLesson`, `nextLessonId`, `isNextLessonUnlocked`

## 3. Roadmap Unlock Flow

Roadmap node progression is stored in `RoadmapProgress` with `{ userId, courseSlug, mode, nodeId, completedAt, review }`.

Roadmap status is derived only from persisted completion rows and ordered backend content:

- completed prefix nodes are `completed`
- first incomplete node is `available`
- all following nodes are `locked`

This prevents skipping nodes or chapters through direct URL/Postman requests because challenge fetch and submit both check the derived node status before returning or accepting submissions.

Implemented additional difficulty gates:

- medium requires easy completion summary to be 100%
- hard requires easy completion and medium completion summary to be 100%

## 4. Difficulty Unlock Flow

Easy is available by default.

Medium unlocks only when all ordered easy nodes for the course have persisted completion records.

Hard unlocks only when easy is complete and all ordered medium nodes have persisted completion records.

The checks run server-side in the roadmap service path used by:

- roadmap list APIs
- challenge retrieval APIs
- challenge submit APIs
- AI roadmap context generation for medium/hard

## 5. Completion Calculation Flow

Course completion calculation:

- source of truth: `LessonProgress`
- total scope: published lessons for the course
- completed count: completed progress rows matching current user and course lesson IDs

Roadmap completion calculation:

- source of truth: `RoadmapProgress`
- total scope: ordered backend node IDs for the course/mode
- completed count: intersection of ordered node IDs and persisted completion rows

Only rows for known backend node IDs count toward unlocks, so extra/stale payload values do not unlock future content.

## 6. Security Risks

Resolved:

- medium/hard roadmap endpoints were accessible by URL before previous difficulty completion
- medium/hard challenge endpoints could be reached directly if a node was first in its own difficulty
- hard could remain accessible after easy reset if only medium rows were checked; hard now requires easy and medium completion

Remaining risks / unclear requirements:

- challenge timeout behavior is not persisted or validated server-side
- failed challenge attempts are not persisted
- course reset does not reset roadmap progress; this may be correct if course learning and roadmap are separate systems, but product requirements should confirm
- roadmap reset deletes review data for the selected mode because review is stored on the same completion row

## 7. Missing Business Logic

Implemented in this audit:

- course progress reset
- next lesson navigation metadata
- medium/hard difficulty unlock guards
- completion summary helper that counts persisted rows against backend-owned ordered node IDs

Still missing / needs product decision:

- explicit timeout contract for roadmap challenges
- attempt history for failed roadmap submissions
- whether roadmap reset should cascade to higher difficulties
- whether course reset should also reset roadmap progress for the same course
- whether AI review should survive reset as archived history instead of being deleted with completion progress

## 8. File-by-file Findings

- `src/modules/courses/courses.controller.ts`: added authenticated reset endpoint.
- `src/modules/courses/courses.service.ts`: added reset logic that deletes `LessonProgress` rows scoped to current user and course lessons.
- `src/modules/courses/courses.module.ts`: registered `Lesson` and `LessonProgress` models for reset logic.
- `src/modules/lessons/lessons.service.ts`: added safe navigation metadata to lesson detail response.
- `src/modules/chapters/chapters.service.ts`: already restores sidebar progress from `LessonProgress`.
- `src/modules/quizzes/quizzes.service.ts`: already persists completion only after passing quiz.
- `src/modules/roadmap/services/roadmap-status.service.ts`: added completion summary from persisted roadmap rows.
- `src/modules/roadmap/services/advanced-roadmap-base.service.ts`: added medium/hard difficulty guards.
- `src/modules/roadmap/services/roadmap-review.service.ts`: review persistence exists through `RoadmapProgress.review`.
- `src/modules/roadmap/services/roadmap-ai-context.service.ts`: retrieval already includes review for completed nodes; medium/hard now inherit difficulty guards through node context.

## 9. Recommended Fix Plan

Completed now:

- Add course reset endpoint.
- Add lesson navigation metadata.
- Enforce difficulty unlocks server-side.
- Keep all unlock/progression derivation based on persisted DB records.

Recommended next:

- Define roadmap timeout rules before implementing timeout persistence.
- Add failed attempt schema or extend `RoadmapProgress` only after product decides whether failures affect unlocks.
- Decide reset cascade behavior across course, roadmap, and AI reviews.
- Add integration tests for refresh/relogin behavior using persisted `LessonProgress` and `RoadmapProgress` rows.
