import { createContext, useContext, useState, type PropsWithChildren } from "react";

export interface AccessibilityPreferences {
  fontScale: number; // 1.0 = default, 1.5 = 150%, etc.
  highContrast: boolean;
  reducedMotion: boolean;
  audioSpeed: number; // 0.5–2.0, default 1.0
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

  const setPreferences = (prefs: Partial<AccessibilityPreferences>) => {
    setPreferencesState((prev) => ({ ...prev, ...prefs }));
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
