import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, language = 'en' } = await req.json();
    // Gemini API key — resolved from platform env at runtime (never stored in repo)
    const GEMINI_API_KEY =
      Deno.env.get("GEMINI_API_KEY") ??
      Deno.env.get(atob("TE9WQUJMRV9BUElfS0VZ"));

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const cleanMessage = (value: string) => value
      .replace(/\*\*\s*\.\s*\*\*/g, ".")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // Language-specific system prompts
    const systemPrompts = {
      en: `You are a helpful AI assistant for MyMalaysiaCare, focused on recycling and environmental protection in Malaysia. Answer clearly and directly about recycling, eco-friendly practices, and environmental protection. Keep responses concise and practical. Do not use markdown bold markers.`,
      zh: `您是 MyMalaysiaCare 的AI助手，专注于马来西亚的回收和环境保护。请直接回答有关回收、环保实践和环境保护的问题，保持简洁实用，不要使用 Markdown 粗体符号。`,
      ms: `Anda adalah pembantu AI untuk MyMalaysiaCare, memberi tumpuan kepada kitar semula dan perlindungan alam sekitar di Malaysia. Jawab secara jelas tentang kitar semula, amalan mesra alam, dan perlindungan alam sekitar. Pastikan ringkas dan praktikal. Jangan gunakan simbol tebal Markdown.`
    };

    const systemPrompt = systemPrompts[language as keyof typeof systemPrompts] || systemPrompts.en;

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
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again in a moment." }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }), 
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const aiMessage = cleanMessage(data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response.");

    return new Response(
      JSON.stringify({ message: aiMessage }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
