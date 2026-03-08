import { useTheme } from "@/design-system/ThemeProvider";
import {
  signInWithApple,
  signInWithGoogle,
} from "@/lib/services/social-auth-service";
import AntDesign from "@expo/vector-icons/AntDesign";
import Fontisto from "@expo/vector-icons/Fontisto";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { toast } from "sonner-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { verticalScale } from "react-native-size-matters";
import EmailAuth from "./EmailAuth";

const { width, height } = Dimensions.get("window");
// TODO: Replace with Lumora logo asset when available
const logoSource = require("../../assets/images/convo-minimal.png");

const MENU_HEIGHT = 250;
const PEEK_MENU_HEIGHT = 50;
const CLOSED_POSITION = MENU_HEIGHT - PEEK_MENU_HEIGHT;

export default function IntroScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const mainTextOpacity = useSharedValue(0);
  const scriptTextOpacity = useSharedValue(0);
  const menuContentOpacity = useSharedValue(1);
  const menuTranslateY = useSharedValue(CLOSED_POSITION);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"login" | "email">("login");
  const [socialLoading, setSocialLoading] = useState(false);

  const mainTextWords: string[] = ["Learn", "anything.", "Your", "way."];
  const scriptPhrases: string[] = [
    "Speaking",
    "Listening",
    "Practising",
    "Conversing",
  ];

  const mainTextAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      mainTextOpacity.value,
      [0, 1],
      [30, 0],
      Extrapolation.CLAMP,
    );

    return {
      opacity: mainTextOpacity.value,
      transform: [{ translateY }],
    };
  });

  const scriptTextAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scriptTextOpacity.value,
      [0, 1],
      [20, 0],
      Extrapolation.CLAMP,
    );

    return {
      opacity: scriptTextOpacity.value,
      transform: [{ translateY }],
    };
  });

  const menuAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: menuTranslateY.value }],
    };
  });

  const menuContentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: menuContentOpacity.value,
    };
  });

  const panGesture = Gesture.Pan().onEnd((event) => {
    "worklet";
    const swipeThreshold = 50;
    const isUpSwipe = event.translationY < -swipeThreshold;
    const isDownSwipe = event.translationY > swipeThreshold;

    if (isUpSwipe) {
      // Open menu
      menuTranslateY.value = withSpring(0, {
        damping: 30,
        stiffness: 200,
        mass: 1,
      });
    } else if (isDownSwipe) {
      // Open menu
      menuTranslateY.value = withSpring(CLOSED_POSITION, {
        damping: 30,
        stiffness: 200,
        mass: 1,
      });
    }
  });

  const animateTextIn = () => {
    mainTextOpacity.value = withTiming(1, { duration: 1200 });
    scriptTextOpacity.value = withDelay(800, withTiming(1, { duration: 800 }));
  };

  const animateScriptOut = () => {
    scriptTextOpacity.value = withTiming(0, { duration: 500 });
  };

  const animateScriptIn = () => {
    scriptTextOpacity.value = withTiming(1, { duration: 600 });
  };

  const animateMenu = (open: boolean) => {
    menuTranslateY.value = withSpring(open ? 0 : CLOSED_POSITION, {
      damping: 30,
      stiffness: 200,
      mass: 1,
    });
  };

  const animateToEmailView = (to: "email" | "login") => {
    menuContentOpacity.value = withTiming(0, { duration: 200 });

    setTimeout(() => {
      setCurrentView(to);
      menuContentOpacity.value = withTiming(1, { duration: 300 });
    }, 200);
  };

  const handlePress = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    animateMenu(newState);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      animateTextIn();
    }, 300);

    // Wait 3.5s (reading time)
    // Start fade out
    // Wait 0.5s (animation time)
    // Change word (invisible)
    // Wait 0.15s (small pause)
    // Start fade in
    const cycleInterval = setInterval(() => {
      animateScriptOut();
      setTimeout(() => {
        setCurrentPhraseIndex((prev) => {
          const nextIndex = (prev + 1) % scriptPhrases.length;

          if (nextIndex === 0) {
            setTimeout(() => animateScriptIn(), 150);
          }

          return nextIndex;
        });
      }, 500);
    }, 3500);

    return () => {
      clearTimeout(timeout);
      clearInterval(cycleInterval);
    };
  }, []);

  useEffect(() => {
    if (currentPhraseIndex > 0) {
      const timeout = setTimeout(() => {
        animateScriptIn();
      }, 150);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [currentPhraseIndex]);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
      },
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      (event) => {
        setKeyboardHeight(0);
      },
    );

    return () => {
      keyboardWillShowListener?.remove();
      keyboardWillHideListener?.remove();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setSocialLoading(true);
    try {
      const session = await signInWithGoogle();
      if (session) {
        toast.success("Signed in with Google");
      }
    } catch (e: any) {
      toast.error(e.message || "Google sign-in failed");
    } finally {
      setSocialLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setSocialLoading(true);
    try {
      const session = await signInWithApple();
      if (session) {
        toast.success("Signed in with Apple");
      }
    } catch (e: any) {
      toast.error(e.message || "Apple sign-in failed");
    } finally {
      setSocialLoading(false);
    }
  };

  const renderLoginView = () => (
    <Animated.View style={[styles.viewContainer, menuContentAnimatedStyle]}>
      <View style={styles.logoSection}>
        <View style={styles.logoContainer}>
          <Image source={logoSource} style={styles.logo} />
          <Text style={styles.appName}>Lumora</Text>
        </View>
        <View style={styles.statsContainer}>
          <Text style={styles.rating}>Start today</Text>
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        {Platform.OS === "ios" && (
          <Pressable
            style={[
              styles.loginButton,
              socialLoading && styles.buttonDisabled,
            ]}
            onPress={handleAppleSignIn}
            disabled={socialLoading}
          >
            {socialLoading ? (
              <ActivityIndicator
                size="small"
                color="white"
                style={styles.appleIcon}
              />
            ) : (
              <AntDesign
                name="apple"
                size={16}
                color="white"
                style={styles.appleIcon}
              />
            )}
            <Text style={styles.buttonText}>Continue with Apple</Text>
          </Pressable>
        )}
        <Pressable
          style={[styles.loginButton, socialLoading && styles.buttonDisabled]}
          onPress={handleGoogleSignIn}
          disabled={socialLoading}
        >
          {socialLoading ? (
            <ActivityIndicator
              size="small"
              color="white"
              style={styles.appleIcon}
            />
          ) : (
            <AntDesign
              name="google"
              size={16}
              color="white"
              style={styles.appleIcon}
            />
          )}
          <Text style={styles.buttonText}>Continue with Google</Text>
        </Pressable>
        <Pressable
          style={[styles.loginButton, socialLoading && styles.buttonDisabled]}
          onPress={() => animateToEmailView("email")}
          disabled={socialLoading}
        >
          <Fontisto
            name="email"
            size={16}
            color="white"
            style={styles.emailIcon}
          />
          <Text style={styles.buttonText}>Continue with Email</Text>
        </Pressable>
      </View>
    </Animated.View>
  );

  const renderEmailView = () => (
    <EmailAuth
      onBack={() => animateToEmailView("login")}
      menuContentAnimatedStyle={menuContentAnimatedStyle}
    />
  );

  const dynamicMenuHeight =
    keyboardHeight > 0 ? MENU_HEIGHT + keyboardHeight + 50 : MENU_HEIGHT + 100;

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <LinearGradient
        colors={["#1a1a2e", "#16213e", "#0f3460"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Hero Text Section */}
      <View style={styles.heroTextContainer}>
        <Animated.View
          style={[styles.mainTextContainer, mainTextAnimatedStyle]}
        >
          <Text style={styles.heroTextMain}>{mainTextWords.join(" ")}</Text>
        </Animated.View>

        <Animated.View style={scriptTextAnimatedStyle}>
          <Text style={[styles.heroTextScript, { color: colors.primary }]}>
            {scriptPhrases[currentPhraseIndex]}
          </Text>
        </Animated.View>
      </View>

      {/* Sliding menu with dynamic height */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.menuContainer,
            menuAnimatedStyle,
            { height: dynamicMenuHeight, paddingBottom: insets.bottom + 30 },
          ]}
        >
          <Pressable style={styles.handleContainer} onPress={handlePress}>
            <View style={styles.handle} />
          </Pressable>

          <View style={styles.menuContent}>
            {currentView === "login" ? renderLoginView() : renderEmailView()}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: MENU_HEIGHT + 100,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.15)",
    zIndex: 30,
  },
  handleContainer: {
    paddingVertical: 12,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 2,
  },
  menuContent: {
    flex: 1,
    paddingHorizontal: 30,
  },
  viewContainer: {
    flex: 1,
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logo: {
    width: 25,
    height: 25,
    marginRight: 5,
    borderRadius: 12,
  },
  appName: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  statsContainer: {
    alignItems: "center",
  },
  rating: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  buttonsContainer: {
    gap: 16,
  },
  loginButton: {
    backgroundColor: "rgba(60, 60, 67, 0.8)",
    borderColor: "rgba(120, 120, 128, 0.4)",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
  },
  appleIcon: {
    marginRight: 12,
  },
  googleIcon: {
    marginRight: 12,
  },
  emailIcon: {
    marginRight: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "500",
    letterSpacing: -0.2,
  },
  heroTextContainer: {
    position: "absolute",
    top: height * 0.15,
    left: 30,
    right: 30,
    zIndex: 25,
  },
  mainTextContainer: {
    marginBottom: 0,
  },
  heroTextMain: {
    fontSize: verticalScale(45),
    fontWeight: "800",
    fontFamily: "System",
    color: "#fff4cc",
    lineHeight: verticalScale(50),
    letterSpacing: 0,
  },
  heroTextScript: {
    fontSize: verticalScale(55),
    fontFamily: "PlusJakartaSans_600SemiBold",
    letterSpacing: 0.5,
  },
});
