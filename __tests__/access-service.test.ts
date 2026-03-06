import {
  isChapterFree,
  isLessonFree,
  canAccessChapter,
  canAccessLesson,
} from "@/lib/services/access-service";
import type { ContentPack } from "@/constants/ContentTypes";

// Minimal fixture — only the fields access-service actually reads.
// Cast via `as any as ContentPack` because icon requires Ionicons glyph names.
const pack = {
  id: "test-pack",
  subjectSlug: "languages",
  languageCode: "zh-CN",
  title: "Test Pack",
  freeChapterCount: 2,
  chapters: [
    {
      title: "Chapter 1",
      lessons: [
        { id: "1-1", title: "L1", icon: "book", questions: [] },
        { id: "1-2", title: "L2", icon: "book", questions: [] },
      ],
    },
    {
      title: "Chapter 2",
      lessons: [{ id: "2-1", title: "L3", icon: "book", questions: [] }],
      review: { id: "2-r", title: "Review", icon: "book", questions: [] },
    },
    {
      title: "Chapter 3 (premium)",
      lessons: [{ id: "3-1", title: "L4", icon: "book", questions: [] }],
    },
  ],
} as any as ContentPack;

describe("isChapterFree", () => {
  it("returns true for chapters within freeChapterCount", () => {
    expect(isChapterFree(pack, 0)).toBe(true);
    expect(isChapterFree(pack, 1)).toBe(true);
  });

  it("returns false for chapters beyond freeChapterCount", () => {
    expect(isChapterFree(pack, 2)).toBe(false);
    expect(isChapterFree(pack, 99)).toBe(false);
  });
});

describe("isLessonFree", () => {
  it("returns true for lessons in free chapters", () => {
    expect(isLessonFree(pack, "1-1")).toBe(true);
    expect(isLessonFree(pack, "2-1")).toBe(true);
  });

  it("returns true for review lessons in free chapters", () => {
    expect(isLessonFree(pack, "2-r")).toBe(true);
  });

  it("returns false for lessons in premium chapters", () => {
    expect(isLessonFree(pack, "3-1")).toBe(false);
  });

  it("returns false for unknown lesson IDs", () => {
    expect(isLessonFree(pack, "unknown")).toBe(false);
  });
});

describe("canAccessChapter", () => {
  it("allows premium users to access any chapter", () => {
    expect(canAccessChapter(pack, 0, true)).toBe(true);
    expect(canAccessChapter(pack, 2, true)).toBe(true);
  });

  it("allows free users to access free chapters only", () => {
    expect(canAccessChapter(pack, 0, false)).toBe(true);
    expect(canAccessChapter(pack, 1, false)).toBe(true);
    expect(canAccessChapter(pack, 2, false)).toBe(false);
  });
});

describe("canAccessLesson", () => {
  it("allows premium users to access any lesson", () => {
    expect(canAccessLesson(pack, "3-1", true)).toBe(true);
  });

  it("blocks free users from premium lessons", () => {
    expect(canAccessLesson(pack, "3-1", false)).toBe(false);
  });

  it("allows free users to access free lessons", () => {
    expect(canAccessLesson(pack, "1-1", false)).toBe(true);
  });
});
