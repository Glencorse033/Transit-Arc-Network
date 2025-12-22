import { GoogleGenAI, Type } from "@google/genai";
import { TransitRoute, AnalyticsData, ChatMessage } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 5 realistic public transit routes for ${city}. Include a mix of Bus, Metro, and Train. Return JSON only.`,
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
    
    const rawRoutes = JSON.parse(text);
    return rawRoutes.map((r: any) => ({
      ...r,
      imageUrl: getDestinationImage(r.destinationType)
    })) as TransitRoute[];
  } catch (error) {
    console.error("Gemini Route Gen Error:", error);
    return [];
  }
};

export const getChatCommuterMessage = async (route: TransitRoute, history: ChatMessage[]): Promise<ChatMessage> => {
  try {
    const chatContext = history.map(m => `${m.sender}: ${m.text}`).join('\n');
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a passenger on the ${route.name} route. Context: ${chatContext}. Write a 1-sentence message. Return JSON with "sender" and "text".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sender: { type: Type.STRING },
            text: { type: Type.STRING }
          }
        }
      }
    });

    const data = JSON.parse(response.text);
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
  try {
    const response = await ai.models.generateContent({ 
      model: "gemini-3-flash-preview", 
      contents: `Generate mock analytics data for a transit operator dashboard. JSON only.`, 
      config: { responseMimeType: "application/json" } 
    });
    return JSON.parse(response.text) as AnalyticsData;
  } catch (error) {
    return { dailyRevenue: [], popularRoutes: [], totalRevenue: 0, activeRiders: 0 };
  }
};

export const generateVaultInsights = async (balance: number, points: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({ 
      model: "gemini-3-flash-preview", 
      contents: `Short tip for transit app user with ${balance} USDC. 1 sentence.` 
    });
    return response.text || "Deposit more to earn higher yield!";
  } catch (e) {
    return "Lock your USDC for rewards!";
  }
};