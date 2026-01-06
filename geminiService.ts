
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const estimateCalories = async (food: string, amount: string): Promise<number> => {
  if (!food || !amount) return 0;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `VOCÊ É UM NUTRICIONISTA EXPERIENTE. 
      Instrução: Estime as calorias para a seguinte refeição: "${amount} de ${food}". 
      
      REGRAS:
      - Use a tabela TACO ou USDA como base.
      - Retorne obrigatoriamente um objeto JSON com o campo "calories".
      - "calories" deve ser um NÚMERO INTEIRO.
      - Se o alimento for vago, dê a melhor estimativa baseada em porções médias.
      
      Exemplo de retorno: {"calories": 300}`,
      config: {
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

    const text = response.text?.trim() || '{"calories": 0}';
    const data = JSON.parse(text);
    return typeof data.calories === 'number' ? data.calories : 0;
  } catch (error) {
    console.error("Erro na estimativa de calorias via Gemini:", error);
    return 0;
  }
};

export const suggestShoppingList = async (meals: any[]): Promise<string[]> => {
  if (!meals || meals.length === 0) return [];
  
  try {
    const mealList = meals.map(m => `${m.amount} de ${m.food}`).join(", ");
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `VOCÊ É UM ASSISTENTE DE NUTRIÇÃO. 
      Crie uma lista de compras consolidada baseada nas seguintes refeições: [${mealList}].
      Extraia apenas os ingredientes brutos necessários para preparar esses pratos. Agrupe itens repetidos.`,
      config: {
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
    
    const text = response.text?.trim() || '{"items": []}';
    const data = JSON.parse(text);
    return data.items || [];
  } catch (error) {
    console.error("Erro ao sugerir lista de compras:", error);
    return [];
  }
};
