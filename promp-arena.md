You are a senior NestJS backend engineer. I need you to implement a production-ready Arena Realtime module for my existing NestJS + MongoDB/Mongoose backend.

Read the current backend source carefully first. Do not rewrite unrelated modules. Follow the existing project style, folder structure, naming style, DTO validation style, Mongoose schema style, JWT auth pattern, and service/controller/gateway pattern.

The Arena feature must be secure, realtime, and backend-authoritative.

==================================================

1. Core Goal
   ==================================================

Implement a realtime 1v1 Arena battle system.

Arena supports:

* User vs User matchmaking
* User vs Bot fallback
* Realtime question flow through Socket.IO
* 5 questions per match
* Questions selected from a backend question bank
* Easy / Medium / Hard question difficulties
* Rank-based matchmaking
* Rank-based question mix
* Difficulty-based time limit
* Backend scoring
* Backend answer evaluation
* Backend match result persistence
* Backend rating update
* Backend reward update if reward service/progress exists
* Safe public question payload with correct answers hidden
* Bot behaves like a normal player and submits answers through the same internal flow

Very important rules:

* Frontend must never receive correct answers before submit or timeout.
* Frontend must never send remainingSeconds.
* Backend must calculate remainingSeconds from server time.
* Backend must own room state.
* Backend must decide score, winner, rating, and result.
* AI/Gemini must not be used during realtime arena match.
* Bot must be rule-based.
* The system must not trust client-submitted score, time, streak, or correctness.

==================================================
2. Arena Rank System
====================

Use these rank names, not role. Do not call this "role" because role is for authorization such as admin/user/student.

Use:

arenaRank
arenaRating
matchesInCurrentRank
winsInCurrentRank
lossesInCurrentRank

Ranks:

Beginner: 1000 - 1199
Fresher:  1200 - 1499
Senior:   1500 - 1899
Expert:   1900+

New player default:

arenaRating = 1000
arenaRank = "Beginner"
matchesInCurrentRank = 0
winsInCurrentRank = 0
lossesInCurrentRank = 0

Rank-up conditions:

Beginner -> Fresher:
arenaRating >= 1200
AND
matchesInCurrentRank >= 10

Fresher -> Senior:
arenaRating >= 1500
AND
matchesInCurrentRank >= 15

Senior -> Expert:
arenaRating >= 1900
AND
matchesInCurrentRank >= 20

When rank up:

* arenaRank becomes next rank
* matchesInCurrentRank resets to 0
* winsInCurrentRank resets to 0
* lossesInCurrentRank resets to 0

Do not reset total arena stats if they exist. Only reset current-rank counters.

Rating update after match:

Human match:

* Win: +20
* Lose: -10
* Draw: +0

Bot match:

* Win: +20
* Lose: -10
* Draw: +0

However, implement config constants so this can be changed later easily. Also add a TODO or optional config for daily bot rating cap to prevent bot farming in the future.

Do not allow arenaRating to drop below 1000 for now.

==================================================
3. Matchmaking Rules
====================

When a user emits find match:

Backend reads userId from authenticated socket.
Backend loads user arenaRank and arenaRating.
Backend puts user into waiting queue.
Backend tries to match with another waiting player.

Waiting expansion rules:

0 - 10 seconds:
same rank
AND rating difference <= 100

10 - 15 seconds:
same rank
AND rating difference <= 200

15 - 20 seconds:
rank difference <= 1
AND rating difference <= 300

20 - 30 seconds:
rank difference <= 1
AND rating difference <= 400

After 30 seconds:
create bot opponent.

Rank value mapping:

Beginner = 1
Fresher = 2
Senior = 3
Expert = 4

Do not match:

Beginner vs Senior
Beginner vs Expert
Fresher vs Expert

Allowed after expansion:

Beginner vs Fresher
Fresher vs Senior
Senior vs Expert

Important:

* A user cannot be in queue twice.
* A user cannot be in two active rooms.
* If user disconnects while waiting, remove from queue.
* If user cancels find match, remove from queue.
* If user disconnects during match, mark disconnected and finish/cancel according to room rules.
* Matchmaking must not broadcast to all users.
* Emit waiting status only to that socket.
* Emit match_found only to both players in the room.

