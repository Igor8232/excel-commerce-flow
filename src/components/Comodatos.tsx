
import { useState } from 'react';
import { useComodatos } from '@/hooks/useComodatos';
import { useClientes } from '@/hooks/useClientes';
import { useProdutos } from '@/hooks/useProdutos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Handshake, Package, Edit, Trash2, DollarSign } from 'lucide-react';

const Comodatos = () => {
  const { comodatos, addComodato, updateComodato, deleteComodato } = useComodatos();
  const { clientes } = useClientes();
  const { produtos } = useProdutos();
  const [editingComodato, setEditingComodato] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    cliente_id: '',
    produto: '',
    quantidade: '',
    valor_unitario: '',
    valor_garantia: '',
    quantidade_vendida: '0',
    quantidade_paga: '0',
    observacoes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const comodatoData = {
      cliente_id: formData.cliente_id,
      produto: formData.produto,
      quantidade: parseInt(formData.quantidade),
      valor_unitario: parseFloat(formData.valor_unitario),
      valor_garantia: parseFloat(formData.valor_garantia),
      quantidade_vendida: parseInt(formData.quantidade_vendida),
      quantidade_paga: parseInt(formData.quantidade_paga),
      observacoes: formData.observacoes,
    };

    if (editingComodato) {
      await updateComodato(editingComodato.id, comodatoData);
    } else {
      await addComodato(comodatoData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      cliente_id: '',
      produto: '',
      quantidade: '',
      valor_unitario: '',
      valor_garantia: '',
      quantidade_vendida: '0',
      quantidade_paga: '0',
      observacoes: '',
    });
    setEditingComodato(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (comodato: any) => {
    setEditingComodato(comodato);
    setFormData({
      cliente_id: comodato.cliente_id,
      produto: comodato.produto,
      quantidade: comodato.quantidade.toString(),
      valor_unitario: comodato.valor_unitario.toString(),
      valor_garantia: comodato.valor_garantia.toString(),
      quantidade_vendida: comodato.quantidade_vendida.toString(),
      quantidade_paga: comodato.quantidade_paga.toString(),
      observacoes: comodato.observacoes || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este comodato?')) {
      await deleteComodato(id);
    }
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

  const getStatusBadge = (comodato: any) => {
    if (comodato.quantidade_vendida === comodato.quantidade) {
      return <Badge className="bg-green-500">Totalmente Vendido</Badge>;
    }
    if (comodato.quantidade_vendida > 0) {
      return <Badge className="bg-yellow-500">Parcialmente Vendido</Badge>;
    }
    return <Badge variant="outline">Emprestado</Badge>;
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Comodatos</h1>
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
                  <Input
                    value={formData.produto}
                    onChange={(e) => setFormData({...formData, produto: e.target.value})}
                    placeholder="Nome do produto"
                    required
                  />
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {comodatos.map((comodato) => (
          <Card key={comodato.id}>
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
                  <p><strong>Produto:</strong> {comodato.produto}</p>
                  <p><strong>Data do Comodato:</strong> {new Date(comodato.data_comodato).toLocaleDateString('pt-BR')}</p>
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {comodatos.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Handshake className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">Nenhum comodato registrado</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Primeiro Comodato
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Comodatos;
