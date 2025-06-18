
export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  endereco: string;
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
  data_fiado: string;
  descricao: string;
  valor_total: number;
  valor_pago: number;
  valor_pendente: number;
}

export interface PagamentoFiado {
  id: string;
  fiado_id: string;
  data_pagamento: string;
  valor_pagamento: number;
}

export interface DespesaEntrada {
  id: string;
  tipo: 'Despesas' | 'Entradas' | 'Bônus';
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
}

export interface Comodato {
  id: string;
  cliente_id: string;
  produto: string;
  quantidade: number;
  quantidade_vendida: number;
  quantidade_paga: number;
  quantidade_pendente: number;
  valor_unitario: number;
  valor_total: number;
  valor_garantia: number;
  data_comodato: string;
  observacoes: string;
}

export interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  data_evento: string;
  hora_evento: string;
  valor: number;
  status: 'Pendente' | 'Concluído' | 'Cancelado';
  data_criacao: string;
}
