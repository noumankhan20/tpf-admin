'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';

/* ------------------------------------------------------
   MODULE DEFINITIONS (Roles Embedded)
------------------------------------------------------- */
const MODULES = [
  { id: 'dashboard', name: 'Dashboard Module', icon: TrendingUp, route: '/dashboard', desc: 'Overview of key metrics and system status', category: 'administration', roles: ['superadmin'] },

  { id: 'admin', name: 'Admin & System Settings', icon: Settings, route: '/admin-settings', desc: 'System configuration and settings', category: 'administration', roles: ['superadmin'] },

  { id: 'security', name: 'Security & Access Control', icon: Shield, route: '/security', desc: 'Manage permissions and security', category: 'administration', roles: ['superadmin'] },

  { id: 'donor', name: 'Donor Management', icon: Users, route: '/donor', desc: 'Manage donor profiles and relationships', category: 'people', roles: ['donor-admin', 'superadmin'] },

  { id: 'beneficiary', name: 'Beneficiary Management', icon: UserCheck, route: '/beneficiary', desc: 'Manage beneficiary records and support', category: 'people', roles: [] },

  { id: 'field', name: 'Volunteer Management', icon: MapPin, route: '/field-operations', desc: 'Manage volunteers and field activities', category: 'people', roles: ['volunteer-admin', 'superadmin'] },

  { id: 'hr', name: 'HR & Employee Management', icon: UserCog, route: '/hr', desc: 'Employee records, payroll and HR tasks', category: 'people', roles: ['hr-admin', 'superadmin'] },

  { id: 'donations', name: 'Transaction Management', icon: Heart, route: '/donations', desc: 'Individual & Organisation donation tracking', category: 'finance', roles: ['finance-admin', 'superadmin'] },

  { id: 'finance', name: 'Finance & Accounting', icon: Calculator, route: '/finance', desc: 'Financial tracking, budgets and reports', category: 'finance', roles: ['finance-admin', 'superadmin'] },

  { id: 'inventory', name: 'Inventory & Asset Management', icon: Package, route: '/inventory', desc: 'Track inventory, assets and resources', category: 'finance', roles: ['finance-admin', 'superadmin'] },

  { id: 'projects', name: 'Project Management', icon: FolderKanban, route: '/projects', desc: 'Create and track projects', category: 'operations', roles: ['project-admin', 'superadmin'] },

  { id: 'campaigns', name: 'Campaign Management', icon: Bell, route: '/campaigns', desc: 'Manage fundraising campaigns', category: 'operations', roles: ['campaign-admin', 'superadmin'] },

  { id: 'fieldops', name: 'Field Operations', icon: MapPin, route: '/field-ops', desc: 'Coordinate field activities', category: 'operations', roles: [] },

  { id: 'dms', name: 'Document Management', icon: FileText, route: '/documents', desc: 'Store and organize all documents', category: 'documentation', roles: ['hr-admin', 'superadmin'] },

  { id: 'legal', name: 'Legal & Compliance', icon: Scale, route: '/legal', desc: 'Legal documents and compliance tracking', category: 'documentation', roles: ['hr-admin', 'superadmin', 'donor-admin'] },

  { id: 'cms', name: 'Content Management System (CMS)', icon: Globe, route: '/cms', desc: 'Manage website and app content', category: 'documentation', roles: ['cms-admin', 'superadmin'] },
];

const CATEGORIES = [
  { id: 'administration', name: 'Administration', icon: Settings },
  { id: 'people', name: 'People Management', icon: Users },
  { id: 'finance', name: 'Finance & Transactions', icon: Calculator },
  { id: 'operations', name: 'Operations', icon: FolderKanban },
  { id: 'documentation', name: 'Documentation', icon: FileText },
];

