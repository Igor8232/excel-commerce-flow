
import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import Dashboard from '@/components/Dashboard';
import Clientes from '@/components/Clientes';
import Produtos from '@/components/Produtos';
import Pedidos from '@/components/Pedidos';
import Fiados from '@/components/Fiados';
import DespesasEntradas from '@/components/DespesasEntradas';
import Comodatos from '@/components/Comodatos';
import Config from '@/components/Config';
import Navigation from '@/components/Navigation';

const Index = () => {
  const loadData = useStore(state => state.loadData);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/fiados" element={<Fiados />} />
          <Route path="/despesas-entradas" element={<DespesasEntradas />} />
          <Route path="/comodatos" element={<Comodatos />} />
          <Route path="/config" element={<Config />} />
        </Routes>
      </main>
    </div>
  );
};

export default Index;
