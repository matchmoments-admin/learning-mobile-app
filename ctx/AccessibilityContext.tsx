import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";

const PREFS_KEY = "@lumora/accessibility_prefs";

export interface AccessibilityPreferences {
  fontScale: number; // 1.0 = default, 1.5 = 150%, etc.
  highContrast: boolean;
  reducedMotion: boolean;
  audioSpeed: number; // 0.5–2.0, default 1.0
  preferAccessibleFont: boolean; // Swap Jakarta for Lexend (dyslexia-friendly)
}

interface AccessibilityContextType {
  preferences: AccessibilityPreferences;
  setPreferences: (prefs: Partial<AccessibilityPreferences>) => void;
  getScaledFontSize: (baseSize: number) => number;
  shouldAnimate: () => boolean;
}

const defaultPreferences: AccessibilityPreferences = {
  fontScale: 1.0,
  highContrast: false,
  reducedMotion: false,
  audioSpeed: 1.0,
  preferAccessibleFont: false,
};

const AccessibilityContext = createContext<AccessibilityContextType>({
  preferences: defaultPreferences,
  setPreferences: () => {},
  getScaledFontSize: (size) => size,
  shouldAnimate: () => true,
});

export function AccessibilityProvider({ children }: PropsWithChildren) {
  const [preferences, setPreferencesState] =
    useState<AccessibilityPreferences>(defaultPreferences);

  // Load persisted preferences on mount
  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY).then((raw) => {
      if (raw) {
        try {
          const saved = JSON.parse(raw) as Partial<AccessibilityPreferences>;
          setPreferencesState((prev) => ({ ...prev, ...saved }));
        } catch {
          // ignore corrupt data
        }
      }
    });
  }, []);

  const setPreferences = (prefs: Partial<AccessibilityPreferences>) => {
    setPreferencesState((prev) => {
      const next = { ...prev, ...prefs };
      void AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const getScaledFontSize = (baseSize: number) =>
    Math.round(baseSize * preferences.fontScale);

  const shouldAnimate = () => !preferences.reducedMotion;

  return (
    <AccessibilityContext.Provider
      value={{ preferences, setPreferences, getScaledFontSize, shouldAnimate }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () => useContext(AccessibilityContext);
