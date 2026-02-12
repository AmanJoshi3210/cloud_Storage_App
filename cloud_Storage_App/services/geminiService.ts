import { GoogleGenAI, Type } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is missing.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeImage = async (
  base64Data: string,
  mimeType: string
): Promise<{ description: string; tags: string[] }> => {
  const ai = getAiClient();
  
  // Clean base64 string if it includes the data URL prefix
  const cleanBase64 = base64Data.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            text: "Analyze this image. Provide a short description (max 2 sentences) and a list of 5 relevant tags.",
          },
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: {
              type: Type.STRING,
              description: "A concise description of the image content.",
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 5 keywords describing the image.",
            },
          },
          required: ["description", "tags"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    // Fallback if AI fails, so the upload doesn't break
    return {
      description: "AI analysis unavailable.",
      tags: ["image"],
    };
  }
};
