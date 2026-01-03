
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const estimateCalories = async (food: string, amount: string): Promise<number> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Estime as calorias para: ${amount} de ${food}. Baseie-se na tabela TACO ou fontes confiáveis. Retorne apenas o número inteiro.`,
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

    const data = JSON.parse(response.text || '{"calories": 0}');
    return data.calories || 0;
  } catch (error) {
    console.error("Error estimating calories:", error);
    return 0;
  }
};

export const suggestShoppingList = async (meals: any[]): Promise<string[]> => {
  if (meals.length === 0) return [];
  
  try {
    const mealList = meals.map(m => `${m.amount} de ${m.food}`).join(", ");
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `VOCÊ É UM ASSISTENTE DE NUTRIÇÃO. 
      Instrução: Analise o cardápio semanal abaixo e crie uma lista de compras consolidada com os ingredientes necessários para preparar essas refeições. 
      Seja prático: se a refeição é "Arroz com Feijão", inclua "Arroz" e "Feijão" na lista.
      Não inclua as quantidades na lista de compras, apenas o nome do item.
      Agrupe itens repetidos.
      
      Cardápio: [${mealList}]
      
      Retorne um objeto JSON com uma propriedade 'items' contendo o array de strings.`,
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
