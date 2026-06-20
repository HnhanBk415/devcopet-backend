# Prompt For Antigravity: Replace Mock Arena With Backend Realtime

You are a senior React frontend engineer working in the Vite + React + TanStack Router frontend repo:

```txt
D:\NEW_DEVCOPET\devcopet_fe
```

Implement the real Arena integration using the existing NestJS backend. Do not rewrite unrelated app areas. Keep the current visual style and component structure as much as possible, but remove mock Arena behavior.

## Current FE Context

The frontend already has an Arena feature under:

```txt
src/features/arena/
```

Important existing files:

```txt
src/features/arena/store/arena.store.ts
src/features/arena/hooks/useArena.ts
src/features/arena/pages/MatchmakingPage.tsx
src/features/arena/pages/BattlePage.tsx
src/features/arena/pages/ArenaRankingPage.tsx
src/features/arena/pages/ArenaHistoryPage.tsx
src/features/arena/components/ArenaSidebar.tsx
src/features/arena/components/ArenaLayout.tsx
src/features/arena/components/battle/*
src/services/socket.service.ts
src/services/axiosClient.ts
src/features/users/store/auth.store.ts
```

Routes already exist:

```txt
/dashboard              -> MatchmakingPage
/dashboard/active       -> BattlePage
/dashboard/history      -> ArenaHistoryPage
/dashboard/rankings     -> ArenaRankingPage
```

Current mock issues to fix:

- `MatchmakingPage` calls mock/nonexistent `GET /users/match`.
- `BattlePage` uses hardcoded JS question/options and `sessionStorage.currentOpponent`.
- `ArenaRankingPage` uses `mockRankings`.
- `ArenaHistoryPage` uses `mockHistory`.
- `VictoryView` posts to nonexistent/mock `POST /users/battle/submit`.
- `socket.service.ts` currently defaults to `http://localhost:5173`, but backend runs on `http://localhost:3000`.
- `socket.service.ts` sends `auth.token` as `Bearer <token>`, but backend socket auth expects raw token in `auth.token`.
- Existing arena store expects old mock payloads like countdown number, `winnerId`, `index`, score record, `id`; backend uses object payloads and `userId`.

## Backend Contract

REST base URL is already configured in:

```txt
src/services/axiosClient.ts
```

It uses:

```ts
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
```

Use this same backend origin for Socket.IO. Socket namespace:

```txt
${API_URL}/arena
```

Recommended env:

```txt
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000/arena
```

Socket connect:

```ts
io(import.meta.env.VITE_WS_URL || `${API_URL}/arena`, {
  auth: { token: accessToken }, // raw token, no "Bearer "
  transports: ["websocket"],
  autoConnect: true,
  reconnection: true,
});
```

Never send `userId`, score, streak, correctness, or remaining time to backend. Backend owns match state and scoring.

## REST Endpoints

Use existing `api` from:

```txt
src/services/axiosClient.ts
```

Endpoints:

```txt
GET /arena/me
GET /arena/history?limit=20
GET /arena/leaderboard?limit=50
```

`GET /arena/me` returns arena profile:

```ts
{
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  arenaRating: number;
  arenaRank: "Beginner" | "Fresher" | "Senior" | "Expert";
  arenaTotalMatches: number;
  arenaWins: number;
  arenaLosses: number;
  arenaDraws: number;
  winRate: number;
  matchesInCurrentRank: number;
  winsInCurrentRank: number;
  lossesInCurrentRank: number;
  lastArenaPlayedAt?: string;
}
```

`GET /arena/leaderboard` returns:

```ts
{
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  arenaRating: number;
  arenaRank: string;
  arenaTotalMatches: number;
  arenaWins: number;
  arenaLosses: number;
  arenaDraws: number;
}[]
```

`GET /arena/history` returns persisted match documents. Use `players`, `finalScoreboard`, `winnerUserId`, `resultType`, `status`, `finishedAt` to render.

## Socket Events

Client -> Server:

```ts
socket.emit("arena:find_match", {
  courseSlug: "python-basic",
  mode: "ranked", // "ranked" | "casual" | "practice"
});

socket.emit("arena:cancel_find_match", {});

socket.emit("arena:submit_answer", {
  roomId,
  questionId,
  answer: { optionId: "A" }
});

socket.emit("arena:submit_answer", {
  roomId,
  questionId,
  answer: {
    dropZoneMap: {
      step_1: "A",
      step_2: "B"
    }
  }
});

socket.emit("arena:leave_room", { roomId });
```

Server -> Client:

