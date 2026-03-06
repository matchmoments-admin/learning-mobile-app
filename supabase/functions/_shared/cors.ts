// Shared CORS headers for all edge functions.
// Mobile-native requests don't send Origin headers, so CORS is mainly
// relevant for web builds and development. Restrict to known origins.
const ALLOWED_ORIGINS = [
  Deno.env.get("SUPABASE_URL") ?? "",
  "http://localhost:8081",  // Expo dev server
  "http://localhost:19006", // Expo web
].filter(Boolean);

export function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") ?? "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };
}
