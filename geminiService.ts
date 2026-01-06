
import { GoogleGenAI, Type } from "@google/genai";

declare var process: any;

export const estimateCalories = async (food: string, amount: string): Promise<number> => {
  if (!food || !amount) return 0;
  
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("NutriControl: API_KEY não configurada no ambiente.");
    return 0;
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Estime as calorias para a seguinte refeição: "${amount} de ${food}".`,
      config: {
        systemInstruction: "VOCÊ É UM NUTRICIONISTA EXPERIENTE. Use a tabela TACO ou USDA como base. Retorne obrigatoriamente um objeto JSON com o campo 'calories' como um NÚMERO INTEIRO. Se o alimento for vago, dê a melhor estimativa baseada em porções médias.",
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

    const text = response.text;
    if (!text) return 0;
    
    const data = JSON.parse(text);
    return typeof data.calories === 'number' ? data.calories : 0;
  } catch (error) {
    console.error("Erro na estimativa de calorias via Gemini:", error);
    return 0;
  }
};

export const suggestShoppingList = async (meals: any[]): Promise<string[]> => {
  if (!meals || meals.length === 0) return [];
  
  const apiKey = process.env.API_KEY;
  if (!apiKey) return [];

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const mealList = meals.map(m => `${m.amount} de ${m.food}`).join(", ");
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Crie uma lista de compras baseada em: [${mealList}].`,
      config: {
        systemInstruction: "VOCÊ É UM ASSISTENTE DE NUTRIÇÃO. Crie uma lista de compras consolidada. Extraia apenas os ingredientes brutos necessários. Agrupe itens repetidos e retorne um JSON com a lista 'items'.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["items"]
        }
      }
    });
    
    const text = response.text;
    if (!text) return [];
    
    const data = JSON.parse(text);
    return data.items || [];
  } catch (error) {
    console.error("Erro ao sugerir lista de compras:", error);
    return [];
  }
};