```ts
"arena:waiting"
{
  status: "waiting" | "cancelled";
  waitingSeconds: number;
  estimatedBotFallbackSeconds: number;
}

"arena:match_found"
{
  roomId: string;
  mode: string;
  courseSlug: string;
  matchTier: "Beginner" | "Fresher" | "Senior" | "Expert";
  players: PublicArenaPlayer[];
}

"arena:countdown"
{
  roomId: string;
  value: 3 | 2 | 1 | "GO";
}

"arena:question"
{
  roomId: string;
  questionIndex: number;
  totalQuestions: 5;
  question: PublicArenaQuestion;
  timeLimitSeconds: number;
  serverTime: string;
}

"arena:answer_result"
{
  roomId: string;
  questionId: string;
  isCorrect: boolean;
  earnedScore: number;
  correctAnswer?: { optionId?: string; dropZoneMap?: Record<string, string> };
  explanation?: string;
  totalScore: number;
  streak: number;
}

"arena:opponent_answered"
{
  roomId: string;
  userId: string;
  answered: true;
}

"arena:score_update"
{
  roomId: string;
  scoreboard: PublicScoreboardItem[];
}

"arena:question_finished"
{
  roomId: string;
  questionId: string;
  correctAnswer: { optionId?: string; dropZoneMap?: Record<string, string> };
  explanation: string;
  scoreboard: PublicScoreboardItem[];
}

"arena:match_finished"
{
  roomId: string;
  result: "win" | "lose" | "draw";
  winnerUserId?: string;
  finalScoreboard: PublicScoreboardItem[];
  ratingChanges: RatingChange[];
  rewards?: unknown;
  rankUp?: RankUpPayload[];
}

"arena:error"
{
  message: string;
  code?: string;
}
```

Types:

```ts
type ArenaRank = "Beginner" | "Fresher" | "Senior" | "Expert";
type ArenaMode = "ranked" | "casual" | "practice";
type ArenaDifficulty = "easy" | "medium" | "hard";

interface PublicArenaPlayer {
  userId: string;
  username: string;
  avatarUrl?: string;
  isBot: boolean;
  arenaRank: ArenaRank;
  arenaRating: number;
}

interface PublicArenaQuestion {
  id: string;
  type: "multiple_choice" | "drag_drop";
  title: string;
  question: string;
  codeSnippet?: { language: string; code: string } | null;
  template?: string;
  options?: { id: string; text: string }[];
  poolItems?: { id: string; text: string }[];
  dropZones?: { id: string; label: string }[];
  difficulty: ArenaDifficulty;
  timeLimitSeconds: number;
  chapterOrder: number;
  conceptTags: string[];
}

interface PublicScoreboardItem {
  userId: string;
  username: string;
  isBot: boolean;
  score: number;
  streak: number;
  correctCount: number;
  wrongCount: number;
  timeoutCount: number;
  disconnected?: boolean;
}

interface RatingChange {
  userId: string;
  oldRating: number;
  newRating: number;
  delta: number;
  oldRank: ArenaRank;
  newRank: ArenaRank;
}

interface RankUpPayload {
  userId: string;
  oldRank: ArenaRank;
  newRank: ArenaRank;
}
```

## Implementation Tasks

### 1. Socket Service

Update or create an Arena-specific socket service. Prefer not to break other socket usage.

Requirements:

- Connect to `/arena` namespace.
- Use raw `accessToken` in `auth.token`.
- Default URL should be `VITE_WS_URL || (VITE_API_URL || "http://localhost:3000") + "/arena"`.
- Provide `connect`, `disconnect`, `emit`, `on`, `off`.
- Cleanup listeners on unmount/logout.
- Do not prepend `Bearer` inside `auth.token`.

### 2. Arena Store Or Hook

Refactor `src/features/arena/store/arena.store.ts` or replace `useArena.ts` with one source of truth.

Store should track:

```ts
status:
  | "idle"
  | "searching"
  | "found"
  | "countdown"
  | "playing"
  | "question_result"
  | "finished"
  | "error";

roomId;
mode;
courseSlug;
matchTier;
players;
waitingSeconds;
estimatedBotFallbackSeconds;
countdownValue;
currentQuestion;
questionIndex;
totalQuestions;
timeLimitSeconds;
serverTime;
selectedAnswer;
answerResult;
questionFinished;
scoreboard;
matchResult;
errorMessage;
```

Actions:

```ts
connectArenaSocket()
findMatch({ courseSlug, mode })
cancelFindMatch()
submitMultipleChoice(optionId)
submitDragDrop(dropZoneMap)
leaveRoom()
resetArena()
```

Map backend payloads exactly:

