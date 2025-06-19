
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { Cliente, Produto, Pedido, ItemPedido, Fiado, PagamentoFiado, DespesaEntrada, Comodato, Evento } from '@/lib/database-types';

interface Store {
  // Estado
  clientes: Cliente[];
  produtos: Produto[];
  pedidos: Pedido[];
  itensPedido: ItemPedido[];
  fiados: Fiado[];
  pagamentosFiado: PagamentoFiado[];
  despesasEntradas: DespesaEntrada[];
  comodatos: Comodato[];
  eventos: Evento[];
  isLoading: boolean;
  error: string | null;

  // Ações
  loadData: () => Promise<void>;
  clearError: () => void;
  
  // Métodos do Store de Pedidos
  createPedido: (data: { cliente_id: string; itens: any[] }) => Promise<void>;
  updatePedidoStatus: (id: string, status: string) => Promise<void>;
  updatePedido: (id: string, data: any) => Promise<void>;
  deletePedido: (id: string) => Promise<void>;

  // Métodos do Store de Fiados
  addFiado: (fiado: Omit<Fiado, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateFiado: (id: string, data: Partial<Fiado>) => Promise<void>;
  deleteFiado: (id: string) => Promise<void>;
  addPagamentoFiado: (pagamento: Omit<PagamentoFiado, 'id' | 'created_at'>) => Promise<void>;
  
  // Métodos do Store de Despesas/Entradas
  addDespesaEntrada: (despesa: Omit<DespesaEntrada, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateDespesaEntrada: (id: string, data: Partial<DespesaEntrada>) => Promise<void>;
  deleteDespesaEntrada: (id: string) => Promise<void>;
  calculateSaldo: () => number;
  
  // Dashboard helpers
  getDashboardData: () => {
    saldo_total: number;
    lucro_total: number;
    total_entradas: number;
    total_bonus: number;
    total_despesas: number;
    produtos_estoque_baixo: number;
    eventos_hoje: number;
    eventos_proximos: number;
  };
  getEstoqueBaixo: () => Produto[];
}

export const useStore = create<Store>((set, get) => ({
  clientes: [],
  produtos: [],
  pedidos: [],
  itensPedido: [],
  fiados: [],
  pagamentosFiado: [],
  despesasEntradas: [],
  comodatos: [],
  eventos: [],
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  loadData: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const [
        clientesResult,
        produtosResult,
        pedidosResult,
        itensPedidoResult,
        fiadosResult,
        pagamentosFiadoResult,
        despesasEntradasResult,
        comodatosResult,
        eventosResult
      ] = await Promise.all([
        supabase.from('clientes').select('*').order('nome'),
        supabase.from('produtos').select('*').order('nome'),
        supabase.from('pedidos').select('*').order('data_pedido', { ascending: false }),
        supabase.from('itens_pedido').select('*'),
        supabase.from('fiados').select('*').order('created_at', { ascending: false }),
        supabase.from('pagamentos_fiado').select('*').order('data_pagamento', { ascending: false }),
        supabase.from('despesas_entradas').select('*').order('data_registro', { ascending: false }),
        supabase.from('comodatos').select('*').order('data_comodato', { ascending: false }),
        supabase.from('eventos').select('*').order('data_evento')
      ]);

      set({
        clientes: clientesResult.data || [],
        produtos: produtosResult.data || [],
        pedidos: (pedidosResult.data || []) as Pedido[],
        itensPedido: itensPedidoResult.data || [],
        fiados: fiadosResult.data || [],
        pagamentosFiado: pagamentosFiadoResult.data || [],
        despesasEntradas: (despesasEntradasResult.data || []) as DespesaEntrada[],
        comodatos: comodatosResult.data || [],
        eventos: (eventosResult.data || []) as Evento[],
        isLoading: false
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      set({
        error: 'Erro ao carregar dados do sistema',
        isLoading: false
      });
    }
  },

  createPedido: async ({ cliente_id, itens }) => {
    try {
      // Calcular valores totais
      const { produtos } = get();
      let valorTotal = 0;
      let valorLucro = 0;

      const itensComCalculo = itens.map(item => {
        const produto = produtos.find(p => p.id === item.produto_id);
        const custoUnitario = produto?.custo_producao || 0;
        const subtotal = item.quantidade * item.preco_unitario;
        const lucroItem = item.quantidade * (item.preco_unitario - custoUnitario);
        
        valorTotal += subtotal;
        valorLucro += lucroItem;

        return {
          ...item,
          custo_unitario: custoUnitario,
          lucro_item: lucroItem
        };
      });

      // Criar pedido
      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .insert({
          cliente_id,
          valor_total: valorTotal,
          valor_lucro: valorLucro
        })
        .select()
        .single();

      if (pedidoError) throw pedidoError;

      // Criar itens do pedido
      const itensParaInserir = itensComCalculo.map(item => ({
        ...item,
        pedido_id: pedido.id
      }));

      const { error: itensError } = await supabase
        .from('itens_pedido')
        .insert(itensParaInserir);

      if (itensError) throw itensError;

      // Recarregar dados
      await get().loadData();
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      set({ error: 'Erro ao criar pedido' });
    }
  },

  updatePedidoStatus: async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      await get().loadData();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      set({ error: 'Erro ao atualizar status do pedido' });
    }
  },

  updatePedido: async (id: string, data: any) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      await get().loadData();
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      set({ error: 'Erro ao atualizar pedido' });
    }
  },

