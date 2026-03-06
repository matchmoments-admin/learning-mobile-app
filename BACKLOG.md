# Lumora Feature Backlog

Derived from comparing the `MultiSubjectLearningPlatform_Blueprint.docx` against the current codebase (March 2026).

## Current Strengths (already exceeds blueprint)

These features exist in the codebase and go **beyond** what the blueprint specifies:

- **AES encryption** for secure local storage (`aes-js`, `expo-secure-store`)
- **Accessibility system** (`AccessibilityContext` — font scaling, contrast, reduced motion)
- **AI conversation scenarios** with dynamic generation (`scenario-generate` edge function)
- **Voice recording & transcription** (`expo-av` + `transcribe-audio` edge function)
- **Vocabulary flashcards** (`Flashcard.tsx`, `VocabularyIntroScreen.tsx`)
- **Sentence breakdown** (`SentenceBreakdownCard.tsx` — word-level analysis)
- **Content pack architecture** (multi-language ready, extensible JSON format)
- **Offline-first dual-write** (AsyncStorage + Supabase sync)
- **Trial/subscription access control** (`access-service.ts`, `start-trial` edge function)

---

## Phase 1 — High Impact: Engagement Loop

**Goal:** Add the core motivation mechanics that keep learners coming back daily.

### 1.1 XP System
- **What:** Award experience points for lesson completions, conversation practice, and daily logins. Display XP on profile and after lessons.
- **Why:** XP is the universal progress currency in the blueprint. It drives all other engagement features (streaks, levels, leaderboards).
- **Blueprint ref:** Section 3.2 (Gamification), Section 4.1 (Reward System)
- **Files to create/modify:**
  - `lib/services/xp-service.ts` — new service: award, query, and persist XP
  - `lib/types/xp.ts` — XP event types, level thresholds
  - `components/lesson/LessonCompleteScreen.tsx` — show XP earned
  - `app/(tabs)/profile.tsx` — display total XP and level
  - `supabase/migrations/` — new migration for `user_xp` table

### 1.2 Streak Tracking
- **What:** Track consecutive days of learning activity. Show current streak prominently. Streak freeze as a future premium feature.
- **Why:** Streaks are the single highest-impact retention mechanic in language learning apps.
- **Blueprint ref:** Section 3.2 (Gamification — Streaks)
- **Files to create/modify:**
  - `lib/services/streak-service.ts` — new service: check-in, calculate streak, detect breaks
  - `components/ui/StreakBadge.tsx` — flame icon + count display
  - `app/(tabs)/profile.tsx` — show streak
  - `supabase/migrations/` — new migration for `user_streaks` table

### 1.3 Daily Goals
- **What:** Let users set a daily learning goal (e.g., 1 lesson, 3 lessons, 10 minutes). Track progress toward the goal each day.
- **Why:** Goals give structure to open-ended practice. Combined with streaks, they define "what counts" as a day of learning.
- **Blueprint ref:** Section 3.3 (Daily Goals)
- **Files to create/modify:**
  - `lib/services/daily-goal-service.ts` — new service: set goal, track progress, check completion
  - `lib/storage/settings.ts` or new `lib/storage/goals.ts` — persist goal preference
  - `components/ui/DailyGoalRing.tsx` — circular progress indicator
  - `app/(tabs)/profile.tsx` or future home tab — display goal progress

### 1.4 Lesson Scoring
- **What:** Score each lesson attempt based on accuracy, speed, and retry count. Display score on completion and in lesson history.
- **Why:** Scoring adds weight to each attempt and feeds into the mastery system (Phase 3).
- **Blueprint ref:** Section 4.2 (Scoring), Section 5.1 (Progress Tracking)
- **Files to create/modify:**
  - `lib/services/scoring-service.ts` — new service: calculate score from attempt data
  - `lib/types/scoring.ts` — score breakdown types
  - `components/lesson/LessonCompleteScreen.tsx` — show score breakdown
  - `lib/services/progress-service.ts` — store score per attempt

---

## Phase 2 — Medium Impact: Home Dashboard

**Goal:** Replace the current lessons-as-home experience with a dedicated dashboard tab.

### 2.1 Home Tab
- **What:** A new tab showing: daily goal progress, current streak, XP summary, "continue learning" shortcut, and recommended next activity.
- **Why:** The blueprint specifies a home screen as the primary entry point. Currently the app opens to the lessons tab. A dashboard surfaces engagement data and guides the learner.
- **Blueprint ref:** Section 2.1 (Home Screen), Section 2.2 (Dashboard)
- **Files to create/modify:**
  - `app/(tabs)/home.tsx` — new tab screen
  - `app/(tabs)/_layout.tsx` — add home tab to tab navigator (reorder: home, lessons, conversations, profile)
  - `components/home/` — new directory for dashboard widgets (StreakWidget, GoalWidget, ContinueLearning, XPSummary)
