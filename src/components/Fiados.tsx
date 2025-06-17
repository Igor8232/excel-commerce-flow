
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, CreditCard, DollarSign } from 'lucide-react';

const Fiados = () => {
  const { fiados, clientes, pedidos, addFiado, addPagamentoFiado } = useStore();
  const [isFiadoDialogOpen, setIsFiadoDialogOpen] = useState(false);
  const [isPagamentoDialogOpen, setIsPagamentoDialogOpen] = useState(false);
  const [selectedFiado, setSelectedFiado] = useState('');
  const [fiadoData, setFiadoData] = useState({
    cliente_id: '',
    pedido_id: '',
    valor_total: '',
    data_vencimento: '',
  });
  const [pagamentoData, setPagamentoData] = useState({
    valor_pagamento: '',
  });

  const handleFiadoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valorTotal = parseFloat(fiadoData.valor_total);
    addFiado({
      cliente_id: fiadoData.cliente_id,
      pedido_id: fiadoData.pedido_id,
      valor_total: valorTotal,
      valor_pago: 0,
      valor_pendente: valorTotal,
      data_vencimento: fiadoData.data_vencimento,
    });
    setFiadoData({
      cliente_id: '',
      pedido_id: '',
      valor_total: '',
      data_vencimento: '',
    });
    setIsFiadoDialogOpen(false);
  };

  const handlePagamentoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPagamentoFiado({
      fiado_id: selectedFiado,
      valor_pagamento: parseFloat(pagamentoData.valor_pagamento),
      data_pagamento: new Date().toISOString().split('T')[0],
    });
    setPagamentoData({ valor_pagamento: '' });
    setSelectedFiado('');
    setIsPagamentoDialogOpen(false);
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

  const isVencido = (dataVencimento: string) => {
    return new Date(dataVencimento) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Fiados</h1>
        <div className="flex space-x-2">
          <Dialog open={isPagamentoDialogOpen} onOpenChange={setIsPagamentoDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <DollarSign className="h-4 w-4 mr-2" />
                Registrar Pagamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Pagamento</DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePagamentoSubmit} className="space-y-4">
                <div>
                  <Label>Fiado</Label>
                  <Select value={selectedFiado} onValueChange={setSelectedFiado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um fiado" />
                    </SelectTrigger>
                    <SelectContent>
                      {fiados.filter(f => f.valor_pendente > 0).map(fiado => (
                        <SelectItem key={fiado.id} value={fiado.id}>
                          {getClienteNome(fiado.cliente_id)} - {formatCurrency(fiado.valor_pendente)} pendente
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="valor_pagamento">Valor do Pagamento</Label>
                  <Input
                    id="valor_pagamento"
                    type="number"
                    step="0.01"
                    value={pagamentoData.valor_pagamento}
                    onChange={(e) => setPagamentoData({valor_pagamento: e.target.value})}
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit">Registrar</Button>
                  <Button type="button" variant="outline" onClick={() => setIsPagamentoDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isFiadoDialogOpen} onOpenChange={setIsFiadoDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Fiado
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Fiado</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleFiadoSubmit} className="space-y-4">
                <div>
                  <Label>Cliente</Label>
                  <Select value={fiadoData.cliente_id} onValueChange={(value) => setFiadoData({...fiadoData, cliente_id: value})}>
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
                  <Label>Pedido (opcional)</Label>
                  <Select value={fiadoData.pedido_id} onValueChange={(value) => setFiadoData({...fiadoData, pedido_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um pedido" />
                    </SelectTrigger>
                    <SelectContent>
                      {pedidos.map(pedido => (
                        <SelectItem key={pedido.id} value={pedido.id}>
                          Pedido #{pedido.id} - {formatCurrency(pedido.valor_total)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="valor_total">Valor Total</Label>
                  <Input
                    id="valor_total"
                    type="number"
                    step="0.01"
                    value={fiadoData.valor_total}
                    onChange={(e) => setFiadoData({...fiadoData, valor_total: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="data_vencimento">Data de Vencimento</Label>
                  <Input
                    id="data_vencimento"
                    type="date"
                    value={fiadoData.data_vencimento}
                    onChange={(e) => setFiadoData({...fiadoData, data_vencimento: e.target.value})}
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit">Salvar</Button>
                  <Button type="button" variant="outline" onClick={() => setIsFiadoDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fiados.map((fiado) => (
          <Card key={fiado.id} className={fiado.valor_pendente > 0 && isVencido(fiado.data_vencimento) ? 'border-red-200 bg-red-50' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Fiado #{fiado.id}</span>
                </div>
                {fiado.valor_pendente === 0 ? (
                  <Badge variant="secondary">Quitado</Badge>
                ) : isVencido(fiado.data_vencimento) ? (
                  <Badge variant="destructive">Vencido</Badge>
                ) : (
                  <Badge variant="outline">Pendente</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Cliente:</strong> {getClienteNome(fiado.cliente_id)}</p>
                <p><strong>Valor Total:</strong> {formatCurrency(fiado.valor_total)}</p>
                <p><strong>Valor Pago:</strong> {formatCurrency(fiado.valor_pago)}</p>
                <p><strong>Valor Pendente:</strong> {formatCurrency(fiado.valor_pendente)}</p>
                <p><strong>Vencimento:</strong> {new Date(fiado.data_vencimento).toLocaleDateString('pt-BR')}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {fiados.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 mb-4">Nenhum fiado registrado</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primeiro Fiado
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Fiados;
