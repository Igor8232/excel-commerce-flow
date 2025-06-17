
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  TrendingUp, 
  Handshake, 
  Settings 
} from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/clientes', label: 'Clientes', icon: Users },
    { path: '/produtos', label: 'Produtos', icon: Package },
    { path: '/pedidos', label: 'Pedidos', icon: ShoppingCart },
    { path: '/fiados', label: 'Fiados', icon: CreditCard },
    { path: '/despesas-entradas', label: 'Financeiro', icon: TrendingUp },
    { path: '/comodatos', label: 'Comodatos', icon: Handshake },
    { path: '/config', label: 'Config', icon: Settings },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-900">Sistema Comercial</h1>
            <div className="hidden md:flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
