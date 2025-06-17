import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Handshake, Package, Edit, Trash2, TrendingUp, DollarSign } from 'lucide-react';

const Comodatos = () => {
  const { comodatos, clientes, produtos, addComodato, updateComodato, deleteComodato } = useStore();
  const [editingComodato, setEditingComodato] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    cliente_id: '',
    produto_id: '',
    quantidade: '',
    data_prev_devolucao: '',
    valor_garantia: '',
    valor_unitario: '',
    quantidade_vendida: '0',
    quantidade_paga: '0',
    observacoes: '',
  });
  const [editFormData, setEditFormData] = useState({
    cliente_id: '',
    produto_id: '',
    quantidade: '',
    data_prev_devolucao: '',
    valor_garantia: '',
    valor_unitario: '',
    quantidade_vendida: '0',
    quantidade_paga: '0',
    observacoes: '',
    status: 'Emprestado' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const comodatoData = {
      cliente_id: formData.cliente_id,
      produto_id: formData.produto_id,
      quantidade: parseInt(formData.quantidade),
      data_emprestimo: new Date().toISOString().split('T')[0],
      data_prev_devolucao: formData.data_prev_devolucao,
      valor_garantia: parseFloat(formData.valor_garantia),
      valor_unitario: parseFloat(formData.valor_unitario),
      quantidade_vendida: parseInt(formData.quantidade_vendida),
      quantidade_paga: parseInt(formData.quantidade_paga),
      observacoes: formData.observacoes,
      status: 'Emprestado' as const,
    };

    if (editingComodato) {
      updateComodato(editingComodato.id, comodatoData);
    } else {
      addComodato(comodatoData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      cliente_id: '',
      produto_id: '',
      quantidade: '',
      data_prev_devolucao: '',
      valor_garantia: '',
      valor_unitario: '',
      quantidade_vendida: '0',
      quantidade_paga: '0',
      observacoes: '',
    });
    setEditingComodato(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (comodato: any) => {
    setEditingComodato(comodato);
    setEditFormData({
      cliente_id: comodato.cliente_id,
      produto_id: comodato.produto_id,
      quantidade: comodato.quantidade.toString(),
      data_prev_devolucao: comodato.data_prev_devolucao,
      valor_garantia: comodato.valor_garantia.toString(),
      valor_unitario: comodato.valor_unitario.toString(),
      quantidade_vendida: comodato.quantidade_vendida.toString(),
      quantidade_paga: comodato.quantidade_paga.toString(),
      observacoes: comodato.observacoes || '',
      status: comodato.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComodato) return;

    const comodatoData = {
      cliente_id: editFormData.cliente_id,
      produto_id: editFormData.produto_id,
      quantidade: parseInt(editFormData.quantidade),
      data_prev_devolucao: editFormData.data_prev_devolucao,
      valor_garantia: parseFloat(editFormData.valor_garantia),
      valor_unitario: parseFloat(editFormData.valor_unitario),
      quantidade_vendida: parseInt(editFormData.quantidade_vendida),
      quantidade_paga: parseInt(editFormData.quantidade_paga),
      observacoes: editFormData.observacoes,
      status: editFormData.status,
    };

    updateComodato(editingComodato.id, comodatoData);
    
    setEditingComodato(null);
    setEditFormData({
      cliente_id: '',
      produto_id: '',
      quantidade: '',
      data_prev_devolucao: '',
      valor_garantia: '',
      valor_unitario: '',
      quantidade_vendida: '0',
      quantidade_paga: '0',
      observacoes: '',
      status: 'Emprestado',
    });
    setIsEditDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este comodato?')) {
      deleteComodato(id);
    }
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

  const getStatusBadge = (comodato: any) => {
    if (comodato.status === 'Devolvido') {
      return <Badge variant="secondary">Devolvido</Badge>;
    }
    if (comodato.quantidade_vendida === comodato.quantidade) {
      return <Badge className="bg-green-500">Totalmente Vendido</Badge>;
    }
    if (comodato.quantidade_vendida > 0) {
      return <Badge className="bg-yellow-500">Parcialmente Vendido</Badge>;
    }
    if (isVencido(comodato.data_prev_devolucao, comodato.status)) {
      return <Badge variant="destructive">Vencido</Badge>;
    }
    return <Badge variant="outline">Emprestado</Badge>;
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingComodato ? 'Editar Comodato' : 'Novo Comodato'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="quantidade">Quantidade Total</Label>
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
                  <Label htmlFor="valor_unitario">Valor Unitário</Label>
                  <Input
                    id="valor_unitario"
                    type="number"
                    step="0.01"
                    value={formData.valor_unitario}
                    onChange={(e) => setFormData({...formData, valor_unitario: e.target.value})}
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantidade_vendida">Quantidade Vendida</Label>
                  <Input
                    id="quantidade_vendida"
                    type="number"
                    min="0"
                    max={formData.quantidade}
                    value={formData.quantidade_vendida}
                    onChange={(e) => setFormData({...formData, quantidade_vendida: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="quantidade_paga">Quantidade Paga</Label>
                  <Input
                    id="quantidade_paga"
                    type="number"
                    min="0"
                    max={formData.quantidade}
                    value={formData.quantidade_paga}
                    onChange={(e) => setFormData({...formData, quantidade_paga: e.target.value})}
                  />
                </div>
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
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  placeholder="Informações adicionais sobre o comodato"
                  rows={3}
                />
              </div>

              {formData.quantidade && formData.valor_unitario && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Resumo Financeiro:</h4>
                  <p className="text-sm">
                    <strong>Valor Total:</strong> {formatCurrency(parseFloat(formData.quantidade) * parseFloat(formData.valor_unitario || '0'))}
                  </p>
                  <p className="text-sm">
                    <strong>Valor Vendido:</strong> {formatCurrency(parseFloat(formData.quantidade_vendida || '0') * parseFloat(formData.valor_unitario || '0'))}
                  </p>
                  <p className="text-sm">
                    <strong>Valor Pendente:</strong> {formatCurrency((parseFloat(formData.quantidade) - parseFloat(formData.quantidade_vendida || '0') - parseFloat(formData.quantidade_paga || '0')) * parseFloat(formData.valor_unitario || '0'))}
                  </p>
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                <Button type="submit">
                  {editingComodato ? 'Atualizar' : 'Salvar'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Comodato</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Cliente</Label>
                <Select value={editFormData.cliente_id} onValueChange={(value) => setEditFormData({...editFormData, cliente_id: value})}>
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
                <Select value={editFormData.produto_id} onValueChange={(value) => setEditFormData({...editFormData, produto_id: value})}>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit_quantidade">Quantidade Total</Label>
                <Input
                  id="edit_quantidade"
                  type="number"
                  min="1"
                  value={editFormData.quantidade}
                  onChange={(e) => setEditFormData({...editFormData, quantidade: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_valor_unitario">Valor Unitário</Label>
                <Input
                  id="edit_valor_unitario"
                  type="number"
                  step="0.01"
                  value={editFormData.valor_unitario}
                  onChange={(e) => setEditFormData({...editFormData, valor_unitario: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_valor_garantia">Valor da Garantia</Label>
                <Input
                  id="edit_valor_garantia"
                  type="number"
                  step="0.01"
                  value={editFormData.valor_garantia}
                  onChange={(e) => setEditFormData({...editFormData, valor_garantia: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_quantidade_vendida">Quantidade Vendida</Label>
                <Input
                  id="edit_quantidade_vendida"
                  type="number"
                  min="0"
                  max={editFormData.quantidade}
                  value={editFormData.quantidade_vendida}
                  onChange={(e) => setEditFormData({...editFormData, quantidade_vendida: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_quantidade_paga">Quantidade Paga</Label>
                <Input
                  id="edit_quantidade_paga"
                  type="number"
                  min="0"
                  max={editFormData.quantidade}
                  value={editFormData.quantidade_paga}
                  onChange={(e) => setEditFormData({...editFormData, quantidade_paga: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_data_prev_devolucao">Data Prevista para Devolução</Label>
                <Input
                  id="edit_data_prev_devolucao"
                  type="date"
                  value={editFormData.data_prev_devolucao}
                  onChange={(e) => setEditFormData({...editFormData, data_prev_devolucao: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editFormData.status} onValueChange={(value: any) => setEditFormData({...editFormData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Emprestado">Emprestado</SelectItem>
                    <SelectItem value="Devolvido">Devolvido</SelectItem>
                    <SelectItem value="Parcialmente Vendido">Parcialmente Vendido</SelectItem>
                    <SelectItem value="Totalmente Vendido">Totalmente Vendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit_observacoes">Observações</Label>
              <Textarea
                id="edit_observacoes"
                value={editFormData.observacoes}
                onChange={(e) => setEditFormData({...editFormData, observacoes: e.target.value})}
                placeholder="Informações adicionais sobre o comodato"
                rows={3}
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="submit">Salvar</Button>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
                  <span>Comodato #{comodato.id.slice(-4)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(comodato)}
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(comodato)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(comodato.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-2 text-sm">
                  <p><strong>Cliente:</strong> {getClienteNome(comodato.cliente_id)}</p>
                  <p><strong>Produto:</strong> {getProdutoNome(comodato.produto_id)}</p>
                  <p><strong>Data do Empréstimo:</strong> {new Date(comodato.data_emprestimo).toLocaleDateString('pt-BR')}</p>
                  <p><strong>Prev. Devolução:</strong> {new Date(comodato.data_prev_devolucao).toLocaleDateString('pt-BR')}</p>
                  {comodato.data_devolucao_real && (
                    <p><strong>Devolvido em:</strong> {new Date(comodato.data_devolucao_real).toLocaleDateString('pt-BR')}</p>
                  )}
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Package className="h-4 w-4 text-blue-600 mr-1" />
                    <span className="text-sm font-medium text-blue-800">Quantidades</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-blue-600">Total</p>
                      <p className="font-medium text-blue-800">{comodato.quantidade}</p>
                    </div>
                    <div>
                      <p className="text-blue-600">Vendida</p>
                      <p className="font-medium text-blue-800">{comodato.quantidade_vendida}</p>
                    </div>
                    <div>
                      <p className="text-blue-600">Paga</p>
                      <p className="font-medium text-blue-800">{comodato.quantidade_paga}</p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-blue-200">
                    <p className="text-blue-600 text-sm">Pendente</p>
                    <p className="font-medium text-blue-800">{comodato.quantidade_pendente}</p>
                  </div>
                </div>

                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm font-medium text-green-800">Valores</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-600">Total:</span>
                      <span className="font-medium text-green-800">{formatCurrency(comodato.valor_total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Vendido:</span>
                      <span className="font-medium text-green-800">{formatCurrency(comodato.quantidade_vendida * comodato.valor_unitario)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Garantia:</span>
                      <span className="font-medium text-green-800">{formatCurrency(comodato.valor_garantia)}</span>
                    </div>
                  </div>
                </div>

                {comodato.observacoes && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-800 mb-1">Observações:</p>
                    <p className="text-sm text-gray-600">{comodato.observacoes}</p>
                  </div>
                )}

                {comodato.status === 'Emprestado' && (
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => handleDevolucao(comodato.id)}
                  >
                    <Package className="h-4 w-4 mr-1" />
                    Marcar como Devolvido
                  </Button>
                )}
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
