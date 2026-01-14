'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MODULES } from "../config/modules";
import { useSelector } from 'react-redux';
import {
  useLogoutAdminApiMutation,
  useLazyGetAdminMeQuery
} from '@/utils/slices/adminApiSlice';


import {
  LogOut,
  Search,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Users,
  Heart,
  UserCheck,
  FolderKanban,
  Calculator,
  Package,
  MapPin,
  FileText,
  Scale,
  UserCog,
  Bell,
  Globe,
  Shield,
  Settings,
  ArrowRight,
  LayoutGrid,
  User,
  KeyRound,
  Layers,
  LayoutDashboard,
  MessageSquare,
  Zap,
} from 'lucide-react';
import LoginNotificationModal from '../Common/LoginNotificationModal';

const CATEGORIES = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'administration', name: 'Administration', icon: Settings },
  { id: 'people', name: 'People Management', icon: Users },
  { id: 'finance', name: 'Finance & Transactions', icon: Calculator },
  { id: 'operations', name: 'Operations', icon: FolderKanban },
  { id: 'documentation', name: 'Documentation', icon: FileText },
  { id: 'verify-forms', name: 'Verify Forms', icon: Shield },
  { id: 'communication', name: 'Communication', icon: MessageSquare },
  { id: 'quick-access', name: 'Quick Access', icon: Zap },
];

export default function SelectPanel() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategories, setOpenCategories] = useState([]);
  const [hasSelectedCategory, setHasSelectedCategory] = useState(false);
  const [mounted, setMounted] = useState(false);


  const [logoutAdmin] = useLogoutAdminApiMutation();

  const router = useRouter();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const admin = useSelector((state) => state.adminAuth.adminInfo);

  const fullName = admin?.fullName || "";
  const adminModules = admin?.modules || [];

  useEffect(() => {
    if (!admin) {
      router.replace("/");
    }
  }, [admin]);


  const allowedModules = useMemo(() => {
    return MODULES.filter((mod) =>
      adminModules.includes(mod.id) ||
      (adminModules.includes("Admin Dashboard") && mod.category === "dashboard")
    );
  }, [adminModules]);



  const useCardView = allowedModules.length <= 4;

  const filteredModules = useMemo(() =>
    allowedModules.filter((m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.desc.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [allowedModules, searchQuery]
  );

  const getModulesByCategory = (catId) =>
    filteredModules.filter((m) => m.category === catId);

  const toggleCategory = (catId) => {
    setOpenCategories((prev) => {
      // If clicking the already open category, close it
      if (prev.includes(catId)) {
        setHasSelectedCategory(false);
        return [];
      }

      // Otherwise, open only this category (close others)
      setHasSelectedCategory(true);
      return [catId];
    });
  };

  const handleLogout = async () => {
    await logoutAdmin().unwrap();
    window.location.href = "/";
  };



  useEffect(() => {
    if (searchQuery) {
      const matching = CATEGORIES.filter(
        (cat) => getModulesByCategory(cat.id).length > 0
      ).map((cat) => cat.id);
      setOpenCategories(matching);
    }
  }, [searchQuery]);

  if (!admin || !mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }



  if (!mounted) {
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
      <LoginNotificationModal />
      <Header
        isLoaded={isLoaded}
        handleLogout={handleLogout}
        fullName={fullName}
      />


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
          <ListView
            categories={CATEGORIES}
            getModulesByCategory={getModulesByCategory}
            openCategories={openCategories}
            toggleCategory={toggleCategory}
            isLoaded={isLoaded}
            hasSelectedCategory={hasSelectedCategory}
          />
        )}
      </main>
    </div>
  );
}

function Header({ isLoaded, handleLogout, fullName }) {

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const getInitials = (fullName) => {
    if (!fullName) return "AD";

    const parts = fullName.trim().split(" ");
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return (parts[0][0] + parts[1][0]).toUpperCase();
  };





  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <img src="/TPFAid-LogoDesign-20.svg" className="h-9 w-auto" alt="TPFAid Logo" />
            <div className="hidden md:block h-8 w-px bg-gray-200"></div>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-gray-900">Admin Portal</h1>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">


            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
                  {getInitials(fullName)}
                </div>

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
                      <p className="text-xs text-gray-500 mt-0.5">Signed in as {fullName} </p>
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
      </div>
    </header>
  );
}