- **Depends on:** Phase 1 (XP, streaks, daily goals)

---

## Phase 3 — Medium Impact: Score & Mastery System

**Goal:** Track per-item mastery so the app can adapt difficulty and recommend reviews.

### 3.1 Mastery Tracking
- **What:** Track mastery level per vocabulary term and per lesson. Mastery increases with correct answers and decays over time (spaced repetition concept).
- **Why:** The blueprint defines a mastery model that feeds into adaptive difficulty. Currently progress tracks completion count but not per-item performance.
- **Blueprint ref:** Section 5.2 (Mastery System), Section 5.3 (Adaptive Learning)
- **Files to create/modify:**
  - `lib/services/mastery-service.ts` — new service: update mastery per term, calculate decay, recommend reviews
  - `lib/types/mastery.ts` — mastery level types, thresholds
  - `lib/services/progress-service.ts` — integrate mastery updates on lesson completion
  - `supabase/migrations/` — new migration for `term_mastery` table

### 3.2 Review Recommendations
- **What:** Surface terms/lessons that are due for review based on mastery decay. Show on home dashboard (Phase 2) and optionally as a "Review" quick action.
- **Why:** Without spaced review, retention drops. This closes the loop between scoring and re-engagement.
- **Blueprint ref:** Section 5.3 (Adaptive Learning — Review Scheduling)
- **Files to create/modify:**
  - `lib/services/mastery-service.ts` — add review scheduling logic
  - `components/home/ReviewWidget.tsx` — new widget for home dashboard
- **Depends on:** Phase 2 (Home Tab), Phase 3.1 (Mastery Tracking)

---

## Phase 4 — Lower Priority: Additional Question Types

**Goal:** Expand the question type repertoire beyond the current three types.

### 4.1 Fill-in-the-Blank
- **What:** Present a sentence with a missing word. Learner types or selects the correct word.
- **Why:** Tests recall rather than recognition. The blueprint lists this as a core question type.
- **Blueprint ref:** Section 4.3 (Question Types — Fill in Blank)
- **Files to create/modify:**
  - `constants/ContentTypes.ts` — add `FillInBlankQuestion` to the `Question` union
  - `components/lesson/FillInBlankMode.tsx` — new question mode component
  - `components/lesson/LessonContent.tsx` — add case for `"fill_in_blank"` type
  - Content packs — author fill-in-blank questions in JSON

### 4.2 Matching Pairs
- **What:** Present two columns (e.g., native script and translation). Learner matches pairs by tapping.
- **Why:** Good for vocabulary drilling. Blueprint includes it as an interactive question type.
- **Blueprint ref:** Section 4.3 (Question Types — Matching)
- **Files to create/modify:**
  - `constants/ContentTypes.ts` — add `MatchingQuestion` to the `Question` union
  - `components/lesson/MatchingMode.tsx` — new question mode component with drag/tap matching UI
  - `components/lesson/LessonContent.tsx` — add case for `"matching"` type
  - Content packs — author matching questions in JSON

---

## V2/V3 — Future Considerations

These are larger architectural changes or features for later versions:

| Item | Description | Notes |
|------|-------------|-------|
| **Zustand migration** | Replace React Context state with Zustand for simpler, more performant global state | Reduces re-render cascading, better DevTools support |
| **TanStack Query** | Add for server state management (Supabase queries) | Automatic caching, background refetching, optimistic updates |
| **FSRS algorithm** | Implement Free Spaced Repetition Scheduler for mastery decay | More scientifically grounded than simple time decay |
| **Leaderboards** | Weekly/monthly XP leaderboards (friends or global) | Requires Supabase real-time or periodic aggregation |
| **Achievements** | Badge system for milestones (first lesson, 7-day streak, 100 terms mastered) | Builds on XP + mastery data |
| **Offline sync queue** | Robust offline queue with conflict resolution | Current dual-write works but lacks retry/conflict handling |
| **Community content** | Allow users to submit content packs for review | Leverages existing `ContentReviewStatus` types in `ContentTypes.ts` |
| **Additional languages** | Author content packs for Spanish (es) and Hindi (hi) | Language configs already defined in `Languages.ts` |
| **Admin panel** | Web-based content authoring and review tool | `UserRole` and `ContentSourceType` types already in `ContentTypes.ts` |

---

## How to Use This Backlog

1. **Pick a phase** — phases are roughly ordered by impact and dependency
2. **Read the "Files to modify" section** — gives you the starting point for each feature
3. **Check dependencies** — some items depend on earlier phases being complete
4. **Create a branch** — one branch per feature item (e.g., `feature/xp-system`)
5. **Reference CLAUDE.md** — for project structure and architecture context
