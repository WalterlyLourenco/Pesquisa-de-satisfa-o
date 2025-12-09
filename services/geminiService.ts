import { GoogleGenAI, Type } from "@google/genai";
import { SurveyResponse, AIAnalysisResult } from "../types";

const apiKey = process.env.API_KEY;

// Initialize the client only if the key exists to prevent immediate crashes, 
// though the app expects it to be present per requirements.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeSurveyData = async (data: SurveyResponse[]): Promise<AIAnalysisResult> => {
  if (!ai) {
    throw new Error("API Key não configurada.");
  }

  // Take the last 20 responses for analysis to keep context reasonable for this demo
  const recentData = data.slice(-20);
  
  const prompt = `
    Analise os seguintes dados de pesquisa de satisfação sobre atendimento de suporte técnico (focados em tempo de resposta e resolução).
    Dados: ${JSON.stringify(recentData)}
    
    Forneça um resumo executivo, identifique os principais pontos de dor relacionados à demora no atendimento, e sugira melhorias práticas.
    Retorne estritamente em JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallSentiment: {
              type: Type.STRING,
              enum: ["Positivo", "Neutro", "Negativo"],
              description: "Sentimento geral baseado nas avaliações e comentários."
            },
            summary: {
              type: Type.STRING,
              description: "Um resumo conciso de 1 parágrafo sobre o estado atual do atendimento."
            },
            painPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de principais reclamações ou gargalos identificados (ex: demora na triagem)."
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de ações sugeridas para melhorar o tempo de resposta."
            }
          },
          required: ["overallSentiment", "summary", "painPoints", "recommendations"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIAnalysisResult;
    }
    
    throw new Error("Não foi possível gerar a análise.");
  } catch (error) {
    console.error("Erro ao analisar dados com Gemini:", error);
    // Fallback in case of error
    return {
      overallSentiment: "Neutro",
      summary: "Não foi possível realizar a análise de IA no momento. Verifique sua chave de API.",
      painPoints: [],
      recommendations: []
    };
  }
};