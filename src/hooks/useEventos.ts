
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Evento } from '@/lib/database-types';

export const useEventos = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEventos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .order('data_evento');
      
      if (error) throw error;
      setEventos((data || []) as Evento[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const addEvento = async (evento: Omit<Evento, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .insert([evento])
        .select()
        .single();
      
      if (error) throw error;
      setEventos(prev => [...prev, data as Evento]);
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao adicionar evento';
      setError(message);
      return { success: false, error: message };
    }
  };

  const updateEvento = async (id: string, updates: Partial<Evento>) => {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      setEventos(prev => prev.map(e => e.id === id ? data as Evento : e));
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar evento';
      setError(message);
      return { success: false, error: message };
    }
  };

  const deleteEvento = async (id: string) => {
    try {
      const { error } = await supabase
        .from('eventos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setEventos(prev => prev.filter(e => e.id !== id));
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar evento';
      setError(message);
      return { success: false, error: message };
    }
  };

  useEffect(() => {
    loadEventos();
  }, []);

  return {
    eventos,
    loading,
    error,
    addEvento,
    updateEvento,
    deleteEvento,
    refetch: loadEventos
  };
};
