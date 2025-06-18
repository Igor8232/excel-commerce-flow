import { create } from 'zustand';
import { excelStore } from '@/lib/excelStore';
import type { Cliente, Produto, Pedido, ItemPedido, Fiado, PagamentoFiado, DespesaEntrada, Comodato, Evento } from '@/lib/types';

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
  
  // Clientes
  addCliente: (cliente: Omit<Cliente, 'id'>) => Promise<boolean>;
  updateCliente: (id: string, cliente: Partial<Cliente>) => Promise<boolean>;
  deleteCliente: (id: string) => Promise<boolean>;
  
  // Produtos
  addProduto: (produto: Omit<Produto, 'id' | 'margem_lucro' | 'percentual_lucro' | 'total_vendido' | 'total_faturado'>) => Promise<boolean>;
  updateProduto: (id: string, produto: Partial<Produto>) => Promise<boolean>;
  deleteProduto: (id: string) => Promise<boolean>;
  
  // Pedidos
  createPedido: (pedido: { cliente_id: string; itens: Array<{ produto_id: string; quantidade: number; preco_unitario: number }> }) => Promise<boolean>;
  updatePedido: (id: string, pedido: Partial<Pedido>) => Promise<boolean>;
  updatePedidoStatus: (id: string, status: 'pendente' | 'producao' | 'pronto' | 'entregue') => Promise<boolean>;
  deletePedido: (id: string) => Promise<boolean>;
  
  // Fiados
  addFiado: (fiado: Omit<Fiado, 'id'>) => Promise<boolean>;
  updateFiado: (id: string, fiado: Partial<Fiado>) => Promise<boolean>;
  deleteFiado: (id: string) => Promise<boolean>;
  addPagamentoFiado: (pagamento: Omit<PagamentoFiado, 'id'>) => Promise<boolean>;
  deletePagamentoFiado: (id: string) => Promise<boolean>;
  
  // Despesas/Entradas
  addDespesaEntrada: (item: Omit<DespesaEntrada, 'id'>) => Promise<boolean>;
  updateDespesaEntrada: (id: string, item: Partial<DespesaEntrada>) => Promise<boolean>;
  deleteDespesaEntrada: (id: string) => Promise<boolean>;
  
  // Comodatos
  addComodato: (comodato: Omit<Comodato, 'id' | 'valor_total' | 'quantidade_pendente'>) => Promise<boolean>;
  updateComodato: (id: string, comodato: Partial<Comodato>) => Promise<boolean>;
  deleteComodato: (id: string) => Promise<boolean>;
  
  // Eventos
  addEvento: (evento: Omit<Evento, 'id'>) => Promise<boolean>;
  updateEvento: (id: string, evento: Partial<Evento>) => Promise<boolean>;
  deleteEvento: (id: string) => Promise<boolean>;
  
  // Dashboard
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
  
  calculateSaldo: () => number;
  getEstoqueBaixo: () => Produto[];
  getEventosHoje: () => Evento[];
  getEventosProximos: () => Evento[];
  
  // Utilitários
  clearError: () => void;
  exportData: () => Promise<void>;
  validateDataIntegrity: () => Promise<boolean>;
}

const safeParseNumber = (value: any): number => {
  const parsed = Number(value);
  return isNaN(parsed) ? 0 : parsed;
};

