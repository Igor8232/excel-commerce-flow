
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Comodato } from '@/lib/database-types';

export const useComodatos = () => {
  const [comodatos, setComodatos] = useState<Comodato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComodatos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comodatos')
        .select('*')
        .order('data_comodato', { ascending: false });
      
      if (error) throw error;
      setComodatos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar comodatos');
    } finally {
      setLoading(false);
    }
  };

  const addComodato = async (comodato: Omit<Comodato, 'id' | 'valor_total' | 'quantidade_pendente' | 'created_at' | 'updated_at'>) => {
    try {
      const valor_total = comodato.quantidade * comodato.valor_unitario;
      const quantidade_pendente = Math.max(0, comodato.quantidade - comodato.quantidade_vendida - comodato.quantidade_paga);
      
      const comodatoCompleto = {
        ...comodato,
        valor_total,
        quantidade_pendente
      };

      const { data, error } = await supabase
        .from('comodatos')
        .insert([comodatoCompleto])
        .select()
        .single();
      
      if (error) throw error;
      setComodatos(prev => [data, ...prev]);
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao adicionar comodato';
      setError(message);
      return { success: false, error: message };
    }
  };

  const updateComodato = async (id: string, updates: Partial<Comodato>) => {
    try {
      // Recalcular valores se necessário
      const comodato = comodatos.find(c => c.id === id);
      if (comodato && (updates.quantidade !== undefined || updates.valor_unitario !== undefined || updates.quantidade_vendida !== undefined || updates.quantidade_paga !== undefined)) {
        const quantidade = updates.quantidade ?? comodato.quantidade;
        const valorUnitario = updates.valor_unitario ?? comodato.valor_unitario;
        const quantidadeVendida = updates.quantidade_vendida ?? comodato.quantidade_vendida;
        const quantidadePaga = updates.quantidade_paga ?? comodato.quantidade_paga;
        
        updates.valor_total = quantidade * valorUnitario;
        updates.quantidade_pendente = Math.max(0, quantidade - quantidadeVendida - quantidadePaga);
      }

      const { data, error } = await supabase
        .from('comodatos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      setComodatos(prev => prev.map(c => c.id === id ? data : c));
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar comodato';
      setError(message);
      return { success: false, error: message };
    }
  };

  const deleteComodato = async (id: string) => {
    try {
      const { error } = await supabase
        .from('comodatos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setComodatos(prev => prev.filter(c => c.id !== id));
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar comodato';
      setError(message);
      return { success: false, error: message };
    }
  };

  useEffect(() => {
    loadComodatos();
  }, []);

  return {
    comodatos,
    loading,
    error,
    addComodato,
    updateComodato,
    deleteComodato,
    refetch: loadComodatos
  };
};
