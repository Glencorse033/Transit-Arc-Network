import { GoogleGenAI, Type } from "@google/genai";
import { TransitRoute, AnalyticsData, ChatMessage } from "../types.ts";

const parseAIJson = (text: string) => {
  try {
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("TransitArc: AI JSON Parse Error:", e);
    return null;
  }
};

const getDestinationImage = (type: string): string => {
  const images: Record<string, string> = {
    'URBAN': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80',
    'NATURE': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
    'COASTAL': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    'AIRPORT': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80',
    'SUBURBAN': 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800&q=80',
  };
  return images[type] || images['URBAN'];
};

export const generateRoutes = async (city: string): Promise<TransitRoute[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 5 realistic and varied public transit routes for ${city}. Include a mix of Bus, Metro, and Train. Each route should have a unique name, price (between 2-15 USDC), and schedule. Return JSON only.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              origin: { type: Type.STRING },
              destination: { type: Type.STRING },
              price: { type: Type.NUMBER },
              schedule: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['BUS', 'TRAIN', 'METRO', 'FERRY'] },
              destinationType: { type: Type.STRING, enum: ['URBAN', 'NATURE', 'COASTAL', 'AIRPORT', 'SUBURBAN'] }
            },
            required: ["id", "name", "origin", "destination", "price", "schedule", "type", "destinationType"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const rawRoutes = parseAIJson(text);
    if (!rawRoutes || !Array.isArray(rawRoutes)) return [];
    
    return rawRoutes.map((r: any) => ({
      ...r,
      imageUrl: getDestinationImage(r.destinationType)
    })) as TransitRoute[];
  } catch (error) {
    console.error("TransitArc: Error in generateRoutes:", error);
    return [];
  }
};

/**
 * Analyzes an image to extract a location or city name
 */
export const analyzeLocationFromImage = async (base64Image: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
          { text: "Identify the city or specific location/landmark in this image. Return ONLY the city or location name as a single string. If unsure, return 'San Francisco'." }
        ]
      }
    });
    return response.text?.trim() || "San Francisco";
  } catch (error) {
    console.error("TransitArc: Image analysis failed:", error);
    return null;
  }
};

/**
 * General Chat Assistant using Gemini 3 Pro
 */
export const getChatAssistantResponse = async (prompt: string, imageBase64?: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const parts: any[] = [{ text: prompt }];
    if (imageBase64) {
      parts.unshift({ inlineData: { data: imageBase64, mimeType: "image/jpeg" } });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { parts },
      config: {
        systemInstruction: "You are the Transit Arc Assistant. You help users with public transport, Web3 payments in USDC, and identifying locations. Be concise, futuristic, and helpful."
      }
    });
    return response.text || "I'm having trouble processing that right now.";
  } catch (error) {
    console.error("TransitArc: Chat error:", error);
    return "The transit network is currently congested. Please try again.";
  }
};

export const getChatCommuterMessage = async (route: TransitRoute, history: ChatMessage[]): Promise<ChatMessage> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const chatContext = history.map(m => `${m.sender}: ${m.text}`).join('\n');
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a passenger on the ${route.name} route. Context: ${chatContext}. Write a 1-sentence message as a helpful commuter. Return JSON with "sender" and "text".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sender: { type: Type.STRING },
            text: { type: Type.STRING }
          },
          required: ["sender", "text"]
        }
      }
    });

    const text = response.text;
    const data = parseAIJson(text || "");
    if (!data) throw new Error("Invalid format");

    return {
      id: Math.random().toString(36).substr(2, 9),
      sender: data.sender,
      senderAddress: `0x${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}...`,
      text: data.text,
      timestamp: Date.now(),
      isAi: true
    };
  } catch (e) {
    return { id: 'fallback', sender: 'Commuter_Anon', senderAddress: '0x123...456', text: 'On my way!', timestamp: Date.now(), isAi: true };
  }
};

export const generateAnalytics = async (): Promise<AnalyticsData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({ 
      model: "gemini-3-pro-preview", 
      contents: `Generate mock analytics data for a transit operator dashboard for the last 7 days. JSON only.`, 
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dailyRevenue: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING },
                  amount: { type: Type.NUMBER }
                }
              }
            },
            popularRoutes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  ticketsSold: { type: Type.NUMBER }
                }
              }
            },
            totalRevenue: { type: Type.NUMBER },
            activeRiders: { type: Type.NUMBER }
          },
          required: ["dailyRevenue", "popularRoutes", "totalRevenue", "activeRiders"]
        }
      } 
    });
    const text = response.text;
    const data = parseAIJson(text || "");
    return data || { dailyRevenue: [], popularRoutes: [], totalRevenue: 0, activeRiders: 0 };
  } catch (error) {
    return { dailyRevenue: [], popularRoutes: [], totalRevenue: 0, activeRiders: 0 };
  }
};

export const generateVaultInsights = async (balance: number, points: number): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({ 
      model: "gemini-3-flash-preview", 
      contents: `Short tip for transit app user with ${balance} USDC in vault and ${points} loyalty points. Keep it to one short sentence.` 
    });
    return response.text || "Deposit more to earn higher yield!";
  } catch (e) {
    return "Lock your USDC for rewards and early access to route upgrades!";
  }
};