==================================================
4. Match Tier and Question Mix
==============================

Each match has 5 questions.

Question mix depends on matchTier.

If both players have same rank:

matchTier = that rank

If players have different rank:

matchTier = lower rank

Examples:

Beginner + Fresher -> Beginner
Fresher + Senior -> Fresher
Senior + Expert -> Senior

Question mix:

Beginner:
easy: 4
medium: 1
hard: 0

Fresher:
easy: 2
medium: 2
hard: 1

Senior:
easy: 1
medium: 2
hard: 2

Expert:
easy: 0
medium: 2
hard: 3

Question selection must be controlled random, not random from the whole bank.

Selection rules:

1. Match courseSlug and isActive=true
2. Match required difficulty count
3. Prefer not to repeat recent questions if user recent history exists
4. Avoid more than 2 questions from same chapter if possible
5. Avoid too many same type if possible
6. If not enough questions:

   * first relax recent-question rule
   * then relax chapter diversity
   * then fallback to closest difficulty
   * never crash the match if there are enough active questions overall
7. Save selected question IDs into room state
8. Do not re-randomize during match
9. Both players must receive the same question order

Question order:

Sort by increasing difficulty for better learning experience:

easy -> medium -> hard

If same difficulty, shuffle inside that group.

==================================================
5. Time Limit
=============

Use difficulty-based time limit:

easy: 25 seconds
medium: 45 seconds
hard: 60 seconds

Config:

QUESTION_TIME = {
easy: 25,
medium: 45,
hard: 60,
}

Backend must send timeLimitSeconds with each question.

Backend must store:

questionStartedAt
timeLimitSeconds

When answer is submitted, backend calculates:

elapsedSeconds = floor((Date.now() - questionStartedAt) / 1000)
remainingSeconds = max(timeLimitSeconds - elapsedSeconds, 0)

If answer is submitted after timeout:

* treat as wrong or timeout
* earnedScore = 0
* reset streak
* do not accept late answer as correct

Do not trust client time.

==================================================
6. Arena Score
==============

Arena Score decides winner inside the match.

Base score:

easy: 20
medium: 40
hard: 60

Scoring formula:

If answer is correct:

nextStreak = currentStreak + 1
streakBonus = min(nextStreak * 10, 50)
earnedScore = baseScore + remainingSeconds + streakBonus

If answer is wrong:

nextStreak = 0
earnedScore = 0

Wrong answers:

* no score
* reset streak
* no negative arenaScore

Important:

* Use nextStreak in calculation, not old currentStreak.
* Cap streak bonus at 50.
* Store per-question earnedScore.
* Store total arenaScore per player.
* Store correctCount, wrongCount, timeoutCount, totalAnswerTimeMs.

Winner after 5 questions:

1. Higher arenaScore wins
2. If tied, higher correctCount wins
3. If still tied, lower avgAnswerTimeMs wins
4. If still tied, result is draw

avgAnswerTimeMs = totalAnswerTimeMs / answeredQuestionCount

Do not count unanswered timeout as normal answer time unless you intentionally record it as full time. Be consistent.

==================================================
7. Question Bank
================

Create ArenaQuestion schema and service if not existing.

Suggested schema:

ArenaQuestion {
courseSlug: string;
difficulty: "easy" | "medium" | "hard";
chapterOrder: number;
chapterTitle?: string;
lessonSlug?: string;
lessonTitle?: string;

title: string;
question: string;
type: "multiple_choice" | "drag_drop";

codeSnippet?: {
language: string;
code: string;
} | null;

template?: string;

options?: {
id: string;
text: string;
}[];

correctOptionId?: string;

poolItems?: {
id: string;
text: string;
}[];

correctDropZoneMap?: Record<string, string>;

explanation: string;

conceptTags: string[];
estimatedSeconds?: number;
baseScore?: number;

isActive: boolean;
}

Indexes:

* courseSlug + difficulty + isActive
* courseSlug + chapterOrder
* conceptTags
* type
* createdAt if timestamps enabled

