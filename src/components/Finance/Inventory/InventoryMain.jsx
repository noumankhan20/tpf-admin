'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import NotificationBell from '../../Common/NotificationBell';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  HardDrive,
  ClipboardList,
  LogOut,
  Search,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Layers,
  ArrowLeft,
  Calculator,
} from 'lucide-react';
import { useLogoutAdminApiMutation } from '@/utils/slices/adminApiSlice';

// Inventory Modules Configuration
const INVENTORY_MODULES = [
  {
    id: 'dashboard-overview',
    name: 'Inventory Dashboard',
    desc: 'Main overview of assets, stock and finances',
    icon: LayoutDashboard,
    category: 'dashboard',
    route: '/inventory/dashboard',
  },
  {
    id: 'vendor-mgmt',
    name: 'Vendors',
    desc: 'Manage suppliers and manufacturer details',
    icon: Users,
    category: 'procurement',
    route: '/inventory/vendors',
  },
  {
    id: 'purchase-tracking',
    name: 'Purchases',
    desc: 'Track purchase orders and incoming stock',
    icon: ShoppingCart,
    category: 'procurement',
    route: '/inventory/purchases',
  },
  {
    id: 'item-master',
    name: 'Items',
    desc: 'Individual product and item master',
    icon: Package,
    category: 'management',
    route: '/inventory/items',
  },
  {
    id: 'asset-mgmt',
    name: 'Assets',
    desc: 'Manage fixed and company assets',
    icon: HardDrive,
    category: 'management',
    route: '/inventory/assets',
  },
  {
    id: 'inventory-tracking',
    name: 'Inventory',
    desc: 'Real-time stock levels and adjustments',
    icon: ClipboardList,
    category: 'management',
    route: '/inventory/stock',
  },
  {
    id: 'finance-mgmt',
    name: 'Finance & Accounting',
    desc: 'Manage financial records and accounting',
    icon: Calculator,
    category: 'finance',
    route: '/finance/expenses',
  },
];

const CATEGORIES = [
  { id: 'dashboard', name: 'Dashboard & Analytics', icon: LayoutDashboard },
  { id: 'finance', name: 'Finance & Accounting', icon: Calculator },
  { id: 'procurement', name: 'Procurement & Supply', icon: ShoppingCart },
  { id: 'management', name: 'Asset & Stock Management', icon: HardDrive },
];

// Category visual styles
const CAT_STYLES = {
  dashboard: {
    grid: 'lg:col-span-2',
    bg: 'bg-gradient-to-br from-emerald-50 to-white',
    iconBg: 'bg-emerald-600',
    accent: 'text-emerald-600',
    border: 'hover:border-emerald-400',
  },
  procurement: {
    grid: 'lg:col-span-2',
    bg: 'bg-gradient-to-br from-indigo-50 to-white',
    iconBg: 'bg-indigo-600',
    accent: 'text-indigo-600',
    border: 'hover:border-indigo-400',
  },
  management: {
    grid: 'lg:col-span-2',
    bg: 'bg-gradient-to-br from-rose-50 to-white',
    iconBg: 'bg-rose-600',
    accent: 'text-rose-600',
    border: 'hover:border-rose-400',
  },
  finance: {
    grid: 'lg:col-span-2',
    bg: 'bg-gradient-to-br from-orange-50 to-white',
    iconBg: 'bg-orange-600',
    accent: 'text-orange-600',
    border: 'hover:border-orange-400',
  },
};

