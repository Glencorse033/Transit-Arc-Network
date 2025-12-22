import { GoogleGenAI, Type } from "@google/genai";
import { TransitRoute, AnalyticsData, ChatMessage } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

// Helper to get image based on destination type
const getDestinationImage = (type: string): string => {
  const images: Record<string, string> = {
    'URBAN': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80', // City
    'NATURE': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80', // Mountains/Nature
    'COASTAL': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', // Beach
    'AIRPORT': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80', // Airport
    'SUBURBAN': 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800&q=80', // Street
  };
  return images[type] || images['URBAN'];
};

export const generateRoutes = async (city: string): Promise<TransitRoute[]> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `Generate 5 realistic public transit routes for ${city}. 
    Include a mix of Bus, Metro, and Train. 
    Prices should be reasonable (between 1.5 and 15.0 USDC).
    Classify the destination vibe as one of: URBAN, NATURE, COASTAL, AIRPORT, SUBURBAN.
    Return JSON only.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
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
    return [
      { id: "r1", name: "Metro Blue Line", origin: "Central Station", destination: "Airport Terminal 1", price: 5.50, schedule: "Every 5 mins", type: "METRO", imageUrl: getDestinationImage('AIRPORT') },
      { id: "r2", name: "Bus 101", origin: "Downtown", destination: "North Hills", price: 2.00, schedule: "Every 15 mins", type: "BUS", imageUrl: getDestinationImage('URBAN') },
    ];
  }
};

export const getChatCommuterMessage = async (route: TransitRoute, history: ChatMessage[]): Promise<ChatMessage> => {
  try {
    const model = "gemini-2.5-flash";
    const chatContext = history.map(m => `${m.sender}: ${m.text}`).join('\n');
    const prompt = `You are a passenger on the ${route.name} transit route (traveling from ${route.origin} to ${route.destination}). 
    The current chat history is:\n${chatContext}\n
    Write a short, realistic 1-sentence message to the group. You could be complaining about a slight delay, mentioning the nice weather, asking if anyone left an umbrella, or just greeting the group. 
    Pick a random name for yourself (e.g. Commuter_92, Alex, TechVoyager).
    Return JSON with "sender" and "text" fields.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
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
    return {
      id: 'fallback',
      sender: 'Commuter_Anon',
      senderAddress: '0x123...456',
      text: 'Great weather for a ride today!',
      timestamp: Date.now(),
      isAi: true
    };
  }
};

export const generateAnalytics = async (): Promise<AnalyticsData> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `Generate mock analytics data for a transit operator dashboard. JSON only.`;
    const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
    return JSON.parse(response.text) as AnalyticsData;
  } catch (error) {
    return {
      dailyRevenue: [{ date: "Mon", amount: 1200 }, { date: "Tue", amount: 1450 }],
      popularRoutes: [{ name: "Metro Blue Line", ticketsSold: 850 }],
      totalRevenue: 15420.50,
      activeRiders: 342,
    };
  }
};

export const generateVaultInsights = async (balance: number, points: number): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    const response = await ai.models.generateContent({ model, contents: `Short tip for transit app user with ${balance} USDC balance. 1 sentence.` });
    return response.text || "Deposit more to earn higher yield!";
  } catch (e) {
    return "Lock your USDC for rewards!";
  }
};