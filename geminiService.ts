
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
  // Tenta pegar de todas as fontes possíveis injetadas pelo Vite/Vercel
  const key = process.env.API_KEY || (import.meta as any).env?.VITE_API_KEY;
  
  if (!key || key === 'undefined' || key === 'null' || key === '') {
    addLog("ERRO CRÍTICO: API_KEY não encontrada no build. Verifique o Vercel.");
    return null;
  }
  return key;
};

export const estimateCalories = async (food: string, amount: string): Promise<number> => {
  if (!food || !amount) return 0;
  
  const apiKey = getApiKey();
  if (!apiKey) return 0;

  addLog(`Solicitando calorias para: ${amount} de ${food}...`);
  
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
    const calories = typeof data.calories === 'number' ? data.calories : 0;
    addLog(`Sucesso! Estimativa: ${calories} kcal.`);
    return calories;
  } catch (error: any) {
    const errorMsg = error?.message || "Erro desconhecido na API";
    addLog(`FALHA NA API: ${errorMsg}`);
    return 0;
  }
};

export const suggestShoppingList = async (meals: any[]): Promise<string[]> => {
  if (!meals || meals.length === 0) return [];
  const apiKey = getApiKey();
  if (!apiKey) return [];

  addLog("Gerando lista de compras via IA...");
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
    addLog(`Lista gerada com ${items.length} itens.`);
    return items;
  } catch (error: any) {
    addLog(`FALHA NA LISTA: ${error?.message || 'Erro desconhecido'}`);
    return [];
  }
};
