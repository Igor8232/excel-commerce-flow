
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, User, Building } from 'lucide-react';
import { Cliente } from '@/lib/localStore';

const Clientes = () => {
  const { clientes, addCliente, updateCliente, deleteCliente } = useStore();
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    cpf_cnpj: '',
    email: '',
    endereco: '',
    cidade: '',
    estado: '',
    nome_fantasia: '',
    observacao: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCliente) {
      updateCliente(editingCliente.id, formData);
    } else {
      addCliente({
        ...formData,
        data_cadastro: new Date().toISOString().split('T')[0]
      });
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      telefone: '',
      cpf_cnpj: '',
      email: '',
      endereco: '',
      cidade: '',
      estado: '',
      nome_fantasia: '',
      observacao: '',
    });
    setEditingCliente(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nome: cliente.nome,
      telefone: cliente.telefone,
      cpf_cnpj: cliente.cpf_cnpj,
      email: cliente.email,
      endereco: cliente.endereco,
      cidade: cliente.cidade,
      estado: cliente.estado,
      nome_fantasia: cliente.nome_fantasia || '',
      observacao: cliente.observacao || '',
    });
    setIsDialogOpen(true);
  };

  const isCNPJ = (cpfCnpj: string) => {
    return cpfCnpj.replace(/\D/g, '').length === 14;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cpf_cnpj">CPF/CNPJ *</Label>
                  <Input
                    id="cpf_cnpj"
                    value={formData.cpf_cnpj}
                    onChange={(e) => setFormData({...formData, cpf_cnpj: e.target.value})}
                    placeholder="000.000.000-00 ou 00.000.000/0001-00"
                    required
                  />
                </div>
              </div>
              
              {isCNPJ(formData.cpf_cnpj) && (
                <div>
                  <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                  <Input
                    id="nome_fantasia"
                    value={formData.nome_fantasia}
                    onChange={(e) => setFormData({...formData, nome_fantasia: e.target.value})}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                  placeholder="Rua, número, bairro"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    placeholder="SP"
                    maxLength={2}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="observacao">Observações</Label>
                <Textarea
                  id="observacao"
                  value={formData.observacao}
                  onChange={(e) => setFormData({...formData, observacao: e.target.value})}
                  placeholder="Informações adicionais sobre o cliente"
                  rows={3}
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button type="submit">
                  {editingCliente ? 'Atualizar' : 'Salvar'}
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
        {clientes.map((cliente) => (
          <Card key={cliente.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {isCNPJ(cliente.cpf_cnpj) ? <Building className="h-5 w-5" /> : <User className="h-5 w-5" />}
                  <span className="truncate">{cliente.nome}</span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(cliente)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteCliente(cliente.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Documento:</strong> {cliente.cpf_cnpj}</p>
                {cliente.nome_fantasia && (
                  <p><strong>Nome Fantasia:</strong> {cliente.nome_fantasia}</p>
                )}
                <p><strong>Telefone:</strong> {cliente.telefone}</p>
                <p><strong>Email:</strong> {cliente.email}</p>
                <p><strong>Endereço:</strong> {cliente.endereco}</p>
                <p><strong>Cidade:</strong> {cliente.cidade}/{cliente.estado}</p>
                {cliente.observacao && (
                  <p><strong>Obs:</strong> {cliente.observacao}</p>
                )}
                <p><strong>Cadastrado em:</strong> {new Date(cliente.data_cadastro).toLocaleDateString('pt-BR')}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clientes.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 mb-4">Nenhum cliente cadastrado</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Cliente
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Clientes;