export default function InventoryMain() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [logoutAdmin] = useLogoutAdminApiMutation();
  const router = useRouter();

  useEffect(() => { setIsLoaded(true); }, []);
  useEffect(() => { setMounted(true); }, []);

  const admin = useSelector((state) => state.adminAuth.adminInfo);
  const fullName = admin?.fullName || '';

  useEffect(() => {
    if (!admin) router.replace('/');
  }, [admin]);

  const useCardView = INVENTORY_MODULES.length <= 4;

  const filteredModules = useMemo(() =>
    INVENTORY_MODULES.filter((m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.desc.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [searchQuery]
  );

  const getModulesByCategory = (catId) =>
    filteredModules.filter((m) => m.category === catId);

  const handleLogout = async () => {
    try {
      await logoutAdmin().unwrap();
      window.location.href = '/';
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  if (!admin || !mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoaded={isLoaded} fullName={fullName} handleLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Title isLoaded={isLoaded} totalModules={filteredModules.length} />

        {!useCardView && (
          <SearchBar
            isLoaded={isLoaded}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {useCardView ? (
          <CardView modules={filteredModules} isLoaded={isLoaded} />
        ) : (
          <BentoView
            categories={CATEGORIES}
            getModulesByCategory={getModulesByCategory}
            isLoaded={isLoaded}
          />
        )}
      </main>
    </div>
  );
}

/* ─── Header ─────────────────────────────────────────────────────────────── */
function Header({ isLoaded, fullName, handleLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const getInitials = (name) => {
    if (!name) return 'AD';
    const parts = name.trim().split(' ');
    return parts.length === 1
      ? parts[0].substring(0, 2).toUpperCase()
      : (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img src="/TPFAid-LogoDesign-20.svg" className="h-9 w-auto" alt="TPFAid Logo" />
            <div className="hidden md:block h-8 w-px bg-gray-200" />
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-gray-900">Inventory Management</h1>
              <p className="text-xs text-gray-500">Finance & Transactions</p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <NotificationBell moduleFilter="FINANCE_TASK" />

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
                  {getInitials(fullName)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-900">{fullName || 'Admin'}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-1 z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                      <p className="text-xs text-gray-500 font-medium">Signed in as {fullName}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-semibold">Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ─── Title ───────────────────────────────────────────────────────────────── */
function Title({ isLoaded, totalModules }) {
  const router = useRouter();

  return (
    <div className="mb-10">
      {/* Back button */}
      <div className="mb-4">
        <button
          onClick={() => router.push('/select-portal?category=resource')}
          className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors font-medium text-sm"
        >
          <ArrowLeft size={16} />
          <span>Back to Select Portal</span>
        </button>
      </div>

      {/* Centered title block */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center space-x-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full mb-6"
        >
          <Layers className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">{totalModules} Active Modules</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold text-gray-900 mb-3"
        >
          Inventory <span className="text-emerald-600">System</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-gray-500 max-w-2xl mx-auto"
        >
          Comprehensive management and tracking hub for assets and procurement.
        </motion.p>
      </div>
    </div>
  );
}

/* ─── SearchBar ───────────────────────────────────────────────────────────── */
function SearchBar({ isLoaded, searchQuery, setSearchQuery }) {
  return (
    <div className="max-w-3xl mx-auto mb-12">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search inventory sections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:border-emerald-500 shadow-xl transition-all outline-none"
          />
        </div>
      </div>
    </div>
  );
}

/* ─── BentoView ───────────────────────────────────────────────────────────── */
function BentoView({ categories, getModulesByCategory, isLoaded }) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {categories.map((cat, idx) => {
        const modules = getModulesByCategory(cat.id);
        if (modules.length === 0) return null;

        const style = CAT_STYLES[cat.id] || {
          grid: 'col-span-1',
          bg: 'bg-white',
          iconBg: 'bg-gray-600',
          accent: 'text-gray-600',
          border: 'hover:border-gray-400',
        };

        const Icon = cat.icon;

        return (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.07 }}
            className={`group relative overflow-hidden rounded-3xl border border-gray-200 p-5 flex flex-col transition-all duration-300 shadow-sm ${style.grid} ${style.bg} ${style.border} hover:shadow-2xl hover:-translate-y-1`}
          >
            {/* Background watermark icon */}
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <Icon className="w-32 h-32 rotate-12" />
            </div>

            {/* Header */}
            <div className="relative mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${style.iconBg} text-white transition-transform group-hover:scale-110`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-white/60 backdrop-blur-sm rounded-full border border-gray-100 shadow-sm text-gray-500">
                  {modules.length} Modules
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{cat.name}</h2>
            </div>

            {/* Module buttons */}
            <div className="relative">
              <div className="grid grid-cols-1 gap-2">
                {modules.map((m) => {
                  const ModIcon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={(e) => { e.stopPropagation(); router.push(m.route); }}
                      className="flex items-center space-x-3 py-2.5 px-3 bg-white/80 hover:bg-white rounded-xl border border-transparent hover:border-emerald-200 transition-all group/btn shadow-sm text-left"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${style.iconBg} text-white flex-shrink-0`}>
                        {ModIcon ? <ModIcon className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-gray-700 truncate block">{m.name}</span>
                        <span className="text-xs text-gray-400 truncate block">{m.desc}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover/btn:text-emerald-500 group-hover/btn:translate-x-0.5 transition-all flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─── CardView (fallback for ≤4 modules) ─────────────────────────────────── */
function CardView({ modules, isLoaded }) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
      {modules.map((p, idx) => {
        const Icon = p.icon;
        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => router.push(p.route)}
            className="group relative bg-white border border-gray-200 rounded-3xl p-5 cursor-pointer transition-all duration-300 hover:border-emerald-500 hover:shadow-2xl hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">
                {p.name}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">{p.desc}</p>
              <div className="flex items-center text-emerald-600 text-xs font-bold uppercase tracking-widest mt-4 opacity-40 group-hover:opacity-100 transition-all">
                <span>Open Module</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
