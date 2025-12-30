'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
    LayoutDashboard,
    Users,
    Package,
    ShoppingCart,
    HardDrive,
    ClipboardList,
    Receipt,
    BarChart3,
    ChevronRight,
    Search,
    ArrowLeft,
    Layers,
    LogOut,
    ChevronDown
} from 'lucide-react';
import { useLogoutAdminApiMutation } from '@/utils/slices/adminApiSlice';

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
        category: 'vendors',
        route: '/inventory/vendors',
    },
    {
        id: 'item-master',
        name: 'Items',
        desc: 'Individual product and item master',
        icon: Package,
        category: 'items',
        route: '/inventory/items',
    },
    {
        id: 'purchase-tracking',
        name: 'Purchases',
        desc: 'Track purchase orders and incoming stock',
        icon: ShoppingCart,
        category: 'purchases',
        route: '/inventory/purchases',
    },
    {
        id: 'asset-mgmt',
        name: 'Assets',
        desc: 'Manage fixed and company assets',
        icon: HardDrive,
        category: 'assets',
        route: '/inventory/assets',
    },
    {
        id: 'inventory-tracking',
        name: 'Inventory',
        desc: 'Real-time stock levels and adjustments',
        icon: ClipboardList,
        category: 'inventory',
        route: '/inventory/stock',
    },
    {
        id: 'expense-mgmt',
        name: 'Expenses',
        desc: 'Operational and maintenance costs',
        icon: Receipt,
        category: 'expenses',
        route: '/inventory/expenses',
    },
];

const CATEGORIES = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'vendors', name: 'Vendors', icon: Users },
    { id: 'items', name: 'Items', icon: Package },
    { id: 'purchases', name: 'Purchases', icon: ShoppingCart },
    { id: 'assets', name: 'Assets', icon: HardDrive },
    { id: 'inventory', name: 'Inventory', icon: ClipboardList },
    { id: 'expenses', name: 'Expenses', icon: Receipt },
];

