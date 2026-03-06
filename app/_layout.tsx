import IntroScreen from "@/components/auth/IntroScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AccessibilityProvider } from "@/ctx/AccessibilityContext";
import { useAuth } from "@/ctx/AuthContext";
import { LanguageProvider, useLanguage } from "@/ctx/LanguageContext";
import { useDeepLinking } from "@/hooks/useDeepLinking";
import { getDefaultPack } from "@/lib/services/content-pack-service";
import { migrateLocalDataToSupabase } from "@/lib/services/migration-service";
import AuthProvider from "@/providers/AuthProvider";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { router, Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Toaster } from "sonner-native";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutNav() {
  const { session, loading, profile } = useAuth();
  const { activePack, setActivePack } = useLanguage();
  const segments = useSegments();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

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
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  if (!session) {
    return (
      <ThemeProvider value={DefaultTheme}>
        <GestureHandlerRootView style={styles.container}>
          <IntroScreen />
          <Toaster />
        </GestureHandlerRootView>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <GestureHandlerRootView style={styles.container}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" />
        </Stack>
        <Toaster />
      </GestureHandlerRootView>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <AccessibilityProvider>
            <RootLayoutNav />
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
});
