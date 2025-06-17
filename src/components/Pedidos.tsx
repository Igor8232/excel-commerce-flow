import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, LayoutGrid, List } from 'lucide-react';
import PedidosKanban from './PedidosKanban';

interface ItemPedido {
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
}

const Pedidos = () => {
  const { pedidos, clientes, produtos, createPedido, itensPedido, updatePedidoStatus } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState('');
  const [itens, setItens] = useState<ItemPedido[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const addItem = () => {
    setItens([...itens, { produto_id: '', quantidade: 1, preco_unitario: 0 }]);
  };

  const removeItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ItemPedido, value: string | number) => {
    const newItens = [...itens];
    if (field === 'produto_id') {
      newItens[index][field] = value as string;
      // Auto-preencher preço sugerido
      const produto = produtos.find(p => p.id === value);
      if (produto) {
        newItens[index].preco_unitario = produto.preco_sugerido;
      }
    } else {
      newItens[index][field] = value as number;
    }
    setItens(newItens);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCliente || itens.length === 0) return;

    const itensValidos = itens.filter(item => 
      item.produto_id && item.quantidade > 0 && item.preco_unitario > 0
    );

    if (itensValidos.length === 0) return;

    createPedido({
      cliente_id: selectedCliente,
      itens: itensValidos
    });

    // Reset form
    setSelectedCliente('');
    setItens([]);
    setIsDialogOpen(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getClienteNome = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nome : 'Cliente não encontrado';
  };

  const getProdutoNome = (produtoId: string) => {
    const produto = produtos.find(p => p.id === produtoId);
    return produto ? produto.nome : 'Produto não encontrado';
  };

  const getItensPedido = (pedidoId: string) => {
    return itensPedido.filter(item => item.pedido_id === pedidoId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Pedido
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Novo Pedido</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Cliente</Label>
                  <Select value={selectedCliente} onValueChange={setSelectedCliente}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map(cliente => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Itens do Pedido</Label>
                    <Button type="button" onClick={addItem} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Item
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {itens.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                              <Label>Produto</Label>
                              <Select 
                                value={item.produto_id} 
                                onValueChange={(value) => updateItem(index, 'produto_id', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  {produtos.map(produto => (
                                    <SelectItem key={produto.id} value={produto.id}>
                                      {produto.nome} (Est: {produto.estoque_atual})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Quantidade</Label>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantidade}
                                onChange={(e) => updateItem(index, 'quantidade', parseInt(e.target.value))}
                              />
                            </div>
                            <div>
                              <Label>Preço Unitário</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.preco_unitario}
                                onChange={(e) => updateItem(index, 'preco_unitario', parseFloat(e.target.value))}
                              />
                            </div>
                            <div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeItem(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            Subtotal: {formatCurrency(item.quantidade * item.preco_unitario)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Criar Pedido</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <PedidosKanban
          pedidos={pedidos}
          clientes={clientes}
          itensPedido={itensPedido}
          produtos={produtos}
          onUpdateStatus={updatePedidoStatus}
        />
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <Card key={pedido.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="h-5 w-5" />
                    <span>Pedido #{pedido.id}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatCurrency(pedido.valor_total)}</p>
                    <p className="text-sm text-green-600">Lucro: {formatCurrency(pedido.valor_lucro)}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Cliente:</strong> {getClienteNome(pedido.cliente_id)}</p>
                    <p><strong>Data:</strong> {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <p><strong>Itens:</strong></p>
                    {getItensPedido(pedido.id).map((item, index) => (
                      <p key={index} className="text-sm text-gray-600">
                        • {getProdutoNome(item.produto_id)} - Qtd: {item.quantidade} - {formatCurrency(item.preco_unitario)}
                      </p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {pedidos.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 mb-4">Nenhum pedido realizado</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Pedido
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Pedidos;
