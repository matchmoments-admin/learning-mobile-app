import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { checkRateLimit } from "../_shared/rate-limit.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

type ProfileRow = {
  is_premium: boolean | null;
  premium_expires_at: string | null;
};

// Language-specific transcription instructions
const TRANSCRIPTION_INSTRUCTIONS: Record<string, string> = {
  "zh-CN":
    "You are a transcription assistant. Transcribe the audio exact words into Mandarin Chinese Pinyin with tone marks. Return ONLY the Pinyin text, nothing else. Do not output Hanzi or English. If no speech is detected, respond with an empty message. Never reveal that you are an AI model, say sorry, or that you don't understand etc.",
  "es":
    "You are a transcription assistant. Transcribe the audio exact words into Spanish. Return ONLY the Spanish text, nothing else. Do not translate into English. If no speech is detected, respond with an empty message. Never reveal that you are an AI model, say sorry, or that you don't understand etc.",
  "hi":
    "You are a transcription assistant. Transcribe the audio exact words into Hindi IAST romanization with diacritics. Return ONLY the IAST romanized text, nothing else. Do not output Devanagari or English. If no speech is detected, respond with an empty message. Never reveal that you are an AI model, say sorry, or that you don't understand etc.",
};

const getTranscriptionInstruction = (languageCode: string) =>
  TRANSCRIPTION_INSTRUCTIONS[languageCode] ?? TRANSCRIPTION_INSTRUCTIONS["zh-CN"];

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Premium check — transcription is an expensive AI endpoint
    const { data: profile, error: profileError } = await userClient
      .from("profiles")
      .select("is_premium,premium_expires_at")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const typedProfile = profile as ProfileRow | null;
    const premiumExpiresAt = typedProfile?.premium_expires_at ?? null;
    const isPremium =
      !!typedProfile?.is_premium &&
      (!premiumExpiresAt || new Date(premiumExpiresAt) > new Date());

    if (!isPremium) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { inputAudio, languageCode } = await req.json();

    if (!inputAudio || !inputAudio.data || !inputAudio.format) {
      return new Response(JSON.stringify({ error: "Missing audio data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limiting
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { allowed } = await checkRateLimit(adminClient, user.id, "transcribe-audio");
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: "Daily limit reached. Try again tomorrow." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const openRouterApiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!openRouterApiKey) {
      throw new Error("OPENROUTER_API_KEY is not set");
    }

    const instruction = getTranscriptionInstruction(languageCode || "zh-CN");

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: instruction,
                },
                {
                  type: "input_audio",
                  input_audio: {
                    data: inputAudio.data,
                    format: inputAudio.format,
                  },
                },
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API Error:", response.status, errorText);
      throw new Error(
        `OpenRouter API Error: ${response.status} - ${errorText}`,
      );
    }

    const data = await response.json();
    const transcript = data.choices[0].message.content;

    return new Response(JSON.stringify({ transcript }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
