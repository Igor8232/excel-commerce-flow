
import { Cliente, Produto, Pedido, ItemPedido, Fiado, PagamentoFiado, DespesaEntrada, Comodato, Evento } from './types';

const API_URL = 'http://localhost:3001/api';

class ExcelStore {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    try {
      console.log(`📡 Chamando API: ${API_URL}${endpoint}`);
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ Resposta da API recebida:`, data);
      return data;
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      throw error;
    }
  }

  async read<T>(sheet: string): Promise<T[]> {
    try {
      const data = await this.makeRequest(`/data/${sheet}`);
      console.log(`📖 Dados lidos de ${sheet}:`, data?.length || 0, 'registros');
      return data || [];
    } catch (error) {
      console.error(`❌ Erro ao ler ${sheet}:`, error);
      return [];
    }
  }

  async write<T>(sheet: string, data: T[]): Promise<boolean> {
    try {
      console.log(`💾 Salvando dados em ${sheet}:`, data?.length || 0, 'registros');
      await this.makeRequest(`/data/${sheet}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      console.log(`✅ Dados salvos em ${sheet} com sucesso`);
      return true;
    } catch (error) {
      console.error(`❌ Erro ao salvar ${sheet}:`, error);
      return false;
    }
  }

  async exportData(): Promise<void> {
    try {
      console.log('📤 Iniciando exportação de dados...');
      await this.makeRequest('/export', { method: 'POST' });
      console.log('✅ Dados exportados com sucesso');
    } catch (error) {
      console.error('❌ Erro ao exportar dados:', error);
      throw error;
    }
  }

  async verifyDataIntegrity(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/verify');
      console.log('🔍 Verificação de integridade:', response.valid ? '✅' : '❌');
      return response.valid;
    } catch (error) {
      console.error('❌ Erro na verificação de integridade:', error);
      return false;
    }
  }

  async initializeData(): Promise<void> {
    try {
      console.log('🔄 Inicializando estrutura de dados...');
      await this.makeRequest('/initialize', { method: 'POST' });
      console.log('✅ Estrutura inicializada');
    } catch (error) {
      console.error('❌ Erro ao inicializar dados:', error);
    }
  }

  async applySeed(): Promise<void> {
    try {
      console.log('🌱 Aplicando dados iniciais...');
      await this.makeRequest('/seed', { method: 'POST' });
      console.log('✅ Dados iniciais aplicados');
    } catch (error) {
      console.error('❌ Erro ao aplicar seed:', error);
    }
  }
}

export const excelStore = new ExcelStore();

// Tipos exportados para compatibilidade
export type { Cliente, Produto, Pedido, ItemPedido, Fiado, PagamentoFiado, DespesaEntrada, Comodato, Evento };
