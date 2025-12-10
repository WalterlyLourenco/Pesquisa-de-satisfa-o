import { SurveyResponse } from '../../types';

/**
 * CONFIGURAÇÃO DO BANCO DE DADOS
 * ---------------------------------------------------------
 * Para tornar o sistema 100% ONLINE e centralizado:
 * 1. Mude USE_CLOUD_DB para true.
 * 2. Insira a URL da sua API no campo API_URL.
 * 
 * Sugestões de Backends Gratuitos para teste:
 * - MockAPI.io
 * - JSONBin.io
 * - Firebase Realtime Database (via REST)
 * - Supabase
 */

const CONFIG = {
  USE_CLOUD_DB: false, // <-- MUDE PARA true QUANDO TIVER O LINK ABAIXO
  API_URL: 'https://seu-servidor-backend.com/api/surveys', // <-- SUA URL AQUI
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
   * Busca todos os registros do banco (Local ou Nuvem)
   */
  async getAll(): Promise<SurveyResponse[]> {
    // Simula latência de rede para realismo
    await new Promise(resolve => setTimeout(resolve, 600));

    if (CONFIG.USE_CLOUD_DB) {
      try {
        const response = await fetch(CONFIG.API_URL);
        if (!response.ok) throw new Error('Falha ao buscar dados da nuvem');
        const data = await response.json();
        // Assume que a API retorna um array de SurveyResponse
        return Array.isArray(data) ? data : []; 
      } catch (error) {
        console.error("ERRO CONEXÃO NUVEM:", error);
        // Fallback: Se a nuvem falhar, tenta mostrar local ou erro
        alert("Erro ao conectar ao servidor central. Verifique sua internet.");
        return [];
      }
    } else {
      // MODO OFFLINE / LOCAL
      const data = this.getLocalData();
      if (data.length === 0) {
        this.setLocalData(SEED_DATA);
        return SEED_DATA;
      }
      return data;
    }
  }

  /**
   * Verifica se um Ticket ID já existe (Evita duplicidade)
   */
  async checkTicketExists(ticketId: string): Promise<boolean> {
    const allData = await this.getAll();
    return allData.some(record => record.ticketId === ticketId.trim());
  }

  /**
   * Salva um novo registro
   */
  async add(record: SurveyResponse): Promise<SurveyResponse> {
    if (CONFIG.USE_CLOUD_DB) {
      try {
        const response = await fetch(CONFIG.API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record)
        });
        if (!response.ok) throw new Error('Falha ao salvar na nuvem');
        return await response.json();
      } catch (error) {
        console.error("ERRO AO SALVAR:", error);
        throw error;
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 800));
      const currentData = this.getLocalData();
      const newData = [...currentData, record];
      this.setLocalData(newData);
      return record;
    }
  }

  /**
   * Remove um registro pelo ID
   */
  async remove(id: string): Promise<boolean> {
    if (CONFIG.USE_CLOUD_DB) {
      try {
        // Assume endpoints RESTful padrão: DELETE /api/surveys/:id
        const response = await fetch(`${CONFIG.API_URL}/${id}`, {
          method: 'DELETE'
        });
        return response.ok;
      } catch (error) {
        console.error("ERRO AO DELETAR:", error);
        return false;
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 500));
      const currentData = this.getLocalData();
      const newData = currentData.filter(item => item.id !== id);
      this.setLocalData(newData);
      return true;
    }
  }

  /**
   * Limpa todo o banco de dados (Cuidado!)
   */
  async clear(): Promise<boolean> {
    if (CONFIG.USE_CLOUD_DB) {
      // Nota: Muitas APIs não permitem um "Delete All" direto por segurança.
      // Implementação depende do backend. Aqui simulamos deletar um a um ou rota especifica.
      alert("A limpeza total via API requer configuração de rota específica no backend.");
      return false;
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.setLocalData([]);
      return true;
    }
  }
}

export const database = new DatabaseService();