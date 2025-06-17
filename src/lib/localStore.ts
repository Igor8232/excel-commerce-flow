// Simulação do Excel Store usando localStorage
export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  cidade: string;
  estado: string;
  data_cadastro: string;
}

export interface Produto {
  id: string;
  nome: string;
  custo_producao: number;
  preco_sugerido: number;
  estoque_atual: number;
  estoque_minimo: number;
}

export interface Pedido {
  id: string;
  cliente_id: string;
  data_pedido: string;
  valor_total: number;
  valor_lucro: number;
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
  status: 'Emprestado' | 'Devolvido';
}

class LocalStore {
  private getKey(sheet: string): string {
    return `excel_commerce_${sheet}`;
  }

  read<T>(sheetName: string): T[] {
    try {
      const data = localStorage.getItem(this.getKey(sheetName));
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Erro ao ler dados de ${sheetName}:`, error);
      return [];
    }
  }

  write<T>(sheetName: string, rows: T[]): void {
    try {
      localStorage.setItem(this.getKey(sheetName), JSON.stringify(rows));
    } catch (error) {
      console.error(`Erro ao salvar dados em ${sheetName}:`, error);
    }
  }

  // Inicializar dados de exemplo se não existirem
  initializeData(): void {
    const sheets = ['clientes', 'produtos', 'pedidos', 'itens_pedido', 'fiados', 'pagamentos_fiado', 'despesas_entradas', 'comodatos'];
    
    sheets.forEach(sheet => {
      if (!localStorage.getItem(this.getKey(sheet))) {
        this.write(sheet, []);
      }
    });
  }

  // Aplicar seed inicial
  applySeed(): void {
    const hoje = new Date().toISOString().split('T')[0];
    
    // Seed de clientes
    this.write('clientes', [
      {
        id: Date.now().toString(),
        nome: 'Empresa Exemplo',
        telefone: '(11) 99999-9999',
        email: 'exemplo@email.com',
        cidade: 'São Paulo',
        estado: 'SP',
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
        estoque_atual: 10,
        estoque_minimo: 2
      }
    ]);

    // Seed de despesas/entradas
    this.write('despesas_entradas', [
      {
        id: (Date.now() + 2).toString(),
        tipo: 'Bônus' as const,
        descricao: 'Seed inicial',
        valor: 0,
        data_registro: hoje,
        categoria: 'Inicial'
      }
    ]);
  }

  // Método para exportar dados (simula download)
  exportData(): void {
    const allData = {
      clientes: this.read('clientes'),
      produtos: this.read('produtos'),
      pedidos: this.read('pedidos'),
      itens_pedido: this.read('itens_pedido'),
      fiados: this.read('fiados'),
      pagamentos_fiado: this.read('pagamentos_fiado'),
      despesas_entradas: this.read('despesas_entradas'),
      comodatos: this.read('comodatos')
    };

    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dados_comerciais_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

export const localStore = new LocalStore();
