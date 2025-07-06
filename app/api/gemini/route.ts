// app/api/gemini/route.ts
// Ce code s'exécute uniquement sur le serveur.
import { GoogleGenAI } from "@google/genai";
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set in environment variables.");
      return NextResponse.json(
        { error: "Gemini API Key is not configured on the server." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    interface RequestBody {
      prompt: string;
    }

    const { prompt }: RequestBody = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: "A valid 'prompt' string is required in the request body." },
        { status: 400 }
      );
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    const generatedText = response.text;

    if (!generatedText) {
      throw new Error("No text was generated");
    }

    return NextResponse.json({ text: generatedText });

  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json(
      { error: `Failed to generate content from Gemini: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}