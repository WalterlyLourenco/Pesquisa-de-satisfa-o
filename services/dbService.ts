import { SurveyResponse } from '../types';

const DB_KEY = 'tickettrack_db_v2';

// Dados iniciais (Seed Data) atualizados para o novo formato
const SEED_DATA: SurveyResponse[] = [
  { id: '1', ticketId: '1001', customerId: 'joao@empresa.com', easeRating: 4, processRating: 5, solutionRating: 5, comment: 'Muito fácil abrir o chamado e o técnico chegou na hora.', timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: '2', ticketId: '1024', customerId: 'maria.s@client.org', easeRating: 2, processRating: 3, solutionRating: 4, comment: 'O sistema de abertura é confuso, mas o técnico resolveu.', timestamp: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: '3', ticketId: '1035', customerId: 'admin@tech.net', easeRating: 5, processRating: 5, solutionRating: 5, comment: 'Processo perfeito do início ao fim.', timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: '4', ticketId: '1042', customerId: 'roberto@loja.com', easeRating: 1, processRating: 2, solutionRating: 3, comment: 'Demorei para conseguir abrir o chamado e agendaram errado.', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: '5', ticketId: '1055', customerId: 'ana@startup.io', easeRating: 3, processRating: 3, solutionRating: 4, comment: 'O atendimento foi bom, mas o agendamento demorou.', timestamp: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: '6', ticketId: '1068', customerId: 'carlos.m@dev.co', easeRating: 5, processRating: 4, solutionRating: 5, comment: 'Rápido e eficiente.', timestamp: new Date().toISOString() },
  { id: '7', ticketId: '1072', customerId: 'julia@design.studio', easeRating: 2, processRating: 2, solutionRating: 2, comment: 'O técnico não trouxe as peças necessárias para a conclusão.', timestamp: new Date().toISOString() },
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

  // Verifica se um chamado já possui avaliação registrada (exata)
  checkTicketExists: (ticketId: string): boolean => {
    const allRecords = dbService.getAll();
    return allRecords.some(record => record.ticketId === ticketId.trim());
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

  // Remove um registro específico pelo ID
  remove: (id: string): SurveyResponse[] => {
    const currentData = dbService.getAll();
    const updatedData = currentData.filter(item => item.id !== id);
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(updatedData));
    } catch (e) {
      console.error("Erro ao salvar no banco de dados local", e);
    }
    return updatedData;
  },

  // Reseta o banco para o estado inicial (Seed Data)
  reset: (): SurveyResponse[] => {
    localStorage.setItem(DB_KEY, JSON.stringify(SEED_DATA));
    return SEED_DATA;
  },

  // Zera completamente o banco de dados
  clear: (): SurveyResponse[] => {
    const empty: SurveyResponse[] = [];
    localStorage.setItem(DB_KEY, JSON.stringify(empty));
    return empty;
  }
};