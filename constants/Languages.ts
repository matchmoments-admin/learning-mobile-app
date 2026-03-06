// ---------------------------------------------------------------------------
// Language configuration — defines rendering & TTS behavior per language
// ---------------------------------------------------------------------------

export interface LanguageConfig {
  id: string;
  code: string; // IETF tag: "zh-CN", "es", "hi"
  displayName: string; // English name
  nativeName: string; // Self-referencing name
  scriptType: "cjk" | "latin" | "devanagari" | "arabic" | "cyrillic";
  writingDirection: "ltr" | "rtl";
  ttsCode: string; // expo-speech language code
  hasContent: boolean; // Whether content packs exist for this language
  renderingConfig: {
    showRomanization: boolean;
    romanizationLabel?: string; // "Pinyin", "IAST", etc.
    primaryScriptLabel: string; // "Hanzi", "Devanagari", "Spanish"
  };
}

// ---------------------------------------------------------------------------
// Supported languages
// ---------------------------------------------------------------------------

export const LANGUAGES: Record<string, LanguageConfig> = {
  "zh-CN": {
    id: "zh-CN",
    code: "zh-CN",
    displayName: "Mandarin Chinese",
    nativeName: "普通话",
    scriptType: "cjk",
    writingDirection: "ltr",
    ttsCode: "zh-CN",
    hasContent: true,
    renderingConfig: {
      showRomanization: true,
      romanizationLabel: "Pinyin",
      primaryScriptLabel: "Hanzi",
    },
  },
  es: {
    id: "es",
    code: "es",
    displayName: "Spanish",
    nativeName: "Español",
    scriptType: "latin",
    writingDirection: "ltr",
    ttsCode: "es-ES",
    hasContent: false,
    renderingConfig: {
      showRomanization: false,
      primaryScriptLabel: "Spanish",
    },
  },
  hi: {
    id: "hi",
    code: "hi",
    displayName: "Hindi",
    nativeName: "हिन्दी",
    scriptType: "devanagari",
    writingDirection: "ltr",
    ttsCode: "hi-IN",
    hasContent: false,
    renderingConfig: {
      showRomanization: true,
      romanizationLabel: "IAST",
      primaryScriptLabel: "Devanagari",
    },
  },
};

export const DEFAULT_LANGUAGE_CODE = "zh-CN";

export function getLanguageConfig(code: string): LanguageConfig {
  return LANGUAGES[code] ?? LANGUAGES[DEFAULT_LANGUAGE_CODE];
}

export function hasRomanization(config: LanguageConfig): boolean {
  return config.renderingConfig.showRomanization;
}
