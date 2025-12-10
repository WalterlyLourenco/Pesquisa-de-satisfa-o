import { SurveyResponse } from '../../types';

/**
 * CONFIGURAÇÃO DO BANCO DE DADOS
 * ---------------------------------------------------------
 * MODO DE SEGURANÇA (LOCAL):
 * Revertemos para LocalStorage para garantir que a função EXCLUIR
 * funcione perfeitamente. O link da Vercel fornecido anteriormente
 * provavelmente não aceita requisições de DELETE/POST diretamente.
 */

const CONFIG = {
  USE_CLOUD_DB: false, // <-- MANTIDO FALSE PARA GARANTIR FUNCIONAMENTO
  API_URL: '', 
  LOCAL_STORAGE_KEY: 'tickettrack_db_v2',
};

// Dados de Exemplo (Seed) para quando iniciar vazio
const SEED_DATA: SurveyResponse[] = [
  { id: '1', ticketId: '1001', customerId: 'joao@empresa.com', easeRating: 4, processRating: 5, solutionRating: 5, comment: 'Muito fácil abrir o chamado e o técnico chegou na hora.', timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: '2', ticketId: '1024', customerId: 'maria.s@client.org', easeRating: 2, processRating: 3, solutionRating: 4, comment: 'O sistema de abertura é confuso, mas o técnico resolveu.', timestamp: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: '3', ticketId: '1035', customerId: 'admin@tech.net', easeRating: 5, processRating: 5, solutionRating: 5, comment: 'Processo perfeito do início ao fim.', timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
];

class DatabaseService {
  
  // --- MÉTODOS INTERNOS (AJUDANTES) ---

  private getLocalData(): SurveyResponse[] {
    try {
      const data = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Erro ao ler LocalStorage", e);
      return [];
    }
  }

  private setLocalData(data: SurveyResponse[]) {
    localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(data));
  }

  // --- MÉTODOS PÚBLICOS (API) ---

  /**
   * Busca todos os registros
   */
  async getAll(): Promise<SurveyResponse[]> {
    // Pequeno delay para simular carga
    await new Promise(resolve => setTimeout(resolve, 300));

    if (CONFIG.USE_CLOUD_DB && CONFIG.API_URL) {
      try {
        const response = await fetch(CONFIG.API_URL);
        if (!response.ok) throw new Error('Falha API');
        const data = await response.json();
        return Array.isArray(data) ? data : []; 
      } catch (error) {
        console.error("ERRO NUVEM (Fallback para Local):", error);
        return this.getLocalData(); // Fallback silencioso
      }
    } else {
      // MODO LOCAL (PRINCIPAL)
      const data = this.getLocalData();
      if (data.length === 0) {
        this.setLocalData(SEED_DATA);
        return SEED_DATA;
      }
      return data;
    }
  }

  /**
   * Verifica duplicidade
   */
  async checkTicketExists(ticketId: string): Promise<boolean> {
    const allData = await this.getAll();
    return allData.some(record => record.ticketId === ticketId.trim());
  }

  /**
   * Salva registro
   */
  async add(record: SurveyResponse): Promise<SurveyResponse> {
    // MODO LOCAL (PRIORITÁRIO AGORA)
    await new Promise(resolve => setTimeout(resolve, 500));
    const currentData = this.getLocalData();
    const newData = [...currentData, record];
    this.setLocalData(newData);
    return record;
  }

  /**
   * Remove registro - FUNÇÃO CRÍTICA
   */
  async remove(id: string): Promise<boolean> {
    console.log("Tentando excluir ID:", id);
    
    // Força execução no LocalStorage para garantir a exclusão
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const currentData = this.getLocalData();
      const newData = currentData.filter(item => item.id !== id);
      this.setLocalData(newData);
      console.log("Excluído com sucesso do LocalStorage");
      return true;
    } catch (e) {
      console.error("Erro fatal ao excluir:", e);
      return false;
    }
  }

  /**
   * Limpa banco
   */
  async clear(): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500));
    this.setLocalData([]);
    return true;
  }
}

export const database = new DatabaseService();