"use client"
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, FileText, MessageSquare, Users, TrendingUp, Clock, Shield, Receipt, Search, Filter, Eye, Trash2, Download, ChevronRight, ChevronDown, MoreVertical, Loader2, ArrowLeft, X, Menu, Edit, ExternalLink, User, SlidersHorizontal, ChevronLeft } from 'lucide-react';
import { useFetchCampaignsQuery, useFetchCampaignByIdQuery } from '@/utils/slices/campaignSlice';
import { useRouter } from 'next/navigation';
import CampaignAnalyticsDashboard from './CampaignAnalyticsDashboard';

// ─────────────────────────────────────────────────────────
// FILTER DRAWER
// ─────────────────────────────────────────────────────────
const CAMPAIGN_STATUSES = [
  'DRAFT',
  'ACTIVE',
  'COMPLETED'
];
const CATEGORIES = ['Education', 'Health', 'Orphan', 'Masjid', 'Food', 'Disaster', 'Other'];
const DEADLINE_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Active (not expired)', value: 'active' },
  { label: 'Expired', value: 'expired' },
];

const EMPTY_FILTERS = {
  campaignStatus: '',
  category: '',
  isUrgent: '',
  zakatVerified: '',
  taxBenefits: '',
  deadline: '',
  minAmount: '',
  maxAmount: '',
  minRaised: '',
  maxRaised: '',
  isActive:'',
};
const TogglePill = ({ val, active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${active
      ? 'bg-emerald-500 border-emerald-500 text-white'
      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
      }`}
  >
    {label || val || 'All'}
  </button>
);

const Section = ({ title, children }) => (
  <div className="space-y-2.5">
    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{title}</p>
    {children}
  </div>
);

const FilterDrawer = ({ open, onClose, filters, onApply }) => {
  const [local, setLocal] = useState(filters);
  useEffect(() => { setLocal(filters); }, [filters]);

  if (!open) return null;

  const set = (key, val) => setLocal((p) => ({ ...p, [key]: val }));

  const reset = () => {
    setLocal(EMPTY_FILTERS);
    onApply(EMPTY_FILTERS);
    onClose();
  };

  const apply = () => { onApply(local); onClose(); };


  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/30 backdrop-blur-sm" />
      <div
        className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col overflow-hidden"
        style={{ borderLeft: '1px solid #e5e7eb' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-emerald-500" />
            <h3 className="text-[15px] font-semibold text-gray-900">Filter Campaigns</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          <Section title="Active Status">
            <div className="flex flex-wrap gap-2">
              {[
                { val: '', label: 'All' },
                { val: 'true', label: 'Active' },
                { val: 'false', label: 'Inactive' },
              ].map(({ val, label }) => (
                <TogglePill key={val} val={val} label={label} active={local.isActive === val} onClick={() => set('isActive', val)} />
              ))}
            </div>
          </Section>

          <Section title="Campaign Status">
            <div className="flex flex-wrap gap-2">
              <TogglePill val="" label="All" active={local.campaignStatus === ''} onClick={() => set('campaignStatus', '')} />
              {CAMPAIGN_STATUSES.map((s) => (
                <TogglePill key={s} val={s} label={s.replace(/_/g, ' ')} active={local.campaignStatus === s} onClick={() => set('campaignStatus', s)} />
              ))}
            </div>
          </Section>

          <Section title="Category">
            <div className="flex flex-wrap gap-2">
              <TogglePill val="" label="All" active={local.category === ''} onClick={() => set('category', '')} />
              {CATEGORIES.map((c) => (
                <TogglePill key={c} val={c} label={c} active={local.category === c} onClick={() => set('category', c)} />
              ))}
            </div>
          </Section>

          <Section title="Deadline">
            <div className="flex flex-wrap gap-2">
              {DEADLINE_OPTIONS.map(({ value, label }) => (
                <TogglePill key={value} val={value} label={label} active={local.deadline === value} onClick={() => set('deadline', value)} />
              ))}
            </div>
          </Section>

          <Section title="Flags">
            <div className="grid grid-cols-1 gap-3">
              {[
                { key: 'isUrgent', label: 'Urgency' },
                { key: 'zakatVerified', label: 'Zakat Verified' },
                { key: 'taxBenefits', label: 'Tax Benefits (80G)' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <p className="text-[11px] text-gray-400 font-medium mb-1.5">{label}</p>
                  <div className="flex gap-2">
                    {[
                      { val: '', label: 'All' },
                      { val: 'true', label: 'Yes' },
                      { val: 'false', label: 'No' },
                    ].map(({ val, label: lbl }) => (
                      <TogglePill key={val} val={val} label={lbl} active={local[key] === val} onClick={() => set(key, val)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Target Amount Range (₹)">
            <div className="grid grid-cols-2 gap-3">
              {[['minAmount', 'Min'], ['maxAmount', 'Max']].map(([k, lbl]) => (
                <div key={k}>
                  <label className="text-[11px] text-gray-400 font-medium mb-1 block">{lbl}</label>
                  <input
                    type="number"
                    placeholder={lbl}
                    value={local[k]}
                    onChange={(e) => set(k, e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              ))}
            </div>
          </Section>

          <Section title="Raised Amount Range (₹)">
            <div className="grid grid-cols-2 gap-3">
              {[['minRaised', 'Min'], ['maxRaised', 'Max']].map(([k, lbl]) => (
                <div key={k}>
                  <label className="text-[11px] text-gray-400 font-medium mb-1 block">{lbl}</label>
                  <input
                    type="number"
                    placeholder={lbl}
                    value={local[k]}
                    onChange={(e) => set(k, e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              ))}
            </div>
          </Section>

        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={reset}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Reset All
          </button>
          <button
            onClick={apply}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

// Filter chip component
const FilterChip = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 border border-emerald-200 text-emerald-700">
    {label}
    <button onClick={onRemove} className="hover:text-emerald-900 ml-0.5">
      <X size={10} strokeWidth={2.5} />
    </button>
  </span>
);

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────
export default function CampaignAdminDashboard() {
  const [view, setView] = useState('list');
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedRow, setExpandedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const limit = 50;
  const router = useRouter();

  // Build query params from applied filters
  const queryParams = React.useMemo(() => {
    const params = {
      page: currentPage,
      limit,
      search: debouncedSearch,
      isSpecialCase: 'all',
    };

    Object.entries(appliedFilters).forEach(([k, v]) => {
      if (v !== '') {
        if (v === 'true') params[k] = 'true';
        else if (v === 'false') params[k] = 'false';
        else params[k] = v;
      }
    });

    return params;
  }, [currentPage, limit, debouncedSearch, appliedFilters]);

  const { data: apiResponse, isLoading, isError, error, refetch } = useFetchCampaignsQuery(queryParams);
  const totalPages = apiResponse?.pagination?.totalPages || 1;

  const {
    data: campaignDetailResponse,
    isLoading: isCampaignLoading,
    isError: isCampaignError,
  } = useFetchCampaignByIdQuery(selectedCampaignId, {
    skip: !selectedCampaignId,
  });

  const campaigns = apiResponse?.campaigns || [];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page on filter change
  useEffect(() => { setCurrentPage(1); }, [appliedFilters]);

  const getProgressPercentage = (raised, goal) => {
    if (!goal || goal === 0) return 0;
    const pct = (raised / goal) * 100;
    return pct < 0 ? 0 : pct;
  };

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      COMPLETED: 'bg-blue-100 text-blue-800 border-blue-200',
      DRAFT: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Active filter chips for display
  const activeChips = React.useMemo(() => {
    const chips = [];
    const labels = {
      isActive: (v) => `Status: ${v === 'true' ? 'Active' : 'Inactive'}`,
      campaignStatus: (v) => `Campaign: ${v.replace(/_/g, ' ')}`,
      category: (v) => `Category: ${v}`,
      isUrgent: (v) => `Urgent: ${v === 'true' ? 'Yes' : 'No'}`,
      zakatVerified: (v) => `Zakat: ${v === 'true' ? 'Yes' : 'No'}`,
      taxBenefits: (v) => `80G: ${v === 'true' ? 'Yes' : 'No'}`,
      deadline: (v) => `Deadline: ${v === 'active' ? 'Active' : 'Expired'}`,
    };
    Object.entries(labels).forEach(([k, fn]) => {
      if (appliedFilters[k] !== '') chips.push({ key: k, label: fn(appliedFilters[k]) });
    });
    if (appliedFilters.minAmount || appliedFilters.maxAmount) {
      chips.push({ key: 'targetAmount', label: `Target: ₹${appliedFilters.minAmount || '0'} – ₹${appliedFilters.maxAmount || '∞'}` });
    }
    if (appliedFilters.minRaised || appliedFilters.maxRaised) {
      chips.push({ key: 'raisedAmount', label: `Raised: ₹${appliedFilters.minRaised || '0'} – ₹${appliedFilters.maxRaised || '∞'}` });
    }
    return chips;
  }, [appliedFilters]);

  const removeChip = (key) => {
    if (key === 'targetAmount') setAppliedFilters((p) => ({ ...p, minAmount: '', maxAmount: '' }));
    else if (key === 'raisedAmount') setAppliedFilters((p) => ({ ...p, minRaised: '', maxRaised: '' }));
    else setAppliedFilters((p) => ({ ...p, [key]: '' }));
  };

  const applyFilters = (f) => {
    setAppliedFilters(f);
    setCurrentPage(1);
  };

  // Client-side active/inactive filter (kept for the tab buttons at top)
  const filteredCampaigns = campaigns.filter(campaign => {
    if (filterStatus === 'active') return campaign.isActive;
    if (filterStatus === 'inactive') return !campaign.isActive;
    return true;
  });

  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.isActive).length;
  const inactiveCampaigns = campaigns.filter(c => !c.isActive).length;
  const totalDonors = apiResponse?.totalDonors || 0;
  const overallTotalTips = apiResponse?.overallTotalTips || 0;
  const totalRaised = apiResponse?.totalRaised || 0;
  const totalNetRaised = apiResponse?.netRaised || 0;
  const totalExpenses = apiResponse?.totalExpenses || 0;

  const tpfExpensesCampaign = campaigns.find(c => 
    c._id === '69bc2a365a3e070a84454f49' ||
    c.title?.toLowerCase().includes('tpf expenses') || 
    c.beneficiaryName?.toLowerCase().includes('tpf expenses')
  );
  const tpfExpensesRaised = tpfExpensesCampaign ? (tpfExpensesCampaign.raisedAmount || 0) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-white p-4 rounded-full shadow-lg">
              <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
            </div>
          </div>
          <p className="text-xl font-semibold text-gray-900 mb-2">Loading campaigns...</p>
          <p className="text-sm text-gray-500">Please wait while we fetch the data</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-100 mb-6 shadow-lg">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Failed to Load Campaigns</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {error?.data?.message || error?.message || 'An error occurred while fetching campaigns'}
          </p>
          <button
            onClick={refetch}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (view === 'detail') {
    if (isCampaignLoading) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-slate-600">Loading campaign analytics...</p>
          </div>
        </div>
      );
    }

    if (isCampaignError || !campaignDetailResponse?.campaign) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="text-center max-w-sm">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-xs text-slate-500 mb-6">We could not fetch the details for this campaign.</p>
            <button onClick={() => { setView('list'); setSelectedCampaignId(null); }} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-950 transition-all">
              Go Back
            </button>
          </div>
        </div>
      );
    }

    return (
      <CampaignAnalyticsDashboard 
        campaign={campaignDetailResponse.campaign}
        tpfExpensesRaised={tpfExpensesRaised}
        onBack={() => { setView('list'); setSelectedCampaignId(null); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <button
              onClick={() => router.push('/select-portal?category=work')}
              className="flex items-center cursor-pointer gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-white transition-all border border-gray-300 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="absolute left-1/2 -translate-x-1/2 text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">Campaign Management</h1>
              <p className="text-sm sm:text-base text-gray-500">Manage and track all donation campaigns</p>
            </div>

            <button
              onClick={refetch}
              className="px-4 sm:px-6 py-2.5 sm:py-3 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all transform hover:-translate-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">Total</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{totalCampaigns}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl sm:rounded-2xl shadow-sm border border-emerald-200 p-4 sm:p-6 hover:shadow-md transition-all transform hover:-translate-y-1">
            <p className="text-xs sm:text-sm font-medium text-emerald-600 mb-1 sm:mb-2">Active</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-600">{activeCampaigns}</p>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all transform hover:-translate-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">Inactive</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{inactiveCampaigns}</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-white rounded-xl sm:rounded-2xl shadow-sm border border-red-200 p-4 sm:p-6 hover:shadow-md transition-all transform hover:-translate-y-1">
            <p className="text-xs sm:text-sm font-medium text-red-600 mb-1 sm:mb-2">Total Tip & TPF Raised</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600">₹{(overallTotalTips + tpfExpensesRaised).toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-red-500 font-semibold mt-1">Tips: ₹{overallTotalTips.toLocaleString('en-IN')} + TPF: ₹{tpfExpensesRaised.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all transform hover:-translate-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">Raised</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 break-words leading-tight">₹{Math.round(totalNetRaised).toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all transform hover:-translate-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">Donors</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{totalDonors}</p>
          </div>
        </div>

        {/* ── Search + Filter Toolbar ── */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5 mb-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name, title or ID..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 sm:pl-12 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 text-sm transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Filter button */}
              <button
                onClick={() => setFilterOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all flex-shrink-0"
                style={activeChips.length > 0
                  ? { background: '#ecfdf5', borderColor: '#6ee7b7', color: '#059669' }
                  : { background: 'white', borderColor: '#e5e7eb', color: '#374151' }}
              >
                <SlidersHorizontal size={14} />
                <span className="hidden sm:inline">Filters</span>
                {activeChips.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {activeChips.length}
                  </span>
                )}
              </button>
            </div>

            {/* Active filter chips */}
            {activeChips.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                {activeChips.map((c) => (
                  <FilterChip key={c.key} label={c.label} onRemove={() => removeChip(c.key)} />
                ))}
                <button
                  onClick={() => setAppliedFilters(EMPTY_FILTERS)}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Count row */}
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-xs text-gray-400">
            Showing {filteredCampaigns.length} of {apiResponse?.pagination?.totalCount || campaigns.length} campaigns
          </p>
        </div>

        {/* ── Desktop Table ── */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Sr. No.</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Campaign</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Raised</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Donors</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Updated</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCampaigns.map((campaign, index) => {
                  const progress = getProgressPercentage(campaign.raisedAmount || 0, campaign.targetAmount || 0);
                  const srNo = (currentPage - 1) * limit + index + 1;
                  return (
                    <tr key={campaign._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-500">
                        {srNo}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{campaign.title || campaign.beneficiaryName || 'Untitled Campaign'}</p>
                          {campaign.title && campaign.beneficiaryName && (
                            <p className="text-xs text-gray-500 mt-0.5">{campaign.beneficiaryName}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          campaign.isActive 
                             ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' 
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${campaign.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {campaign.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-full max-w-xs">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
                            <span className="font-semibold">{progress.toFixed(0)}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-bold text-gray-900">₹{(campaign.raisedAmount || 0).toLocaleString('en-IN')}</p>
                          <p className="text-xs text-gray-500 mt-0.5">of ₹{(campaign.targetAmount || 0).toLocaleString('en-IN')}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{campaign.totalDonors || 0}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{formatDate(campaign.updatedAt)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setSelectedCampaignId(campaign._id); setView('detail'); }}
                            className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 text-xs font-semibold text-slate-600 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                          >
                            Analytics
                            <ChevronRight size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
 
          {/* ── Mobile Cards ── */}
          <div className="lg:hidden divide-y divide-gray-200">
            {filteredCampaigns.map((campaign, index) => {
              const progress = getProgressPercentage(campaign.raisedAmount || 0, campaign.targetAmount || 0);
              const isExpanded = expandedRow === campaign._id;
              const srNo = (currentPage - 1) * limit + index + 1;
              return (
                <div key={campaign._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="mb-3">
                    <div className="flex items-start justify-between mb-2 gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-gray-400">#{srNo}</span>
                          <h3 className="text-sm font-bold text-gray-900 break-words">{campaign.title || campaign.beneficiaryName || 'Untitled Campaign'}</h3>
                        </div>
                        {campaign.title && campaign.beneficiaryName && (
                          <p className="text-xs text-gray-500 mb-1">{campaign.beneficiaryName}</p>
                        )}
                        <p className="text-xs text-gray-400 font-mono">ID: {campaign._id.slice(0, 8)}...</p>
                      </div>
                      <button
                        onClick={() => setExpandedRow(isExpanded ? null : campaign._id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                      >
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
 
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(campaign.campaignStatus)}`}>
                        {campaign.campaignStatus?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
 
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs font-medium text-gray-600 mb-2">
                      <span>{progress.toFixed(0)}% funded</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{campaign.totalDonors || 0}</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
 
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-base font-bold text-gray-900">₹{(campaign.raisedAmount || 0).toLocaleString('en-IN')}</p>
                      <p className="text-xs text-gray-500">of ₹{(campaign.targetAmount || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Updated</p>
                      <p className="text-xs font-semibold text-gray-700">{formatDate(campaign.updatedAt)}</p>
                    </div>
                  </div>
 
                  {isExpanded && (
                    <div className="pt-3 border-t border-gray-200 space-y-3">
                      {campaign.impactGoals && campaign.impactGoals.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Impact Goals</p>
                          <div className="space-y-2">
                            {campaign.impactGoals.map((goal, idx) => (
                              <div key={idx} className="flex gap-2 p-2.5 bg-gradient-to-r from-emerald-50 to-transparent rounded-lg border border-emerald-100">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">{idx + 1}</div>
                                <p className="text-xs text-gray-700 flex-1">{goal}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                           <p className="text-xs text-gray-500 mb-1">Tax</p>
                          <p className="text-xs font-bold text-gray-900">{campaign.taxBenefits ? '80G' : 'N/A'}</p>
                        </div>
                        <div className="text-center p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Zakat</p>
                          <p className="text-xs font-bold text-gray-900">{campaign.zakatVerified ? 'Yes' : 'No'}</p>
                        </div>
                        <div className="text-center p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Docs</p>
                          <p className="text-xs font-bold text-gray-900">{campaign.documents?.length || 0}</p>
                        </div>
                      </div>
                    </div>
                  )}
 
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => { setSelectedCampaignId(campaign._id); setView('detail'); }}
                      className="flex-1 py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      Campaign Analytics
                    </button>
                    <button className="p-2.5 border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCampaigns.length === 0 && (
            <div className="text-center py-16 px-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gray-100 mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No campaigns found</h3>
              <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6 fab-avoid">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm font-semibold text-gray-700">Page {currentPage} of {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {filteredCampaigns.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-900">{filteredCampaigns.length}</span> of{' '}
              <span className="font-semibold text-gray-900">{campaigns.length}</span> campaigns
            </p>
          </div>
        )}
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={appliedFilters}
        onApply={applyFilters}
      />
    </div>
  );
}   