Question types:

multiple_choice:

* FE sends optionId
* BE compares with correctOptionId

drag_drop:

* FE sends dropZoneMap
* BE compares with correctDropZoneMap

drag_drop should support:

* fill blank
* arrange order
* ranking
* matching

Do not send correctOptionId, correctDropZoneMap, explanation before submit/timeout.

Public question payload may include only:

id
type
title
question
codeSnippet
template
options
poolItems
difficulty
timeLimitSeconds
chapterOrder
conceptTags if useful

Do not use blacklist sanitization.
Use whitelist sanitization.

==================================================
8. WebSocket Authentication
===========================

Arena socket must be authenticated.

Use JWT access token from socket handshake:

Option A:
client sends auth.token

Option B:
client sends Authorization header

Backend verifies JWT using the same JWT_ACCESS_SECRET as JwtStrategy.

On successful connection:

client.data.user = {
userId,
email,
}

If token invalid:
disconnect or emit auth error and disconnect.

Never trust userId sent in event payload.

Use client.data.user.userId only.

==================================================
9. Socket Events
================

Client -> Server:

arena:find_match
payload:
{
courseSlug: string;
mode?: "ranked" | "casual" | "practice";
}

arena:cancel_find_match
payload:
{}

arena:submit_answer
payload:
{
roomId: string;
questionId: string;
answer: {
optionId?: string;
dropZoneMap?: Record<string, string>;
}
}

arena:leave_room
payload:
{
roomId: string;
}

Server -> Client:

arena:waiting
payload:
{
status: "waiting";
waitingSeconds: number;
estimatedBotFallbackSeconds: number;
}

arena:match_found
payload:
{
roomId: string;
mode: string;
courseSlug: string;
matchTier: ArenaRank;
players: PublicArenaPlayer[];
}

arena:countdown
payload:
{
roomId: string;
value: 3 | 2 | 1 | "GO";
}

arena:question
payload:
{
roomId: string;
questionIndex: number;
totalQuestions: 5;
question: PublicArenaQuestion;
timeLimitSeconds: number;
serverTime: string;
}

arena:answer_result
emit privately to the answering user:
{
roomId: string;
questionId: string;
isCorrect: boolean;
earnedScore: number;
correctAnswer?: any;
explanation?: string;
totalScore: number;
streak: number;
}

arena:opponent_answered
emit to opponent or room:
{
roomId: string;
userId: string;
answered: true;
}

arena:score_update
emit to room:
{
roomId: string;
scoreboard: PublicScoreboardItem[];
}

arena:question_finished
emit to room:
{
roomId: string;
questionId: string;
correctAnswer: any;
explanation: string;
scoreboard: PublicScoreboardItem[];
}

arena:match_finished
emit to room:
{
roomId: string;
result: "win" | "lose" | "draw";
winnerUserId?: string;
finalScoreboard: PublicScoreboardItem[];
ratingChanges: RatingChange[];
rewards?: any;
rankUp?: {
userId: string;
oldRank: ArenaRank;
newRank: ArenaRank;
}[];
}

arena:error
payload:
{
message: string;
code?: string;
}

Important:

* Use room emit only for room events.
* Use private emit for answer_result if it includes correctness before question_finished.
* Do not reveal explanation to opponent before they submit or before timeout unless the question is finished.

==================================================
10. Room State
==============

Implement in-memory room state for active matches.

ArenaRoom {
roomId: string;
courseSlug: string;
mode: "ranked" | "casual" | "practice";
status: "waiting" | "countdown" | "playing" | "finished" | "cancelled";

matchTier: ArenaRank;

players: ArenaRuntimePlayer[];

questions: ArenaRuntimeQuestion[];
currentQuestionIndex: number;

questionStartedAt?: number;
questionTimeLimitSeconds?: number;

submittedAnswers: Record<questionId, Record<userId, ArenaSubmittedAnswer>>;

timers: {
countdownTimer?: NodeJS.Timeout;
questionTimer?: NodeJS.Timeout;
botTimer?: NodeJS.Timeout;
};

createdAt: number;
startedAt?: number;
finishedAt?: number;
}

