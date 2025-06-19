
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { DespesaEntrada } from '@/lib/database-types';

export const useDespesasEntradas = () => {
  const [despesasEntradas, setDespesasEntradas] = useState<DespesaEntrada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDespesasEntradas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('despesas_entradas')
        .select('*')
        .order('data_registro', { ascending: false });
      
      if (error) throw error;
      setDespesasEntradas(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar despesas/entradas');
    } finally {
      setLoading(false);
    }
  };

  const addDespesaEntrada = async (item: Omit<DespesaEntrada, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('despesas_entradas')
        .insert([item])
        .select()
        .single();
      
      if (error) throw error;
      setDespesasEntradas(prev => [data, ...prev]);
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao adicionar despesa/entrada';
      setError(message);
      return { success: false, error: message };
    }
  };

  const updateDespesaEntrada = async (id: string, updates: Partial<DespesaEntrada>) => {
    try {
      const { data, error } = await supabase
        .from('despesas_entradas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      setDespesasEntradas(prev => prev.map(d => d.id === id ? data : d));
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar despesa/entrada';
      setError(message);
      return { success: false, error: message };
    }
  };

  const deleteDespesaEntrada = async (id: string) => {
    try {
      const { error } = await supabase
        .from('despesas_entradas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setDespesasEntradas(prev => prev.filter(d => d.id !== id));
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar despesa/entrada';
      setError(message);
      return { success: false, error: message };
    }
  };

  useEffect(() => {
    loadDespesasEntradas();
  }, []);

  return {
    despesasEntradas,
    loading,
    error,
    addDespesaEntrada,
    updateDespesaEntrada,
    deleteDespesaEntrada,
    refetch: loadDespesasEntradas
  };
};
