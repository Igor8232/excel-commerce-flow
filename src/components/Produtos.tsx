
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, AlertTriangle, TrendingUp, Package } from 'lucide-react';
import { Produto } from '@/lib/localStore';

const Produtos = () => {
  const { produtos, addProduto, updateProduto, deleteProduto } = useStore();
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    custo_producao: '',
    preco_sugerido: '',
    estoque_atual: '',
    estoque_minimo: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const produtoData = {
      nome: formData.nome,
      custo_producao: parseFloat(formData.custo_producao),
      preco_sugerido: parseFloat(formData.preco_sugerido),
      estoque_atual: parseInt(formData.estoque_atual),
      estoque_minimo: parseInt(formData.estoque_minimo),
    };

    if (editingProduto) {
      updateProduto(editingProduto.id, produtoData);
    } else {
      addProduto(produtoData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      custo_producao: '',
      preco_sugerido: '',
      estoque_atual: '',
      estoque_minimo: '',
    });
    setEditingProduto(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (produto: Produto) => {
    setEditingProduto(produto);
    setFormData({
      nome: produto.nome,
      custo_producao: produto.custo_producao.toString(),
      preco_sugerido: produto.preco_sugerido.toString(),
      estoque_atual: produto.estoque_atual.toString(),
      estoque_minimo: produto.estoque_minimo.toString(),
    });
    setIsDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.0%';
    }
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingProduto ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="custo_producao">Custo de Produção</Label>
                  <Input
                    id="custo_producao"
                    type="number"
                    step="0.01"
                    value={formData.custo_producao}
                    onChange={(e) => setFormData({...formData, custo_producao: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="preco_sugerido">Preço Sugerido</Label>
                  <Input
                    id="preco_sugerido"
                    type="number"
                    step="0.01"
                    value={formData.preco_sugerido}
                    onChange={(e) => setFormData({...formData, preco_sugerido: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estoque_atual">Estoque Atual</Label>
                  <Input
                    id="estoque_atual"
                    type="number"
                    value={formData.estoque_atual}
                    onChange={(e) => setFormData({...formData, estoque_atual: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="estoque_minimo">Estoque Mínimo</Label>
                  <Input
                    id="estoque_minimo"
                    type="number"
                    value={formData.estoque_minimo}
                    onChange={(e) => setFormData({...formData, estoque_minimo: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              {formData.custo_producao && formData.preco_sugerido && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Análise de Lucro:</h4>
                  <p className="text-sm">
                    <strong>Margem:</strong> {formatCurrency(parseFloat(formData.preco_sugerido) - parseFloat(formData.custo_producao))}
                  </p>
                  <p className="text-sm">
                    <strong>Percentual:</strong> {formatPercentage((parseFloat(formData.preco_sugerido) - parseFloat(formData.custo_producao)) / parseFloat(formData.custo_producao) * 100)}
                  </p>
                </div>
              )}

              <div className="flex space-x-2">
                <Button type="submit">
                  {editingProduto ? 'Atualizar' : 'Salvar'}
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
        {produtos.map((produto) => (
          <Card key={produto.id} className={produto.estoque_atual < produto.estoque_minimo ? 'border-red-200 bg-red-50' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="truncate">{produto.nome}</span>
                <div className="flex items-center space-x-2">
                  {produto.estoque_atual < produto.estoque_minimo && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Baixo
                    </Badge>
                  )}
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(produto)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteProduto(produto.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Custo</p>
                    <p className="font-medium">{formatCurrency(produto.custo_producao)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Preço</p>
                    <p className="font-medium">{formatCurrency(produto.preco_sugerido)}</p>
                  </div>
                </div>

                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm font-medium text-green-800">Lucro</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-green-600">Margem</p>
                      <p className="font-medium text-green-800">{formatCurrency(produto.margem_lucro)}</p>
                    </div>
                    <div>
                      <p className="text-green-600">Percentual</p>
                      <p className="font-medium text-green-800">{formatPercentage(produto.percentual_lucro)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Package className="h-4 w-4 text-blue-600 mr-1" />
                    <span className="text-sm font-medium text-blue-800">Estoque</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-blue-600">Atual</p>
                      <p className="font-medium text-blue-800">{produto.estoque_atual}</p>
                    </div>
                    <div>
                      <p className="text-blue-600">Mínimo</p>
                      <p className="font-medium text-blue-800">{produto.estoque_minimo}</p>
                    </div>
                  </div>
                </div>

                {(produto.total_vendido > 0 || produto.total_faturado > 0) && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-800 mb-2">Estatísticas de Vendas</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Vendido</p>
                        <p className="font-medium">{produto.total_vendido} un</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Faturado</p>
                        <p className="font-medium">{formatCurrency(produto.total_faturado)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {produtos.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 mb-4">Nenhum produto cadastrado</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Produto
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Produtos;
