import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const ACTION = "transcribe-audio";
const GLOBAL_DAILY_CAP = 1500;
const MAX_BODY_BYTES = 14_000_000;
const MAX_AUDIO_CHARS = 14_000_000;

const ALLOWED_ORIGINS = [
  "https://cypj2011-creator.github.io",
  "http://localhost:8080",
  "http://localhost:5173",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") ?? "";
  const allowed = ALLOWED_ORIGINS.includes(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

function json(body: unknown, status: number, cors: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

async function guard(req: Request, cors: Record<string, string>): Promise<Response | null> {
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Please sign in first." }, 401, cors);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) {
    return json({ error: "Session expired. Please refresh the page and try again." }, 401, cors);
  }

  const user = data.user;
  const isGuest = user.is_anonymous === true || user.app_metadata?.provider === "anonymous";

  const { data: status, error: rpcError } = await admin.rpc("check_ai_usage", {
    p_user: user.id,
    p_action: ACTION,
    p_is_guest: isGuest,
    p_global_max: GLOBAL_DAILY_CAP,
  });

  if (rpcError) {
    console.error("check_ai_usage failed:", rpcError.message);
    return json({ error: "Service temporarily unavailable. Please try again later." }, 503, cors);
  }
  if (status === "guest_blocked") {
    return json({ error: "Voice input is only available when you sign in." }, 403, cors);
  }
  if (status === "user_limit") {
    return json({ error: "You're going too fast. Please try again in a moment." }, 429, cors);
  }
  if (status === "global_limit") {
    return json({ error: "The service is very busy right now. Please try again tomorrow." }, 503, cors);
  }
  if (status !== "ok") {
    return json({ error: "Service temporarily unavailable. Please try again later." }, 503, cors);
  }
  return null;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405, corsHeaders);
  }

  try {
    const contentLength = Number(req.headers.get("content-length") ?? "0");
    if (contentLength > MAX_BODY_BYTES) {
      return json({ error: "Audio is too large." }, 413, corsHeaders);
    }

    const blocked = await guard(req, corsHeaders);
    if (blocked) return blocked;

    const { audio } = await req.json();

    if (typeof audio !== "string" || !audio || audio.length > MAX_AUDIO_CHARS) {
      return json({ error: "No audio data provided, or audio is too large." }, 400, corsHeaders);
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      console.error("OpenAI API key not configured");
      return json({ error: "Service is not configured." }, 500, corsHeaders);
    }

    let binaryAudio: Uint8Array;
    try {
      binaryAudio = Uint8Array.from(atob(audio), (c) => c.charCodeAt(0));
    } catch {
      return json({ error: "Invalid audio data." }, 400, corsHeaders);
    }

    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: "audio/webm" });
    formData.append("file", blob, "audio.webm");
    formData.append("model", "whisper-1");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      return json({ error: "Transcription failed. Please try again." }, 500, corsHeaders);
    }

    const result = await response.json();

    return json({ text: result.text }, 200, corsHeaders);
  } catch (error) {
    console.error("Transcription error:", error);
    return json({ error: "Transcription failed. Please try again." }, 500, corsHeaders);
  }
});