const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

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
    console.log('🔄 Iniciando carregamento de dados...');
    set({ isLoading: true, error: null });
    
    try {
      await excelStore.initializeData();
      
      const [
        clientes,
        produtos,
        pedidos,
        itensPedido,
        fiados,
        pagamentosFiado,
        despesasEntradas,
        comodatos,
        eventos
      ] = await Promise.all([
        excelStore.read<Cliente>('clientes'),
        excelStore.read<Produto>('produtos'),
        excelStore.read<Pedido>('pedidos'),
        excelStore.read<ItemPedido>('itens_pedido'),
        excelStore.read<Fiado>('fiados'),
        excelStore.read<PagamentoFiado>('pagamentos_fiado'),
        excelStore.read<DespesaEntrada>('despesas_entradas'),
        excelStore.read<Comodato>('comodatos'),
        excelStore.read<Evento>('eventos')
      ]);
      
      // Verificar se precisa aplicar seed
      const needsSeed = clientes.length === 0 && produtos.length === 0 && despesasEntradas.length === 0;
      
      if (needsSeed) {
        console.log('🌱 Aplicando dados iniciais...');
        await excelStore.applySeed();
        
        const [seededClientes, seededProdutos, seededDespesasEntradas] = await Promise.all([
          excelStore.read<Cliente>('clientes'),
          excelStore.read<Produto>('produtos'),
          excelStore.read<DespesaEntrada>('despesas_entradas')
        ]);
        
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
          isLoading: false
        });
      } else {
        console.log('✅ Dados carregados:', {
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
          isLoading: false
        });
      }
      
      // Verificar integridade dos dados
      await get().validateDataIntegrity();
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
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
        isLoading: false,
        error: 'Erro ao carregar dados do sistema. Verifique se a API está rodando.'
      });
    }
  },

  addCliente: async (cliente) => {
    try {
      const newCliente = { 
        ...cliente, 
        id: generateId(),
        data_cadastro: cliente.data_cadastro || new Date().toISOString().split('T')[0]
      };
      const clientes = [...get().clientes, newCliente];
      const success = await excelStore.write('clientes', clientes);
      if (success) {
        set({ clientes });
        console.log('✅ Cliente adicionado:', newCliente.nome);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao adicionar cliente:', error);
      set({ error: 'Erro ao adicionar cliente' });
      return false;
    }
  },

  updateCliente: async (id, updates) => {
    try {
      const clientes = get().clientes.map(c => c.id === id ? { ...c, ...updates } : c);
      const success = await excelStore.write('clientes', clientes);
      if (success) {
        set({ clientes });
        console.log('✅ Cliente atualizado:', id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao atualizar cliente:', error);
      set({ error: 'Erro ao atualizar cliente' });
      return false;
    }
  },

  deleteCliente: async (id) => {
    try {
      const clientes = get().clientes.filter(c => c.id !== id);
      const success = await excelStore.write('clientes', clientes);
      if (success) {
        set({ clientes });
        console.log('✅ Cliente deletado:', id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao deletar cliente:', error);
      set({ error: 'Erro ao deletar cliente' });
      return false;
    }
  },

  addProduto: async (produto) => {
    try {
      const custo = safeParseNumber(produto.custo_producao);
      const preco = safeParseNumber(produto.preco_sugerido);
      const margem_lucro = preco - custo;
      const percentual_lucro = custo > 0 ? (margem_lucro / custo) * 100 : 0;
      
      const newProduto = { 
        ...produto, 
        id: generateId(),
        custo_producao: custo,
        preco_sugerido: preco,
        margem_lucro,
        percentual_lucro,
        total_vendido: 0,
        total_faturado: 0,
        estoque_atual: safeParseNumber(produto.estoque_atual),
        estoque_minimo: safeParseNumber(produto.estoque_minimo)
      };
      const produtos = [...get().produtos, newProduto];
      const success = await excelStore.write('produtos', produtos);
      if (success) {
        set({ produtos });
        console.log('✅ Produto adicionado:', newProduto.nome);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao adicionar produto:', error);
      set({ error: 'Erro ao adicionar produto' });
      return false;
    }
  },

  updateProduto: async (id, updates) => {
    try {
      const produtos = get().produtos.map(p => {
        if (p.id === id) {
          const updated = { ...p, ...updates };
          const custo = safeParseNumber(updated.custo_producao);
          const preco = safeParseNumber(updated.preco_sugerido);
          updated.custo_producao = custo;
          updated.preco_sugerido = preco;
          updated.margem_lucro = preco - custo;
          updated.percentual_lucro = custo > 0 ? ((preco - custo) / custo) * 100 : 0;
          updated.estoque_atual = safeParseNumber(updated.estoque_atual);
          updated.estoque_minimo = safeParseNumber(updated.estoque_minimo);
          return updated;
        }
        return p;
      });
      const success = await excelStore.write('produtos', produtos);
      if (success) {
        set({ produtos });
        console.log('✅ Produto atualizado:', id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao atualizar produto:', error);
      set({ error: 'Erro ao atualizar produto' });
      return false;
    }
  },

  deleteProduto: async (id) => {
    try {
      const produtos = get().produtos.filter(p => p.id !== id);
      const success = await excelStore.write('produtos', produtos);
      if (success) {
        set({ produtos });
        console.log('✅ Produto deletado:', id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao deletar produto:', error);
      set({ error: 'Erro ao deletar produto' });
      return false;
    }
  },

  createPedido: async ({ cliente_id, itens }) => {
    try {
      const pedidoId = generateId();
      let valorTotal = 0;
      let valorLucro = 0;
      const novosItens: ItemPedido[] = [];
      const produtos = [...get().produtos];

      // Processar cada item do pedido
      itens.forEach((item, index) => {
        const produto = produtos.find(p => p.id === item.produto_id);
        if (produto) {
          const quantidade = safeParseNumber(item.quantidade);
          const precoUnitario = safeParseNumber(item.preco_unitario);
          const custoUnitario = safeParseNumber(produto.custo_producao);
          
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
      
      const [pedidoSuccess, itensSuccess, produtoSuccess] = await Promise.all([
        excelStore.write('pedidos', pedidos),
        excelStore.write('itens_pedido', itensPedido),
        excelStore.write('produtos', produtos)
      ]);

      if (pedidoSuccess && itensSuccess && produtoSuccess) {
        set({ pedidos, itensPedido, produtos });
        console.log('✅ Pedido criado:', pedidoId, 'Valor total:', valorTotal, 'Lucro:', valorLucro);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao criar pedido:', error);
      set({ error: 'Erro ao criar pedido' });
      return false;
    }
  },

  updatePedido: async (id, updates) => {
    try {
      const pedidos = get().pedidos.map(p => p.id === id ? { 
        ...p, 
        ...updates,
        valor_total: safeParseNumber(updates.valor_total ?? p.valor_total),
        valor_lucro: safeParseNumber(updates.valor_lucro ?? p.valor_lucro)
      } : p);
      const success = await excelStore.write('pedidos', pedidos);
      if (success) {
        set({ pedidos });
        console.log('✅ Pedido atualizado:', id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao atualizar pedido:', error);
      set({ error: 'Erro ao atualizar pedido' });
      return false;
    }
  },

  updatePedidoStatus: async (id, status) => {
    try {
      const pedidos = get().pedidos.map(p => p.id === id ? { ...p, status } : p);
      const success = await excelStore.write('pedidos', pedidos);
      if (success) {
        set({ pedidos });
        console.log('✅ Status do pedido atualizado:', id, status);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao atualizar status do pedido:', error);
      set({ error: 'Erro ao atualizar status do pedido' });
      return false;
    }
  },

  deletePedido: async (id) => {
    try {
      const pedidos = get().pedidos.filter(p => p.id !== id);
      const itensPedido = get().itensPedido.filter(i => i.pedido_id !== id);
      const [pedidoSuccess, itensSuccess] = await Promise.all([
        excelStore.write('pedidos', pedidos),
        excelStore.write('itens_pedido', itensPedido)
      ]);
      if (pedidoSuccess && itensSuccess) {
        set({ pedidos, itensPedido });
        console.log('✅ Pedido deletado:', id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao deletar pedido:', error);
      set({ error: 'Erro ao deletar pedido' });
      return false;
    }
  },

  addFiado: async (fiado) => {
    try {
      const newFiado = { 
        ...fiado, 
        id: generateId(),
        valor_total: safeParseNumber(fiado.valor_total),
        valor_pago: safeParseNumber(fiado.valor_pago),
        valor_pendente: safeParseNumber(fiado.valor_pendente)
      };
      const fiados = [...get().fiados, newFiado];
      const success = await excelStore.write('fiados', fiados);
      if (success) {
        set({ fiados });
        console.log('✅ Fiado adicionado:', newFiado.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao adicionar fiado:', error);
      set({ error: 'Erro ao adicionar fiado' });
      return false;
    }
  },

  updateFiado: async (id, updates) => {
    try {
      const fiados = get().fiados.map(f => f.id === id ? { 
        ...f, 
        ...updates,
        valor_total: safeParseNumber(updates.valor_total ?? f.valor_total),
        valor_pago: safeParseNumber(updates.valor_pago ?? f.valor_pago),
        valor_pendente: safeParseNumber(updates.valor_pendente ?? f.valor_pendente)
      } : f);
      const success = await excelStore.write('fiados', fiados);
      if (success) {
        set({ fiados });
        console.log('✅ Fiado atualizado:', id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao atualizar fiado:', error);
      set({ error: 'Erro ao atualizar fiado' });
      return false;
    }
  },

  deleteFiado: async (id) => {
    try {
      const fiados = get().fiados.filter(f => f.id !== id);
      const pagamentosFiado = get().pagamentosFiado.filter(p => p.fiado_id !== id);
      const [fiadoSuccess, pagamentoSuccess] = await Promise.all([
        excelStore.write('fiados', fiados),
        excelStore.write('pagamentos_fiado', pagamentosFiado)
      ]);
      if (fiadoSuccess && pagamentoSuccess) {
        set({ fiados, pagamentosFiado });
        console.log('✅ Fiado deletado:', id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao deletar fiado:', error);
      set({ error: 'Erro ao deletar fiado' });
      return false;
    }
  },

  addPagamentoFiado: async (pagamento) => {
    try {
      const valorPagamento = safeParseNumber(pagamento.valor_pagamento);
      const newPagamento = { 
        ...pagamento, 
        id: generateId(),
        valor_pagamento: valorPagamento
      };
      const pagamentosFiado = [...get().pagamentosFiado, newPagamento];
      
      // Atualizar valor pendente do fiado
      const fiados = get().fiados.map(f => {
        if (f.id === pagamento.fiado_id) {
          const novoValorPago = safeParseNumber(f.valor_pago) + valorPagamento;
          const novoValorPendente = Math.max(0, safeParseNumber(f.valor_total) - novoValorPago);
          return { 
            ...f, 
            valor_pago: novoValorPago, 
            valor_pendente: novoValorPendente 
          };
        }
        return f;
      });
      
      const [pagamentoSuccess, fiadoSuccess] = await Promise.all([
        excelStore.write('pagamentos_fiado', pagamentosFiado),
        excelStore.write('fiados', fiados)
      ]);
      
      if (pagamentoSuccess && fiadoSuccess) {
        set({ pagamentosFiado, fiados });
        console.log('✅ Pagamento de fiado adicionado:', newPagamento.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao adicionar pagamento de fiado:', error);
      set({ error: 'Erro ao adicionar pagamento de fiado' });
      return false;
    }
  },

  deletePagamentoFiado: async (id) => {
    try {
      const pagamentosFiado = get().pagamentosFiado.filter(p => p.id !== id);
      const success = await excelStore.write('pagamentos_fiado', pagamentosFiado);
      if (success) {
        set({ pagamentosFiado });
        console.log('✅ Pagamento de fiado deletado:', id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao deletar pagamento de fiado:', error);
      set({ error: 'Erro ao deletar pagamento de fiado' });
      return false;
    }
  },

  addDespesaEntrada: async (item) => {
    try {
      const newItem = { 
        ...item, 
        id: generateId(),
        valor: safeParseNumber(item.valor)
      };
      const despesasEntradas = [...get().despesasEntradas, newItem];
      const success = await excelStore.write('despesas_entradas', despesasEntradas);
      if (success) {
        set({ despesasEntradas });
        console.log('✅ Despesa/Entrada adicionada:', newItem.tipo, newItem.valor);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao adicionar despesa/entrada:', error);
      set({ error: 'Erro ao adicionar despesa/entrada' });
      return false;
    }
  },

  updateDespesaEntrada: async (id, updates) => {
    try {
      const despesasEntradas = get().despesasEntradas.map(d => d.id === id ? { 
        ...d, 
        ...updates,
        valor: safeParseNumber(updates.valor ?? d.valor)
      } : d);
      const success = await excelStore.write('despesas_entradas', despesasEntradas);
      if (success) {
        set({ despesasEntradas });
        console.log('✅ Despesa/Entrada atualizada:', id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao atualizar despesa/entrada:', error);
      set({ error: 'Erro ao atualizar despesa/entrada' });
      return false;
    }
  },

  deleteDespesaEntrada: async (id) => {
    try {
      const despesasEntradas = get().despesasEntradas.filter(d => d.id !== id);
      const success = await excelStore.write('despesas_entradas', despesasEntradas);
      if (success) {
        set({ despesasEntradas });
        console.log('✅ Despesa/Entrada deletada:', id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao deletar despesa/entrada:', error);
      set({ error: 'Erro ao deletar despesa/entrada' });
      return false;
    }
  },

  addComodato: async (comodato) => {
    try {
      const quantidade = safeParseNumber(comodato.quantidade);
      const valorUnitario = safeParseNumber(comodato.valor_unitario);
      const quantidadeVendida = safeParseNumber(comodato.quantidade_vendida);
      const quantidadePaga = safeParseNumber(comodato.quantidade_paga);
      
      const valor_total = quantidade * valorUnitario;
      const quantidade_pendente = Math.max(0, quantidade - quantidadeVendida - quantidadePaga);
      
      const newComodato = { 
        ...comodato, 
        id: generateId(),
        quantidade,
        valor_unitario: valorUnitario,
        quantidade_vendida: quantidadeVendida,
        quantidade_paga: quantidadePaga,
        valor_total,
        quantidade_pendente,
        valor_garantia: safeParseNumber(comodato.valor_garantia)
      };
      const comodatos = [...get().comodatos, newComodato];
      const success = await excelStore.write('comodatos', comodatos);
      if (success) {
        set({ comodatos });
        console.log('✅ Comodato adicionado:', newComodato.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao adicionar comodato:', error);
      set({ error: 'Erro ao adicionar comodato' });
      return false;
    }
  },

  updateComodato: async (id, updates) => {
    try {
      const comodatos = get().comodatos.map(c => {
        if (c.id === id) {
          const updated = { ...c, ...updates };
          const quantidade = safeParseNumber(updated.quantidade);
          const valorUnitario = safeParseNumber(updated.valor_unitario);
          const quantidadeVendida = safeParseNumber(updated.quantidade_vendida);
          const quantidadePaga = safeParseNumber(updated.quantidade_paga);
          
          updated.quantidade = quantidade;
          updated.valor_unitario = valorUnitario;
          updated.quantidade_vendida = quantidadeVendida;
          updated.quantidade_paga = quantidadePaga;
          updated.valor_total = quantidade * valorUnitario;
          updated.quantidade_pendente = Math.max(0, quantidade - quantidadeVendida - quantidadePaga);
          updated.valor_garantia = safeParseNumber(updated.valor_garantia);
          
          return updated;
        }
        return c;
      });
      const success = await excelStore.write('comodatos', comodatos);
      if (success) {
        set({ comodatos });
        console.log('✅ Comodato atualizado:', id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao atualizar comodato:', error);
      set({ error: 'Erro ao atualizar comodato' });
      return false;
    }
  },

  deleteComodato: async (id) => {
    try {
      const comodatos = get().comodatos.filter(c => c.id !== id);
      const success = await excelStore.write('comodatos', comodatos);
      if (success) {
        set({ comodatos });
        console.log('✅ Comodato deletado:', id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao deletar comodato:', error);
      set({ error: 'Erro ao deletar comodato' });
      return false;
    }
  },

  addEvento: async (evento) => {
    try {
      const newEvento = { 
        ...evento, 
        id: generateId(),
        valor: safeParseNumber(evento.valor),
        data_criacao: new Date().toISOString().split('T')[0]
      };
      const eventos = [...get().eventos, newEvento];
      const success = await excelStore.write('eventos', eventos);
      if (success) {
        set({ eventos });
        console.log('✅ Evento adicionado:', newEvento.titulo);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao adicionar evento:', error);
      set({ error: 'Erro ao adicionar evento' });
      return false;
    }
  },

  updateEvento: async (id, updates) => {
    try {
      const eventos = get().eventos.map(e => e.id === id ? { 
        ...e, 
        ...updates,
        valor: safeParseNumber(updates.valor ?? e.valor)
      } : e);
      const success = await excelStore.write('eventos', eventos);
      if (success) {
        set({ eventos });
        console.log('✅ Evento atualizado:', id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao atualizar evento:', error);
      set({ error: 'Erro ao atualizar evento' });
      return false;
    }
  },

  deleteEvento: async (id) => {
    try {
      const eventos = get().eventos.filter(e => e.id !== id);
      const success = await excelStore.write('eventos', eventos);
      if (success) {
        set({ eventos });
        console.log('✅ Evento deletado:', id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao deletar evento:', error);
      set({ error: 'Erro ao deletar evento' });
      return false;
    }
  },

  calculateSaldo: () => {
    try {
      const { pedidos, despesasEntradas } = get();
      
      const lucroTotal = (pedidos || []).reduce((sum, p) => sum + safeParseNumber(p.valor_lucro), 0);
      const entradas = (despesasEntradas || []).filter(d => d.tipo === 'Entradas').reduce((sum, d) => sum + safeParseNumber(d.valor), 0);
      const bonus = (despesasEntradas || []).filter(d => d.tipo === 'Bônus').reduce((sum, d) => sum + safeParseNumber(d.valor), 0);
      const despesas = (despesasEntradas || []).filter(d => d.tipo === 'Despesas').reduce((sum, d) => sum + safeParseNumber(d.valor), 0);
      
      const saldo = entradas + bonus - despesas + lucroTotal;
      console.log('💰 Saldo calculado:', { entradas, bonus, despesas, lucroTotal, saldo });
      
      return saldo;
    } catch (error) {
      console.error('❌ Erro ao calcular saldo:', error);
      return 0;
    }
  },

  getDashboardData: () => {
    try {
      const { pedidos, despesasEntradas, produtos, eventos } = get();
      
      const lucroTotal = (pedidos || []).reduce((sum, p) => sum + safeParseNumber(p.valor_lucro), 0);
      const entradas = (despesasEntradas || []).filter(d => d.tipo === 'Entradas').reduce((sum, d) => sum + safeParseNumber(d.valor), 0);
      const bonus = (despesasEntradas || []).filter(d => d.tipo === 'Bônus').reduce((sum, d) => sum + safeParseNumber(d.valor), 0);
      const despesas = (despesasEntradas || []).filter(d => d.tipo === 'Despesas').reduce((sum, d) => sum + safeParseNumber(d.valor), 0);
      
      const saldoTotal = get().calculateSaldo();
      
      const produtosEstoqueBaixo = (produtos || []).filter(p => safeParseNumber(p.estoque_atual) < safeParseNumber(p.estoque_minimo)).length;
      
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
      
      console.log('📊 Dashboard calculado:', dashboardData);
      
      return dashboardData;
    } catch (error) {
      console.error('❌ Erro ao calcular dashboard:', error);
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
      return (get().produtos || []).filter(p => safeParseNumber(p.estoque_atual) < safeParseNumber(p.estoque_minimo));
    } catch (error) {
      console.error('❌ Erro ao obter estoque baixo:', error);
      return [];
    }
  },

  getEventosHoje: () => {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      return (get().eventos || []).filter(e => e.data_evento === hoje && e.status === 'Pendente');
    } catch (error) {
      console.error('❌ Erro ao obter eventos hoje:', error);
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
      console.error('❌ Erro ao obter eventos próximos:', error);
      return [];
    }
  },

  exportData: async () => {
    try {
      await excelStore.exportData();
      console.log('✅ Dados exportados com sucesso');
    } catch (error) {
      console.error('❌ Erro ao exportar dados:', error);
      set({ error: 'Erro ao exportar dados' });
    }
  },

  validateDataIntegrity: async () => {
    try {
      const isValid = await excelStore.verifyDataIntegrity();
      console.log('🔍 Integridade dos dados:', isValid ? '✅ Válida' : '❌ Inválida');
      return isValid;
    } catch (error) {
      console.error('❌ Erro ao validar integridade:', error);
      return false;
    }
  }
}));