function Title({ isLoaded, totalModules }) {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-emerald-100 rounded-full mb-4">
        <Layers className="w-4 h-4 text-emerald-600" />
        <span className="text-sm font-medium text-emerald-700">{totalModules} Modules Available</span>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Select Your Module</h1>
      <p className="text-gray-600">Choose the module you'd like to access and start working</p>
    </div>
  );
}

function SearchBar({ isLoaded, searchQuery, setSearchQuery }) {
  return (
    <div className="max-w-2xl mx-auto mb-10">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search modules by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
        />
      </div>
    </div>
  );
}

function CardView({ modules, isLoaded }) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
      {modules.map((p) => {
        const Icon = p.icon;

        return (
          <div
            key={p.id}
            onClick={() => router.push(p.route)}
            className="group relative bg-white border-2 border-gray-200 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:border-emerald-500 hover:shadow-lg"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md mb-4 group-hover:scale-105 transition-transform">
                <Icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                {p.name}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">{p.desc}</p>

              <div className="flex items-center text-emerald-600 text-sm font-medium mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Open module</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListView({
  categories,
  getModulesByCategory,
  openCategories,
  toggleCategory,
  isLoaded,
  hasSelectedCategory,
}) {
  const router = useRouter();

  return (
    <div className={`w-full mx-auto transition-all duration-1000 ease-in-out ${hasSelectedCategory ? 'max-w-7xl' : 'max-w-3xl'}`}>
      <div className={`grid gap-6 transition-all duration-1000 ease-in-out ${hasSelectedCategory ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
        {/* Categories - Center initially, moves to left sidebar when selected */}
        <div className={`transition-all duration-1000 ease-in-out ${hasSelectedCategory ? 'lg:col-span-4 xl:col-span-3' : 'col-span-1'}`}>
          <div className={`bg-white rounded-xl border border-gray-200 p-4 sm:p-5 transition-all duration-1000 ease-in-out shadow-sm ${hasSelectedCategory ? 'lg:sticky lg:top-24' : 'shadow-md'}`}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 px-2 whitespace-nowrap">
              {hasSelectedCategory ? 'Categories' : 'Select a Category'}
            </h3>
            <nav className="space-y-1">
              {categories.map((category) => {
                const categoryModules = getModulesByCategory(category.id);
                const isOpen = openCategories.includes(category.id);
                const CatIcon = category.icon;

                if (categoryModules.length === 0) return null;

                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-3 sm:py-3.5 rounded-lg transition-colors duration-300 ease-out ${isOpen
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center space-x-3 flex-1 overflow-hidden">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-colors duration-300 ease-out flex-shrink-0 ${isOpen ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                        <CatIcon className="w-5 h-5" />
                      </div>
                      <div className="text-left overflow-hidden flex-1">
                        <p className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">{category.name}</p>
                        <p className="text-xs text-gray-500 whitespace-nowrap">{categoryModules.length} modules</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform duration-300 ease-out flex-shrink-0 ml-2 ${isOpen ? 'rotate-90' : ''}`} />
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Modules - Only show when category is selected */}
        {hasSelectedCategory && (
          <div className="lg:col-span-8 xl:col-span-9 space-y-4 sm:space-y-6 animate-fadeIn">
            {categories.map((category) => {
              const categoryModules = getModulesByCategory(category.id);
              const isOpen = openCategories.includes(category.id);
              const CatIcon = category.icon;

              if (categoryModules.length === 0 || !isOpen) return null;

              return (
                <div key={category.id} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
                  <div className="flex items-center space-x-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-100">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
                      <CatIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{category.name}</h2>
                      <p className="text-xs sm:text-sm text-gray-500">{categoryModules.length} modules in this category</p>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    {categoryModules.map((module) => {
                      const Icon = module.icon;

                      return (
                        <div
                          key={module.id}
                          onClick={() => router.push(module.route)}
                          className="group flex items-center justify-between p-3 sm:p-4 bg-gray-50 hover:bg-emerald-50 border-2 border-transparent hover:border-emerald-500 rounded-lg cursor-pointer transition-all duration-300 ease-out"
                        >
                          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-white border-2 border-gray-200 group-hover:border-emerald-500 flex items-center justify-center transition-all duration-300 ease-out flex-shrink-0">
                              <Icon className="w-5 h-5 text-gray-600 group-hover:text-emerald-600 transition-colors duration-300 ease-out" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm sm:text-base text-gray-900 group-hover:text-emerald-600 transition-colors duration-300 ease-out truncate">
                                {module.name}
                              </h4>
                              <p className="text-xs sm:text-sm text-gray-600 truncate">{module.desc}</p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-300 ease-out flex-shrink-0" />
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
  );
}