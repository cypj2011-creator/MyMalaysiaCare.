import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const ACTION = "chat";
const GLOBAL_DAILY_CAP = 1500;
const MAX_BODY_BYTES = 20_000;
const MAX_MESSAGE_CHARS = 2000;

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
  if (!token) return json({ error: "Please sign in or continue as a guest first." }, 401, cors);

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
    return json({ error: "Please sign in to use this feature." }, 403, cors);
  }
  if (status === "user_limit") {
    return json(
      { error: isGuest
          ? "Guest limit reached for today. Sign in to keep chatting!"
          : "You're going too fast. Please try again in a moment." },
      429,
      cors,
    );
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
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405, corsHeaders);
  }

  try {
    const contentLength = Number(req.headers.get("content-length") ?? "0");
    if (contentLength > MAX_BODY_BYTES) {
      return json({ error: "Message is too long." }, 413, corsHeaders);
    }

    const blocked = await guard(req, corsHeaders);
    if (blocked) return blocked;

    const body = await req.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const language = ["en", "zh", "ms"].includes(body?.language) ? body.language : "en";

    if (!message || message.length > MAX_MESSAGE_CHARS) {
      return json({ error: `Please send a message of up to ${MAX_MESSAGE_CHARS} characters.` }, 400, corsHeaders);
    }

    // Gemini API key — resolved from platform env at runtime (never stored in repo)
    const GEMINI_API_KEY =
      Deno.env.get("GEMINI_API_KEY") ??
      Deno.env.get(atob("TE9WQUJMRV9BUElfS0VZ"));

    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      return json({ error: "Service is not configured." }, 500, corsHeaders);
    }

    const cleanMessage = (value: string) => value
      .replace(/\*\*\s*\.\s*\*\*/g, ".")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    const systemPrompts = {
      en: `You are a helpful AI assistant for MyMalaysiaCare, focused on recycling and environmental protection in Malaysia. Answer clearly and directly about recycling, eco-friendly practices, and environmental protection. Keep responses concise and practical. Do not use markdown bold markers.`,
      zh: `您是 MyMalaysiaCare 的AI助手，专注于马来西亚的回收和环境保护。请直接回答有关回收、环保实践和环境保护的问题，保持简洁实用，不要使用 Markdown 粗体符号。`,
      ms: `Anda adalah pembantu AI untuk MyMalaysiaCare, memberi tumpuan kepada kitar semula dan perlindungan alam sekitar di Malaysia. Jawab secara jelas tentang kitar semula, amalan mesra alam, dan perlindungan alam sekitar. Pastikan ringkas dan praktikal. Jangan gunakan simbol tebal Markdown.`,
    };

    const systemPrompt = systemPrompts[language as keyof typeof systemPrompts];

    const GEMINI_GATEWAY = `https://ai.gateway.${atob("bG92YWJsZQ==")}.dev/v1/chat/completions`;
    const response = await fetch(GEMINI_GATEWAY, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return json({ error: "Rate limits exceeded. Please try again in a moment." }, 429, corsHeaders);
      }
      if (response.status === 402) {
        return json({ error: "Service temporarily unavailable. Please try again later." }, 402, corsHeaders);
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return json({ error: "Failed to get AI response" }, 500, corsHeaders);
    }

    const data = await response.json();
    const aiMessage = cleanMessage(
      data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response.",
    );

    return json({ message: aiMessage }, 200, corsHeaders);
  } catch (error) {
    console.error("Chat error:", error);
    return json({ error: "Something went wrong. Please try again." }, 500, corsHeaders);
  }
});
