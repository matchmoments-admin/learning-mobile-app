import { supabase } from "@/utils/supabase";
import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import type { Session } from "@supabase/supabase-js";

/**
 * Call once at app startup to configure the Google Sign-In SDK.
 */
export function configureGoogleSignIn() {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });
}

/**
 * Triggers the native Google sign-in modal, then exchanges the ID token
 * with Supabase. Returns the session on success, or null if the user cancelled.
 */
export async function signInWithGoogle(): Promise<Session | null> {
  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();

  if (!isSuccessResponse(response)) {
    return null;
  }

  const idToken = response.data.idToken;
  if (!idToken) {
    throw new Error("Google Sign-In succeeded but no ID token was returned");
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: idToken,
  });

  if (error) throw error;
  return data.session;
}

/**
 * Triggers the native Apple sign-in sheet, then exchanges the identity token
 * with Supabase. Returns the session on success, or null if the user cancelled.
 * iOS only.
 */
export async function signInWithApple(): Promise<Session | null> {
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce,
  );

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });

    const identityToken = credential.identityToken;
    if (!identityToken) {
      throw new Error(
        "Apple Sign-In succeeded but no identity token was returned",
      );
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: identityToken,
      nonce: rawNonce,
    });

    if (error) throw error;

    // Apple only provides the user's name on the very first sign-in.
    // Capture it now and save to user metadata + profile table.
    const givenName = credential.fullName?.givenName;
    const familyName = credential.fullName?.familyName;
    if (data.session && (givenName || familyName)) {
      const fullName = [givenName, familyName].filter(Boolean).join(" ");
      await supabase.auth.updateUser({
        data: { full_name: fullName },
      });
      await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", data.session.user.id);
    }

    return data.session;
  } catch (e: any) {
    if (e.code === "ERR_REQUEST_CANCELED") {
      return null;
    }
    throw e;
  }
}
