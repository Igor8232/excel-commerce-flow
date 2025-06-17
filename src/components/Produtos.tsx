
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
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
              <div className="flex space-x-2">
                <Button type="submit">Salvar</Button>
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
                <span>{produto.nome}</span>
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
              <div className="space-y-2 text-sm">
                <p><strong>Custo:</strong> {formatCurrency(produto.custo_producao)}</p>
                <p><strong>Preço:</strong> {formatCurrency(produto.preco_sugerido)}</p>
                <p><strong>Estoque:</strong> {produto.estoque_atual} unidades</p>
                <p><strong>Estoque Mín:</strong> {produto.estoque_minimo} unidades</p>
                <p><strong>Margem:</strong> {formatCurrency(produto.preco_sugerido - produto.custo_producao)}</p>
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
