
import { GoogleGenAI, Type } from "@google/genai";

// Use import.meta.env for Astro/Vite compatibility
const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  // @ts-ignore - Astro/Vite specific
  return import.meta.env?.PUBLIC_GEMINI_API_KEY || '';
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const summarizeDocument = async (content: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Please summarize the following operational document for the UBCO Marine Robotics team. Focus on key actions and safety implications: \n\n${content}`,
      config: {
        systemInstruction: "You are a specialized engineering team assistant for a marine robotics club. Your summaries must be concise, highlighting safety and technical requirements."
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to generate summary.";
  }
};

export const parseDigikeyQR = async (qrData: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Extract electronic component part information from this Digikey QR data string: "${qrData}". Provide Name, Manufacturer Part Number, and Quantity if available. Output ONLY JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            partNumber: { type: Type.STRING },
            quantity: { type: Type.NUMBER }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini QR Parsing Error:", error);
    return null;
  }
};

export const processMeetingAudio = async (transcription: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this meeting transcription and produce structured meeting minutes: \n\n${transcription}`,
      config: {
        systemInstruction: "You are a highly efficient meeting scribe for an engineering team. Convert transcriptions into structured JSON including: title, agenda, notes, and actionItems (with owner and deadline if mentioned). Output ONLY valid JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            agenda: { type: Type.STRING },
            notes: { type: Type.STRING },
            actionItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  task: { type: Type.STRING },
                  owner: { type: Type.STRING },
                  deadline: { type: Type.STRING }
                },
                required: ["task", "owner"]
              }
            }
          },
          required: ["title", "agenda", "notes", "actionItems"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Audio Processing Error:", error);
    return null;
  }
};

export const chatKnowledgeBase = async (query: string, context: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `As the UBCO Marine Robotics Intelligence Assistant, answer this query: "${query}" using the context below. If you don't know the answer, say you don't have that specific data record.\n\nCONTEXT:\n${context}`,
      config: {
        systemInstruction: "You are 'Scribe-V3', the AI intelligence system for UBC Okanagan Marine Robotics. You are professional, technical, and helpful. You have access to meeting minutes, SOPs, and project data."
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Intelligence systems are currently offline. Please contact an Executive.";
  }
};

export const generateWeeklyBriefing = async (data: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a concise weekly operational briefing for the team based on this raw data: ${data}. Focus on milestones achieved and upcoming critical deadlines.`,
      config: {
        systemInstruction: "You are a project manager. Create a professional, motivating summary of the week's progress for an engineering club."
      }
    });
    return response.text;
  } catch (error) {
    return "Weekly briefing synthesis failed.";
  }
};
