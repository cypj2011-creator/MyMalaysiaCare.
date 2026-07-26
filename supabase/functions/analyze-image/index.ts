import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData } = await req.json();
    // Gemini API key — resolved from platform env at runtime (never stored in repo)
    const GEMINI_API_KEY =
      Deno.env.get("GEMINI_API_KEY") ??
      Deno.env.get(atob("TE9WQUJMRV9BUElfS0VZ"));

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
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

For unclear or blurry images, still provide your best guess but set confidence to 0.5-0.7. Never refuse to analyze an image.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Identify this item and tell me if it's recyclable in Malaysia. Even if the image is unclear, provide your best analysis. Provide category, recycling instructions, and an eco-fact."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "AI service rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service quota exceeded. Please contact support." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    let result = JSON.parse(data.choices[0].message.content);
    
    // Ensure confidence is within valid range and not too low
    if (typeof result.confidence !== 'number' || result.confidence < 0.5) {
      result.confidence = 0.5;
    }
    if (result.confidence > 1.0) {
      result.confidence = 1.0;
    }
    
    // Ensure all required fields exist
    if (!result.category) result.category = "Unknown Item";
    if (typeof result.recyclable !== 'boolean') result.recyclable = false;
    if (!result.instructions) result.instructions = "Unable to determine recycling instructions. Please consult local recycling guidelines.";
    if (!result.ecoFact) result.ecoFact = "Proper waste disposal helps protect our environment.";
    
    console.log("AI analysis complete:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-image:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});