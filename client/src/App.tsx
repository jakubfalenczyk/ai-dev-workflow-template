import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Building2, LayoutDashboard, Users, Briefcase, ArrowRightLeft, Bell, Settings } from 'lucide-react';
import CustomerList from './modules/customers/CustomerList.tsx';
import CustomerForm from './modules/customers/CustomerForm.tsx';
import ProductList from './modules/products/ProductList.tsx';
import ProductForm from './modules/products/ProductForm.tsx';
import OrderList from './modules/orders/OrderList.tsx';
import OrderForm from './modules/orders/OrderForm.tsx';
import Dashboard from './modules/dashboard/Dashboard.tsx';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-100">
          {/* Header */}
          <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                {/* Logo and Brand */}
                <div className="flex items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-500 p-2 rounded-lg">
                      <Building2 className="h-6 w-6 text-slate-900" />
                    </div>
                    <div className="hidden sm:block">
                      <h1 className="text-lg font-bold text-white">Meridian</h1>
                      <p className="text-xs text-slate-400 -mt-1">Commercial Bank</p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex items-center space-x-1">
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-slate-700 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`
                    }
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden md:inline">Dashboard</span>
                  </NavLink>
                  <NavLink
                    to="/customers"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-slate-700 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`
                    }
                  >
                    <Users className="h-4 w-4" />
                    <span className="hidden md:inline">Clients</span>
                  </NavLink>
                  <NavLink
                    to="/products"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-slate-700 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`
                    }
                  >
                    <Briefcase className="h-4 w-4" />
                    <span className="hidden md:inline">Products</span>
                  </NavLink>
                  <NavLink
                    to="/orders"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-slate-700 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`
                    }
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                    <span className="hidden md:inline">Transactions</span>
                  </NavLink>
                </nav>

                {/* Right side actions */}
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                    <Bell className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                    <Settings className="h-5 w-5" />
                  </button>
                  <div className="ml-2 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center">
                      <span className="text-sm font-semibold text-slate-900">JD</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customers" element={<CustomerList />} />
              <Route path="/customers/new" element={<CustomerForm />} />
              <Route path="/customers/:id/edit" element={<CustomerForm />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/new" element={<ProductForm />} />
              <Route path="/products/:id/edit" element={<ProductForm />} />
              <Route path="/orders" element={<OrderList />} />
              <Route path="/orders/new" element={<OrderForm />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-slate-900 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex justify-between items-center text-sm text-slate-500">
                <p>2026 Meridian Commercial Bank. All rights reserved.</p>
                <p>Enterprise Banking Platform v2.0</p>
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
