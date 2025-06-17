
// Simulação do Excel Store usando localStorage com tratamento robusto de erros
export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  cpf_cnpj: string;
  email: string;
  endereco: string;
  cidade: string;
  estado: string;
  nome_fantasia?: string;
  observacao?: string;
  data_cadastro: string;
}

export interface Produto {
  id: string;
  nome: string;
  custo_producao: number;
  preco_sugerido: number;
  margem_lucro: number;
  percentual_lucro: number;
  estoque_atual: number;
  estoque_minimo: number;
  total_vendido: number;
  total_faturado: number;
}

export interface Pedido {
  id: string;
  cliente_id: string;
  data_pedido: string;
  valor_total: number;
  valor_lucro: number;
  status: 'pendente' | 'producao' | 'pronto' | 'entregue';
}

export interface ItemPedido {
  id: string;
  pedido_id: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  custo_unitario: number;
  lucro_item: number;
}

export interface Fiado {
  id: string;
  cliente_id: string;
  pedido_id: string;
  valor_total: number;
  valor_pago: number;
  valor_pendente: number;
  data_vencimento: string;
}

export interface PagamentoFiado {
  id: string;
  fiado_id: string;
  valor_pagamento: number;
  data_pagamento: string;
}

export interface DespesaEntrada {
  id: string;
  tipo: 'Despesas' | 'Entradas' | 'Bônus';
  descricao: string;
  valor: number;
  data_registro: string;
  categoria: string;
}

export interface Comodato {
  id: string;
  cliente_id: string;
  produto_id: string;
  quantidade: number;
  data_emprestimo: string;
  data_prev_devolucao: string;
  data_devolucao_real?: string;
  valor_garantia: number;
  valor_unitario: number;
  valor_total: number;
  quantidade_vendida: number;
  quantidade_paga: number;
  quantidade_pendente: number;
  observacoes?: string;
  status: 'Emprestado' | 'Devolvido' | 'Parcialmente Vendido' | 'Totalmente Vendido';
}

export interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  data_evento: string;
  hora_evento: string;
  tipo: 'Reunião' | 'Pagamento' | 'Entrega' | 'Evento' | 'Lembrete' | 'Outro';
  status: 'Pendente' | 'Concluído' | 'Cancelado';
  cliente_id?: string;
  valor?: number;
  observacoes?: string;
  data_criacao: string;
}

class LocalStore {
  private getKey(sheet: string): string {
    return `excel_commerce_${sheet}`;
  }

