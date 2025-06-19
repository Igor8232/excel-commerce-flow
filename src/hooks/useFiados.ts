
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Fiado, PagamentoFiado } from '@/lib/database-types';

export const useFiados = () => {
  const [fiados, setFiados] = useState<Fiado[]>([]);
  const [pagamentosFiado, setPagamentosFiado] = useState<PagamentoFiado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFiados = async () => {
    try {
      setLoading(true);
      const [fiadosResult, pagamentosResult] = await Promise.all([
        supabase.from('fiados').select('*').order('created_at', { ascending: false }),
        supabase.from('pagamentos_fiado').select('*').order('data_pagamento', { ascending: false })
      ]);
      
      if (fiadosResult.error) throw fiadosResult.error;
      if (pagamentosResult.error) throw pagamentosResult.error;
      
      setFiados(fiadosResult.data || []);
      setPagamentosFiado(pagamentosResult.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar fiados');
    } finally {
      setLoading(false);
    }
  };

  const addFiado = async (fiado: Omit<Fiado, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('fiados')
        .insert([fiado])
        .select()
        .single();
      
      if (error) throw error;
      setFiados(prev => [data, ...prev]);
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao adicionar fiado';
      setError(message);
      return { success: false, error: message };
    }
  };

  const updateFiado = async (id: string, updates: Partial<Fiado>) => {
    try {
      const { data, error } = await supabase
        .from('fiados')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      setFiados(prev => prev.map(f => f.id === id ? data : f));
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar fiado';
      setError(message);
      return { success: false, error: message };
    }
  };

  const deleteFiado = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fiados')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setFiados(prev => prev.filter(f => f.id !== id));
      setPagamentosFiado(prev => prev.filter(p => p.fiado_id !== id));
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar fiado';
      setError(message);
      return { success: false, error: message };
    }
  };

  const addPagamentoFiado = async (pagamento: Omit<PagamentoFiado, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('pagamentos_fiado')
        .insert([pagamento])
        .select()
        .single();
      
      if (error) throw error;
      
      // Atualizar fiado correspondente
      const fiado = fiados.find(f => f.id === pagamento.fiado_id);
      if (fiado) {
        const novoValorPago = fiado.valor_pago + pagamento.valor_pagamento;
        const novoValorPendente = Math.max(0, fiado.valor_total - novoValorPago);
        
        await updateFiado(fiado.id, {
          valor_pago: novoValorPago,
          valor_pendente: novoValorPendente
        });
      }
      
      setPagamentosFiado(prev => [data, ...prev]);
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao adicionar pagamento';
      setError(message);
      return { success: false, error: message };
    }
  };

  const deletePagamentoFiado = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pagamentos_fiado')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setPagamentosFiado(prev => prev.filter(p => p.id !== id));
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar pagamento';
      setError(message);
      return { success: false, error: message };
    }
  };

  useEffect(() => {
    loadFiados();
  }, []);

  return {
    fiados,
    pagamentosFiado,
    loading,
    error,
    addFiado,
    updateFiado,
    deleteFiado,
    addPagamentoFiado,
    deletePagamentoFiado,
    refetch: loadFiados
  };
};