ArenaRuntimePlayer {
userId: string;
socketId?: string;
username: string;
avatarUrl?: string;

isBot: boolean;
botDifficulty?: "easy" | "medium" | "hard" | "elite";

arenaRank: ArenaRank;
arenaRating: number;

score: number;
streak: number;
correctCount: number;
wrongCount: number;
timeoutCount: number;
totalAnswerTimeMs: number;
answeredCurrentQuestion: boolean;
disconnected?: boolean;
}

Clean up:

* Clear timers when room ends.
* Remove room from active map after persistence.
* Remove user from activeRoom map.
* Remove socket from queue on disconnect.

==================================================
11. Bot Logic
=============

Bot enters after user waits more than 30 seconds, or if mode is practice.

Bot difficulty follows user rank:

Beginner -> easy bot
Fresher -> medium bot
Senior -> hard bot
Expert -> elite bot

Bot accuracy:

easy: 45%
medium: 65%
hard: 80%
elite: 90%

Bot answer delay:

easy: 8-15 seconds
medium: 5-10 seconds
hard: 2-7 seconds
elite: 1-5 seconds

Bot must not answer after question timeout.

Bot answer generation:

* Use correct answer with probability = accuracy
* Otherwise choose a valid wrong answer
* For multiple_choice, choose wrong optionId
* For drag_drop, generate wrong dropZoneMap by shuffling items or swapping at least one mapping

Bot answer must go through the same scoring/evaluation pipeline as a normal player.

Do not use AI for bot.

==================================================
12. Persistence
===============

Create ArenaMatch schema.

ArenaMatch {
roomId: string;
courseSlug: string;
mode: "ranked" | "casual" | "practice";
matchTier: ArenaRank;

players: [
{
userId?: ObjectId;
username: string;
isBot: boolean;
botDifficulty?: string;
arenaRank: string;
ratingBefore: number;
ratingAfter: number;
ratingDelta: number;
score: number;
correctCount: number;
wrongCount: number;
timeoutCount: number;
avgAnswerTimeMs: number;
}
];

questionResults: [
{
questionId: ObjectId;
difficulty: string;
type: string;
correctAnswer: any;
answers: [
{
userId?: ObjectId;
isBot: boolean;
answer: any;
isCorrect: boolean;
earnedScore: number;
answerTimeMs: number;
remainingSeconds: number;
}
];
}
];

finalScoreboard: any[];

winnerUserId?: ObjectId;
resultType: "win" | "draw" | "cancelled" | "disconnected";
status: "completed" | "cancelled" | "disconnected";

startedAt: Date;
finishedAt: Date;
}

Indexes:

* roomId unique
* players.userId
* courseSlug + createdAt
* winnerUserId
* status

Persist every completed match.

For cancelled or disconnected matches, persist with proper status if match had already started.

==================================================
13. User Schema Updates
=======================

Add arena fields to User schema if not existing:

arenaRating: number default 1000
arenaRank: "Beginner" | "Fresher" | "Senior" | "Expert" default "Beginner"

arenaTotalMatches: number default 0
arenaWins: number default 0
arenaLosses: number default 0
arenaDraws: number default 0

matchesInCurrentRank: number default 0
winsInCurrentRank: number default 0
lossesInCurrentRank: number default 0

Optional:
recentArenaQuestionIds: ObjectId[] default []
lastArenaPlayedAt?: Date

Update these after match.

Use atomic update where possible.

==================================================
14. Rating and Rank Update
==========================

At match finish:

For each non-bot player:

* Calculate rating delta
* Update rating
* Update total stats
* Update current-rank stats
* Check rank-up
* Save oldRank and newRank if rank changes

Do not update rating for cancelled match.

Do not update rating twice if room finish is triggered multiple times.

Use an idempotency guard:

room.status must transition to finished once.

==================================================
15. Module Structure
====================

Create:

src/modules/arena/
arena.module.ts
arena.gateway.ts

constants/
arena.constants.ts

dto/
find-match.dto.ts
submit-answer.dto.ts

