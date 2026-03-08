import { MultipleChoiceQuestion, SingleResponseQuestion, ListeningMultipleChoiceQuestion } from "@/constants/ContentTypes";

type AudioQuestion = MultipleChoiceQuestion | SingleResponseQuestion | ListeningMultipleChoiceQuestion;
import { useTheme } from "@/design-system/ThemeProvider";
import { useLanguage } from "@/ctx/LanguageContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "@/design-system/components/Text";
import AudioWaveform from "./AudioWaveform";

export default function AudioPrompt({
  isPlaying,
  isRecognizing,
  hasListenedToAudio,
  onPlay,
  onStartRecord,
  onStopRecord,
  onRevealNativeScript,
  currentQuestion,
  showNativeScript,
  selectedOption,
  scaleAnim,
  instructionOpacity,
  listeningOpacity,
  listeningScale,
  fadeAnim,
}: {
  isPlaying: boolean;
  isRecognizing: boolean;
  hasListenedToAudio: boolean;
  onPlay: () => void;
  onStartRecord: () => void;
  onStopRecord: () => void;
  onRevealNativeScript: () => void;
  currentQuestion: AudioQuestion;
  showNativeScript: boolean;
  selectedOption: number | null;
  scaleAnim: Animated.Value;
  instructionOpacity: Animated.Value;
  listeningOpacity: Animated.Value;
  listeningScale: Animated.Value;
  fadeAnim: Animated.Value;
}) {
  const { colors } = useTheme();
  const { hasRomanization, getNativeScriptLabel } = useLanguage();

  const playbackDisabled = !selectedOption && (isPlaying || hasListenedToAudio);
  return (
    <>
      <Pressable
        disabled={playbackDisabled}
        accessibilityRole="button"
        accessibilityLabel={
          selectedOption
            ? isRecognizing
              ? "Stop recording"
              : "Start recording your answer"
            : "Play audio prompt"
        }
        accessibilityState={{ disabled: playbackDisabled }}
        onPress={
          selectedOption
            ? isRecognizing
              ? onStopRecord
              : () => requestAnimationFrame(onStartRecord)
            : playbackDisabled
              ? undefined
              : () => requestAnimationFrame(onPlay)
        }
        onPressIn={() => {
          if (playbackDisabled) {
            return;
          }

          Animated.spring(scaleAnim, {
            toValue: 0.9,
            useNativeDriver: true,
          }).start();
        }}
        onPressOut={() => {
          if (playbackDisabled) {
            return;
          }

          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
        }}
      >
        <Animated.View
          style={[
            styles.playButton,
            {
              backgroundColor: selectedOption
                ? isRecognizing
                  ? colors.error
                  : colors.primary
                : playbackDisabled
                  ? "#ff8c66"
                  : colors.primary,
              transform: [{ scale: scaleAnim }],
              ...Platform.select({
                ios: {
                  shadowColor: colors.shadow,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                },
              }),
            },
          ]}
        >
          {selectedOption ? (
            isRecognizing ? (
              <MaterialIcons name="stop" size={36} color="white" />
            ) : (
              <Ionicons name="mic" size={36} color="white" />
            )
          ) : isPlaying ? (
            <MaterialIcons name="graphic-eq" size={36} color="white" />
          ) : (
            <Ionicons name="play" size={36} color="white" />
          )}
        </Animated.View>
      </Pressable>
      {selectedOption && isRecognizing ? (
        <View style={styles.recordingStatus}>
          <View style={styles.recordingIndicatorLarge}>
            <View style={[styles.recordingDotLarge, { backgroundColor: colors.error }]}></View>
          </View>
          <Text style={[styles.recordingText, { color: colors.error }]}>Recording...</Text>
        </View>
      ) : (
        <AudioWaveform isPlaying={isPlaying} />
      )}

      <View
        style={[
          styles.promptTextContainer,
          { minHeight: currentQuestion.type === "listening_mc" ? 0 : 50 },
        ]}
      >
        {selectedOption ? (
          <View style={styles.recordingPromptTop}>
            <Text style={[styles.recordingPromptText, { color: colors.textSecondary }]}>
              {isRecognizing
                ? "Speak your response now"
                : "Tap the microphone to record"}
            </Text>
          </View>
        ) : !hasListenedToAudio ? (
          <View style={styles.listeningPrompt}>
            <Animated.View
              style={[
                styles.instructionContainer,
                { opacity: instructionOpacity },
              ]}
            >
              <Text style={[styles.instructionText, { marginBottom: 8, color: colors.textSecondary }]}>
                Tap play to listen carefully
              </Text>
              <Text style={[styles.instructionHint, { color: colors.textTertiary }]}>
                The audio plays once before each response
              </Text>
            </Animated.View>
            <Animated.View
              style={[
                styles.listeningContainer,
                {
                  opacity: listeningOpacity,
                  transform: [{ scale: listeningScale }],
                },
              ]}
            >
              <Text style={[styles.revealButtonText, { color: colors.textSecondary }]}>
                Listening...
              </Text>
            </Animated.View>
          </View>
        ) : showNativeScript ? (
          <TouchableOpacity onPress={onRevealNativeScript}>
            <Animated.View style={[styles.nativeScriptText, { opacity: fadeAnim }]}>
              {hasRomanization() && currentQuestion.prompt.romanization && (
                <Text style={styles.romanization}>
                  {currentQuestion.prompt.romanization}
                </Text>
              )}
              <Text
                style={[styles.nativeScript, { color: colors.textSecondary }]}
              >
                {currentQuestion.prompt.nativeScript}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        ) : (
          currentQuestion.type !== "listening_mc" && (
            <TouchableOpacity
              style={styles.revealButton}
              onPress={onRevealNativeScript}
              hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
              accessibilityRole="button"
              accessibilityLabel="Reveal what was said"
              accessibilityHint="Tap to show the phrase in the target language"
            >
              <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
                Tap here to reveal what was said
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  nativeScriptText: {
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  romanization: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  nativeScript: {
    fontSize: 18,
  },
  revealButton: {
    marginBottom: 8,
    marginTop: 16,
    alignItems: "center",
  },
  revealButtonText: {
    fontSize: 16,
    marginBottom: 4,
  },
  recordingStatus: {
    alignItems: "center",
    marginVertical: 16,
  },
  recordingIndicatorLarge: {
    marginBottom: 8,
  },
  recordingDotLarge: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  recordingText: {
    fontSize: 16,
    fontWeight: "600",
  },
  promptTextContainer: {
    alignItems: "center",
  },
  recordingPromptTop: {
    alignItems: "center",
    padding: 12,
  },
  recordingPromptText: {
    fontSize: 16,
    textAlign: "center",
  },
  listeningPrompt: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    minHeight: 60,
  },
  instructionContainer: {
    alignItems: "center",
  },
  listeningContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  instructionText: {
    fontSize: 16,
    textAlign: "center",
  },
  instructionHint: {
    fontSize: 14,
    textAlign: "center",
  },
});
