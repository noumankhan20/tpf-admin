'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MODULES } from "../config/modules";
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  useLogoutAdminApiMutation,
  useLazyGetAdminMeQuery
} from '@/utils/slices/adminApiSlice';
import { useSocket } from '@/utils/context/SocketContext';

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
  Briefcase,
} from 'lucide-react';
import LoginNotificationModal from '../Common/LoginNotificationModal';
import NotificationDropdown from '../Admin/Communication/NotificationDropdown';
import NotificationBell from '../Common/NotificationBell';
import LoadingScreen from '../Common/LoadingScreen';
import { Calendar as CalendarIcon } from 'lucide-react';



// const CATEGORIES = [
//   { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
//   { id: 'administration', name: 'Administration', icon: Settings },
//   { id: 'people', name: 'People Management', icon: Users },
//   { id: 'finance', name: 'Finance & Transactions', icon: Calculator },
//   { id: 'operations', name: 'Operations', icon: FolderKanban },
//   { id: 'documentation', name: 'Documentation', icon: FileText },
//   { id: 'verify-forms', name: 'Verify Forms', icon: Shield },
//   { id: 'communication', name: 'Communication', icon: MessageSquare },
//   { id: 'quick-access', name: 'Quick Access', icon: Zap },
// ];

const CATEGORIES = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'tpf-management', name: 'TPF-Management', icon: Users },
  { id: 'monitoring', name: 'Monitoring', icon: Layers },
  { id: 'work', name: 'Work', icon: FolderKanban },
  { id: 'resource', name: 'Resource Management', icon: Package },
  { id: 'hr', name: 'Human Resources', icon: Briefcase },
  { id: 'administration', name: 'Administration', icon: Settings },
  { id: 'legal', name: 'Legal & Records', icon: Scale },
  { id: 'communication', name: 'Communication', icon: MessageSquare },
];


