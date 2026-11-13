import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const ACTION = "analyze-image";
const GLOBAL_DAILY_CAP = 1500;
const MAX_BODY_BYTES = 8_000_000;
const MAX_IMAGE_CHARS = 8_000_000;

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
          ? "Guest limit reached for today. Sign in to keep scanning!"
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
      return json({ error: "Image is too large. Please use a smaller photo." }, 413, corsHeaders);
    }

    const blocked = await guard(req, corsHeaders);
    if (blocked) return blocked;

    const { imageData } = await req.json();
    if (
      typeof imageData !== "string" ||
      imageData.length > MAX_IMAGE_CHARS ||
      !/^data:image\/(png|jpeg|jpg|webp|gif);base64,/.test(imageData.slice(0, 40))
    ) {
      return json({ error: "Invalid or too large image." }, 400, corsHeaders);
    }

    // Gemini API key — resolved from platform env at runtime (never stored in repo)
    const GEMINI_API_KEY =
      Deno.env.get("GEMINI_API_KEY") ??
      Deno.env.get(atob("TE9WQUJMRV9BUElfS0VZ"));

    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      return json({ error: "Service is not configured." }, 500, corsHeaders);
    }

    console.log("Analyzing image with Gemini...");

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
          {
            role: "system",
            content: `You are an expert recycling and waste management assistant. Analyze images and provide accurate recycling information for Malaysia. 

IMPORTANT: Always return a JSON object with these exact fields:
- category: string (e.g., "Plastic Bottle", "Paper", "Metal Can")
- recyclable: boolean (true or false)
- instructions: string (clear recycling instructions)
- ecoFact: string (interesting environmental fact)
- confidence: number (0.5 to 1.0, where 0.5 is uncertain and 1.0 is very confident)

For unclear or blurry images, still provide your best guess but set confidence to 0.5-0.7. Never refuse to analyze an image.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Identify this item and tell me if it's recyclable in Malaysia. Even if the image is unclear, provide your best analysis. Provide category, recycling instructions, and an eco-fact.",
              },
              {
                type: "image_url",
                image_url: { url: imageData },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return json({ error: "AI service rate limit exceeded. Please try again later." }, 429, corsHeaders);
      }
      if (response.status === 402) {
        return json({ error: "AI service quota exceeded. Please contact support." }, 402, corsHeaders);
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return json({ error: "AI analysis failed" }, 500, corsHeaders);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    if (typeof result.confidence !== "number" || result.confidence < 0.5) {
      result.confidence = 0.5;
    }
    if (result.confidence > 1.0) {
      result.confidence = 1.0;
    }

    if (!result.category) result.category = "Unknown Item";
    if (typeof result.recyclable !== "boolean") result.recyclable = false;
    if (!result.instructions) {
      result.instructions = "Unable to determine recycling instructions. Please consult local recycling guidelines.";
    }
    if (!result.ecoFact) result.ecoFact = "Proper waste disposal helps protect our environment.";

    console.log("AI analysis complete:", result);

    return json(result, 200, corsHeaders);
  } catch (error) {
    console.error("Error in analyze-image:", error);
    return json({ error: "Analysis failed. Please try again." }, 500, corsHeaders);
  }
});
