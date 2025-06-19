
// Tipos atualizados para corresponder ao banco Supabase
export interface Cliente {
  id: string;
  nome: string;
  telefone?: string;
  cpf_cnpj?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  nome_fantasia?: string;
  observacao?: string;
  data_cadastro: string;
  created_at?: string;
  updated_at?: string;
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
  created_at?: string;
  updated_at?: string;
}

export interface Pedido {
  id: string;
  cliente_id: string;
  data_pedido: string;
  valor_total: number;
  valor_lucro: number;
  status: 'pendente' | 'producao' | 'pronto' | 'entregue';
  created_at?: string;
  updated_at?: string;
}

export interface ItemPedido {
  id: string;
  pedido_id: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  custo_unitario: number;
  lucro_item: number;
  created_at?: string;
}

export interface Fiado {
  id: string;
  cliente_id: string;
  pedido_id?: string;
  valor_total: number;
  valor_pago: number;
  valor_pendente: number;
  data_vencimento?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PagamentoFiado {
  id: string;
  fiado_id: string;
  valor_pagamento: number;
  data_pagamento: string;
  created_at?: string;
}

export interface DespesaEntrada {
  id: string;
  tipo: 'Despesas' | 'Entradas' | 'Bônus';
  descricao: string;
  valor: number;
  data_registro: string;
  categoria?: string;
  created_at?: string;
  updated_at?: string;
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
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Evento {
  id: string;
  titulo: string;
  descricao?: string;
  data_evento: string;
  hora_evento?: string;
  valor?: number;
  status: 'Pendente' | 'Concluído' | 'Cancelado';
  tipo?: 'Reunião' | 'Pagamento' | 'Entrega' | 'Evento' | 'Lembrete' | 'Outro';
  cliente_id?: string;
  observacoes?: string;
  data_criacao: string;
  created_at?: string;
  updated_at?: string;
}
