export interface SurveyResponse {
  id: string;
  ticketId: string;
  customerId: string;
  speedRating: number; // 1-5
  resolutionRating: number; // 1-5
  qualityRating: number; // 1-5
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