  read<T>(sheetName: string): T[] {
    try {
      const data = localStorage.getItem(this.getKey(sheetName));
      if (!data) {
        console.log(`Nenhum dado encontrado para ${sheetName}, retornando array vazio`);
        return [];
      }
      
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        console.warn(`Dados de ${sheetName} não são um array, retornando array vazio`);
        return [];
      }
      
      console.log(`Dados lidos de ${sheetName}:`, parsed.length, 'registros');
      return parsed;
    } catch (error) {
      console.error(`Erro ao ler dados de ${sheetName}:`, error);
      // Em caso de erro, tentar limpar dados corrompidos
      try {
        localStorage.removeItem(this.getKey(sheetName));
      } catch (cleanupError) {
        console.error(`Erro ao limpar dados corrompidos de ${sheetName}:`, cleanupError);
      }
      return [];
    }
  }

  write<T>(sheetName: string, rows: T[]): void {
    try {
      if (!Array.isArray(rows)) {
        console.error(`Tentativa de salvar dados não-array em ${sheetName}:`, rows);
        return;
      }
      
      const dataToSave = JSON.stringify(rows);
      localStorage.setItem(this.getKey(sheetName), dataToSave);
      console.log(`Dados salvos em ${sheetName}:`, rows.length, 'registros');
      
      // Verificar se os dados foram salvos corretamente
      const verification = localStorage.getItem(this.getKey(sheetName));
      if (!verification) {
        throw new Error(`Falha na verificação de salvamento para ${sheetName}`);
      }
    } catch (error) {
      console.error(`Erro ao salvar dados em ${sheetName}:`, error);
      
      // Tentar salvar novamente em caso de erro de quota
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('Quota do localStorage excedida, tentando limpar dados antigos...');
        this.clearOldData();
        
        // Tentar salvar novamente
        try {
          localStorage.setItem(this.getKey(sheetName), JSON.stringify(rows));
          console.log(`Dados salvos em ${sheetName} após limpeza:`, rows.length, 'registros');
        } catch (retryError) {
          console.error(`Erro ao salvar dados em ${sheetName} após limpeza:`, retryError);
        }
      }
    }
  }

  // Limpar dados antigos em caso de quota excedida
  private clearOldData(): void {
    try {
      const keysToCheck = Object.keys(localStorage);
      const oldKeys = keysToCheck.filter(key => 
        key.startsWith('excel_commerce_') && 
        !key.includes('clientes') && 
        !key.includes('produtos') && 
        !key.includes('despesas_entradas')
      );
      
      oldKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
          console.log('Dados antigos removidos:', key);
        } catch (error) {
          console.error('Erro ao remover dados antigos:', key, error);
        }
      });
    } catch (error) {
      console.error('Erro ao limpar dados antigos:', error);
    }
  }

  // Inicializar dados de exemplo se não existirem
  initializeData(): void {
    const sheets = ['clientes', 'produtos', 'pedidos', 'itens_pedido', 'fiados', 'pagamentos_fiado', 'despesas_entradas', 'comodatos', 'eventos'];
    
    sheets.forEach(sheet => {
      try {
        const existingData = localStorage.getItem(this.getKey(sheet));
        if (!existingData) {
          console.log(`Inicializando dados para ${sheet}`);
          this.write(sheet, []);
        }
      } catch (error) {
        console.error(`Erro ao inicializar dados para ${sheet}:`, error);
        this.write(sheet, []);
      }
    });
  }

  // Aplicar seed inicial
  applySeed(): void {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      
      // Seed de clientes
      this.write('clientes', [
        {
          id: Date.now().toString(),
          nome: 'Empresa Exemplo',
          telefone: '(11) 99999-9999',
          cpf_cnpj: '00.000.000/0001-00',
          email: 'exemplo@email.com',
          endereco: 'Rua Exemplo, 123',
          cidade: 'São Paulo',
          estado: 'SP',
          nome_fantasia: 'Exemplo Ltda',
          observacao: 'Cliente exemplo do sistema',
          data_cadastro: hoje
        }
      ]);

      // Seed de produtos
      this.write('produtos', [
        {
          id: (Date.now() + 1).toString(),
          nome: 'Produto Demo',
          custo_producao: 10.00,
          preco_sugerido: 25.00,
          margem_lucro: 15.00,
          percentual_lucro: 150,
          estoque_atual: 10,
          estoque_minimo: 2,
          total_vendido: 0,
          total_faturado: 0
        }
      ]);

      // Seed de despesas/entradas - com valor 0 para não afetar cálculos
      this.write('despesas_entradas', [
        {
          id: (Date.now() + 2).toString(),
          tipo: 'Bônus' as const,
          descricao: 'Seed inicial do sistema',
          valor: 0,
          data_registro: hoje,
          categoria: 'Sistema'
        }
      ]);

      console.log('Seed aplicado com sucesso');
    } catch (error) {
      console.error('Erro ao aplicar seed:', error);
    }
  }

  // Método para exportar dados (simula download)
  exportData(): void {
    try {
      const allData = {
        clientes: this.read('clientes'),
        produtos: this.read('produtos'),
        pedidos: this.read('pedidos'),
        itens_pedido: this.read('itens_pedido'),
        fiados: this.read('fiados'),
        pagamentos_fiado: this.read('pagamentos_fiado'),
        despesas_entradas: this.read('despesas_entradas'),
        comodatos: this.read('comodatos'),
        eventos: this.read('eventos')
      };

      const dataStr = JSON.stringify(allData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dados_comerciais_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      console.log('Dados exportados com sucesso');
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      alert('Erro ao exportar dados. Tente nov

amente.');
    }
  }

  // Método para verificar integridade dos dados
  verifyDataIntegrity(): boolean {
    try {
      const sheets = ['clientes', 'produtos', 'pedidos', 'itens_pedido', 'fiados', 'pagamentos_fiado', 'despesas_entradas', 'comodatos', 'eventos'];
      
      for (const sheet of sheets) {
        const data = this.read(sheet);
        if (!Array.isArray(data)) {
          console.error(`Dados de ${sheet} não são um array válido`);
          return false;
        }
      }
      
      console.log('Integridade dos dados verificada com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao verificar integridade dos dados:', error);
      return false;
    }
  }
}

export const localStore = new LocalStore();
