import { ContentPack } from "@/constants/ContentTypes";

/** Check if a chapter (by 0-based index) is within the free tier */
export function isChapterFree(pack: ContentPack, chapterIndex: number): boolean {
  return chapterIndex < pack.freeChapterCount;
}

/** Check if a lesson belongs to a free chapter */
export function isLessonFree(pack: ContentPack, lessonId: string): boolean {
  for (let i = 0; i < pack.chapters.length; i++) {
    const chapter = pack.chapters[i];
    const inChapter =
      chapter.lessons.some((l) => l.id === lessonId) ||
      chapter.review?.id === lessonId;
    if (inChapter) return isChapterFree(pack, i);
  }
  return false;
}

/** Can the user access a specific chapter? */
export function canAccessChapter(
  pack: ContentPack,
  chapterIndex: number,
  isPremium: boolean,
): boolean {
  return isPremium || isChapterFree(pack, chapterIndex);
}

/** Can the user access a specific lesson? */
export function canAccessLesson(
  pack: ContentPack,
  lessonId: string,
  isPremium: boolean,
): boolean {
  return isPremium || isLessonFree(pack, lessonId);
}