export default function InventoryMain() {
    const [searchQuery, setSearchQuery] = useState('');
    const [openCategories, setOpenCategories] = useState(['dashboard']);
    const [hasSelectedCategory, setHasSelectedCategory] = useState(true);
    const [mounted, setMounted] = useState(false);

    const router = useRouter();
    const admin = useSelector((state) => state.adminAuth.adminInfo);
    const fullName = admin?.fullName || "";

    const [logoutAdmin] = useLogoutAdminApiMutation();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        try {
            await logoutAdmin().unwrap();
            window.location.href = "/";
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    const filteredModules = useMemo(() =>
        INVENTORY_MODULES.filter((m) =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.desc.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        [searchQuery]
    );

    const getModulesByCategory = (catId) =>
        filteredModules.filter((m) => m.category === catId);

    const toggleCategory = (catId) => {
        setOpenCategories((prev) => {
            if (prev.includes(catId)) {
                if (prev.length === 1) return prev; // Keep at least one open
                return prev.filter(id => id !== catId);
            }
            return [catId]; // Only keep one open to match user's implied single-select logic or common sidebar behavior
        });
        setHasSelectedCategory(true);
    };

    useEffect(() => {
        if (searchQuery) {
            const matching = CATEGORIES.filter(
                (cat) => getModulesByCategory(cat.id).length > 0
            ).map((cat) => cat.id);
            setOpenCategories(matching);
        }
    }, [searchQuery]);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header fullName={fullName} handleLogout={handleLogout} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Title totalModules={filteredModules.length} />

                <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

                <div className={`w-full mx-auto transition-all duration-700 ${hasSelectedCategory ? 'max-w-7xl' : 'max-w-3xl'}`}>
                    <div className={`grid gap-6 ${hasSelectedCategory ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
                        {/* Categories Sidebar */}
                        <div className={`${hasSelectedCategory ? 'lg:col-span-4 xl:col-span-3' : 'col-span-1'}`}>
                            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm sticky top-24">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 px-2">
                                    Inventory Sections
                                </h3>
                                <nav className="space-y-1">
                                    {CATEGORIES.map((category) => {
                                        const categoryModules = getModulesByCategory(category.id);
                                        const isOpen = openCategories.includes(category.id);
                                        const CatIcon = category.icon;
                                        if (categoryModules.length === 0 && searchQuery) return null;
                                        return (
                                            <button
                                                key={category.id}
                                                onClick={() => toggleCategory(category.id)}
                                                className={`w-full flex items-center justify-between px-3 py-3.5 rounded-lg transition-all ${isOpen ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-3 overflow-hidden">
                                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${isOpen ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        <CatIcon size={18} />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-sm font-medium">{category.name}</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        </div>

                        {/* Modules Area */}
                        {hasSelectedCategory && (
                            <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                                {CATEGORIES.map((category) => {
                                    const categoryModules = getModulesByCategory(category.id);
                                    const isOpen = openCategories.includes(category.id);
                                    if (categoryModules.length === 0 || !isOpen) return null;
                                    return (
                                        <div key={category.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
                                                <div className="w-11 h-11 rounded-lg bg-emerald-500 flex items-center justify-center">
                                                    <category.icon className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold text-gray-900">{category.name}</h2>
                                                    <p className="text-sm text-gray-500">{categoryModules.length} modules available</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {categoryModules.map((module) => {
                                                    const Icon = module.icon;
                                                    return (
                                                        <div
                                                            key={module.id}
                                                            onClick={() => router.push(module.route)}
                                                            className="group flex items-center justify-between p-4 bg-gray-50 hover:bg-emerald-50 border-2 border-transparent hover:border-emerald-500 rounded-lg cursor-pointer transition-all"
                                                        >
                                                            <div className="flex items-center space-x-4">
                                                                <div className="w-11 h-11 rounded-lg bg-white border-2 border-gray-200 group-hover:border-emerald-500 flex items-center justify-center transition-all">
                                                                    <Icon className="w-5 h-5 text-gray-600 group-hover:text-emerald-600" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold text-gray-900 group-hover:text-emerald-600">{module.name}</h4>
                                                                    <p className="text-xs text-gray-600">{module.desc}</p>
                                                                </div>
                                                            </div>
                                                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

function Header({ fullName, handleLogout }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const getInitials = (name) => name?.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) || "AD";

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3">
                        <img src="/TPFAid-LogoDesign-20.svg" className="h-9 w-auto" alt="TPFAid Logo" />
                        <div className="hidden md:block h-8 w-px bg-gray-200"></div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">Inventory Management</h1>
                            <p className="text-xs text-gray-500">Finance & Transactions</p>
                        </div>
                    </div>
                    <div className="relative">
                        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">{getInitials(fullName)}</div>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-semibold text-gray-900">
                                    {fullName || "Admin"}
                                </p>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {dropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setDropdownOpen(false)}
                                ></div>
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-xs text-gray-500 mt-0.5">Signed in as {fullName}</p>
                                    </div>
                                    <div className="py-1">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span className="text-sm font-medium">Logout</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

function Title({ totalModules }) {
    const router = useRouter();
    return (
        <div className="relative mb-8 pt-4">
            <button onClick={() => router.push('/select-portal')} className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors font-medium mb-6">
                <ArrowLeft size={20} />
                <span>Back to Select Portal</span>
            </button>
            <div className="text-center">
                <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-emerald-100 rounded-full mb-4">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">{totalModules} Active Modules</span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Inventory System</h1>
                <p className="text-gray-600">Comprehensive management and tracking hub</p>
            </div>
        </div>
    );
}

function SearchBar({ searchQuery, setSearchQuery }) {
    return (
        <div className="max-w-2xl mx-auto mb-10">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search inventory sections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                />
            </div>
        </div>
    );
}