/* ------------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------- */
export default function SelectPanel() {
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategories, setOpenCategories] = useState(['administration']);
  const [roles, setRoles] = useState([]);
  const router = useRouter();

  /* Load animation */
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  /* Load roles */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('roles') || '[]');
    setRoles(stored);
  }, []);

  /* Card View logic */
  const useCardView =
    roles.length > 0 && roles.length <= 4 && !roles.includes('superadmin');

  /* Filter modules based on roles */
  const allowedModules = MODULES.filter((m) =>
    m.roles.some((role) => roles.includes(role))
  );

  /* Search filter */
  const filteredModules = allowedModules.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getModulesByCategory = (catId) =>
    filteredModules.filter((m) => m.category === catId);

  const toggleCategory = (catId) => {
    setOpenCategories((prev) =>
      prev.includes(catId)
        ? prev.filter((c) => c !== catId)
        : [...prev, catId]
    );
  };

  const handleModuleSelect = (moduleId) => setSelectedPanel(moduleId);

  const handleContinue = () => {
    const module = MODULES.find((m) => m.id === selectedPanel);
    if (module) router.push(module.route);
  };

  const handleLogout = () => console.log('Logging out...');

  /* Auto-expand categories on search */
  useEffect(() => {
    if (searchQuery) {
      const matching = CATEGORIES.filter(
        (cat) => getModulesByCategory(cat.id).length > 0
      ).map((cat) => cat.id);
      setOpenCategories(matching);
    }
  }, [searchQuery]);

  /* ------------------------------------------------------
        RENDER
  ------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 relative overflow-hidden">
      <BgAnimation />
      <Header isLoaded={isLoaded} handleLogout={handleLogout} />

      <main className="relative z-10 flex flex-col items-center px-4 py-6 md:py-10">
        <Title isLoaded={isLoaded} />

        {!useCardView && (
          <SearchBar
            isLoaded={isLoaded}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {useCardView ? (
          <CardView selectedPanel={selectedPanel} setSelectedPanel={setSelectedPanel} roles={roles} />
        ) : (
          <AccordionView
            selectedPanel={selectedPanel}
            setSelectedPanel={setSelectedPanel}
            filteredModules={filteredModules}
            openCategories={openCategories}
            toggleCategory={toggleCategory}
            getModulesByCategory={getModulesByCategory}
            isLoaded={isLoaded}
          />
        )}

        <ContinueButton selectedPanel={selectedPanel} handleContinue={handleContinue} isLoaded={isLoaded} />
      </main>
    </div>
  );
}

/* ------------------------------------------------------
   COMPONENTS
------------------------------------------------------- */

function BgAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
    </div>
  );
}