- `arena:countdown` receives object `{ roomId, value }`, not a raw number.
- `arena:question` uses `questionIndex`, not `index`.
- `arena:score_update` uses `{ scoreboard }`, not a score record.
- players use `userId`, not `id`.
- `arena:match_finished` uses `winnerUserId`, not `winnerId`.
- cancel event is `arena:cancel_find_match`, not `arena:cancel_match`.

### 3. MatchmakingPage

Replace mock `GET /users/match`.

UI behavior:

- Default `courseSlug = "python-basic"`.
- Let user choose `mode`: ranked / casual / practice.
- On Find Match, call store `findMatch({ courseSlug, mode })`.
- Show waiting status from `arena:waiting`: waiting seconds and bot fallback countdown.
- On `arena:match_found`, show both players and match tier.
- Backend starts countdown automatically. There is no ready event. Either:
  - navigate to `/dashboard/active` immediately on match found, or
  - show match found briefly and navigate when countdown starts.
- Cancel button emits `arena:cancel_find_match`.

### 4. BattlePage

Remove hardcoded JS question/options and `sessionStorage.currentOpponent`.

Render from Arena store:

- Top player cards from `players` and `scoreboard`.
- Timer from `serverTime + timeLimitSeconds`; display only. Do not submit remaining time.
- Show countdown overlay for 3, 2, 1, GO.
- Render `currentQuestion.title`, `question`, `difficulty`, `conceptTags`, `codeSnippet`.
- For `multiple_choice`, render `question.options`.
- On option click, emit `arena:submit_answer` with `{ optionId }`.
- Disable answer controls after submit until next question.
- Show `arena:answer_result` privately: correctness, earnedScore, totalScore, streak, explanation.
- Show `arena:question_finished` to reveal correct answer/explanation for everyone.
- Show `arena:match_finished` final scoreboard, result, rating changes, rank-up.

### 5. Drag Drop

Backend now sends:

```ts
poolItems: { id, text }[]
dropZones: { id, label }[]
```

Implement a simple drag-drop or click-to-assign UI:

- Render `poolItems`.
- Render `dropZones`.
- Build `dropZoneMap: Record<zoneId, itemId>`.
- Submit with:

```ts
answer: { dropZoneMap }
```

Keep it accessible enough: allow selecting an item then clicking a zone if native drag/drop is too much.

### 6. Ranking Page

Replace `mockRankings` with:

```ts
api.get("/arena/leaderboard?limit=50")
```

Render:

- rank
- username
- avatarUrl fallback
- arenaRank
- arenaRating
- arenaWins / arenaTotalMatches
- computed win rate if needed

### 7. History Page

Replace `mockHistory` with:

```ts
api.get("/arena/history?limit=20")
```

Render each match:

- result from current user's perspective using `winnerUserId`, status/resultType.
- opponent from `players` where `userId !== currentUser.id`; if bot, show bot name.
- score from `finalScoreboard`.
- finishedAt date.
- rating delta from `players` item for current user if present, or from REST data if available.

### 8. Sidebar

Fetch `/arena/me` and show real:

- `arenaRank`
- `arenaRating`
- total matches
- win rate

Quick Match should call `findMatch({ courseSlug: "python-basic", mode: "ranked" })` and navigate to dashboard if needed.

### 9. VictoryView

Remove `POST /users/battle/submit`.

Use backend `arena:match_finished` result instead:

- result: win / lose / draw
- finalScoreboard
- ratingChanges
- rankUp

Do not award XP client-side.

## Acceptance Criteria

- `npm run build` passes.
- No mock `/users/match`.
- No mock `/users/battle/submit`.
- Arena Socket.IO connects to backend `/arena` namespace.
- Find match works with payload `{ courseSlug: "python-basic", mode: "ranked" }`.
- Practice mode creates bot match quickly.
- Multiple choice questions can be answered.
- Drag-drop questions can be answered using `dropZones` and `poolItems`.
- Scoreboard updates only from backend events.
- Match finished screen shows final result/rating changes.
- Ranking page uses `/arena/leaderboard`.
- History page uses `/arena/history`.
- Sidebar/profile Arena stats use `/arena/me`.
- Do not send `userId`, score, streak, correctness, or remaining time from client.

## Backend Setup Reminder

Before testing Arena, backend must have arena questions seeded:

```bash
cd D:\NEW_DEVCOPET\devcopet_be
npm run seed
```

Backend dev server:

```bash
cd D:\NEW_DEVCOPET\devcopet_be
npm run start:dev
```

Frontend dev server:

```bash
cd D:\NEW_DEVCOPET\devcopet_fe
npm run dev
```
