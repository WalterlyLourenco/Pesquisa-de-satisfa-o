import { SurveyResponse } from '../types';

const DB_KEY = 'tickettrack_db_v1';

// Dados iniciais (Seed Data) para o banco não começar vazio na demonstração
const SEED_DATA: SurveyResponse[] = [
  { id: '1', ticketId: 'TKT-1001', customerId: 'joao@empresa.com', speedRating: 4, resolutionRating: 5, qualityRating: 5, comment: 'Resolvido rápido, muito bom.', timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: '2', ticketId: 'TKT-1024', customerId: 'maria.s@client.org', speedRating: 2, resolutionRating: 3, qualityRating: 4, comment: 'Demorou muito para responder o primeiro email.', timestamp: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: '3', ticketId: 'TKT-1035', customerId: 'admin@tech.net', speedRating: 5, resolutionRating: 5, qualityRating: 5, comment: 'Excelente atendimento do suporte.', timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: '4', ticketId: 'TKT-1042', customerId: 'roberto@loja.com', speedRating: 1, resolutionRating: 2, qualityRating: 3, comment: 'Fiquei 3 dias esperando uma resposta simples.', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: '5', ticketId: 'TKT-1055', customerId: 'ana@startup.io', speedRating: 3, resolutionRating: 3, qualityRating: 4, comment: 'O técnico foi bom, mas o processo é burocrático.', timestamp: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: '6', ticketId: 'TKT-1068', customerId: 'carlos.m@dev.co', speedRating: 5, resolutionRating: 4, qualityRating: 5, comment: 'Rápido e eficiente.', timestamp: new Date().toISOString() },
  { id: '7', ticketId: 'TKT-1072', customerId: 'julia@design.studio', speedRating: 2, resolutionRating: 2, qualityRating: 2, comment: 'Não resolveram meu problema na primeira tentativa.', timestamp: new Date().toISOString() },
];

export const dbService = {
  // Inicializa o banco ou retorna os dados existentes
  getAll: (): SurveyResponse[] => {
    try {
      const stored = localStorage.getItem(DB_KEY);
      if (!stored) {
        localStorage.setItem(DB_KEY, JSON.stringify(SEED_DATA));
        return SEED_DATA;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.error("Erro ao ler banco de dados local", e);
      return SEED_DATA;
    }
  },

  // Insere um novo registro no banco
  add: (record: SurveyResponse): SurveyResponse[] => {
    const currentData = dbService.getAll();
    const updatedData = [...currentData, record];
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(updatedData));
    } catch (e) {
      console.error("Erro ao salvar no banco de dados local", e);
      alert("Erro: Armazenamento cheio ou indisponível.");
    }
    return updatedData;
  },

  // Reseta o banco para o estado inicial (útil para testes)
  reset: (): SurveyResponse[] => {
    localStorage.setItem(DB_KEY, JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
};
