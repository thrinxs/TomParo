import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("⚠️ GEMINI_API_KEY is not set in .env.local");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.3,
    maxOutputTokens: 32768,
    responseMimeType: "application/json",
  },
});

export async function generateWithGemini(prompt: string): Promise<string> {
  try {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    console.log("🤖 Calling Gemini AI...");
    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log("✅ Gemini AI responded successfully");
    console.log("📝 Response length:", text.length);
    return text;
  } catch (error) {
    console.error("❌ Gemini AI error details:", error);

    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error(
          "Invalid Gemini API key. Please check your .env.local file."
        );
      }
      if (error.message.includes("quota") || error.message.includes("QUOTA")) {
        throw new Error(
          "Gemini API quota exceeded. Please try again later."
        );
      }
      if (error.message.includes("SAFETY")) {
        throw new Error(
          "Content was blocked by AI safety filters. Please try different content."
        );
      }
      throw new Error(`Gemini AI error: ${error.message}`);
    }

    throw new Error("AI generation failed. Please try again.");
  }
}

export async function generateJSONWithGemini<T>(prompt: string): Promise<T> {
  const text = await generateWithGemini(prompt);

  console.log("📄 RAW Gemini Response length:", text.length);
  console.log("📄 First 300 chars:", text.slice(0, 300));
  console.log("📄 Last 300 chars:", text.slice(-300));

  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```json\s*/gi, "");
  cleaned = cleaned.replace(/^```\s*/g, "");
  cleaned = cleaned.replace(/\s*```$/g, "");
  cleaned = cleaned.trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1) {
    console.error("❌ No opening brace found");
    throw new Error("AI response is not valid JSON");
  }

  let jsonString: string;

  // If we have a proper closing brace
  if (lastBrace > firstBrace) {
    jsonString = cleaned.slice(firstBrace, lastBrace + 1);
  } else {
    // Response was truncated — use everything from first brace
    jsonString = cleaned.slice(firstBrace);
  }

  try {
    return JSON.parse(jsonString) as T;
  } catch (firstError) {
    console.warn("⚠️ First parse failed, attempting to fix truncated JSON");

    // Count braces to determine how many are missing
    const openBraces = (jsonString.match(/\{/g) || []).length;
    const closeBraces = (jsonString.match(/\}/g) || []).length;
    const openBrackets = (jsonString.match(/\[/g) || []).length;
    const closeBrackets = (jsonString.match(/\]/g) || []).length;

    // Remove any incomplete trailing content
    // Try to find a safe cut point (last complete object)
    let attempts = [
      jsonString,
      jsonString + "}",
      jsonString + "}]}",
      jsonString + "]}}",
      jsonString + '"}]}}',
    ];

    // Add missing brackets
    if (openBrackets > closeBrackets) {
      const missing = openBrackets - closeBrackets;
      attempts.push(jsonString + "]".repeat(missing) + "}".repeat(openBraces - closeBraces));
    }

    // Add missing braces
    if (openBraces > closeBraces) {
      const missing = openBraces - closeBraces;
      attempts.push(jsonString + "}".repeat(missing));
    }

    // Fix trailing commas in each attempt
    attempts = attempts.map((s) =>
      s.replace(/,\s*}/g, "}").replace(/,\s*\]/g, "]")
    );

    // Try each attempt
    for (const attempt of attempts) {
      try {
        return JSON.parse(attempt) as T;
      } catch {
        continue;
      }
    }

    console.error("❌ All parse attempts failed");
    console.error("Full response:", text);
    throw new Error(
      "AI response format was invalid. Please try again."
    );
  }
}