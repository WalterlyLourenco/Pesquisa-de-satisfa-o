import { SurveyResponse } from '../types';

const DB_KEY = 'tickettrack_db_v2';

// SEED DATA (Simulação de dados iniciais no servidor)
const SEED_DATA: SurveyResponse[] = [
  { id: '1', ticketId: '1001', customerId: 'joao@empresa.com', easeRating: 4, processRating: 5, solutionRating: 5, comment: 'Muito fácil abrir o chamado e o técnico chegou na hora.', timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: '2', ticketId: '1024', customerId: 'maria.s@client.org', easeRating: 2, processRating: 3, solutionRating: 4, comment: 'O sistema de abertura é confuso, mas o técnico resolveu.', timestamp: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: '3', ticketId: '1035', customerId: 'admin@tech.net', easeRating: 5, processRating: 5, solutionRating: 5, comment: 'Processo perfeito do início ao fim.', timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: '4', ticketId: '1042', customerId: 'roberto@loja.com', easeRating: 1, processRating: 2, solutionRating: 3, comment: 'Demorei para conseguir abrir o chamado e agendaram errado.', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: '5', ticketId: '1055', customerId: 'ana@startup.io', easeRating: 3, processRating: 3, solutionRating: 4, comment: 'O atendimento foi bom, mas o agendamento demorou.', timestamp: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: '6', ticketId: '1068', customerId: 'carlos.m@dev.co', easeRating: 5, processRating: 4, solutionRating: 5, comment: 'Rápido e eficiente.', timestamp: new Date().toISOString() },
  { id: '7', ticketId: '1072', customerId: 'julia@design.studio', easeRating: 2, processRating: 2, solutionRating: 2, comment: 'O técnico não trouxe as peças necessárias para a conclusão.', timestamp: new Date().toISOString() },
];

/**
 * MOCK CLOUD DATABASE SERVICE
 * 
 * Esta estrutura agora é ASSÍNCRONA (Async/Await).
 * Para conectar com um banco real (Firebase, Supabase, API REST),
 * você apenas substitui o conteúdo interno das funções abaixo pelas chamadas de API.
 */
export const dbService = {
  
  // GET: Busca todos os dados
  getAll: async (): Promise<SurveyResponse[]> => {
    // Simula delay de rede (Internet)
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // AQUI ENTRARIA: const response = await fetch('https://api.seubanco.com/surveys');
      const stored = localStorage.getItem(DB_KEY);
      if (!stored) {
        localStorage.setItem(DB_KEY, JSON.stringify(SEED_DATA));
        return SEED_DATA;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.error("Erro de conexão simulada", e);
      return [];
    }
  },

  // CHECK: Validação (geralmente feita no backend, mas simulada aqui)
  checkTicketExists: async (ticketId: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Pequeno delay
    
    const stored = localStorage.getItem(DB_KEY);
    const allRecords: SurveyResponse[] = stored ? JSON.parse(stored) : [];
    return allRecords.some(record => record.ticketId === ticketId.trim());
  },

  // POST: Salvar novo registro
  add: async (record: SurveyResponse): Promise<SurveyResponse> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Delay de salvamento

    const stored = localStorage.getItem(DB_KEY);
    const currentData: SurveyResponse[] = stored ? JSON.parse(stored) : [];
    
    const updatedData = [...currentData, record];
    localStorage.setItem(DB_KEY, JSON.stringify(updatedData));
    
    return record;
  },

  // DELETE: Remover registro
  remove: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 600));

    const stored = localStorage.getItem(DB_KEY);
    const currentData: SurveyResponse[] = stored ? JSON.parse(stored) : [];
    
    const updatedData = currentData.filter(item => item.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(updatedData));
    
    return true;
  },

  // DELETE ALL: Limpar banco
  clear: async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    localStorage.setItem(DB_KEY, JSON.stringify([]));
    return true;
  }
};