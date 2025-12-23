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
    'URBAN': 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=800',
    'NATURE': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800',
    'COASTAL': 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&q=80&w=800',
    'AIRPORT': 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&q=80&w=800',
    'SUBURBAN': 'https://images.unsplash.com/photo-1510253687831-0f982d7862fc?auto=format&fit=crop&q=80&w=800',
  };
  return images[type] || images['URBAN'];
};

export const DEFAULT_ROUTES: TransitRoute[] = [
  { id: 'def-1', name: 'Global Express Metro', origin: 'Central Hub', destination: 'Financial District', price: 2.50, schedule: 'Every 5 mins', type: 'METRO', imageUrl: 'https://images.unsplash.com/photo-1447433589675-4aaa569f3e05?auto=format&fit=crop&q=80&w=800' },
  { id: 'def-2', name: 'Coastal Ferry', origin: 'North Pier', destination: 'Island Sanctuary', price: 12.00, schedule: 'Every 60 mins', type: 'FERRY', imageUrl: 'https://images.unsplash.com/photo-1534491336415-410a98f51947?auto=format&fit=crop&q=80&w=800' },
  { id: 'def-3', name: 'Hyperlink Train', origin: 'East Terminal', destination: 'West Coast Loop', price: 15.00, schedule: 'Every 30 mins', type: 'TRAIN', imageUrl: 'https://images.unsplash.com/photo-1532105956626-9569c03602f6?auto=format&fit=crop&q=80&w=800' },
  { id: 'def-4', name: 'City Loop Bus', origin: 'Old Town', destination: 'Arts Quarter', price: 1.50, schedule: 'Every 12 mins', type: 'BUS', imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800' },
  { id: 'def-5', name: 'Airport Shuttle', origin: 'Skyport Center', destination: 'Downtown Transit Hub', price: 8.50, schedule: 'Every 15 mins', type: 'BUS', imageUrl: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&q=80&w=800' },
  { id: 'def-6', name: 'Sky-Line Monorail', origin: 'University Heights', destination: 'Tech Valley', price: 4.00, schedule: 'Every 8 mins', type: 'METRO', imageUrl: 'https://images.unsplash.com/photo-1519010470956-6d877008eaa4?auto=format&fit=crop&q=80&w=800' },
  { id: 'def-7', name: 'Trans-Alpine Rail', origin: 'Mountain Base', destination: 'Summit Peak', price: 25.00, schedule: 'Hourly', type: 'TRAIN', imageUrl: 'https://images.unsplash.com/photo-1474487059207-de619b0616f7?auto=format&fit=crop&q=80&w=800' },
  { id: 'def-8', name: 'Harbor Cruiser', origin: 'West Marina', destination: 'Fishermans Wharf', price: 6.00, schedule: 'Every 20 mins', type: 'FERRY', imageUrl: 'https://images.unsplash.com/photo-1511316695145-4992006ffddb?auto=format&fit=crop&q=80&w=800' },
];

export interface RealWorldTransitResponse {
  text: string;
  groundingChunks: any[];
}

/**
 * Fetches real transit data using Google Maps grounding.
 */
export const fetchRealWorldRoutes = async (location: string, coords?: { lat: number, lng: number }): Promise<RealWorldTransitResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Search for current public transit routes, bus lines, and train stations in or near "${location}". 
      Identify official transit providers and list specific active routes. 
      Provide destination information and use the googleMaps tool to find verified links to schedules or route maps.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: coords ? { latitude: coords.lat, longitude: coords.lng } : undefined
          }
        }
      }
    });

    return {
      text: response.text || "No verified transit information found for this location.",
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("TransitArc: Real-world fetch failed:", error);
    throw error;
  }
};

export const generateRoutes = async (city: string): Promise<TransitRoute[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 8 realistic and varied public transit routes for ${city}. Include a mix of Bus, Metro, and Train. Each route should have a unique name, price (between 2-15 USDC), and schedule. Return JSON only.`,
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

export const analyzeLocationFromImage = async (base64Image: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
          { text: "Identify the city or specific location/landmark in this image. Return ONLY the city or location name as a single string. If you cannot identify it, return 'Global'." }
        ]
      }
    });
    return response.text?.trim() || null;
  } catch (error) {
    console.error("TransitArc: Image analysis failed:", error);
    return null;
  }
};

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
