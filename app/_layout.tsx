import IntroScreen from "@/components/auth/IntroScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AccessibilityProvider } from "@/ctx/AccessibilityContext";
import { useAuth } from "@/ctx/AuthContext";
import { LanguageProvider, useLanguage } from "@/ctx/LanguageContext";
import { DesignSystemProvider, useTheme } from "@/design-system/ThemeProvider";
import { useDeepLinking } from "@/hooks/useDeepLinking";
import { getDefaultPack } from "@/lib/services/content-pack-service";
import { migrateLocalDataToSupabase } from "@/lib/services/migration-service";
import { configureGoogleSignIn } from "@/lib/services/social-auth-service";
import { checkAndAwardDailyLogin } from "@/lib/services/xp-service";
import AuthProvider from "@/providers/AuthProvider";
import {
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_700Bold,
} from "@expo-google-fonts/lexend";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import {
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { router, Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Toaster } from "sonner-native";

if (Platform.OS !== "web") {
  configureGoogleSignIn();
}

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutNav() {
  const { session, loading, profile } = useAuth();
  const { activePack, setActivePack } = useLanguage();
  const { colors } = useTheme();
  const segments = useSegments();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_700Bold,
  });

  // Build React Navigation theme from design system tokens
  const navTheme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.card,
        text: colors.text,
        border: colors.border,
      },
    }),
    [colors],
  );

  // Handle deep linking for magic links
  useDeepLinking();

  // Load the default content pack on mount
  useEffect(() => {
    if (!activePack) {
      setActivePack(getDefaultPack());
    }
  }, [activePack, setActivePack]);

  useEffect(() => {
    if (!loading && session) {
      // Migrate local data to Supabase on first launch after update
      if (session.user?.id) {
        void migrateLocalDataToSupabase(session.user.id);
        void checkAndAwardDailyLogin(session.user.id);
      }

      if (!profile || !profile.onboarding_completed) {
        const inOnboarding = segments[0] === "onboarding";

        if (!inOnboarding) {
          router.replace("/onboarding");
        }
      }
    }
  }, [session, loading, profile, segments]);

  useEffect(() => {
    if (loaded && !loading) {
      SplashScreen.hideAsync();
    }
  }, [loaded, loading]);

  if (!loaded || loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!session) {
    return (
      <ThemeProvider value={navTheme}>
        <GestureHandlerRootView style={styles.container}>
          <IntroScreen />
          <Toaster />
        </GestureHandlerRootView>
        <StatusBar style="dark" />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={navTheme}>
      <GestureHandlerRootView style={styles.container}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="privacy" />
          <Stack.Screen name="terms" />
        </Stack>
        <Toaster />
      </GestureHandlerRootView>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <AccessibilityProvider>
            <DesignSystemProvider>
              <RootLayoutNav />
            </DesignSystemProvider>
          </AccessibilityProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
