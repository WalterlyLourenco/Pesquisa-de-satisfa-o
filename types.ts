export interface SurveyResponse {
  id: string;
  ticketId: string;
  customerId: string;
  easeRating: number; // Facilidade de Abertura (1-5)
  processRating: number; // Direcionamento e Agendamento (1-5)
  solutionRating: number; // Ações e Conclusão (1-5)
  comment: string;
  timestamp: string;
}

export interface AIAnalysisResult {
  overallSentiment: 'Positivo' | 'Neutro' | 'Negativo';
  summary: string;
  painPoints: string[];
  recommendations: string[];
}

export enum ViewState {
  SURVEY = 'SURVEY',
  DASHBOARD = 'DASHBOARD',
}
