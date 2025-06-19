
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Produto } from '@/lib/database-types';

export const useProdutos = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProdutos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      setProdutos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const addProduto = async (produto: Omit<Produto, 'id' | 'margem_lucro' | 'percentual_lucro' | 'total_vendido' | 'total_faturado' | 'created_at' | 'updated_at'>) => {
    try {
      const custo = produto.custo_producao;
      const preco = produto.preco_sugerido;
      const margem_lucro = preco - custo;
      const percentual_lucro = custo > 0 ? (margem_lucro / custo) * 100 : 0;

      const produtoCompleto = {
        ...produto,
        margem_lucro,
        percentual_lucro,
        total_vendido: 0,
        total_faturado: 0
      };

      const { data, error } = await supabase
        .from('produtos')
        .insert([produtoCompleto])
        .select()
        .single();
      
      if (error) throw error;
      setProdutos(prev => [...prev, data]);
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao adicionar produto';
      setError(message);
      return { success: false, error: message };
    }
  };

  const updateProduto = async (id: string, updates: Partial<Produto>) => {
    try {
      // Recalcular margem e percentual se custo ou preço mudaram
      if (updates.custo_producao !== undefined || updates.preco_sugerido !== undefined) {
        const produto = produtos.find(p => p.id === id);
        if (produto) {
          const custo = updates.custo_producao ?? produto.custo_producao;
          const preco = updates.preco_sugerido ?? produto.preco_sugerido;
          updates.margem_lucro = preco - custo;
          updates.percentual_lucro = custo > 0 ? ((preco - custo) / custo) * 100 : 0;
        }
      }

      const { data, error } = await supabase
        .from('produtos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      setProdutos(prev => prev.map(p => p.id === id ? data : p));
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar produto';
      setError(message);
      return { success: false, error: message };
    }
  };

  const deleteProduto = async (id: string) => {
    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setProdutos(prev => prev.filter(p => p.id !== id));
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar produto';
      setError(message);
      return { success: false, error: message };
    }
  };

  useEffect(() => {
    loadProdutos();
  }, []);

  return {
    produtos,
    loading,
    error,
    addProduto,
    updateProduto,
    deleteProduto,
    refetch: loadProdutos
  };
};