function Header({ isLoaded, handleLogout }) {
  return (
    <header className={`relative z-10 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
      <div className="flex items-center justify-between p-4 md:p-6">
        <div className={`transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100' : 'opacity-0 -translate-x-4'}`}>
          <img src="/TPFAid-LogoDesign-20.svg" className="w-28 h-12 object-contain" />
        </div>

        <button
          onClick={handleLogout}
          className={`flex items-center space-x-2 text-gray-300 hover:text-white bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700/50 group transition duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0 translate-x-4'}`}
        >
          <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </header>
  );
}

function Title({ isLoaded }) {
  return (
    <div className={`text-center mb-6 md:mb-8 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">Select Your Module</h1>
      <p className="text-gray-400 text-sm md:text-base">Choose the module you'd like to access</p>
    </div>
  );
}

function SearchBar({ isLoaded, searchQuery, setSearchQuery }) {
  return (
    <div className={`w-full max-w-xl mb-6 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search modules..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-gray-800/40 border border-gray-700/40 rounded-xl text-white placeholder-gray-500"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------
   CARD VIEW
------------------------------------------------------- */
function CardView({ selectedPanel, setSelectedPanel, roles }) {
  const router = useRouter();

  const PANEL_MAP = {
    'hr-admin': { id: 'hr', title: 'HR Admin', icon: UserCog, desc: 'HR & employee records', route: '/hr' },
    'volunteer-admin': { id: 'field', title: 'Volunteer Admin', icon: MapPin, desc: 'Volunteers & activities', route: '/field-operations' },
    'cms-admin': { id: 'cms', title: 'CMS Admin', icon: Globe, desc: 'Content Management System', route: '/cms' },
    'finance-admin': { id: 'finance', title: 'Finance Admin', icon: Calculator, desc: 'Financial operations', route: '/finance' },
    'donor-admin': { id: 'donor', title: 'Donor Admin', icon: Users, desc: 'Donor relationships', route: '/donor' },
    'project-admin': { id: 'projects', title: 'Project Admin', icon: FolderKanban, desc: 'Organisation projects', route: '/projects' },
    'campaign-admin': { id: 'campaigns', title: 'Campaign Admin', icon: Bell, desc: 'Fundraising campaigns', route: '/campaigns' },
    'documentation-admin': { id: 'dms', title: 'Documents Admin', icon: FileText, desc: 'Document access & storage', route: '/documents' },
    'legal-admin': { id: 'legal', title: 'Legal Admin', icon: Scale, desc: 'Legal & compliance tasks', route: '/legal' },
  };

  const panels = roles.map((r) => PANEL_MAP[r]).filter(Boolean);

  return (
    <div className="flex flex-col md:flex-row md:justify-center md:flex-wrap w-full mt-6 px-2 gap-4 max-w-6xl mx-auto">
      {panels.map((p) => {
        const Icon = p.icon;
        const isSelected = selectedPanel === p.id;

        return (
          <div
            key={p.id}
            onClick={() => setSelectedPanel(p.id)}
            onDoubleClick={() => router.push(p.route)}
            className={`group relative bg-gray-800/60 border rounded-xl p-4 cursor-pointer transition-all duration-300 w-full md:w-[280px]
              ${isSelected ? 'border-emerald-500 shadow-emerald-500/20 scale-[1.03]' 
              : 'border-gray-700 hover:border-emerald-500 hover:scale-[1.02]'}`}
          >
            {isSelected && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} stroke="currentColor" d="M5 13l3 3L19 7" />
                </svg>
              </div>
            )}

            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md">
                <Icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-lg font-semibold text-white mb-1">{p.title}</h3>
              <p className="text-gray-400 text-xs leading-tight">{p.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------
   ACCORDION
------------------------------------------------------- */
function AccordionView({
  selectedPanel,
  setSelectedPanel,
  filteredModules,
  openCategories,
  toggleCategory,
  getModulesByCategory,
  isLoaded,
}) {
  return (
    <div className={`w-full max-w-xl space-y-3 mb-8 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
      {CATEGORIES.map((category) => {
        const categoryModules = getModulesByCategory(category.id);
        const isOpen = openCategories.includes(category.id);
        const CatIcon = category.icon;

        if (categoryModules.length === 0) return null;

        return (
          <div key={category.id} className="bg-gray-800/50 border border-gray-700/40 rounded-xl overflow-hidden">
            <button onClick={() => toggleCategory(category.id)} className="w-full p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <CatIcon className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-white font-semibold">{category.name}</span>
                <span className="text-xs text-gray-500 bg-gray-700/50 px-2 rounded">{categoryModules.length}</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className={`${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden transition-all duration-300`}>
              <div className="border-t border-gray-700/30">
                {categoryModules.map((module) => {
                  const Icon = module.icon;
                  const isSelected = selectedPanel === module.id;

                  return (
                    <div
                      key={module.id}
                      onClick={() => setSelectedPanel(module.id)}
                      className={`flex items-center px-4 py-3 cursor-pointer transition ${
                        isSelected
                          ? 'bg-emerald-500/20 border-l-2 border-emerald-500'
                          : 'hover:bg-gray-700/30'
                      }`}
                    >
                      <div className="flex items-center flex-1 min-w-0 space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-emerald-500' : 'bg-gray-700/50'}`}>
                          <Icon className={isSelected ? 'text-white' : 'text-gray-400'} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`truncate font-medium ${isSelected ? 'text-emerald-100' : 'text-white'}`}>{module.name}</p>
                          <p className="text-xs text-gray-500 truncate">{module.desc}</p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-emerald-300' : 'text-gray-600'}`} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------
   Continue Button
------------------------------------------------------- */
function ContinueButton({ selectedPanel, handleContinue, isLoaded }) {
  return (
    <div className={`transition-all ${selectedPanel ? 'opacity-100' : 'opacity-0 pointer-events-none'} duration-500`}>
      <button
        onClick={handleContinue}
        className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl shadow-lg flex items-center space-x-2 mt-4"
      >
        <span className="text-lg">Continue</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
