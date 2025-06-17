
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { localStore } from '@/lib/localStore';
import { Download, Upload, Trash2, RefreshCw } from 'lucide-react';
import { useStore } from '@/store/useStore';

const Config = () => {
  const { loadData } = useStore();

  const handleExportData = () => {
    localStore.exportData();
  };

  const handleClearData = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita!')) {
      localStorage.clear();
      loadData();
      alert('Dados limpos com sucesso!');
    }
  };

  const handleReloadData = () => {
    loadData();
    alert('Dados recarregados!');
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validar se o arquivo tem a estrutura esperada
        const expectedSheets = ['clientes', 'produtos', 'pedidos', 'itens_pedido', 'fiados', 'pagamentos_fiado', 'despesas_entradas', 'comodatos'];
        const hasValidStructure = expectedSheets.every(sheet => Array.isArray(data[sheet]));
        
        if (!hasValidStructure) {
          alert('Arquivo com formato inválido!');
          return;
        }

        // Importar dados
        Object.entries(data).forEach(([sheet, rows]) => {
          localStore.write(sheet, rows as any[]);
        });

        loadData();
        alert('Dados importados com sucesso!');
      } catch (error) {
        alert('Erro ao importar dados. Verifique se o arquivo está no formato correto.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
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
              Recarregue os dados do localStorage caso haja alguma inconsistência.
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
              <p><strong>Versão:</strong> 1.0.0</p>
              <p><strong>Armazenamento:</strong> LocalStorage</p>
              <p><strong>Tipo:</strong> Sistema Offline</p>
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