schemas/
arena-question.schema.ts
arena-match.schema.ts

types/
arena.types.ts

services/
arena-auth.service.ts
arena-matchmaking.service.ts
arena-room.service.ts
arena-question.service.ts
arena-question-evaluator.service.ts
arena-score.service.ts
arena-bot.service.ts
arena-result.service.ts
arena-rating.service.ts

Service responsibilities:

ArenaGateway:

* handles socket events only
* delegates logic to services
* never implements heavy business logic directly

ArenaAuthService:

* validates socket JWT
* attaches user to socket

ArenaMatchmakingService:

* waiting queue
* canMatch
* bot fallback
* cancel queue
* remove disconnected users

ArenaRoomService:

* creates room
* manages active room state
* starts countdown
* starts question
* handles submit
* detects when question is finished
* finishes match
* clears timers

ArenaQuestionService:

* selects questions from DB
* controlled random
* sanitizes question payload using whitelist

ArenaQuestionEvaluatorService:

* evaluates multiple_choice
* evaluates drag_drop
* returns correct answer payload safely

ArenaScoreService:

* calculates question score
* calculates winner and tie-break

ArenaBotService:

* creates bot player
* schedules bot answer
* generates correct/wrong answer

ArenaResultService:

* persists ArenaMatch
* optionally updates leaderboard/rewards/notifications

ArenaRatingService:

* updates arenaRating
* checks rank-up
* updates user arena stats

==================================================
16. Error Handling
==================

Handle these cases:

* unauthenticated socket
* duplicate find_match
* user already in active room
* invalid courseSlug
* not enough active arena questions
* invalid roomId
* invalid questionId
* user not in room
* user already answered current question
* answer after timeout
* invalid answer shape
* disconnected player
* bot timer after room finished
* room finish called twice

Do not throw unhandled exceptions inside gateway.
Emit arena:error to affected socket.
Log server-side errors.

==================================================
17. Security Requirements
=========================

* Never send correct answer before submit/timeout.
* Never accept userId from payload.
* Never accept score/time/streak from payload.
* Validate DTOs.
* Validate ObjectId.
* Use whitelist public question payload.
* Do not store secrets in response.
* Do not expose internal room state directly.
* Do not broadcast matchmaking queue details globally.
* Rate limit or guard spam find_match / submit_answer if possible.
* Prevent double submit.

==================================================
18. Testing Requirements
========================

Add unit tests or at least isolated service tests for:

1. rank calculation:

* 1000 -> Beginner
* 1200 -> Fresher
* 1500 -> Senior
* 1900 -> Expert

2. rank-up conditions:

* Beginner cannot rank up before 10 matches even if rating >= 1200
* Beginner ranks up when rating >= 1200 and matchesInCurrentRank >= 10
* Fresher needs 15 matches
* Senior needs 20 matches

3. matchmaking:

* same rank diff 100 can match under 10s
* same rank diff 200 cannot match under 10s but can after 10s
* rank diff 2 cannot match
* rank diff 1 and diff <= 400 can match after 20s

4. question mix:

* Beginner returns 4 easy + 1 medium
* Fresher returns 2 easy + 2 medium + 1 hard
* Senior returns 1 easy + 2 medium + 2 hard
* Expert returns 0 easy + 2 medium + 3 hard

5. score:

* correct easy with 15s and next streak 2 = 20 + 15 + 20 = 55
* wrong returns 0 and resets streak
* streak bonus capped at 50

6. winner:

* higher score wins
* tie score uses correctCount
* tie correctCount uses avgAnswerTimeMs
* total tie returns draw

7. evaluator:

* multiple_choice correct/wrong
* drag_drop exact match
* drag_drop wrong when one mapping differs

==================================================
19. Expected Deliverable
========================

Implement the module and update existing app module imports.

After implementation, explain:

* files created
* files modified
* socket events implemented
* schemas added
* how to seed question bank
* how FE should call socket events
* any remaining TODOs

Do not change unrelated features unless required for Arena integration.

Prioritize correctness, security, and clean architecture over shortcuts.
