
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Evento } from '@/lib/database-types';

export const useEventos = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEventos = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Carregando eventos...');
      
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .order('data_evento');
      
      if (error) {
        console.error('Erro ao carregar eventos:', error);
        throw error;
      }
      
      console.log('Eventos carregados:', data?.length || 0);
      setEventos((data || []) as Evento[]);
    } catch (err) {
      console.error('Erro no loadEventos:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const addEvento = async (evento: Omit<Evento, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Adicionando evento:', evento);
      
      const { data, error } = await supabase
        .from('eventos')
        .insert([evento])
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao adicionar evento:', error);
        throw error;
      }
      
      console.log('Evento adicionado com sucesso:', data);
      setEventos(prev => [...prev, data as Evento]);
      return { success: true, data };
    } catch (err) {
      console.error('Erro no addEvento:', err);
      const message = err instanceof Error ? err.message : 'Erro ao adicionar evento';
      setError(message);
      return { success: false, error: message };
    }
  };

  const updateEvento = async (id: string, updates: Partial<Evento>) => {
    try {
      console.log('Atualizando evento:', id, updates);
      
      const { data, error } = await supabase
        .from('eventos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao atualizar evento:', error);
        throw error;
      }
      
      console.log('Evento atualizado com sucesso:', data);
      setEventos(prev => prev.map(e => e.id === id ? data as Evento : e));
      return { success: true, data };
    } catch (err) {
      console.error('Erro no updateEvento:', err);
      const message = err instanceof Error ? err.message : 'Erro ao atualizar evento';
      setError(message);
      return { success: false, error: message };
    }
  };

  const deleteEvento = async (id: string) => {
    try {
      console.log('Deletando evento:', id);
      
      const { error } = await supabase
        .from('eventos')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao deletar evento:', error);
        throw error;
      }
      
      console.log('Evento deletado com sucesso');
      setEventos(prev => prev.filter(e => e.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Erro no deleteEvento:', err);
      const message = err instanceof Error ? err.message : 'Erro ao deletar evento';
      setError(message);
      return { success: false, error: message };
    }
  };

  useEffect(() => {
    console.log('useEventos: Iniciando carregamento de eventos');
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
