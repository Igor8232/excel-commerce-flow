
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Clientes from "./components/Clientes";
import Produtos from "./components/Produtos";
import Pedidos from "./components/Pedidos";
import Fiados from "./components/Fiados";
import DespesasEntradas from "./components/DespesasEntradas";
import Comodatos from "./components/Comodatos";
import Config from "./components/Config";
import Navigation from "./components/Navigation";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="produtos" element={<Produtos />} />
            <Route path="pedidos" element={<Pedidos />} />
            <Route path="fiados" element={<Fiados />} />
            <Route path="despesas-entradas" element={<DespesasEntradas />} />
            <Route path="comodatos" element={<Comodatos />} />
            <Route path="config" element={<Config />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
