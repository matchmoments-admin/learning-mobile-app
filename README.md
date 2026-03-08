# Lumora

A multi-language learning platform built with Expo React Native. Combines structured lessons, AI-powered conversation practice, and voice recording to help learners build real fluency.

## Features

- Cross-platform iOS/Android app (Expo SDK 54, React Native 0.81)
- Passwordless authentication via Supabase magic links
- Personalized onboarding flow (level, motivation, interests)
- Structured curriculum with content pack architecture (currently Mandarin Chinese)
- Multiple question types: multiple choice, single response, listening comprehension
- Vocabulary flashcards with sentence-level breakdown
- Voice recording with AI transcription for pronunciation practice
- AI roleplay conversations with scenario goals and tasks
- Custom scenario generation via edge functions
- Speaking/listening stats and lesson completion tracking
- AES-encrypted secure local storage
- Offline-first dual-write (AsyncStorage + Supabase sync)
- Accessibility support (font scaling, contrast, reduced motion)
- Trial/subscription access control with paywall

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 54, React 19.1, React Native 0.81 |
| Navigation | expo-router (file-based routing) |
| Backend | Supabase (Auth, Postgres, Edge Functions) |
| AI | OpenRouter / Gemini via edge functions |
| State | React Context (Auth, Language, Accessibility) |
| Storage | AsyncStorage + Supabase (offline-first) |
| Audio | expo-av, expo-speech |
| Testing | Jest + ts-jest |

## Setup

### Prerequisites

- Node.js 18+
- npm
- Supabase CLI
- iOS Simulator or Android Emulator

### Install

```bash
git clone https://github.com/matchmoments-admin/learning-mobile-app.git
cd learning-mobile-app
npm install
```

### Environment Variables

Copy the example and fill in your Supabase credentials:

```bash
cp .env.example .env
```

### Supabase Setup

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Deploy edge functions:

```bash
npx supabase functions deploy chat-completion
npx supabase functions deploy transcribe-audio
npx supabase functions deploy scenario-generate
npx supabase functions deploy start-trial
```

Set function secrets:

```bash
npx supabase secrets set OPENROUTER_API_KEY=your_openrouter_key
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Auth Redirect

Add your app redirect URL in Supabase Auth settings:

```
lumora://
```

### Run

```bash
npm start          # Start Expo dev server
npm run ios        # iOS simulator
npm run android    # Android emulator
npm test           # Run tests
npm run lint       # ESLint
```

## Project Structure

```
app/                    # Expo Router screens (tabs, lessons, conversations, onboarding)
components/             # UI components (lesson modes, flashcards, auth, conversation)
constants/              # ContentTypes.ts, Languages.ts, theme.ts
ctx/                    # React Context providers (Auth, Language, Accessibility)
lib/services/           # Business logic (progress, stats, content packs, access control)
hooks/                  # Custom hooks (stats, deep linking, color scheme)
supabase/functions/     # Edge functions (chat, transcribe, scenario-generate, trial)
supabase/migrations/    # Database schema
assets/data/packs/      # Content pack JSON files
```

## Roadmap

See [BACKLOG.md](./BACKLOG.md) for the full feature backlog:

- **Phase 1**: XP system, streaks, daily goals, lesson scoring
- **Phase 2**: Home dashboard tab
- **Phase 3**: Score and mastery system with spaced repetition
- **Phase 4**: Fill-in-blank and matching pairs question types
- **Design**: WCAG 2.2 AA+ design system, Plus Jakarta Sans typography, NativeWind v4, dark mode, accessibility-first component library

## License

MIT
