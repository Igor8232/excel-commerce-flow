import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Edit, Trash2, Clock, MapPin, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Evento } from '@/lib/database-types';

const Agenda = () => {
  const { clientes, eventos, loadData } = useStore();
  const [localEventos, setLocalEventos] = useState<Evento[]>([]);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data_evento: '',
    hora_evento: '',
    tipo: 'Evento' as 'Reunião' | 'Pagamento' | 'Entrega' | 'Evento' | 'Lembrete' | 'Outro',
    status: 'Pendente' as 'Pendente' | 'Concluído' | 'Cancelado',
    cliente_id: '',
    valor: '',
    observacoes: '',
  });

  useEffect(() => {
    console.log('Agenda: Carregando dados iniciais');
    loadData();
    loadEventos();
  }, [loadData]);

  useEffect(() => {
    console.log('Eventos do store atualizados:', eventos);
    setLocalEventos(eventos);
  }, [eventos]);

  const loadEventos = async () => {
    try {
      console.log('Agenda: Carregando eventos do Supabase');
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .order('data_evento');
      
      if (error) {
        console.error('Erro ao carregar eventos:', error);
        return;
      }
      
      console.log('Eventos carregados:', data?.length || 0);
      setLocalEventos((data || []) as Evento[]);
    } catch (error) {
      console.error('Erro no loadEventos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Agenda: Salvando evento', formData);
      
      const eventoData = {
        ...formData,
        valor: formData.valor ? parseFloat(formData.valor) : undefined,
        cliente_id: formData.cliente_id === 'none' ? undefined : formData.cliente_id,
        data_criacao: new Date().toISOString().split('T')[0]
      };

      if (editingEvento) {
        console.log('Atualizando evento:', editingEvento.id);
        const { data, error } = await supabase
          .from('eventos')
          .update(eventoData)
          .eq('id', editingEvento.id)
          .select()
          .single();
        
        if (error) throw error;
        console.log('Evento atualizado:', data);
      } else {
        console.log('Criando novo evento');
        const { data, error } = await supabase
          .from('eventos')
          .insert([eventoData])
          .select()
          .single();
        
        if (error) throw error;
        console.log('Evento criado:', data);
      }
      
      await loadEventos();
      await loadData();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      alert('Erro ao salvar evento. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      data_evento: '',
      hora_evento: '',
      tipo: 'Evento',
      status: 'Pendente',
      cliente_id: '',
      valor: '',
      observacoes: '',
    });
    setEditingEvento(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (evento: Evento) => {
    console.log('Editando evento:', evento);
    setEditingEvento(evento);
    setFormData({
      titulo: evento.titulo,
      descricao: evento.descricao || '',
      data_evento: evento.data_evento,
      hora_evento: evento.hora_evento || '',
      tipo: evento.tipo || 'Evento',
      status: evento.status,
      cliente_id: evento.cliente_id || 'none',
      valor: evento.valor?.toString() || '',
      observacoes: evento.observacoes || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este evento?')) return;
    
    try {
      console.log('Deletando evento:', id);
      const { error } = await supabase
        .from('eventos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      console.log('Evento deletado com sucesso');
      await loadEventos();
      await loadData();
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      alert('Erro ao deletar evento');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente': return 'bg-yellow-100 text-yellow-800';
      case 'Concluído': return 'bg-green-100 text-green-800';
      case 'Cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Reunião': return 'bg-blue-100 text-blue-800';
      case 'Pagamento': return 'bg-green-100 text-green-800';
      case 'Entrega': return 'bg-purple-100 text-purple-800';
      case 'Evento': return 'bg-indigo-100 text-indigo-800';
      case 'Lembrete': return 'bg-orange-100 text-orange-800';
      case 'Outro': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClienteNome = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nome : '';
  };

  const eventosOrdenados = [...localEventos].sort((a, b) => {
    const dataA = new Date(`${a.data_evento}T${a.hora_evento || '00:00'}`);
    const dataB = new Date(`${b.data_evento}T${b.hora_evento || '00:00'}`);
    return dataA.getTime() - dataB.getTime();
  });

  console.log('Agenda renderizada com', localEventos.length, 'eventos');

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Agenda</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEvento ? 'Editar Evento' : 'Novo Evento'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Reunião">Reunião</SelectItem>
                      <SelectItem value="Pagamento">Pagamento</SelectItem>
                      <SelectItem value="Entrega">Entrega</SelectItem>
                      <SelectItem value="Evento">Evento</SelectItem>
                      <SelectItem value="Lembrete">Lembrete</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  placeholder="Descreva o evento..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_evento">Data *</Label>
                  <Input
                    id="data_evento"
                    type="date"
                    value={formData.data_evento}
                    onChange={(e) => setFormData({...formData, data_evento: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="hora_evento">Hora</Label>
                  <Input
                    id="hora_evento"
                    type="time"
                    value={formData.hora_evento}
                    onChange={(e) => setFormData({...formData, hora_evento: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cliente_id">Cliente (Opcional)</Label>
                  <Select value={formData.cliente_id || 'none'} onValueChange={(value) => setFormData({...formData, cliente_id: value === 'none' ? '' : value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum cliente</SelectItem>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="valor">Valor (Opcional)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({...formData, valor: e.target.value})}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Concluído">Concluído</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  placeholder="Informações adicionais..."
                  rows={2}
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : (editingEvento ? 'Atualizar' : 'Salvar')}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {eventosOrdenados.map((evento) => (
          <Card key={evento.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col">
                    <span className="text-lg">{evento.titulo}</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getTipoColor(evento.tipo || 'Evento')}>
                        {evento.tipo || 'Evento'}
                      </Badge>
                      <Badge className={getStatusColor(evento.status)}>
                        {evento.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(evento)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(evento.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(evento.data_evento).toLocaleDateString('pt-BR')}</span>
                  </div>
                  {evento.hora_evento && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{evento.hora_evento}</span>
                    </div>
                  )}
                  {evento.valor && (
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>R$ {evento.valor.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                
                {evento.descricao && (
                  <p className="text-sm text-gray-700">{evento.descricao}</p>
                )}
                
                {evento.cliente_id && (
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>Cliente: {getClienteNome(evento.cliente_id)}</span>
                  </div>
                )}
                
                {evento.observacoes && (
                  <p className="text-sm text-gray-500 italic">{evento.observacoes}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {localEventos.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">Nenhum evento na agenda</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Evento
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Agenda;
