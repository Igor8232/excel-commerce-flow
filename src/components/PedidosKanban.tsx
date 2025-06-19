
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, User, Calendar, DollarSign } from 'lucide-react';
import type { Pedido } from '@/lib/database-types';

const statusConfig = {
  pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', bgColor: 'bg-yellow-50' },
  producao: { label: 'Em Produção', color: 'bg-blue-100 text-blue-800', bgColor: 'bg-blue-50' },
  pronto: { label: 'Pronto', color: 'bg-green-100 text-green-800', bgColor: 'bg-green-50' },
  entregue: { label: 'Entregue', color: 'bg-gray-100 text-gray-800', bgColor: 'bg-gray-50' }
};

interface PedidosKanbanProps {
  pedidos: Pedido[];
  clientes: any[];
  itensPedido: any[];
  produtos: any[];
  onUpdateStatus: (id: string, status: 'pendente' | 'producao' | 'pronto' | 'entregue') => void;
}

const PedidosKanban = ({ pedidos, clientes, itensPedido, produtos, onUpdateStatus }: PedidosKanbanProps) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

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

  const getPedidosByStatus = (status: string) => {
    return pedidos.filter(pedido => pedido.status === status);
  };

  const handleDragStart = (e: React.DragEvent, pedidoId: string) => {
    setDraggedItem(pedidoId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: 'pendente' | 'producao' | 'pronto' | 'entregue') => {
    e.preventDefault();
    if (draggedItem) {
      onUpdateStatus(draggedItem, newStatus);
      setDraggedItem(null);
    }
  };

  const PedidoCard = ({ pedido }: { pedido: Pedido }) => (
    <Card 
      key={pedido.id}
      className="mb-3 cursor-move hover:shadow-md transition-shadow"
      draggable
      onDragStart={(e) => handleDragStart(e, pedido.id)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-4 w-4" />
            <span>#{pedido.id.slice(-6)}</span>
          </div>
          <Badge className={statusConfig[pedido.status].color}>
            {statusConfig[pedido.status].label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="h-3 w-3" />
            <span>{getClienteNome(pedido.cliente_id)}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-3 w-3" />
            <span>{new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-3 w-3 text-green-600" />
              <span className="font-bold text-green-600">{formatCurrency(pedido.valor_total)}</span>
            </div>
            <span className="text-xs text-gray-500">
              Lucro: {formatCurrency(pedido.valor_lucro)}
            </span>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">Itens:</p>
            {getItensPedido(pedido.id).slice(0, 2).map((item, index) => (
              <p key={index} className="text-xs text-gray-600">
                • {getProdutoNome(item.produto_id)} ({item.quantidade}x)
              </p>
            ))}
            {getItensPedido(pedido.id).length > 2 && (
              <p className="text-xs text-gray-500">
                +{getItensPedido(pedido.id).length - 2} mais...
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Object.entries(statusConfig).map(([status, config]) => (
        <div
          key={status}
          className={`${config.bgColor} p-4 rounded-lg min-h-[500px]`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, status as any)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">{config.label}</h3>
            <Badge variant="secondary" className="text-xs">
              {getPedidosByStatus(status).length}
            </Badge>
          </div>
          <div className="space-y-3">
            {getPedidosByStatus(status).map(pedido => (
              <PedidoCard key={pedido.id} pedido={pedido} />
            ))}
            {getPedidosByStatus(status).length === 0 && (
              <div className="text-center text-gray-400 text-sm py-8">
                Nenhum pedido aqui
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PedidosKanban;
