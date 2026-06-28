import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function generateNodeDefinition(prompt: string, context: string = "") {
  const systemInstruction = `
    You are an expert software architect. Generate a custom node definition for a visual flow builder.
    The response must be a valid JSON object matching this structure:
    {
      "type": "unique_id",
      "label": "Human Readable Label",
      "category": "api | database | flow | infographic",
      "description": "Short description",
      "color": "text-color bg-color (Tailwind classes)",
      "configSchema": {
        "fields": [
          { "name": "fieldName", "type": "text | number | select", "label": "Label" }
        ]
      }
    }
    
    Context: ${context}
    User Request: ${prompt}
    
    ONLY return the JSON object, no markdown, no explanation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: "Generate the node definition JSON.",
      config: {
        systemInstruction,
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate node definition");
  }
}
