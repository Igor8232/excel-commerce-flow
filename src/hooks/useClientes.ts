
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Cliente } from '@/lib/database-types';

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      setClientes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const addCliente = async (cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([cliente])
        .select()
        .single();
      
      if (error) throw error;
      setClientes(prev => [...prev, data]);
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao adicionar cliente';
      setError(message);
      return { success: false, error: message };
    }
  };

  const updateCliente = async (id: string, updates: Partial<Cliente>) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      setClientes(prev => prev.map(c => c.id === id ? data : c));
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar cliente';
      setError(message);
      return { success: false, error: message };
    }
  };

  const deleteCliente = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setClientes(prev => prev.filter(c => c.id !== id));
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar cliente';
      setError(message);
      return { success: false, error: message };
    }
  };

  useEffect(() => {
    loadClientes();
  }, []);

  return {
    clientes,
    loading,
    error,
    addCliente,
    updateCliente,
    deleteCliente,
    refetch: loadClientes
  };
};
