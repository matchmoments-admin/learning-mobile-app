import Ionicons from "@expo/vector-icons/Ionicons";

// ---------------------------------------------------------------------------
// Generic content types — replaces Mandarin-specific CourseData.ts types
// ---------------------------------------------------------------------------

/** A single vocabulary term (replaces Word) */
export interface Term {
  nativeScript: string; // e.g. "你好", "Hola", "नमस्ते"
  romanization?: string; // e.g. "Nǐ hǎo", "namaste" (optional for Latin scripts)
  translation: string; // English translation
}

/** Prompt shown/played to the learner (replaces MandarinPrompt) */
export interface Prompt {
  nativeScript: string;
  romanization?: string;
}

/** A full phrase with word-level breakdown (replaces MandarinPhrase) */
export interface Phrase {
  nativeScript: string;
  romanization?: string;
  words: Term[];
  breakdown: string;
}

/** Option the learner can select or speak (replaces SpeakingOption) */
export interface SpeakingOption {
  id: number;
  translation: string; // English meaning
  phrase: Phrase;
}

/** Option for listening comprehension (replaces ListeningOption) */
export interface ListeningOption {
  id: number;
  translation: string;
}

// ---------------------------------------------------------------------------
// Question types
// ---------------------------------------------------------------------------

interface BaseQuestion {
  id: number;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple_choice";
  prompt: Prompt;
  options: SpeakingOption[];
}

export interface SingleResponseQuestion extends BaseQuestion {
  type: "single_response";
  prompt: Prompt;
  options: [SpeakingOption];
}

export interface ListeningMultipleChoiceQuestion extends BaseQuestion {
  type: "listening_mc";
  prompt: Prompt & {
    words: Term[];
    breakdown: string;
  };
  options: ListeningOption[];
  correctOptionId: number;
}

export type Question =
  | MultipleChoiceQuestion
  | SingleResponseQuestion
  | ListeningMultipleChoiceQuestion;

// ---------------------------------------------------------------------------
// Course structure
// ---------------------------------------------------------------------------

export interface Lesson {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  completionCount: number;
  questions: Question[];
}

export interface Chapter {
  id: number;
  title: string;
  lessons: Lesson[];
  review?: Lesson;
}

/** A phrasebook entry for conversation scenarios */
export interface PhrasebookEntry {
  nativeScript: string;
  romanization?: string;
  translation: string;
}

export interface ConversationScenario {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  isFree: boolean;
  description: string;
  goal: string;
  tasks: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  phrasebook?: PhrasebookEntry[];
}

// ---------------------------------------------------------------------------
// Content pack — wraps a curriculum unit for any subject/language
// ---------------------------------------------------------------------------

export interface ContentPack {
  id: string;
  subjectSlug: string; // "languages", "mathematics", etc.
  languageCode?: string; // e.g. "zh-CN", "es", "hi" (null for non-language)
  title: string;
  description?: string;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  freeChapterCount: number; // how many chapters (from the start) are free
  chapters: Chapter[];
  scenarios?: ConversationScenario[];
}

// ---------------------------------------------------------------------------
// Course data envelope (same shape as the old CourseData for compat)
// ---------------------------------------------------------------------------

export interface CourseData {
  chapters: Chapter[];
  scenarios: ConversationScenario[];
}

// ---------------------------------------------------------------------------
// Content authoring / admin types (future admin site support)
// ---------------------------------------------------------------------------

export type ContentSourceType = "manual" | "csv_import" | "ai_generated";

export type ContentReviewStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "published"
  | "rejected";

export type UserRole = "learner" | "creator" | "reviewer" | "admin";
