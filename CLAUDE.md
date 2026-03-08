# Lumora — Claude Code Project Guide

## What is Lumora?

A multi-language education platform built with Expo React Native. Originally a Mandarin-only app, now fully migrated to a generic type system supporting any language. Currently ships Mandarin Chinese (zh-CN) content with Spanish (es) and Hindi (hi) language configs defined but awaiting content packs.

## Tech Stack

- **Framework:** Expo SDK 54, React 19.1, React Native 0.81
- **Navigation:** expo-router (file-based routing)
- **Backend:** Supabase (auth, Postgres DB, edge functions)
- **AI:** Edge functions call OpenRouter/Gemini for chat completion, transcription, scenario generation
- **State:** React Context (`AuthContext`, `LanguageContext`, `AccessibilityContext`)
- **Storage:** Dual-write AsyncStorage + Supabase (offline-first pattern)
- **Encryption:** AES-CTR via `aes-js` for secure local storage
- **Testing:** Jest + ts-jest

## File Structure

```
app/
  _layout.tsx              # Root layout (auth guard, providers, deep linking)
  (tabs)/
    _layout.tsx            # Tab navigator
    lessons.tsx            # Lesson list / course view
    conversations.tsx      # AI conversation scenarios
    profile.tsx            # User profile & settings
  conversation.tsx         # Active conversation screen
  practise.tsx             # Active lesson screen
  onboarding.tsx           # First-run onboarding
  modal.tsx                # Modal route

components/
  lesson/                  # Lesson UI (flashcards, question modes, feedback, audio)
  conversation/            # ConversationMode.tsx
  auth/                    # IntroScreen, login flows
  subscription/            # Paywall / trial UI
  ui/                      # Shared UI primitives

constants/
  ContentTypes.ts          # Generic type system (Term, Phrase, Question, ContentPack, etc.)
  Languages.ts             # LanguageConfig definitions + helpers
  CourseData.ts            # Legacy Mandarin types (kept as migration reference only)

design-system/
  ThemeProvider.tsx         # DesignSystemProvider + useTheme() hook
  tokens/
    colors.ts              # WCAG-audited palette, lightTheme/darkTheme
    typography.ts           # Plus Jakarta Sans + Lexend type scale
    spacing.ts              # 4px base / 8px grid spacing tokens
    radius.ts               # Border radius tokens
    shadows.ts              # Cross-platform shadow tokens
    animation.ts            # Duration, easing, spring presets
    index.ts                # Barrel re-export
  components/
    Text.tsx                # Themed text (replaces ThemedText)
    Button.tsx              # Primary/secondary/ghost button
    Icon.tsx                # Ionicons wrapper with theme colors
    Card.tsx                # Elevated/outlined/filled card
    Badge.tsx               # Semantic status badges
    Input.tsx               # Themed text input
    ProgressBar.tsx          # Animated progress bar
    index.ts                # Barrel re-export
  hooks/
    useAccessibleTheme.ts   # Composite hook: theme + accessibility

ctx/
  AuthContext.tsx           # Auth state + Supabase session
  LanguageContext.tsx       # Active language + content pack
  AccessibilityContext.tsx  # Font size, contrast, reduced motion

lib/services/
  content-pack-service.ts  # Load & resolve content packs from assets
  progress-service.ts      # Lesson completion tracking (local + Supabase)
  stats-service.ts         # Learning statistics
  event-service.ts         # Analytics / event logging
  migration-service.ts     # Local → Supabase data migration
  access-service.ts        # Free/trial/paid access control

hooks/
  useSpeakingListeningStats.ts  # Per-skill stats aggregation
  useDeepLinking.ts             # URL deep link handler

assets/data/packs/
  zh-CN-beginner.json      # Mandarin beginner content pack

supabase/
  functions/
    chat-completion/       # AI conversation responses
    transcribe-audio/      # Speech-to-text
    scenario-generate/     # Dynamic scenario creation
    start-trial/           # Trial activation
    _shared/               # Shared edge function utilities
  migrations/              # SQL migrations (Postgres)

scripts/
  migrate-content.ts       # Content migration tooling
  reset-project.js         # Dev reset script
```

## Key Architecture Decisions

- **Generic type system:** All content uses `Term`, `Phrase`, `Prompt`, `ContentPack` from `ContentTypes.ts`. Never use the old Mandarin-specific types from `CourseData.ts`.
- **Design system:** All colors come from `useTheme()` via `@/design-system/ThemeProvider`. Never hardcode hex colors — use token values. Shared components live in `design-system/components/`. Typography uses Plus Jakarta Sans (primary) and Lexend (accessible alternative).
- **Content packs:** Curriculum is packaged as JSON files in `assets/data/packs/`. Each pack has a `languageCode`, difficulty, chapters, and optional conversation scenarios.
- **Language-aware rendering:** `LanguageConfig.renderingConfig` controls whether romanization is shown, what labels to use, etc. Components check this config rather than hardcoding language behavior.
- **Offline-first:** All user data writes go to AsyncStorage first, then sync to Supabase when online. Read from local storage as source of truth.
- **Question types:** Currently `multiple_choice`, `single_response`, and `listening_mc`. More planned (see BACKLOG.md).

## Migration Status

The type system migration is **complete** (all 6 phases). Every component, service, and edge function uses `ContentTypes.ts` imports. `CourseData.ts` is retained only as a reference — do not import from it in new code.

## Dev Commands

```bash
npm start          # Start Expo dev server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Start web dev server
npm run lint       # ESLint
npm test           # Jest test suite
```

### Supabase

```bash
supabase start             # Start local Supabase
supabase functions serve   # Serve edge functions locally
supabase db push           # Push migrations to remote
supabase functions deploy   # Deploy edge functions
```

## Planned Improvements

See **BACKLOG.md** for the structured feature backlog derived from the original blueprint comparison. Phases cover XP/streaks, home dashboard, mastery system, and additional question types.
