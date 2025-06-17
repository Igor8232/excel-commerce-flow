
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Handshake, Package } from 'lucide-react';

const Comodatos = () => {
  const { comodatos, clientes, produtos, addComodato, updateComodato } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    cliente_id: '',
    produto_id: '',
    quantidade: '',
    data_prev_devolucao: '',
    valor_garantia: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addComodato({
      cliente_id: formData.cliente_id,
      produto_id: formData.produto_id,
      quantidade: parseInt(formData.quantidade),
      data_emprestimo: new Date().toISOString().split('T')[0],
      data_prev_devolucao: formData.data_prev_devolucao,
      valor_garantia: parseFloat(formData.valor_garantia),
      status: 'Emprestado',
    });
    setFormData({
      cliente_id: '',
      produto_id: '',
      quantidade: '',
      data_prev_devolucao: '',
      valor_garantia: '',
    });
    setIsDialogOpen(false);
  };

  const handleDevolucao = (comodatoId: string) => {
    updateComodato(comodatoId, {
      status: 'Devolvido',
      data_devolucao_real: new Date().toISOString().split('T')[0],
    });
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

  const isVencido = (dataPrevDevolucao: string, status: string) => {
    return status === 'Emprestado' && new Date(dataPrevDevolucao) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Comodatos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Comodato
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Comodato</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Cliente</Label>
                <Select value={formData.cliente_id} onValueChange={(value) => setFormData({...formData, cliente_id: value})}>
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
                <Label>Produto</Label>
                <Select value={formData.produto_id} onValueChange={(value) => setFormData({...formData, produto_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {produtos.map(produto => (
                      <SelectItem key={produto.id} value={produto.id}>
                        {produto.nome} (Estoque: {produto.estoque_atual})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="1"
                  value={formData.quantidade}
                  onChange={(e) => setFormData({...formData, quantidade: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="data_prev_devolucao">Data Prevista para Devolução</Label>
                <Input
                  id="data_prev_devolucao"
                  type="date"
                  value={formData.data_prev_devolucao}
                  onChange={(e) => setFormData({...formData, data_prev_devolucao: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="valor_garantia">Valor da Garantia</Label>
                <Input
                  id="valor_garantia"
                  type="number"
                  step="0.01"
                  value={formData.valor_garantia}
                  onChange={(e) => setFormData({...formData, valor_garantia: e.target.value})}
                  required
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit">Salvar</Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {comodatos.map((comodato) => (
          <Card 
            key={comodato.id} 
            className={
              isVencido(comodato.data_prev_devolucao, comodato.status) 
                ? 'border-red-200 bg-red-50' 
                : comodato.status === 'Devolvido' 
                ? 'border-green-200 bg-green-50' 
                : ''
            }
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Handshake className="h-5 w-5" />
                  <span>Comodato #{comodato.id}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {comodato.status === 'Emprestado' ? (
                    isVencido(comodato.data_prev_devolucao, comodato.status) ? (
                      <Badge variant="destructive">Vencido</Badge>
                    ) : (
                      <Badge variant="outline">Emprestado</Badge>
                    )
                  ) : (
                    <Badge variant="secondary">Devolvido</Badge>
                  )}
                  {comodato.status === 'Emprestado' && (
                    <Button
                      size="sm"
                      onClick={() => handleDevolucao(comodato.id)}
                    >
                      <Package className="h-4 w-4 mr-1" />
                      Devolver
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Cliente:</strong> {getClienteNome(comodato.cliente_id)}</p>
                <p><strong>Produto:</strong> {getProdutoNome(comodato.produto_id)}</p>
                <p><strong>Quantidade:</strong> {comodato.quantidade} unidades</p>
                <p><strong>Data do Empréstimo:</strong> {new Date(comodato.data_emprestimo).toLocaleDateString('pt-BR')}</p>
                <p><strong>Prev. Devolução:</strong> {new Date(comodato.data_prev_devolucao).toLocaleDateString('pt-BR')}</p>
                {comodato.data_devolucao_real && (
                  <p><strong>Devolvido em:</strong> {new Date(comodato.data_devolucao_real).toLocaleDateString('pt-BR')}</p>
                )}
                <p><strong>Valor da Garantia:</strong> {formatCurrency(comodato.valor_garantia)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {comodatos.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 mb-4">Nenhum comodato registrado</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primeiro Comodato
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Comodatos;
