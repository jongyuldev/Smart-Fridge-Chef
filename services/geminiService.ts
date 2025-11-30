import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AnalysisResult, DietaryFilter } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFridgeImage = async (
  base64Image: string, 
  dietaryFilter: DietaryFilter,
  pantryItems: string[]
): Promise<AnalysisResult> => {
  
  const filterInstruction = dietaryFilter !== DietaryFilter.None 
    ? `Strictly adhere to the dietary restriction: ${dietaryFilter}.` 
    : "No specific dietary restrictions.";

  const pantryInstruction = pantryItems.length > 0 
    ? `The user also has these pantry items available: ${pantryItems.join(', ')}. Treat these as available ingredients.` 
    : "";

  const prompt = `
    Analyze this image of a fridge or food ingredients. 
    ${pantryInstruction}
    1. Identify the visible ingredients.
    2. Suggest 3-5 distinct, complete recipes that can be made primarily with the visible ingredients and the provided pantry items. 
    3. If a few essential ingredients are missing (like spices, oils, or a common pairing), list them as 'isMissing: true'.
    4. ${filterInstruction}
    5. Provide estimated calories, prep time, and difficulty.
    6. Provide clear, step-by-step cooking instructions.
  `;

  // Clean base64 string to remove the data URI scheme if present
  let cleanBase64 = base64Image;
  let mimeType = 'image/jpeg';

  if (base64Image.includes(';base64,')) {
    const parts = base64Image.split(';base64,');
    mimeType = parts[0].replace('data:', '');
    cleanBase64 = parts[1];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: cleanBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            identifiedIngredients: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of ingredients found in the image"
            },
            recipes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] },
                  prepTimeMinutes: { type: Type.INTEGER },
                  calories: { type: Type.INTEGER },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  ingredients: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        amount: { type: Type.STRING },
                        isMissing: { type: Type.BOOLEAN }
                      },
                      required: ['name', 'amount', 'isMissing']
                    }
                  },
                  steps: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Step by step cooking instructions"
                  }
                },
                required: ['id', 'title', 'description', 'difficulty', 'prepTimeMinutes', 'calories', 'ingredients', 'steps', 'tags']
              }
            }
          },
          required: ['identifiedIngredients', 'recipes']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio generated");
    
    // Create a data URL for the audio
    return `data:audio/mp3;base64,${base64Audio}`;
  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
};