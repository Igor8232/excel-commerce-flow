
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Package, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useProdutos } from '@/hooks/useProdutos';

const Dashboard = () => {
  const { data, loading, refetch } = useDashboard();
  const { produtos } = useProdutos();
  
  useEffect(() => {
    refetch();
  }, [refetch]);

  const formatCurrency = (value: number | undefined | null) => {
    const safeValue = Number(value) || 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(safeValue);
  };

  const estoqueBaixo = produtos.filter(p => (p.estoque_atual || 0) < (p.estoque_minimo || 0));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <Badge variant="outline" className="text-sm">
          Atualizado agora
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-xl md:text-2xl font-bold ${data.saldo_total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(data.saldo_total)}
            </div>
            <p className="text-xs text-muted-foreground">
              Entradas + Bônus - Despesas + Lucros
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-green-600">{formatCurrency(data.lucro_total)}</div>
            <p className="text-xs text-muted-foreground">
              Lucro dos pedidos realizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-green-600">{formatCurrency(data.total_entradas)}</div>
            <p className="text-xs text-muted-foreground">
              Entradas registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-red-600">{formatCurrency(data.total_despesas)}</div>
            <p className="text-xs text-muted-foreground">
              Despesas registradas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bônus Total</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-blue-600">{formatCurrency(data.total_bonus)}</div>
            <p className="text-xs text-muted-foreground">
              Bônus e extras registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-yellow-600">{data.produtos_estoque_baixo || 0}</div>
            <p className="text-xs text-muted-foreground">
              Produtos precisando reposição
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Próximos</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-purple-600">{data.eventos_proximos || 0}</div>
            <p className="text-xs text-muted-foreground">
              Eventos nos próximos 7 dias
            </p>
          </CardContent>
        </Card>
      </div>

      {estoqueBaixo.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span>Alertas de Estoque Baixo</span>
              <Badge variant="destructive">{estoqueBaixo.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {estoqueBaixo.map((produto) => (
                <div key={produto.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium">{produto.nome}</p>
                    <p className="text-sm text-gray-600">
                      Estoque atual: {produto.estoque_atual} | Mínimo: {produto.estoque_minimo}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                    <Package className="h-3 w-3 mr-1" />
                    Baixo
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
