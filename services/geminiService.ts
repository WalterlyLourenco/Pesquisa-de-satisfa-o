import { GoogleGenAI, Type } from "@google/genai";
import { SurveyResponse, AIAnalysisResult } from "../types";

// Initialize the client directly using process.env.API_KEY as per guidelines.
// The environment variable is assumed to be present and valid.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSurveyData = async (data: SurveyResponse[]): Promise<AIAnalysisResult> => {
  // Take the last 20 responses for analysis to keep context reasonable for this demo
  const recentData = data.slice(-20);
  
  const prompt = `
    Analise os seguintes dados de pesquisa de qualidade de suporte técnico.
    Os dados contêm avaliações (1-5) para:
    1. Facilidade de Abertura (easeRating): Quão fácil foi abrir o chamado.
    2. Direcionamento e Agendamento (processRating): Se foi para o time certo e na hora certa.
    3. Solução Técnica (solutionRating): Qualidade das ações tomadas para resolver.
    
    Dados: ${JSON.stringify(recentData)}
    
    Forneça um resumo executivo focado na eficiência do processo, identifique gargalos (ex: dificuldade de abrir chamado ou erro de agendamento), e sugira melhorias.
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
              description: "Um resumo conciso de 1 parágrafo sobre a qualidade do processo e técnica."
            },
            painPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de principais problemas (ex: Agendamento falho, Técnico sem peça)."
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de ações para melhorar o fluxo de abertura e resolução."
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