export default function SelectPanel() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [moduleCounts, setModuleCounts] = useState({});
  
  const socketContext = useSocket();
  const socket = socketContext?.socket;


  const [logoutAdmin] = useLogoutAdminApiMutation();

  const router = useRouter();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    setMounted(true);

    const hasSeenLoading = sessionStorage.getItem('hasSeenLoadingScreen');

    if (!hasSeenLoading) {
      setShowLoading(true);
      sessionStorage.setItem('hasSeenLoadingScreen', 'true');

      // Hide loading screen after 3 seconds
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  const admin = useSelector((state) => state.adminAuth.adminInfo);

  const fullName = admin?.fullName || "";
  const adminModules = admin?.modules || [];

  useEffect(() => {
    if (!admin) {
      router.replace("/");
    }
  }, [admin]);

  useEffect(() => {
    const fetchInitialCounts = async () => {
      const adminId = admin?._id || admin?.id;
      if (!adminId) return;

      try {
        const apiBase = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:7000/api';
        let newCounts = {};
        
        const increment = (id) => {
          newCounts[id] = (newCounts[id] || 0) + 1;
        };

        // Tasks
        const taskRes = await fetch(`${apiBase}/workflow/tasks/pending-all`, { credentials: 'include' });
        const taskResult = await taskRes.json();
        if (taskResult.success && taskResult.data) {
          taskResult.data.forEach(task => {
            if (task.module === 'PHOTO_TASK') { increment('Photography'); increment('Photo-Editing'); }
            if (task.module === 'CMS_TASK') increment('CMS-Admin');
            if (task.module === 'SOCIAL_TASK') increment('Social-Media');
            if (task.module === 'FINANCE_TASK') increment('Disbursement-Tasks');
          });
        }

        // Financial Aid Verifications
        if (admin?.isSuperAdmin || adminModules.includes('Financial Aid')) {
          const formRes = await fetch(`${apiBase}/admin/verify/forms?status=pending`, { credentials: 'include' });
          const formResult = await formRes.json();
          if (formResult.success && formResult.data) {
            formResult.data.forEach(() => increment('Financial Aid'));
          }
        }

        // KYC Verification (Fixed)
        if (admin?.isSuperAdmin || adminModules.includes('KYC Verification')) {
          const kycRes = await fetch(`${apiBase}/admin/kyc/requests?status=pending`, { credentials: 'include' });
          const kycResult = await kycRes.json();
          if (kycResult.success && kycResult.data) {
            kycResult.data.forEach(() => increment('KYC Verification')); // This increments the count for 'KYC Verification'
          }
        }

        // Organization Verification
        if (admin?.isSuperAdmin || adminModules.includes('Organization Verification')) {
          const orgRes = await fetch(`${apiBase}/organizations?verificationStatus=pending`, { credentials: 'include' });
          const orgResult = await orgRes.json();
          if (orgResult.success && orgResult.data) {
            orgResult.data.forEach(() => increment('Organization Verification'));
          }
          
          const allOrgRes = await fetch(`${apiBase}/organizations`, { credentials: 'include' });
          const allOrgResult = await allOrgRes.json();
          if (allOrgResult.success && allOrgResult.data) {
            allOrgResult.data.forEach(org => {
              if (org.editRequests?.status === 'pending') increment('Organization Verification');
            });
          }

          const campRes = await fetch(`${apiBase}/campaign-requests/all`, { credentials: 'include' });
          const campResult = await campRes.json();
          if (campResult.success && campResult.data) {
            campResult.data.forEach(req => {
              if (req.status === 'pending') increment('Organization Verification');
            });
          }
        }

        // Delete Requests
        if (admin?.isSuperAdmin) {
          const deleteRes = await fetch(`${apiBase}/delete/getall`, { credentials: 'include' });
          const deleteResult = await deleteRes.json();
          if (deleteResult.success && deleteResult.data) {
            deleteResult.data.forEach(req => {
              if (req.status === 'pending') increment('deletion');
            });
          }
        }
        
        // Offline Donations
        if (admin?.isSuperAdmin || adminModules.includes('Donation Management')) {
          const offlineRes = await fetch(`${apiBase}/offline-donations/pending-count`, { credentials: 'include' });
          const offlineResult = await offlineRes.json();
          if (offlineResult.count !== undefined) {
             newCounts['Donation Management'] = (newCounts['Donation Management'] || 0) + offlineResult.count;
          }
        }
        
        setModuleCounts(newCounts);
      } catch (err) {
        console.error('Failed to fetch module notification counts:', err);
      }
    };
    
    fetchInitialCounts();
  }, [admin, adminModules]);

  // Handle Socket Updates for counts
  useEffect(() => {
    if (!socket) return;
    
    const handleTaskAssigned = (data) => {
        setModuleCounts(prev => {
            const next = { ...prev };
            const inc = (id) => next[id] = (next[id] || 0) + 1;
            if (data.module === 'PHOTO_TASK') { inc('Photography'); inc('Photo-Editing'); }
            if (data.module === 'CMS_TASK') inc('CMS-Admin');
            if (data.module === 'SOCIAL_TASK') inc('Social-Media');
            if (data.module === 'FINANCE_TASK') inc('Disbursement-Tasks');
            return next;
        });
    };

    const handleFormSubmitted = (data) => {
        setModuleCounts(prev => {
            const next = { ...prev };
            const inc = (id) => next[id] = (next[id] || 0) + 1;
            if (data.type === 'KYC') inc('KYC Verification');
            else if (['ORGANIZATION', 'ORGANIZATION_EDIT', 'CAMPAIGN_REQUEST', 'CAMPAIGN_RESUBMITTED'].includes(data.type)) inc('Organization Verification');
            else inc('Financial Aid');
            return next;
        });
    };

    const handleDeleteRequestCreated = (data) => {
      if (admin?.isSuperAdmin) {
        setModuleCounts(prev => {
          const next = { ...prev };
          next['deletion'] = (next['deletion'] || 0) + 1;
          return next;
        });
      }
    };

    const handleOfflineDonationCreated = () => {
        setModuleCounts(prev => {
            const next = { ...prev };
            next['Donation Management'] = (next['Donation Management'] || 0) + 1;
            return next;
        });
    };

    const handleOfflineDonationProcessed = () => {
        setModuleCounts(prev => {
            const next = { ...prev };
            next['Donation Management'] = Math.max(0, (next['Donation Management'] || 0) - 1);
            return next;
        });
    };

    socket.on('taskAssigned', handleTaskAssigned);
    socket.on('formSubmitted', handleFormSubmitted);
    socket.on('deleteRequestCreated', handleDeleteRequestCreated);
    socket.on('offlineDonationCreated', handleOfflineDonationCreated);
    socket.on('offlineDonationProcessed', handleOfflineDonationProcessed);
    
    return () => {
        socket.off('taskAssigned', handleTaskAssigned);
        socket.off('formSubmitted', handleFormSubmitted);
        socket.off('deleteRequestCreated', handleDeleteRequestCreated);
        socket.off('offlineDonationCreated', handleOfflineDonationCreated);
        socket.off('offlineDonationProcessed', handleOfflineDonationProcessed);
    };
  }, [socket]);


  const allowedModules = useMemo(() => {
    if (admin?.isSuperAdmin) return MODULES;
    return MODULES.filter((mod) =>
      adminModules.includes(mod.id) ||
      (adminModules.includes("Admin Dashboard") && mod.category === "dashboard") ||
      mod.id === "Internal Communication"
    );
  }, [adminModules, admin?.isSuperAdmin]);



  const useCardView = allowedModules.length <= 4;

  const filteredModules = useMemo(() =>
    allowedModules.filter((m) =>
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.desc?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [allowedModules, searchQuery]
  );

  const getModulesByCategory = (catId) =>
    filteredModules.filter((m) => m.category === catId);

  const handleLogout = async () => {
    await logoutAdmin().unwrap();
    window.location.href = "/";
  };


  if (!admin || !mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Show loading screen animation
  if (showLoading) {
    return <LoadingScreen onComplete={() => setShowLoading(false)} />;
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
          <CardView modules={filteredModules} isLoaded={isLoaded} moduleCounts={moduleCounts} />
        ) : (
          <BentoView
            categories={CATEGORIES}
            getModulesByCategory={getModulesByCategory}
            isLoaded={isLoaded}
            moduleCounts={moduleCounts}
          />
        )}
      </main>

    </div>
  );
}

