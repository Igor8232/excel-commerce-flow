
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, TrendingDown, DollarSign, Edit, Trash2 } from 'lucide-react';

const DespesasEntradas = () => {
  const { despesasEntradas, addDespesaEntrada, updateDespesaEntrada, deleteDespesaEntrada, calculateSaldo, getDashboardData } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    tipo: 'Entradas' as const,
    descricao: '',
    valor: '',
    categoria: '',
  });
  const [editFormData, setEditFormData] = useState({
    tipo: 'Entradas' as const,
    descricao: '',
    valor: '',
    categoria: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de dados
    if (!formData.descricao.trim()) {
      alert('Descrição é obrigatória');
      return;
    }
    
    const valor = Number(formData.valor);
    if (isNaN(valor) || valor <= 0) {
      alert('Valor deve ser um número válido maior que zero');
      return;
    }
    
    addDespesaEntrada({
      ...formData,
      valor,
      data_registro: new Date().toISOString().split('T')[0],
    });
    
    setFormData({
      tipo: 'Entradas',
      descricao: '',
      valor: '',
      categoria: '',
    });
    setIsDialogOpen(false);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setEditFormData({
      tipo: item.tipo,
      descricao: item.descricao,
      valor: item.valor.toString(),
      categoria: item.categoria || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    // Validação de dados
    if (!editFormData.descricao.trim()) {
      alert('Descrição é obrigatória');
      return;
    }
    
    const valor = Number(editFormData.valor);
    if (isNaN(valor) || valor <= 0) {
      alert('Valor deve ser um número válido maior que zero');
      return;
    }

    updateDespesaEntrada(editingItem.id, {
      tipo: editFormData.tipo,
      descricao: editFormData.descricao,
      valor,
      categoria: editFormData.categoria,
    });

    setEditingItem(null);
    setEditFormData({
      tipo: 'Entradas',
      descricao: '',
      valor: '',
      categoria: '',
    });
    setIsEditDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
      deleteDespesaEntrada(id);
    }
  };

  const formatCurrency = (value: number | undefined | null) => {
    const safeValue = Number(value) || 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(safeValue);
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'Entradas':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'Bônus':
        return <DollarSign className="h-5 w-5 text-blue-600" />;
      case 'Despesas':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <DollarSign className="h-5 w-5" />;
    }
  };

  const getBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'Entradas':
        return 'default';
      case 'Bônus':
        return 'secondary';
      case 'Despesas':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Usar dados sincronizados - ÚNICA FONTE DE VERDADE
  const dashboardData = getDashboardData();
  const saldoSincronizado = calculateSaldo();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Despesas e Entradas</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Registro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Registro Financeiro</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Tipo</Label>
                <Select value={formData.tipo} onValueChange={(value: any) => setFormData({...formData, tipo: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Entradas">Entradas</SelectItem>
                    <SelectItem value="Bônus">Bônus</SelectItem>
                    <SelectItem value="Despesas">Despesas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="valor">Valor</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData({...formData, valor: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Input
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  placeholder="Ex: Vendas, Marketing, Operacional..."
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

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Registro Financeiro</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label>Tipo</Label>
              <Select value={editFormData.tipo} onValueChange={(value: any) => setEditFormData({...editFormData, tipo: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entradas">Entradas</SelectItem>
                  <SelectItem value="Bônus">Bônus</SelectItem>
                  <SelectItem value="Despesas">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit_descricao">Descrição</Label>
              <Input
                id="edit_descricao"
                value={editFormData.descricao}
                onChange={(e) => setEditFormData({...editFormData, descricao: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_valor">Valor</Label>
              <Input
                id="edit_valor"
                type="number"
                step="0.01"
                min="0.01"
                value={editFormData.valor}
                onChange={(e) => setEditFormData({...editFormData, valor: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_categoria">Categoria</Label>
              <Input
                id="edit_categoria"
                value={editFormData.categoria}
                onChange={(e) => setEditFormData({...editFormData, categoria: e.target.value})}
                placeholder="Ex: Vendas, Marketing, Operacional..."
              />
            </div>
            <div className="flex space-x-2">
              <Button type="submit">Salvar</Button>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Resumo Financeiro - Usando dados sincronizados */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Entradas</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(dashboardData.total_entradas)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Bônus</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(dashboardData.total_bonus)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Despesas</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(dashboardData.total_despesas)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Lucros</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(dashboardData.lucro_total)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Saldo Total</p>
                <p className={`text-2xl font-bold ${saldoSincronizado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(saldoSincronizado)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Registros */}
      <div className="space-y-4">
        {(despesasEntradas || [])
          .sort((a, b) => new Date(b.data_registro).getTime() - new Date(a.data_registro).getTime())
          .map((item) => (
          <Card key={item.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getIcon(item.tipo)}
                  <div>
                    <p className="font-medium">{item.descricao || 'Sem descrição'}</p>
                    <p className="text-sm text-gray-600">
                      {item.categoria || 'Sem categoria'} • {new Date(item.data_registro).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <p className={`text-lg font-bold ${item.tipo === 'Despesas' ? 'text-red-600' : 'text-green-600'}`}>
                    {item.tipo === 'Despesas' ? '-' : '+'}{formatCurrency(item.valor)}
                  </p>
                  <Badge variant={getBadgeVariant(item.tipo)}>
                    {item.tipo}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!despesasEntradas || despesasEntradas.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 mb-4">Nenhum registro financeiro</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Fazer Primeiro Registro
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DespesasEntradas;
