import { create } from 'zustand';
import { localStore, Cliente, Produto, Pedido, ItemPedido, Fiado, PagamentoFiado, DespesaEntrada, Comodato } from '@/lib/localStore';

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
  
  // Dashboard
  getDashboardData: () => {
    saldo_total: number;
    lucro_total: number;
    total_entradas: number;
    total_despesas: number;
    produtos_estoque_baixo: number;
  };
  
  getEstoqueBaixo: () => Produto[];
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

  loadData: () => {
    console.log('Carregando dados...');
    localStore.initializeData();
    
    const clientes = localStore.read<Cliente>('clientes');
    const produtos = localStore.read<Produto>('produtos');
    const pedidos = localStore.read<Pedido>('pedidos');
    const itensPedido = localStore.read<ItemPedido>('itens_pedido');
    const fiados = localStore.read<Fiado>('fiados');
    const pagamentosFiado = localStore.read<PagamentoFiado>('pagamentos_fiado');
    const despesasEntradas = localStore.read<DespesaEntrada>('despesas_entradas');
    const comodatos = localStore.read<Comodato>('comodatos');
    
    // Verificar se precisa aplicar seed
    const needsSeed = clientes.length === 0 && produtos.length === 0 && despesasEntradas.length === 0;
    
    if (needsSeed) {
      console.log('Seed applied');
      localStore.applySeed();
      
      const seededClientes = localStore.read<Cliente>('clientes');
      const seededProdutos = localStore.read<Produto>('produtos');
      const seededDespesasEntradas = localStore.read<DespesaEntrada>('despesas_entradas');
      
      set({
        clientes: seededClientes,
        produtos: seededProdutos,
        pedidos,
        itensPedido,
        fiados,
        pagamentosFiado,
        despesasEntradas: seededDespesasEntradas,
        comodatos,
      });
    } else {
      console.log('Dados carregados:', {
        clientes: clientes.length,
        produtos: produtos.length,
        pedidos: pedidos.length,
        despesasEntradas: despesasEntradas.length
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
      });
    }
  },

  addCliente: (cliente) => {
    const newCliente = { ...cliente, id: Date.now().toString() };
    const clientes = [...get().clientes, newCliente];
    localStore.write('clientes', clientes);
    set({ clientes });
  },

  updateCliente: (id, updates) => {
    const clientes = get().clientes.map(c => c.id === id ? { ...c, ...updates } : c);
    localStore.write('clientes', clientes);
    set({ clientes });
  },

  deleteCliente: (id) => {
    const clientes = get().clientes.filter(c => c.id !== id);
    localStore.write('clientes', clientes);
    set({ clientes });
  },

  addProduto: (produto) => {
    const margem_lucro = produto.preco_sugerido - produto.custo_producao;
    const percentual_lucro = produto.custo_producao > 0 ? (margem_lucro / produto.custo_producao) * 100 : 0;
    
    const newProduto = { 
      ...produto, 
      id: Date.now().toString(),
      margem_lucro,
      percentual_lucro,
      total_vendido: 0,
      total_faturado: 0
    };
    const produtos = [...get().produtos, newProduto];
    localStore.write('produtos', produtos);
    set({ produtos });
  },

  updateProduto: (id, updates) => {
    const produtos = get().produtos.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...updates };
        if (updates.custo_producao !== undefined || updates.preco_sugerido !== undefined) {
          updated.margem_lucro = updated.preco_sugerido - updated.custo_producao;
          updated.percentual_lucro = updated.custo_producao > 0 ? (updated.margem_lucro / updated.custo_producao) * 100 : 0;
        }
        return updated;
      }
      return p;
    });
    localStore.write('produtos', produtos);
    set({ produtos });
  },

  deleteProduto: (id) => {
    const produtos = get().produtos.filter(p => p.id !== id);
    localStore.write('produtos', produtos);
    set({ produtos });
  },

  createPedido: ({ cliente_id, itens }) => {
    const pedidoId = Date.now().toString();
    let valorTotal = 0;
    let valorLucro = 0;
    const novosItens: ItemPedido[] = [];
    const produtos = [...get().produtos];

    // Processar cada item do pedido
    itens.forEach((item, index) => {
      const produto = produtos.find(p => p.id === item.produto_id);
      if (produto) {
        const lucroItem = (item.preco_unitario - produto.custo_producao) * item.quantidade;
        valorTotal += item.preco_unitario * item.quantidade;
        valorLucro += lucroItem;

        // Atualizar estoque e estatísticas do produto
        produto.estoque_atual -= item.quantidade;
        produto.total_vendido += item.quantidade;
        produto.total_faturado += item.preco_unitario * item.quantidade;

        // Criar item do pedido
        novosItens.push({
          id: `${pedidoId}_${index}`,
          pedido_id: pedidoId,
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          custo_unitario: produto.custo_producao,
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
  },

  updatePedidoStatus: (id, status) => {
    const pedidos = get().pedidos.map(p => p.id === id ? { ...p, status } : p);
    localStore.write('pedidos', pedidos);
    set({ pedidos });
  },

  deletePedido: (id) => {
    const pedidos = get().pedidos.filter(p => p.id !== id);
    const itensPedido = get().itensPedido.filter(i => i.pedido_id !== id);
    localStore.write('pedidos', pedidos);
    localStore.write('itens_pedido', itensPedido);
    set({ pedidos, itensPedido });
  },

  addFiado: (fiado) => {
    const newFiado = { ...fiado, id: Date.now().toString() };
    const fiados = [...get().fiados, newFiado];
    localStore.write('fiados', fiados);
    set({ fiados });
  },

  updateFiado: (id, updates) => {
    const fiados = get().fiados.map(f => f.id === id ? { ...f, ...updates } : f);
    localStore.write('fiados', fiados);
    set({ fiados });
  },

  deleteFiado: (id) => {
    const fiados = get().fiados.filter(f => f.id !== id);
    const pagamentosFiado = get().pagamentosFiado.filter(p => p.fiado_id !== id);
    localStore.write('fiados', fiados);
    localStore.write('pagamentos_fiado', pagamentosFiado);
    set({ fiados, pagamentosFiado });
  },

  addPagamentoFiado: (pagamento) => {
    const newPagamento = { ...pagamento, id: Date.now().toString() };
    const pagamentosFiado = [...get().pagamentosFiado, newPagamento];
    localStore.write('pagamentos_fiado', pagamentosFiado);
    set({ pagamentosFiado });

    // Atualizar valor pendente do fiado
    const fiados = get().fiados.map(f => {
      if (f.id === pagamento.fiado_id) {
        return { ...f, valor_pago: f.valor_pago + pagamento.valor_pagamento, valor_pendente: f.valor_pendente - pagamento.valor_pagamento };
      }
      return f;
    });
    localStore.write('fiados', fiados);
    set({ fiados });
  },

  deletePagamentoFiado: (id) => {
    const pagamentosFiado = get().pagamentosFiado.filter(p => p.id !== id);
    localStore.write('pagamentos_fiado', pagamentosFiado);
    set({ pagamentosFiado });
  },

  addDespesaEntrada: (item) => {
    const newItem = { ...item, id: Date.now().toString() };
    const despesasEntradas = [...get().despesasEntradas, newItem];
    localStore.write('despesas_entradas', despesasEntradas);
    set({ despesasEntradas });
  },

  updateDespesaEntrada: (id, updates) => {
    const despesasEntradas = get().despesasEntradas.map(d => d.id === id ? { ...d, ...updates } : d);
    localStore.write('despesas_entradas', despesasEntradas);
    set({ despesasEntradas });
  },

  deleteDespesaEntrada: (id) => {
    const despesasEntradas = get().despesasEntradas.filter(d => d.id !== id);
    localStore.write('despesas_entradas', despesasEntradas);
    set({ despesasEntradas });
  },

  addComodato: (comodato) => {
    const valor_total = comodato.quantidade * comodato.valor_unitario;
    const quantidade_pendente = comodato.quantidade - comodato.quantidade_vendida - comodato.quantidade_paga;
    
    const newComodato = { 
      ...comodato, 
      id: Date.now().toString(),
      valor_total,
      quantidade_pendente
    };
    const comodatos = [...get().comodatos, newComodato];
    localStore.write('comodatos', comodatos);
    set({ comodatos });
  },

  updateComodato: (id, updates) => {
    const comodatos = get().comodatos.map(c => {
      if (c.id === id) {
        const updated = { ...c, ...updates };
        if (updates.quantidade !== undefined || updates.valor_unitario !== undefined) {
          updated.valor_total = updated.quantidade * updated.valor_unitario;
        }
        if (updates.quantidade_vendida !== undefined || updates.quantidade_paga !== undefined || updates.quantidade !== undefined) {
          updated.quantidade_pendente = updated.quantidade - updated.quantidade_vendida - updated.quantidade_paga;
        }
        return updated;
      }
      return c;
    });
    localStore.write('comodatos', comodatos);
    set({ comodatos });
  },

  deleteComodato: (id) => {
    const comodatos = get().comodatos.filter(c => c.id !== id);
    localStore.write('comodatos', comodatos);
    set({ comodatos });
  },

  getDashboardData: () => {
    const { pedidos, despesasEntradas, produtos } = get();
    
    console.log('Calculando dashboard com:', {
      pedidos: pedidos.length,
      despesasEntradas: despesasEntradas.length,
      produtos: produtos.length
    });
    
    const lucroTotal = pedidos.reduce((sum, p) => sum + (p.valor_lucro || 0), 0);
    const entradas = despesasEntradas.filter(d => d.tipo === 'Entradas' || d.tipo === 'Bônus').reduce((sum, d) => sum + (d.valor || 0), 0);
    const despesas = despesasEntradas.filter(d => d.tipo === 'Despesas').reduce((sum, d) => sum + (d.valor || 0), 0);
    const saldoTotal = entradas - despesas + lucroTotal;
    const produtosEstoqueBaixo = produtos.filter(p => p.estoque_atual < p.estoque_minimo).length;

    const dashboardData = {
      saldo_total: saldoTotal || 0,
      lucro_total: lucroTotal || 0,
      total_entradas: entradas || 0,
      total_despesas: despesas || 0,
      produtos_estoque_baixo: produtosEstoqueBaixo || 0
    };
    
    console.log('Dashboard calculado:', dashboardData);
    
    return dashboardData;
  },

  getEstoqueBaixo: () => {
    return get().produtos.filter(p => p.estoque_atual < p.estoque_minimo);
  }
}));