function Header({ isLoaded, handleLogout, fullName }) {
  const router = useRouter();
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
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <img src="/TPFAid-Logo.png" className="h-9 w-auto" alt="TPFAid Logo" />
            <div className="hidden md:block h-8 w-px bg-gray-300"></div>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-gray-900">Admin Portal</h1>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <NotificationDropdown />
            <NotificationBell />

            <div className="h-8 w-px bg-gray-200 mx-2"></div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
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
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-1 z-20 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                        <p className="text-xs text-gray-500 font-medium whitespace-nowrap">Signed in as {fullName} </p>
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

              <button
                onClick={() => router.push('/admin/dashboard/calendar')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 border border-gray-100 shadow-sm"
                title="Activity Calendar"
              >
                <CalendarIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function Title({ isLoaded, totalModules }) {
  return (
    <div className="text-center mb-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center space-x-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full mb-6"
      >
        <Layers className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">{totalModules} System Modules</span>
      </motion.div>
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-4xl md:text-5xl font-bold text-gray-900 mb-3"
      >
        Select Your <span className="text-emerald-600">Module</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-lg text-gray-500 max-w-2xl mx-auto"
      >
        High-performance management tools for your daily operations.
      </motion.p>
    </div>
  );
}

function SearchBar({ isLoaded, searchQuery, setSearchQuery }) {
  return (
    <div className="max-w-3xl mx-auto mb-12">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Quick search modules, reports, or tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:border-emerald-500 shadow-xl transition-all outline-none"
          />
        </div>
      </div>
    </div>
  );
}

function BentoView({ categories, getModulesByCategory, isLoaded, moduleCounts }) {
  const router = useRouter();

  const CAT_STYLES = {
    work: {
      grid: "lg:col-span-2",
      bg: "bg-gradient-to-br from-indigo-50 to-white",
      iconBg: "bg-indigo-600",
      accent: "text-indigo-600",
      border: "hover:border-indigo-400"
    },
    dashboard: {
      grid: "lg:col-span-1",
      bg: "bg-gradient-to-br from-emerald-50 to-white",
      iconBg: "bg-emerald-600",
      accent: "text-emerald-600",
      border: "hover:border-emerald-400"
    },
    monitoring: {
      grid: "lg:col-span-1",
      bg: "bg-gradient-to-br from-amber-50 to-white",
      iconBg: "bg-amber-600",
      accent: "text-amber-600",
      border: "hover:border-amber-400"
    },
    resource: {
      grid: "lg:col-span-1 lg:row-span-1",
      bg: "bg-gradient-to-br from-rose-50 to-white",
      iconBg: "bg-rose-600",
      accent: "text-rose-600",
      border: "hover:border-rose-400"
    },
    administration: {
      grid: "lg:col-span-1",
      bg: "bg-gradient-to-br from-purple-50 to-white",
      iconBg: "bg-purple-600",
      accent: "text-purple-600",
      border: "hover:border-purple-400"
    },
    legal: {
      grid: "lg:col-span-1",
      bg: "bg-gradient-to-br from-slate-50 to-white",
      iconBg: "bg-slate-700",
      accent: "text-slate-700",
      border: "hover:border-slate-400"
    },
    communication: {
      grid: "lg:col-span-2 ",
      bg: "bg-gradient-to-br from-blue-50 to-white",
      iconBg: "bg-blue-600",
      accent: "text-blue-600",
      border: "hover:border-blue-400"
    },
    hr: {
      grid: "lg:col-span-1",
      bg: "bg-gradient-to-br from-green-50 to-white",
      iconBg: "bg-green-600",
      accent: "text-green-600",
      border: "hover:border-green-400"
    },
    "tpf-management": {
      grid: "lg:col-span-2 h-fit",
      bg: "bg-gradient-to-br from-teal-50 to-white",
      iconBg: "bg-teal-600",
      accent: "text-teal-600",
      border: "hover:border-teal-400"
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {categories.map((cat, idx) => {
        const modules = getModulesByCategory(cat.id);
        if (modules.length === 0) return null;

        const style = CAT_STYLES[cat.id] || {
          grid: "col-span-1",
          bg: "bg-white",
          iconBg: "bg-gray-600",
          accent: "text-gray-600",
          border: "hover:border-gray-400"
        };

        const Icon = cat.icon;

        return (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className={`group relative overflow-hidden rounded-3xl border border-gray-200 p-5 flex flex-col transition-all duration-300 shadow-sm ${style.grid} ${style.bg} ${style.border} hover:shadow-2xl hover:-translate-y-1`}
          >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <Icon className="w-32 h-32 rotate-12" />
            </div>

            <div className="relative mb-2">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${style.iconBg} text-white transition-transform group-hover:scale-110`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-white/60 backdrop-blur-sm rounded-full border border-gray-100 shadow-sm text-gray-500">
                  {modules.length} Modules
                </span>
              </div>


              <h2 className="text-2xl font-bold text-gray-900">{cat.name}</h2>
            </div>

            <div className="relative">
              <div className={`grid gap-2 ${cat.id === 'work' || cat.id === 'tpf-management' || cat.id === 'communication' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                {modules.map(m => (
                  <button
                    key={m.id}
                    onClick={(e) => { e.stopPropagation(); router.push(m.route); }}
                    className="flex items-center relative space-x-3 py-2 px-3 bg-white/80 hover:bg-white rounded-xl border border-transparent hover:border-emerald-200 transition-all group/btn shadow-sm"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${style.iconBg} text-white transition-colors`}>
                      {m.icon ? <m.icon className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                    <span className="text-xs font-semibold text-gray-700 truncate">{m.name}</span>
                    {moduleCounts?.[m.id] > 0 && (
                        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white min-w-[20px] h-5 rounded-full px-1 flex items-center justify-center text-[10px] font-bold shadow-md z-10 border-2 border-white">
                            {moduleCounts[m.id]}
                        </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function CardView({ modules, isLoaded, moduleCounts }) {
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
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="relative">
              {moduleCounts?.[p.id] > 0 && (
                  <div className="absolute -top-3 -right-3 bg-emerald-500 text-white min-w-[24px] h-6 rounded-full px-2 flex items-center justify-center text-xs font-bold shadow-md border-2 border-white z-10">
                      {moduleCounts[p.id]}
                  </div>
              )}
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">
                {p.name}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">{p.desc}</p>

              <div className="flex items-center text-emerald-600 text-xs font-bold uppercase tracking-widest mt-4 opacity-40 group-hover:opacity-100 transition-all">
                <span>Access Module</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
