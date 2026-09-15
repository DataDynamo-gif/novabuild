"use server";

import { GoogleGenAI } from "@google/genai";

export async function generateProjectCode(prompt: string) {
  try {
    if (!prompt.trim()) {
      return { success: false, error: "Prompt cannot be empty." };
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      return { success: false, error: "GEMINI_API_KEY is missing in environment variables." };
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are an expert developer. The user wants to build and run this: "${prompt}". 
              Provide a fully working, single-file or easily executable solution (such as a complete HTML file with embedded Tailwind CSS and JavaScript, or a complete Python script) that the user can copy, save, and run instantly on their computer without complex setup. Include clear instructions on how to run it.`
            }
          ]
        }
      ],
    });

    return { success: true, data: response.text };
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    return { success: false, error: error.message || "Failed to generate project." };
  }
}