
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Download, Upload, Trash2, RefreshCw } from 'lucide-react';
import { useSupabaseStore } from '@/store/supabaseStore';

const Config = () => {
  const { loadAllData } = useSupabaseStore();

  const handleExportData = async () => {
    try {
      // Buscar todos os dados do Supabase
      const [
        clientes,
        produtos,
        pedidos,
        itensPedido,
        fiados,
        pagamentosFiado,
        despesasEntradas,
        comodatos,
        eventos
      ] = await Promise.all([
        supabase.from('clientes').select('*'),
        supabase.from('produtos').select('*'),
        supabase.from('pedidos').select('*'),
        supabase.from('itens_pedido').select('*'),
        supabase.from('fiados').select('*'),
        supabase.from('pagamentos_fiado').select('*'),
        supabase.from('despesas_entradas').select('*'),
        supabase.from('comodatos').select('*'),
        supabase.from('eventos').select('*')
      ]);

      const exportData = {
        clientes: clientes.data || [],
        produtos: produtos.data || [],
        pedidos: pedidos.data || [],
        itens_pedido: itensPedido.data || [],
        fiados: fiados.data || [],
        pagamentos_fiado: pagamentosFiado.data || [],
        despesas_entradas: despesasEntradas.data || [],
        comodatos: comodatos.data || [],
        eventos: eventos.data || []
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_sistema_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      alert('Dados exportados com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      alert('Erro ao exportar dados');
    }
  };

  const handleClearData = async () => {
    if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita!')) {
      try {
        // Deletar dados em ordem para respeitar foreign keys
        await supabase.from('itens_pedido').delete().neq('id', '');
        await supabase.from('pagamentos_fiado').delete().neq('id', '');
        await supabase.from('pedidos').delete().neq('id', '');
        await supabase.from('fiados').delete().neq('id', '');
        await supabase.from('comodatos').delete().neq('id', '');
        await supabase.from('eventos').delete().neq('id', '');
        await supabase.from('despesas_entradas').delete().neq('id', '');
        await supabase.from('produtos').delete().neq('id', '');
        await supabase.from('clientes').delete().neq('id', '');
        
        await loadAllData();
        alert('Dados limpos com sucesso!');
      } catch (error) {
        console.error('Erro ao limpar dados:', error);
        alert('Erro ao limpar dados');
      }
    }
  };

  const handleReloadData = async () => {
    await loadAllData();
    alert('Dados recarregados!');
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validar estrutura
        const expectedTables = ['clientes', 'produtos', 'pedidos', 'itens_pedido', 'fiados', 'pagamentos_fiado', 'despesas_entradas', 'comodatos', 'eventos'];
        const hasValidStructure = expectedTables.every(table => Array.isArray(data[table]));
        
        if (!hasValidStructure) {
          alert('Arquivo com formato inválido!');
          return;
        }

        // Importar dados respeitando ordem das foreign keys
        if (data.clientes?.length > 0) {
          await supabase.from('clientes').insert(data.clientes);
        }
        if (data.produtos?.length > 0) {
          await supabase.from('produtos').insert(data.produtos);
        }
        if (data.pedidos?.length > 0) {
          await supabase.from('pedidos').insert(data.pedidos);
        }
        if (data.itens_pedido?.length > 0) {
          await supabase.from('itens_pedido').insert(data.itens_pedido);
        }
        if (data.fiados?.length > 0) {
          await supabase.from('fiados').insert(data.fiados);
        }
        if (data.pagamentos_fiado?.length > 0) {
          await supabase.from('pagamentos_fiado').insert(data.pagamentos_fiado);
        }
        if (data.despesas_entradas?.length > 0) {
          await supabase.from('despesas_entradas').insert(data.despesas_entradas);
        }
        if (data.comodatos?.length > 0) {
          await supabase.from('comodatos').insert(data.comodatos);
        }
        if (data.eventos?.length > 0) {
          await supabase.from('eventos').insert(data.eventos);
        }

        await loadAllData();
        alert('Dados importados com sucesso!');
      } catch (error) {
        console.error('Erro ao importar:', error);
        alert('Erro ao importar dados. Verifique se o arquivo está no formato correto.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Configurações</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Exportar Dados</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Faça o download de todos os seus dados em formato JSON para backup.
            </p>
            <Button onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Exportar Dados
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Importar Dados</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Importe dados de um arquivo JSON exportado anteriormente.
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
              id="import-file"
            />
            <label htmlFor="import-file">
              <Button asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Dados
                </span>
              </Button>
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5" />
              <span>Recarregar Dados</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Recarregue os dados do Supabase caso haja alguma inconsistência.
            </p>
            <Button onClick={handleReloadData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Recarregar
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              <span>Limpar Dados</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4 text-red-600">
              <strong>Atenção:</strong> Esta ação irá apagar todos os dados permanentemente!
            </p>
            <Button onClick={handleClearData} variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Todos os Dados
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Versão:</strong> 2.0.0</p>
              <p><strong>Armazenamento:</strong> Supabase</p>
              <p><strong>Tipo:</strong> Sistema Web em Nuvem</p>
            </div>
            <div>
              <p><strong>Navegador:</strong> {navigator.userAgent.split(' ')[0]}</p>
              <p><strong>Data/Hora:</strong> {new Date().toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Config;
