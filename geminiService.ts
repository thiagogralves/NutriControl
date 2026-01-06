
import { GoogleGenAI, Type } from "@google/genai";

declare var process: any;

// Sistema de log global para depuração em mobile
if (!(window as any).appLogs) (window as any).appLogs = [];
const addLog = (msg: string) => {
  const timestamp = new Date().toLocaleTimeString();
  (window as any).appLogs.unshift(`[${timestamp}] ${msg}`);
  console.log(`[NutriControl] ${msg}`);
};

const getApiKey = () => {
  const key = process.env.API_KEY || (import.meta as any).env?.VITE_API_KEY;
  
  if (!key || key === 'undefined' || key === 'null' || key === '') {
    addLog("ERRO: API_KEY não configurada no Vercel.");
    return null;
  }
  return key;
};

export const estimateCalories = async (food: string, amount: string): Promise<number> => {
  if (!food || !amount) return 0;
  
  const apiKey = getApiKey();
  if (!apiKey) return 0;

  addLog(`IA: Estimando "${amount} de ${food}"...`);
  
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Estime as calorias para a seguinte refeição: "${amount} de ${food}".`,
      config: {
        systemInstruction: "Retorne apenas um JSON com o campo 'calories' sendo um número inteiro.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            calories: { type: Type.INTEGER }
          },
          required: ["calories"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    const calories = data.calories || 0;
    addLog(`IA: Sucesso (${calories} kcal).`);
    return calories;
  } catch (error: any) {
    let msg = error?.message || "";
    if (msg.includes("leaked")) {
      addLog("ALERTA CRÍTICO: Sua API Key foi BLOQUEADA pelo Google por vazamento. Você precisa gerar uma nova no Google AI Studio e atualizar no Vercel.");
    } else if (msg.includes("API key not valid")) {
      addLog("ERRO: API Key inválida. Verifique se copiou corretamente.");
    } else {
      addLog(`IA FALHOU: ${msg.substring(0, 50)}...`);
    }
    return 0;
  }
};

export const suggestShoppingList = async (meals: any[]): Promise<string[]> => {
  if (!meals || meals.length === 0) return [];
  const apiKey = getApiKey();
  if (!apiKey) return [];

  addLog("IA: Gerando lista de compras...");
  try {
    const ai = new GoogleGenAI({ apiKey });
    const mealList = meals.map(m => `${m.amount} de ${m.food}`).join(", ");
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Crie uma lista de compras para: [${mealList}].`,
      config: {
        systemInstruction: "Retorne um JSON com a lista 'items'.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["items"]
        }
      }
    });
    
    const data = JSON.parse(response.text || '{}');
    const items = data.items || [];
    addLog(`IA: Lista gerada (${items.length} itens).`);
    return items;
  } catch (error: any) {
    if (error?.message?.includes("leaked")) {
      addLog("ALERTA: Chave bloqueada por vazamento.");
    } else {
      addLog("IA: Falha ao gerar lista.");
    }
    return [];
  }
};
