
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
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
        pedidos: pedidosResult.data || [],
        itensPedido: itensPedidoResult.data || [],
        fiados: fiadosResult.data || [],
        pagamentosFiado: pagamentosFiadoResult.data || [],
        despesasEntradas: despesasEntradasResult.data || [],
        comodatos: comodatosResult.data || [],
        eventos: eventosResult.data || [],
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
