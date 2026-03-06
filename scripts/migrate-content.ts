#!/usr/bin/env npx ts-node
/**
 * Content migration script
 * Transforms assets/data/course_content.json → assets/data/packs/zh-CN-beginner.json
 *
 * Mapping:
 *   hanzi     → nativeScript
 *   pinyin    → romanization
 *   english   → translation
 *   mandarin  (on options) → phrase
 *   mandarin  (on questions) → prompt
 *
 * Run: npx ts-node scripts/migrate-content.ts
 */

import * as fs from "fs";
import * as path from "path";

const INPUT = path.resolve(__dirname, "../assets/data/course_content.json");
const OUTPUT = path.resolve(
  __dirname,
  "../assets/data/packs/zh-CN-beginner.json",
);

// ---------------------------------------------------------------------------
// Transformers
// ---------------------------------------------------------------------------

function migrateTerm(word: any) {
  return {
    nativeScript: word.hanzi,
    romanization: word.pinyin,
    translation: word.english,
  };
}

function migratePhrase(mandarin: any) {
  return {
    nativeScript: mandarin.hanzi,
    romanization: mandarin.pinyin,
    words: (mandarin.words ?? []).map(migrateTerm),
    breakdown: mandarin.breakdown ?? "",
  };
}

function migratePrompt(mandarin: any) {
  const prompt: any = {
    nativeScript: mandarin.hanzi,
    romanization: mandarin.pinyin,
  };
  if (mandarin.words) {
    prompt.words = mandarin.words.map(migrateTerm);
  }
  if (mandarin.breakdown) {
    prompt.breakdown = mandarin.breakdown;
  }
  return prompt;
}

function migrateSpeakingOption(opt: any) {
  return {
    id: opt.id,
    translation: opt.english,
    phrase: migratePhrase(opt.mandarin),
  };
}

function migrateListeningOption(opt: any) {
  return {
    id: opt.id,
    translation: opt.english,
  };
}

function migrateQuestion(q: any) {
  const base: any = { id: q.id, type: q.type };

  if (q.type === "multiple_choice") {
    base.prompt = migratePrompt(q.mandarin);
    base.options = q.options.map(migrateSpeakingOption);
  } else if (q.type === "single_response") {
    base.prompt = migratePrompt(q.mandarin);
    base.options = q.options.map(migrateSpeakingOption);
  } else if (q.type === "listening_mc") {
    base.prompt = migratePrompt(q.mandarin);
    base.options = q.options.map(migrateListeningOption);
    base.correctOptionId = q.correctOptionId;
  }

  return base;
}

function migrateLesson(lesson: any) {
  return {
    id: lesson.id,
    title: lesson.title,
    icon: lesson.icon,
    completionCount: lesson.completionCount ?? 0,
    questions: (lesson.questions ?? []).map(migrateQuestion),
  };
}

function migrateChapter(chapter: any) {
  const result: any = {
    id: chapter.id,
    title: chapter.title,
    lessons: (chapter.lessons ?? []).map(migrateLesson),
  };
  if (chapter.review) {
    result.review = migrateLesson(chapter.review);
  }
  return result;
}

function migratePhrasebookEntry(entry: any) {
  return {
    nativeScript: entry.hanzi,
    romanization: entry.pinyin,
    translation: entry.english,
  };
}

function migrateScenario(scenario: any) {
  return {
    id: scenario.id,
    title: scenario.title,
    icon: scenario.icon,
    isFree: scenario.isFree,
    description: scenario.description,
    goal: scenario.goal,
    tasks: scenario.tasks,
    difficulty: scenario.difficulty,
    phrasebook: (scenario.phrasebook ?? []).map(migratePhrasebookEntry),
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const raw = fs.readFileSync(INPUT, "utf-8");
  const source = JSON.parse(raw);

  const contentPack = {
    id: "zh-CN-beginner",
    subjectSlug: "languages",
    languageCode: "zh-CN",
    title: "Mandarin Chinese — Beginner",
    description:
      "Complete beginner course for Mandarin Chinese with 12 chapters covering greetings, numbers, food, travel, and more.",
    difficulty: "Beginner",
    chapters: (source.chapters ?? []).map(migrateChapter),
    scenarios: (source.scenarios ?? []).map(migrateScenario),
  };

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(contentPack, null, 2), "utf-8");

  const stats = {
    chapters: contentPack.chapters.length,
    lessons: contentPack.chapters.reduce(
      (sum: number, c: any) =>
        sum + c.lessons.length + (c.review ? 1 : 0),
      0,
    ),
    scenarios: contentPack.scenarios.length,
  };

  console.log("Migration complete!");
  console.log(`  Output: ${OUTPUT}`);
  console.log(
    `  ${stats.chapters} chapters, ${stats.lessons} lessons, ${stats.scenarios} scenarios`,
  );
}

main();
