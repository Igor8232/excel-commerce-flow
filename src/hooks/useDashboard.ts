
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useDashboard = () => {
  const [data, setData] = useState({
    saldo_total: 0,
    lucro_total: 0,
    total_entradas: 0,
    total_bonus: 0,
    total_despesas: 0,
    produtos_estoque_baixo: 0,
    eventos_hoje: 0,
    eventos_proximos: 0
  });
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados dos pedidos para calcular lucro
      const { data: pedidos } = await supabase
        .from('pedidos')
        .select('valor_lucro');
      
      // Buscar despesas e entradas
      const { data: despesasEntradas } = await supabase
        .from('despesas_entradas')
        .select('tipo, valor');
      
      // Buscar produtos com estoque baixo
      const { data: produtos } = await supabase
        .from('produtos')
        .select('estoque_atual, estoque_minimo');
      
      // Buscar eventos próximos
      const hoje = new Date().toISOString().split('T')[0];
      const proximaData = new Date();
      proximaData.setDate(proximaData.getDate() + 7);
      
      const { data: eventosHoje } = await supabase
        .from('eventos')
        .select('id')
        .eq('data_evento', hoje)
        .eq('status', 'Pendente');
      
      const { data: eventosProximos } = await supabase
        .from('eventos')
        .select('id')
        .gte('data_evento', hoje)
        .lte('data_evento', proximaData.toISOString().split('T')[0])
        .eq('status', 'Pendente');

      // Calcular totais
      const lucroTotal = (pedidos || []).reduce((sum, p) => sum + (p.valor_lucro || 0), 0);
      const entradas = (despesasEntradas || []).filter(d => d.tipo === 'Entradas').reduce((sum, d) => sum + (d.valor || 0), 0);
      const bonus = (despesasEntradas || []).filter(d => d.tipo === 'Bônus').reduce((sum, d) => sum + (d.valor || 0), 0);
      const despesas = (despesasEntradas || []).filter(d => d.tipo === 'Despesas').reduce((sum, d) => sum + (d.valor || 0), 0);
      const produtosEstoqueBaixo = (produtos || []).filter(p => (p.estoque_atual || 0) < (p.estoque_minimo || 0)).length;
      
      const saldoTotal = entradas + bonus - despesas + lucroTotal;

      setData({
        saldo_total: saldoTotal,
        lucro_total: lucroTotal,
        total_entradas: entradas,
        total_bonus: bonus,
        total_despesas: despesas,
        produtos_estoque_baixo: produtosEstoqueBaixo,
        eventos_hoje: (eventosHoje || []).length,
        eventos_proximos: (eventosProximos || []).length
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return { data, loading, refetch: loadDashboardData };
};
