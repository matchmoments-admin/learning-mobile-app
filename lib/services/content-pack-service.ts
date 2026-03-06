import type { ContentPack } from "@/constants/ContentTypes";

// Bundled content packs — loaded from assets/data/packs/
import zhCNBeginner from "@/assets/data/packs/zh-CN-beginner.json";

const BUNDLED_PACKS: ContentPack[] = [zhCNBeginner as unknown as ContentPack];

let cachedPack: ContentPack | null = null;

/**
 * Get all bundled content packs (shipped with the app).
 */
export function getBundledPacks(): ContentPack[] {
  return BUNDLED_PACKS;
}

/**
 * Find a bundled pack by its ID.
 */
export function getBundledPackById(id: string): ContentPack | null {
  return BUNDLED_PACKS.find((p) => p.id === id) ?? null;
}

/**
 * Find bundled packs for a specific language code.
 */
export function getBundledPacksForLanguage(
  languageCode: string,
): ContentPack[] {
  return BUNDLED_PACKS.filter((p) => p.languageCode === languageCode);
}

/**
 * Get or set the cached active pack (in-memory for current session).
 */
export function getActivePack(): ContentPack | null {
  return cachedPack;
}

export function setActivePack(pack: ContentPack | null): void {
  cachedPack = pack;
}

/**
 * Get the default pack — currently the zh-CN beginner pack.
 */
export function getDefaultPack(): ContentPack {
  return BUNDLED_PACKS[0];
}
