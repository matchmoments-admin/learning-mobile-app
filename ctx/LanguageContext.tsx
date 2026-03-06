import {
  DEFAULT_LANGUAGE_CODE,
  getLanguageConfig,
  hasRomanization,
  type LanguageConfig,
} from "@/constants/Languages";
import { createContext, useContext, useState, type PropsWithChildren } from "react";
import type { ContentPack } from "@/constants/ContentTypes";

interface LanguageContextType {
  activeLanguage: LanguageConfig;
  activePack: ContentPack | null;
  setActiveLanguageCode: (code: string) => void;
  setActivePack: (pack: ContentPack | null) => void;
  hasRomanization: () => boolean;
  getNativeScriptLabel: () => string;
  getRomanizationLabel: () => string | null;
  getTtsCode: () => string;
}

const LanguageContext = createContext<LanguageContextType>({
  activeLanguage: getLanguageConfig(DEFAULT_LANGUAGE_CODE),
  activePack: null,
  setActiveLanguageCode: () => {},
  setActivePack: () => {},
  hasRomanization: () => true,
  getNativeScriptLabel: () => "Hanzi",
  getRomanizationLabel: () => "Pinyin",
  getTtsCode: () => "zh-CN",
});

export function LanguageProvider({ children }: PropsWithChildren) {
  const [languageCode, setLanguageCode] = useState(DEFAULT_LANGUAGE_CODE);
  const [activePack, setActivePack] = useState<ContentPack | null>(null);

  const activeLanguage = getLanguageConfig(languageCode);

  const value: LanguageContextType = {
    activeLanguage,
    activePack,
    setActiveLanguageCode: setLanguageCode,
    setActivePack,
    hasRomanization: () => hasRomanization(activeLanguage),
    getNativeScriptLabel: () => activeLanguage.renderingConfig.primaryScriptLabel,
    getRomanizationLabel: () =>
      activeLanguage.renderingConfig.showRomanization
        ? (activeLanguage.renderingConfig.romanizationLabel ?? null)
        : null,
    getTtsCode: () => activeLanguage.ttsCode,
  };

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