  deletePedido: async (id: string) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await get().loadData();
    } catch (error) {
      console.error('Erro ao excluir pedido:', error);
      set({ error: 'Erro ao excluir pedido' });
    }
  },

  addFiado: async (fiado) => {
    try {
      const { error } = await supabase
        .from('fiados')
        .insert(fiado);

      if (error) throw error;
      await get().loadData();
    } catch (error) {
      console.error('Erro ao adicionar fiado:', error);
      set({ error: 'Erro ao adicionar fiado' });
    }
  },

  updateFiado: async (id: string, data: Partial<Fiado>) => {
    try {
      const { error } = await supabase
        .from('fiados')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      await get().loadData();
    } catch (error) {
      console.error('Erro ao atualizar fiado:', error);
      set({ error: 'Erro ao atualizar fiado' });
    }
  },

  deleteFiado: async (id: string) => {
    try {
      const { error } = await supabase
        .from('fiados')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await get().loadData();
    } catch (error) {
      console.error('Erro ao excluir fiado:', error);
      set({ error: 'Erro ao excluir fiado' });
    }
  },

  addPagamentoFiado: async (pagamento) => {
    try {
      // Adicionar pagamento
      const { error: pagamentoError } = await supabase
        .from('pagamentos_fiado')
        .insert(pagamento);

      if (pagamentoError) throw pagamentoError;

      // Buscar fiado atual
      const { data: fiado, error: fiadoError } = await supabase
        .from('fiados')
        .select('*')
        .eq('id', pagamento.fiado_id)
        .single();

      if (fiadoError) throw fiadoError;

      // Calcular novos valores
      const novoValorPago = fiado.valor_pago + pagamento.valor_pagamento;
      const novoValorPendente = Math.max(0, fiado.valor_total - novoValorPago);

      // Atualizar fiado
      const { error: updateError } = await supabase
        .from('fiados')
        .update({
          valor_pago: novoValorPago,
          valor_pendente: novoValorPendente
        })
        .eq('id', pagamento.fiado_id);

      if (updateError) throw updateError;

      await get().loadData();
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      set({ error: 'Erro ao registrar pagamento' });
    }
  },

  addDespesaEntrada: async (despesa) => {
    try {
      const { error } = await supabase
        .from('despesas_entradas')
        .insert(despesa);

      if (error) throw error;
      await get().loadData();
    } catch (error) {
      console.error('Erro ao adicionar despesa/entrada:', error);
      set({ error: 'Erro ao adicionar despesa/entrada' });
    }
  },

  updateDespesaEntrada: async (id: string, data: Partial<DespesaEntrada>) => {
    try {
      const { error } = await supabase
        .from('despesas_entradas')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      await get().loadData();
    } catch (error) {
      console.error('Erro ao atualizar despesa/entrada:', error);
      set({ error: 'Erro ao atualizar despesa/entrada' });
    }
  },

  deleteDespesaEntrada: async (id: string) => {
    try {
      const { error } = await supabase
        .from('despesas_entradas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await get().loadData();
    } catch (error) {
      console.error('Erro ao excluir despesa/entrada:', error);
      set({ error: 'Erro ao excluir despesa/entrada' });
    }
  },

  calculateSaldo: () => {
    const { pedidos, despesasEntradas } = get();
    
    const lucroTotal = pedidos.reduce((sum, p) => sum + (p.valor_lucro || 0), 0);
    const entradas = despesasEntradas.filter(d => d.tipo === 'Entradas').reduce((sum, d) => sum + (d.valor || 0), 0);
    const bonus = despesasEntradas.filter(d => d.tipo === 'Bônus').reduce((sum, d) => sum + (d.valor || 0), 0);
    const despesas = despesasEntradas.filter(d => d.tipo === 'Despesas').reduce((sum, d) => sum + (d.valor || 0), 0);
    
    return entradas + bonus - despesas + lucroTotal;
  },

  getDashboardData: () => {
    const { pedidos, despesasEntradas, produtos, eventos } = get();
    
    const lucroTotal = pedidos.reduce((sum, p) => sum + (p.valor_lucro || 0), 0);
    const entradas = despesasEntradas.filter(d => d.tipo === 'Entradas').reduce((sum, d) => sum + (d.valor || 0), 0);
    const bonus = despesasEntradas.filter(d => d.tipo === 'Bônus').reduce((sum, d) => sum + (d.valor || 0), 0);
    const despesas = despesasEntradas.filter(d => d.tipo === 'Despesas').reduce((sum, d) => sum + (d.valor || 0), 0);
    
    const saldoTotal = entradas + bonus - despesas + lucroTotal;
    const produtosEstoqueBaixo = produtos.filter(p => (p.estoque_atual || 0) < (p.estoque_minimo || 0)).length;
    
    const hoje = new Date().toISOString().split('T')[0];
    const eventosHoje = eventos.filter(e => e.data_evento === hoje && e.status === 'Pendente').length;
    
    const proximosDias = new Date();
    proximosDias.setDate(proximosDias.getDate() + 7);
    const eventosProximos = eventos.filter(e => {
      const dataEvento = new Date(e.data_evento);
      const agora = new Date();
      return dataEvento > agora && dataEvento <= proximosDias && e.status === 'Pendente';
    }).length;

    return {
      saldo_total: saldoTotal,
      lucro_total: lucroTotal,
      total_entradas: entradas,
      total_bonus: bonus,
      total_despesas: despesas,
      produtos_estoque_baixo: produtosEstoqueBaixo,
      eventos_hoje: eventosHoje,
      eventos_proximos: eventosProximos
    };
  },

  getEstoqueBaixo: () => {
    const { produtos } = get();
    return produtos.filter(p => (p.estoque_atual || 0) < (p.estoque_minimo || 0));
  }
}));
