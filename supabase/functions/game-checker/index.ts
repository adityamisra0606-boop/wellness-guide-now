import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { gameName, laptopModel } = await req.json();

    if (!gameName || typeof gameName !== "string" || gameName.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Please provide a game name." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!laptopModel || typeof laptopModel !== "string" || laptopModel.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Please provide your laptop model." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a PC gaming hardware expert. When given a game name and a laptop model, you must:

1. **Game Requirements**: List the game's minimum and recommended system requirements (CPU, GPU, RAM, Storage).
2. **Laptop Specs**: Based on the laptop model provided, identify its typical specs (CPU, GPU, RAM, Storage). If you're unsure about the exact variant, mention the most common configuration.
3. **Compatibility Verdict**: Give a clear verdict:
   - ✅ **CAN RUN** — meets recommended specs
   - ⚠️ **CAN RUN (LOW SETTINGS)** — meets minimum but not recommended
   - ❌ **CANNOT RUN** — doesn't meet minimum specs
4. **Performance Tips**: If the game can run, suggest optimal settings (Low/Medium/High/Ultra) and any tweaks to improve FPS.
5. **Expected FPS**: Estimate the FPS range at the suggested settings.

Be specific with component comparisons. Format your response in clear markdown with headers and bullet points. If you don't recognize the laptop model, ask for more details about the specs.`,
          },
          {
            role: "user",
            content: `Can my laptop run this game?\n\nGame: ${gameName.trim()}\nLaptop: ${laptopModel.trim()}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "Failed to check compatibility. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "Unable to check compatibility at this time.";

    return new Response(JSON.stringify({ result: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("game-checker error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
