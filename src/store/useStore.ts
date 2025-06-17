
import { create } from 'zustand';
import { localStore, Cliente, Produto, Pedido, ItemPedido, Fiado, PagamentoFiado, DespesaEntrada, Comodato, Evento } from '@/lib/localStore';

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

  // Ações
  loadData: () => void;
  
  // Clientes
  addCliente: (cliente: Omit<Cliente, 'id'>) => void;
  updateCliente: (id: string, cliente: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
  
  // Produtos
  addProduto: (produto: Omit<Produto, 'id' | 'margem_lucro' | 'percentual_lucro' | 'total_vendido' | 'total_faturado'>) => void;
  updateProduto: (id: string, produto: Partial<Produto>) => void;
  deleteProduto: (id: string) => void;
  
  // Pedidos
  createPedido: (pedido: { cliente_id: string; itens: Array<{ produto_id: string; quantidade: number; preco_unitario: number }> }) => void;
  updatePedidoStatus: (id: string, status: 'pendente' | 'producao' | 'pronto' | 'entregue') => void;
  deletePedido: (id: string) => void;
  
  // Fiados
  addFiado: (fiado: Omit<Fiado, 'id'>) => void;
  updateFiado: (id: string, fiado: Partial<Fiado>) => void;
  deleteFiado: (id: string) => void;
  addPagamentoFiado: (pagamento: Omit<PagamentoFiado, 'id'>) => void;
  deletePagamentoFiado: (id: string) => void;
  
  // Despesas/Entradas
  addDespesaEntrada: (item: Omit<DespesaEntrada, 'id'>) => void;
  updateDespesaEntrada: (id: string, item: Partial<DespesaEntrada>) => void;
  deleteDespesaEntrada: (id: string) => void;
  
  // Comodatos
  addComodato: (comodato: Omit<Comodato, 'id' | 'valor_total' | 'quantidade_pendente'>) => void;
  updateComodato: (id: string, comodato: Partial<Comodato>) => void;
  deleteComodato: (id: string) => void;
  
  // Eventos
  addEvento: (evento: Omit<Evento, 'id'>) => void;
  updateEvento: (id: string, evento: Partial<Evento>) => void;
  deleteEvento: (id: string) => void;
  
  // Dashboard - Função centralizada ÚNICA para todos os cálculos
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
  
  // Função centralizada ÚNICA para calcular saldo
  calculateSaldo: () => number;
  
  getEstoqueBaixo: () => Produto[];
  getEventosHoje: () => Evento[];
  getEventosProximos: () => Evento[];
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

  loadData: () => {
    console.log('Carregando dados...');
    try {
      localStore.initializeData();
      
      const clientes = localStore.read<Cliente>('clientes') || [];
      const produtos = localStore.read<Produto>('produtos') || [];
      const pedidos = localStore.read<Pedido>('pedidos') || [];
      const itensPedido = localStore.read<ItemPedido>('itens_pedido') || [];
      const fiados = localStore.read<Fiado>('fiados') || [];
      const pagamentosFiado = localStore.read<PagamentoFiado>('pagamentos_fiado') || [];
      const despesasEntradas = localStore.read<DespesaEntrada>('despesas_entradas') || [];
      const comodatos = localStore.read<Comodato>('comodatos') || [];
      const eventos = localStore.read<Evento>('eventos') || [];
      
      // Verificar se precisa aplicar seed
      const needsSeed = clientes.length === 0 && produtos.length === 0 && despesasEntradas.length === 0;
      
      if (needsSeed) {
        console.log('Aplicando seed inicial...');
        localStore.applySeed();
        
        const seededClientes = localStore.read<Cliente>('clientes') || [];
        const seededProdutos = localStore.read<Produto>('produtos') || [];
        const seededDespesasEntradas = localStore.read<DespesaEntrada>('despesas_entradas') || [];
        
        set({
          clientes: seededClientes,
          produtos: seededProdutos,
          pedidos,
          itensPedido,
          fiados,
          pagamentosFiado,
          despesasEntradas: seededDespesasEntradas,
          comodatos,
          eventos,
        });
      } else {
        console.log('Dados carregados:', {
          clientes: clientes.length,
          produtos: produtos.length,
          pedidos: pedidos.length,
          despesasEntradas: despesasEntradas.length,
          eventos: eventos.length
        });
        
        set({
          clientes,
          produtos,
          pedidos,
          itensPedido,
          fiados,
          pagamentosFiado,
          despesasEntradas,
          comodatos,
          eventos,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // Se houver erro, inicializar com arrays vazios
      set({
        clientes: [],
        produtos: [],
        pedidos: [],
        itensPedido: [],
        fiados: [],
        pagamentosFiado: [],
        despesasEntradas: [],
        comodatos: [],
        eventos: [],
      });
    }
  },

  addCliente: (cliente) => {
    try {
      const newCliente = { ...cliente, id: Date.now().toString() };
      const clientes = [...get().clientes, newCliente];
      localStore.write('clientes', clientes);
      set({ clientes });
      console.log('Cliente adicionado:', newCliente.nome);
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
    }
  },

  updateCliente: (id, updates) => {
    try {
      const clientes = get().clientes.map(c => c.id === id ? { ...c, ...updates } : c);
      localStore.write('clientes', clientes);
      set({ clientes });
      console.log('Cliente atualizado:', id);
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
    }
  },

  deleteCliente: (id) => {
    try {
      const clientes = get().clientes.filter(c => c.id !== id);
      localStore.write('clientes', clientes);
      set({ clientes });
      console.log('Cliente deletado:', id);
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
    }
  },

  addProduto: (produto) => {
    try {
      const custo = Number(produto.custo_producao) || 0;
      const preco = Number(produto.preco_sugerido) || 0;
      const margem_lucro = preco - custo;
      const percentual_lucro = custo > 0 ? (margem_lucro / custo) * 100 : 0;
      
      const newProduto = { 
        ...produto, 
        id: Date.now().toString(),
        custo_producao: custo,
        preco_sugerido: preco,
        margem_lucro,
        percentual_lucro,
        total_vendido: 0,
        total_faturado: 0,
        estoque_atual: Number(produto.estoque_atual) || 0,
        estoque_minimo: Number(produto.estoque_minimo) || 0
      };
      const produtos = [...get().produtos, newProduto];
      localStore.write('produtos', produtos);
      set({ produtos });
      console.log('Produto adicionado:', newProduto.nome);
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
    }
  },

  updateProduto: (id, updates) => {
    try {
      const produtos = get().produtos.map(p => {
        if (p.id === id) {
          const updated = { ...p, ...updates };
          const custo = Number(updated.custo_producao) || 0;
          const preco = Number(updated.preco_sugerido) || 0;
          updated.custo_producao = custo;
          updated.preco_sugerido = preco;
          updated.margem_lucro = preco - custo;
          updated.percentual_lucro = custo > 0 ? ((preco - custo) / custo) * 100 : 0;
          updated.estoque_atual = Number(updated.estoque_atual) || 0;
          updated.estoque_minimo = Number(updated.estoque_minimo) || 0;
          return updated;
        }
        return p;
      });
      localStore.write('produtos', produtos);
      set({ produtos });
      console.log('Produto atualizado:', id);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
    }
  },

  deleteProduto: (id) => {
    try {
      const produtos = get().produtos.filter(p => p.id !== id);
      localStore.write('produtos', produtos);
      set({ produtos });
      console.log('Produto deletado:', id);
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
    }
  },

  createPedido: ({ cliente_id, itens }) => {
    try {
      const pedidoId = Date.now().toString();
      let valorTotal = 0;
      let valorLucro = 0;
      const novosItens: ItemPedido[] = [];
      const produtos = [...get().produtos];

      // Processar cada item do pedido
      itens.forEach((item, index) => {
        const produto = produtos.find(p => p.id === item.produto_id);
        if (produto) {
          const quantidade = Number(item.quantidade) || 0;
          const precoUnitario = Number(item.preco_unitario) || 0;
          const custoUnitario = Number(produto.custo_producao) || 0;
          
          const lucroItem = (precoUnitario - custoUnitario) * quantidade;
          const valorItem = precoUnitario * quantidade;
          
          valorTotal += valorItem;
          valorLucro += lucroItem;

          // Atualizar estoque e estatísticas do produto
          produto.estoque_atual = Math.max(0, produto.estoque_atual - quantidade);
          produto.total_vendido = (produto.total_vendido || 0) + quantidade;
          produto.total_faturado = (produto.total_faturado || 0) + valorItem;

          // Criar item do pedido
          novosItens.push({
            id: `${pedidoId}_${index}`,
            pedido_id: pedidoId,
            produto_id: item.produto_id,
            quantidade,
            preco_unitario: precoUnitario,
            custo_unitario: custoUnitario,
            lucro_item: lucroItem
          });
        }
      });

      // Criar pedido
      const novoPedido: Pedido = {
        id: pedidoId,
        cliente_id,
        data_pedido: new Date().toISOString().split('T')[0],
        valor_total: valorTotal,
        valor_lucro: valorLucro,
        status: 'pendente'
      };

      // Salvar tudo
      const pedidos = [...get().pedidos, novoPedido];
      const itensPedido = [...get().itensPedido, ...novosItens];
      
      localStore.write('pedidos', pedidos);
      localStore.write('itens_pedido', itensPedido);
      localStore.write('produtos', produtos);

      set({ pedidos, itensPedido, produtos });
      console.log('Pedido criado:', pedidoId, 'Valor total:', valorTotal, 'Lucro:', valorLucro);
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
    }
  },

  updatePedidoStatus: (id, status) => {
    try {
      const pedidos = get().pedidos.map(p => p.id === id ? { ...p, status } : p);
      localStore.write('pedidos', pedidos);
      set({ pedidos });
      console.log('Status do pedido atualizado:', id, status);
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
    }
  },

  deletePedido: (id) => {
    try {
      const pedidos = get().pedidos.filter(p => p.id !== id);
      const itensPedido = get().itensPedido.filter(i => i.pedido_id !== id);
      localStore.write('pedidos', pedidos);
      localStore.write('itens_pedido', itensPedido);
      set({ pedidos, itensPedido });
      console.log('Pedido deletado:', id);
    } catch (error) {
      console.error('Erro ao deletar pedido:', error);
    }
  },

  addFiado: (fiado) => {
    try {
      const newFiado = { 
        ...fiado, 
        id: Date.now().toString(),
        valor_total: Number(fiado.valor_total) || 0,
        valor_pago: Number(fiado.valor_pago) || 0,
        valor_pendente: Number(fiado.valor_pendente) || 0
      };
      const fiados = [...get().fiados, newFiado];
      localStore.write('fiados', fiados);
      set({ fiados });
      console.log('Fiado adicionado:', newFiado.id);
    } catch (error) {
      console.error('Erro ao adicionar fiado:', error);
    }
  },

  updateFiado: (id, updates) => {
    try {
      const fiados = get().fiados.map(f => f.id === id ? { 
        ...f, 
        ...updates,
        valor_total: Number(updates.valor_total ?? f.valor_total) || 0,
        valor_pago: Number(updates.valor_pago ?? f.valor_pago) || 0,
        valor_pendente: Number(updates.valor_pendente ?? f.valor_pendente) || 0
      } : f);
      localStore.write('fiados', fiados);
      set({ fiados });
      console.log('Fiado atualizado:', id);
    } catch (error) {
      console.error('Erro ao atualizar fiado:', error);
    }
  },

  deleteFiado: (id) => {
    try {
      const fiados = get().fiados.filter(f => f.id !== id);
      const pagamentosFiado = get().pagamentosFiado.filter(p => p.fiado_id !== id);
      localStore.write('fiados', fiados);
      localStore.write('pagamentos_fiado', pagamentosFiado);
      set({ fiados, pagamentosFiado });
      console.log('Fiado deletado:', id);
    } catch (error) {
      console.error('Erro ao deletar fiado:', error);
    }
  },

  addPagamentoFiado: (pagamento) => {
    try {
      const valorPagamento = Number(pagamento.valor_pagamento) || 0;
      const newPagamento = { 
        ...pagamento, 
        id: Date.now().toString(),
        valor_pagamento: valorPagamento
      };
      const pagamentosFiado = [...get().pagamentosFiado, newPagamento];
      localStore.write('pagamentos_fiado', pagamentosFiado);
      set({ pagamentosFiado });

      // Atualizar valor pendente do fiado
      const fiados = get().fiados.map(f => {
        if (f.id === pagamento.fiado_id) {
          const novoValorPago = (f.valor_pago || 0) + valorPagamento;
          const novoValorPendente = Math.max(0, (f.valor_total || 0) - novoValorPago);
          return { 
            ...f, 
            valor_pago: novoValorPago, 
            valor_pendente: novoValorPendente 
          };
        }
        return f;
      });
      localStore.write('fiados', fiados);
      set({ fiados });
      console.log('Pagamento de fiado adicionado:', newPagamento.id);
    } catch (error) {
      console.error('Erro ao adicionar pagamento de fiado:', error);
    }
  },

  deletePagamentoFiado: (id) => {
    try {
      const pagamentosFiado = get().pagamentosFiado.filter(p => p.id !== id);
      localStore.write('pagamentos_fiado', pagamentosFiado);
      set({ pagamentosFiado });
      console.log('Pagamento de fiado deletado:', id);
    } catch (error) {
      console.error('Erro ao deletar pagamento de fiado:', error);
    }
  },

  addDespesaEntrada: (item) => {
    try {
      const newItem = { 
        ...item, 
        id: Date.now().toString(),
        valor: Number(item.valor) || 0
      };
      const despesasEntradas = [...get().despesasEntradas, newItem];
      localStore.write('despesas_entradas', despesasEntradas);
      set({ despesasEntradas });
      console.log('Despesa/Entrada adicionada:', newItem.tipo, newItem.valor);
    } catch (error) {
      console.error('Erro ao adicionar despesa/entrada:', error);
    }
  },

  updateDespesaEntrada: (id, updates) => {
    try {
      const despesasEntradas = get().despesasEntradas.map(d => d.id === id ? { 
        ...d, 
        ...updates,
        valor: Number(updates.valor ?? d.valor) || 0
      } : d);
      localStore.write('despesas_entradas', despesasEntradas);
      set({ despesasEntradas });
      console.log('Despesa/Entrada atualizada:', id);
    } catch (error) {
      console.error('Erro ao atualizar despesa/entrada:', error);
    }
  },

  deleteDespesaEntrada: (id) => {
    try {
      const despesasEntradas = get().despesasEntradas.filter(d => d.id !== id);
      localStore.write('despesas_entradas', despesasEntradas);
      set({ despesasEntradas });
      console.log('Despesa/Entrada deletada:', id);
    } catch (error) {
      console.error('Erro ao deletar despesa/entrada:', error);
    }
  },

  addComodato: (comodato) => {
    try {
      const quantidade = Number(comodato.quantidade) || 0;
      const valorUnitario = Number(comodato.valor_unitario) || 0;
      const quantidadeVendida = Number(comodato.quantidade_vendida) || 0;
      const quantidadePaga = Number(comodato.quantidade_paga) || 0;
      
      const valor_total = quantidade * valorUnitario;
      const quantidade_pendente = Math.max(0, quantidade - quantidadeVendida - quantidadePaga);
      
      const newComodato = { 
        ...comodato, 
        id: Date.now().toString(),
        quantidade,
        valor_unitario: valorUnitario,
        quantidade_vendida: quantidadeVendida,
        quantidade_paga: quantidadePaga,
        valor_total,
        quantidade_pendente,
        valor_garantia: Number(comodato.valor_garantia) || 0
      };
      const comodatos = [...get().comodatos, newComodato];
      localStore.write('comodatos', comodatos);
      set({ comodatos });
      console.log('Comodato adicionado:', newComodato.id);
    } catch (error) {
      console.error('Erro ao adicionar comodato:', error);
    }
  },

  updateComodato: (id, updates) => {
    try {
      const comodatos = get().comodatos.map(c => {
        if (c.id === id) {
          const updated = { ...c, ...updates };
          const quantidade = Number(updated.quantidade) || 0;
          const valorUnitario = Number(updated.valor_unitario) || 0;
          const quantidadeVendida = Number(updated.quantidade_vendida) || 0;
          const quantidadePaga = Number(updated.quantidade_paga) || 0;
          
          updated.quantidade = quantidade;
          updated.valor_unitario = valorUnitario;
          updated.quantidade_vendida = quantidadeVendida;
          updated.quantidade_paga = quantidadePaga;
          updated.valor_total = quantidade * valorUnitario;
          updated.quantidade_pendente = Math.max(0, quantidade - quantidadeVendida - quantidadePaga);
          updated.valor_garantia = Number(updated.valor_garantia) || 0;
          
          return updated;
        }
        return c;
      });
      localStore.write('comodatos', comodatos);
      set({ comodatos });
      console.log('Comodato atualizado:', id);
    } catch (error) {
      console.error('Erro ao atualizar comodato:', error);
    }
  },

  deleteComodato: (id) => {
    try {
      const comodatos = get().comodatos.filter(c => c.id !== id);
      localStore.write('comodatos', comodatos);
      set({ comodatos });
      console.log('Comodato deletado:', id);
    } catch (error) {
      console.error('Erro ao deletar comodato:', error);
    }
  },

  addEvento: (evento) => {
    try {
      const newEvento = { 
        ...evento, 
        id: Date.now().toString(),
        valor: Number(evento.valor) || 0,
        data_criacao: new Date().toISOString().split('T')[0]
      };
      const eventos = [...get().eventos, newEvento];
      localStore.write('eventos', eventos);
      set({ eventos });
      console.log('Evento adicionado:', newEvento.titulo);
    } catch (error) {
      console.error('Erro ao adicionar evento:', error);
    }
  },

  updateEvento: (id, updates) => {
    try {
      const eventos = get().eventos.map(e => e.id === id ? { 
        ...e, 
        ...updates,
        valor: Number(updates.valor ?? e.valor) || 0
      } : e);
      localStore.write('eventos', eventos);
      set({ eventos });
      console.log('Evento atualizado:', id);
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
    }
  },

  deleteEvento: (id) => {
    try {
      const eventos = get().eventos.filter(e => e.id !== id);
      localStore.write('eventos', eventos);
      set({ eventos });
      console.log('Evento deletado:', id);
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
    }
  },

  // FUNÇÃO CENTRALIZADA ÚNICA PARA CALCULAR SALDO - ÚNICA FONTE DA VERDADE
  calculateSaldo: () => {
    try {
      const { pedidos, despesasEntradas } = get();
      
      const lucroTotal = (pedidos || []).reduce((sum, p) => sum + (Number(p.valor_lucro) || 0), 0);
      const entradas = (despesasEntradas || []).filter(d => d.tipo === 'Entradas').reduce((sum, d) => sum + (Number(d.valor) || 0), 0);
      const bonus = (despesasEntradas || []).filter(d => d.tipo === 'Bônus').reduce((sum, d) => sum + (Number(d.valor) || 0), 0);
      const despesas = (despesasEntradas || []).filter(d => d.tipo === 'Despesas').reduce((sum, d) => sum + (Number(d.valor) || 0), 0);
      
      const saldo = entradas + bonus - despesas + lucroTotal;
      console.log('Saldo calculado:', { entradas, bonus, despesas, lucroTotal, saldo });
      
      return saldo || 0;
    } catch (error) {
      console.error('Erro ao calcular saldo:', error);
      return 0;
    }
  },

  getDashboardData: () => {
    try {
      const { pedidos, despesasEntradas, produtos, eventos } = get();
      
      console.log('Calculando dashboard com:', {
        pedidos: (pedidos || []).length,
        despesasEntradas: (despesasEntradas || []).length,
        produtos: (produtos || []).length,
        eventos: (eventos || []).length
      });
      
      const lucroTotal = (pedidos || []).reduce((sum, p) => sum + (Number(p.valor_lucro) || 0), 0);
      const entradas = (despesasEntradas || []).filter(d => d.tipo === 'Entradas').reduce((sum, d) => sum + (Number(d.valor) || 0), 0);
      const bonus = (despesasEntradas || []).filter(d => d.tipo === 'Bônus').reduce((sum, d) => sum + (Number(d.valor) || 0), 0);
      const despesas = (despesasEntradas || []).filter(d => d.tipo === 'Despesas').reduce((sum, d) => sum + (Number(d.valor) || 0), 0);
      
      // Usar a função centralizada para calcular saldo - GARANTINDO CONSISTÊNCIA TOTAL
      const saldoTotal = get().calculateSaldo();
      
      const produtosEstoqueBaixo = (produtos || []).filter(p => (Number(p.estoque_atual) || 0) < (Number(p.estoque_minimo) || 0)).length;
      
      const hoje = new Date().toISOString().split('T')[0];
      const eventosHoje = (eventos || []).filter(e => e.data_evento === hoje && e.status === 'Pendente').length;
      
      const proximosDias = new Date();
      proximosDias.setDate(proximosDias.getDate() + 7);
      const eventosProximos = (eventos || []).filter(e => {
        try {
          const dataEvento = new Date(e.data_evento);
          const agora = new Date();
          return dataEvento > agora && dataEvento <= proximosDias && e.status === 'Pendente';
        } catch {
          return false;
        }
      }).length;

      const dashboardData = {
        saldo_total: saldoTotal,
        lucro_total: lucroTotal,
        total_entradas: entradas,
        total_bonus: bonus,
        total_despesas: despesas,
        produtos_estoque_baixo: produtosEstoqueBaixo,
        eventos_hoje: eventosHoje,
        eventos_proximos: eventosProximos
      };
      
      console.log('Dashboard calculado:', dashboardData);
      
      return dashboardData;
    } catch (error) {
      console.error('Erro ao calcular dashboard:', error);
      return {
        saldo_total: 0,
        lucro_total: 0,
        total_entradas: 0,
        total_bonus: 0,
        total_despesas: 0,
        produtos_estoque_baixo: 0,
        eventos_hoje: 0,
        eventos_proximos: 0
      };
    }
  },

  getEstoqueBaixo: () => {
    try {
      return (get().produtos || []).filter(p => (Number(p.estoque_atual) || 0) < (Number(p.estoque_minimo) || 0));
    } catch (error) {
      console.error('Erro ao obter estoque baixo:', error);
      return [];
    }
  },

  getEventosHoje: () => {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      return (get().eventos || []).filter(e => e.data_evento === hoje && e.status === 'Pendente');
    } catch (error) {
      console.error('Erro ao obter eventos hoje:', error);
      return [];
    }
  },

  getEventosProximos: () => {
    try {
      const proximosDias = new Date();
      proximosDias.setDate(proximosDias.getDate() + 7);
      const agora = new Date();
      return (get().eventos || []).filter(e =>  {
        try {
          const dataEvento = new Date(e.data_evento);
          return dataEvento > agora && dataEvento <= proximosDias && e.status === 'Pendente';
        } catch {
          return false;
        }
      });
    } catch (error) {
      console.error('Erro ao obter eventos próximos:', error);
      return [];
    }
  }
}));
