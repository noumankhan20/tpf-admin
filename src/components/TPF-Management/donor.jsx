"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, Search, Users, IndianRupee, TrendingUp, ChevronLeft, ChevronRight, SlidersHorizontal, Star, X,
  ShieldCheck, ShieldAlert, UserPlus, Crown, Phone, Mail, MapPin, ExternalLink, Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetAllDonorsQuery, useGetDonorDetailsQuery } from '@/utils/slices/donationApiSlice';

/* ---------- helpers ---------- */
const inr = (n) => `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;
const inrCompact = (n) =>
  `₹${new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(n) || 0)}`;
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const initialsOf = (name) =>
  (name || '?').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';
const monthLabel = (key) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: 'short' });
};
const isoDaysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
};
const locationOf = (donor) => {
  const parts = [donor.city, donor.state].filter((v) => v && v !== 'KYC Pending');
  if (parts.length === 0) return '';
  return [...new Set(parts)].map((v) => v.charAt(0).toUpperCase() + v.slice(1)).join(', ');
};

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Wraps the typed words inside the text so admins can see why a row matched
function Highlight({ text, query }) {
  const value = String(text ?? '');
  const words = query.trim().split(/\s+/).filter(Boolean);
  if (!value || words.length === 0) return value || '—';
  const re = new RegExp(`(${words.map(escapeRe).join('|')})`, 'ig');
  return value.split(re).map((part, i) =>
    i % 2 === 1 ? <mark key={i} className="bg-yellow-200 text-slate-900 rounded px-0.5">{part}</mark> : part
  );
}

const FILTER_LABELS = {
  minTotalDonation: 'Min total ₹',
  maxTotalDonation: 'Max total ₹',
  selectedDate: 'Joined on',
  joinedSince: 'Joined since',
  kycStatus: 'KYC',
};
const EMPTY_FILTERS = { minTotalDonation: '', maxTotalDonation: '', selectedDate: '', joinedSince: '', kycStatus: '' };

const inputCls =
  'w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all';

function Kpi({ icon: Icon, label, value, hint, tone }) {
  const tones = {
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1.5 text-2xl font-bold text-slate-900 break-words">{value}</p>
        {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      </div>
      <div className={`hidden sm:grid place-items-center w-11 h-11 rounded-xl shrink-0 ${tones[tone]}`}>
        <Icon className="w-5 h-5" aria-hidden />
      </div>
    </div>
  );
}

function ProgressRow({ icon: Icon, label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="inline-flex items-center gap-2 font-medium text-slate-700">
          <Icon className="w-4 h-4 text-slate-400" aria-hidden /> {label}
        </span>
        <span className="text-slate-500"><b className="text-slate-900">{value}</b> · {pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500
        ${active ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
    >
      {children}
    </button>
  );
}

function KycBadge({ status }) {
  return status === 'verified' ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
      <ShieldCheck className="w-3.5 h-3.5" aria-hidden /> Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">
      <ShieldAlert className="w-3.5 h-3.5" aria-hidden /> KYC pending
    </span>
  );
}

/* ---------- page ---------- */
export default function DonorModule() {
  const router = useRouter();
  const searchRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDonorId, setSelectedDonorId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const setFilter = (key, val) => { setFilters((prev) => ({ ...prev, [key]: val })); setCurrentPage(1); };
  const resetFilters = () => { setFilters(EMPTY_FILTERS); setCurrentPage(1); };
  const activeFilters = Object.entries(filters).filter(([, v]) => v !== '');
  const cleanedFilters = Object.fromEntries(activeFilters);
  const newSince = isoDaysAgo(30);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Press "/" anywhere to jump to the search box
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const { data, isLoading, isFetching, error } = useGetAllDonorsQuery(
    { page: currentPage, search: debouncedSearch, includeStats: true, ...cleanedFilters },
    { refetchOnMountOrArgChange: true }
  );

  const { data: details, isLoading: isLoadingDetails, error: errorDetails } = useGetDonorDetailsQuery(selectedDonorId, {
    skip: !selectedDonorId,
  });

  const donors = useMemo(() => data?.donors || [], [data]);
  const analytics = data?.analytics;
  const totalPages = data?.totalPages || 0;
  const matchCount = data?.filteredTotalDonors || 0;
  const perPage = data?.itemsPerPage || 25;
  const topDonors = data?.topDonors || [];
  const trend = analytics?.monthlyTrend || [];
  const trendMax = Math.max(1, ...trend.map((t) => t.amount));
  const trendTotal = trend.reduce((s, t) => s + t.amount, 0);
  const searching = debouncedSearch.length > 0 || activeFilters.length > 0;
  const permanentInResults = donors.filter((d) => d.permanentMember).length;

  const goBack = () => {
    if (selectedDonorId) setSelectedDonorId(null);
    else window.location.href = '/select-portal';
  };
  const openPermanent = (id) => router.push(`/tpf-management/permanent-donors?donor=${id}`);
  const clearAll = () => { setSearchQuery(''); setDebouncedSearch(''); resetFilters(); };

  const pageBg = 'min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/40 to-slate-100';

  /* ----- donor detail (normal donors) ----- */
  if (selectedDonorId) {
    if (isLoadingDetails) return <div className={`${pageBg} flex items-center justify-center text-slate-600`}>Loading donor details...</div>;
    if (errorDetails) return <div className={`${pageBg} flex items-center justify-center text-red-600`}>Error loading donor details</div>;
    const history = details?.donations || [];
    return (
      <div className={`${pageBg} p-4 md:p-6 lg:p-8`}>
        <div className="max-w-5xl mx-auto">
          <button onClick={goBack} className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 mb-4 cursor-pointer group">
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" aria-hidden />
            <span className="font-medium">Back to donors</span>
          </button>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-7 mb-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white grid place-items-center text-lg font-bold shrink-0">{initialsOf(details?.fullName)}</div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 break-words">{details?.fullName}</h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-600">
                {details?.email && <span className="inline-flex items-center gap-1.5 break-all"><Mail className="w-4 h-4 shrink-0" aria-hidden />{details.email}</span>}
                {details?.mobileNo && <span className="inline-flex items-center gap-1.5"><Phone className="w-4 h-4 shrink-0" aria-hidden />{details.mobileNo}</span>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <Kpi icon={IndianRupee} tone="emerald" label="Total donated" value={inr(details?.totalAmountDonated)} />
            <Kpi icon={TrendingUp} tone="purple" label="Donations" value={details?.totalDonations ?? 0} />
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Donation history</h2>
            {history.length === 0 ? (
              <p className="text-center py-10 text-slate-500">No donations yet</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {history.map((x, i) => (
                  <li key={i} className="py-3 flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800">{fmtDate(x.donationDate)}</p>
                      <p className="text-xs text-slate-500 truncate">{x.campaignName}{x.paymentMode ? ` · ${x.paymentMode}` : ''}</p>
                    </div>
                    <span className="font-bold text-emerald-600">{inr(x.amountDonated)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`${pageBg} p-4 md:p-8`} role="status" aria-live="polite">
        <div className="max-w-7xl mx-auto animate-pulse space-y-5">
          <div className="h-10 w-56 rounded-xl bg-slate-200" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[0, 1, 2, 3].map((i) => <div key={i} className="h-28 rounded-2xl bg-slate-200" />)}</div>
          <div className="h-64 rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }
  if (error) {
    return <div className={`${pageBg} flex items-center justify-center text-red-600 text-lg`} role="alert">Error loading donors data</div>;
  }

  return (
    <div className={`${pageBg} p-4 md:p-6 lg:p-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <button onClick={goBack} className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 mb-4 cursor-pointer group rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" aria-hidden />
          <span className="font-medium">Back</span>
        </button>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Donors</h1>
            <p className="text-slate-600 mt-1">Find any donor in seconds, permanent donors included, and see how giving is trending.</p>
          </div>
          <button
            onClick={() => router.push('/tpf-management/permanent-donors')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
          >
            <Star className="w-4 h-4" fill="currentColor" aria-hidden /> Permanent donors
          </button>
        </div>

        {/* Analytics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
          <Kpi icon={IndianRupee} tone="emerald" label="Total donated" value={inr(data?.totalAmountDonated)} hint="Regular donors" />
          <Kpi icon={Users} tone="blue" label="Donors who gave" value={(data?.globalTotalDonors || 0).toLocaleString('en-IN')} hint={analytics ? `${analytics.totalUsers.toLocaleString('en-IN')} registered users` : undefined} />
          <Kpi icon={TrendingUp} tone="purple" label="Average per donor" value={inr(data?.averageDonationAmount)} />
          <Kpi icon={UserPlus} tone="amber" label="New this month" value={(analytics?.newThisMonth || 0).toLocaleString('en-IN')} hint="Users who joined" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 lg:col-span-1">
            <div className="flex items-baseline justify-between mb-1">
              <h2 className="text-base font-bold text-slate-900">Last 6 months</h2>
              <span className="text-xs text-slate-500">{inrCompact(trendTotal)} total</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">All successful donations, per month</p>
            {trend.length === 0 ? (
              <p className="text-sm text-slate-500 py-8 text-center">No data yet</p>
            ) : (
              <div className="flex items-end justify-between gap-2 h-40">
                {trend.map((t) => (
                  <div key={t.month} className="flex-1 flex flex-col items-center justify-end h-full gap-1" title={`${monthLabel(t.month)}: ${inr(t.amount)} from ${t.count} donation(s)`}>
                    <span className="text-[10px] font-bold text-emerald-700">{t.amount ? inrCompact(t.amount) : ''}</span>
                    <div className="w-full rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400" style={{ height: `${Math.max(4, (t.amount / trendMax) * 100)}px` }} />
                    <span className="text-[11px] font-medium text-slate-500">{monthLabel(t.month)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-base font-bold text-slate-900 mb-4">Donor mix</h2>
            {analytics ? (
              <div className="space-y-5">
                <ProgressRow icon={Star} label="Permanent donors" value={analytics.permanentCount} total={analytics.totalUsers} color="bg-amber-500" />
                <ProgressRow icon={ShieldCheck} label="KYC verified" value={analytics.kycVerified} total={analytics.totalUsers} color="bg-emerald-500" />
                <ProgressRow icon={UserPlus} label="Joined this month" value={analytics.newThisMonth} total={analytics.totalUsers} color="bg-blue-500" />
              </div>
            ) : (
              <p className="text-sm text-slate-500">No data yet</p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-base font-bold text-slate-900 mb-3 inline-flex items-center gap-2"><Crown className="w-4 h-4 text-amber-500" aria-hidden /> Top donors</h2>
            {topDonors.length === 0 ? (
              <p className="text-sm text-slate-500">No donors yet</p>
            ) : (
              <ol className="space-y-2.5">
                {topDonors.map((d, i) => (
                  <li key={d._id}>
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(d.fullName || ''); setCurrentPage(1); }}
                      className="w-full flex items-center gap-3 text-left rounded-lg px-1.5 py-1 hover:bg-slate-50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      title="Search this donor"
                    >
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold grid place-items-center shrink-0">{i + 1}</span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{d.fullName}</span>
                      <span className="text-sm font-bold text-emerald-600">{inrCompact(d.donationStats?.totalAmount)}</span>
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {/* Search + filters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" aria-hidden />
              <label htmlFor="donor-search" className="sr-only">Search donors</label>
              <input
                id="donor-search"
                ref={searchRef}
                type="text"
                autoComplete="off"
                placeholder="Search name, email or mobile"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-11 pr-24 py-3 text-[15px] border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder-slate-400"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {(isFetching || searchQuery.trim() !== debouncedSearch) && <Loader2 className="w-4 h-4 animate-spin text-emerald-600" aria-label="Searching" />}
                {searchQuery ? (
                  <button type="button" onClick={() => { setSearchQuery(''); setDebouncedSearch(''); setCurrentPage(1); searchRef.current?.focus(); }} aria-label="Clear search" className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-block text-[11px] font-semibold text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">/</kbd>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsFilterOpen((v) => !v)}
              aria-expanded={isFilterOpen}
              className={`inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold border rounded-xl transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500
                ${isFilterOpen || activeFilters.length ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <SlidersHorizontal className="w-4 h-4" aria-hidden /> More filters
              {activeFilters.length > 0 && <span className="w-5 h-5 bg-emerald-600 text-white text-xs rounded-full grid place-items-center">{activeFilters.length}</span>}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3" role="group" aria-label="Quick filters">
            <Chip active={activeFilters.length === 0} onClick={resetFilters}>All donors</Chip>
            <Chip active={filters.kycStatus === 'verified'} onClick={() => setFilter('kycStatus', filters.kycStatus === 'verified' ? '' : 'verified')}>KYC verified</Chip>
            <Chip active={filters.kycStatus === 'pending'} onClick={() => setFilter('kycStatus', filters.kycStatus === 'pending' ? '' : 'pending')}>KYC pending</Chip>
            <Chip active={filters.joinedSince === newSince} onClick={() => setFilter('joinedSince', filters.joinedSince === newSince ? '' : newSince)}>Joined last 30 days</Chip>
            <Chip active={filters.minTotalDonation === '10000'} onClick={() => setFilter('minTotalDonation', filters.minTotalDonation === '10000' ? '' : '10000')}>Gave ₹10,000+</Chip>
          </div>

          {isFilterOpen && (
            <div className="mt-4 border border-slate-200 rounded-2xl bg-slate-50/70 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="f-on" className="block text-xs font-semibold text-slate-500 mb-1.5">Joined on date</label>
                <input id="f-on" type="date" value={filters.selectedDate} onChange={(e) => setFilter('selectedDate', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label htmlFor="f-since" className="block text-xs font-semibold text-slate-500 mb-1.5">Joined since</label>
                <input id="f-since" type="date" value={filters.joinedSince} onChange={(e) => setFilter('joinedSince', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label htmlFor="f-min" className="block text-xs font-semibold text-slate-500 mb-1.5">Min total donated (₹)</label>
                <input id="f-min" type="number" min="0" placeholder="0" value={filters.minTotalDonation} onChange={(e) => setFilter('minTotalDonation', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label htmlFor="f-max" className="block text-xs font-semibold text-slate-500 mb-1.5">Max total donated (₹)</label>
                <input id="f-max" type="number" min="0" placeholder="No limit" value={filters.maxTotalDonation} onChange={(e) => setFilter('maxTotalDonation', e.target.value)} className={inputCls} />
              </div>
            </div>
          )}

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              {activeFilters.map(([key, value]) => (
                <span key={key} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-medium">
                  {FILTER_LABELS[key]}: {value}
                  <button type="button" onClick={() => setFilter(key, '')} aria-label={`Remove ${FILTER_LABELS[key]} filter`} className="p-0.5 rounded-full hover:bg-emerald-200 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              ))}
              <button type="button" onClick={resetFilters} className="text-xs font-semibold text-red-600 hover:underline cursor-pointer px-1">Reset filters</button>
            </div>
          )}

          {/* Results */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-5 mb-3" aria-live="polite">
            <p className="text-sm text-slate-600">
              {searching ? (
                <><b className="text-slate-900">{matchCount.toLocaleString('en-IN')}</b> donor{matchCount === 1 ? '' : 's'} found{debouncedSearch && <> for “<b className="text-slate-900">{debouncedSearch}</b>”</>}</>
              ) : (
                <>Showing <b className="text-slate-900">{matchCount.toLocaleString('en-IN')}</b> donors, newest first</>
              )}
              {permanentInResults > 0 && <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800"><Star className="w-3 h-3" fill="currentColor" aria-hidden />{permanentInResults} permanent</span>}
            </p>
            {!debouncedSearch && <p className="text-xs text-slate-400">Permanent donors appear when you search. Use the “Permanent donors” button for the full list.</p>}
          </div>

          <div className={`transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
            {donors.length === 0 ? (
              <div className="text-center py-14">
                <div className="w-16 h-16 bg-slate-100 rounded-full grid place-items-center mx-auto mb-3"><Search className="w-7 h-7 text-slate-400" aria-hidden /></div>
                <p className="text-lg font-semibold text-slate-700">{debouncedSearch ? `No donors match “${debouncedSearch}”` : 'No donors found'}</p>
                <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">Check the spelling, try just one word of the name, or search by mobile number or email.</p>
                {searching && <button onClick={clearAll} className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 cursor-pointer">Clear search and filters</button>}
              </div>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="lg:hidden space-y-3">
                  {donors.map((d) => (
                    <div key={d._id} className={`rounded-xl border p-4 ${d.permanentMember ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full text-white grid place-items-center text-sm font-bold shrink-0 ${d.permanentMember ? 'bg-amber-500' : 'bg-gradient-to-br from-emerald-500 to-teal-600'}`}>{initialsOf(d.fullName)}</div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900 break-words"><Highlight text={d.fullName} query={debouncedSearch} /></p>
                          <p className="text-xs text-slate-500 break-all"><Highlight text={d.email} query={debouncedSearch} /></p>
                          <p className="text-xs text-slate-500"><Highlight text={d.mobileNo} query={debouncedSearch} /></p>
                        </div>
                        <span className="font-bold text-emerald-600 text-sm">{inr(d.donationStats?.totalAmount)}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {d.permanentMember && <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-bold uppercase text-white"><Star className="w-3 h-3" fill="currentColor" aria-hidden />Permanent</span>}
                        <KycBadge status={d.kycStatus} />
                        <span className="text-xs text-slate-500">Joined {fmtDate(d.createdDate)}</span>
                      </div>
                      <button
                        onClick={() => (d.permanentMember ? openPermanent(d._id) : setSelectedDonorId(d._id))}
                        className={`mt-3 w-full py-2 rounded-lg text-sm font-semibold cursor-pointer ${d.permanentMember ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                      >
                        {d.permanentMember ? 'View permanent profile' : 'View details'}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Desktop table */}
                <div className="hidden lg:block overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                        <th scope="col" className="px-5 py-3.5 font-semibold">Donor</th>
                        <th scope="col" className="px-5 py-3.5 font-semibold">Contact</th>
                        <th scope="col" className="px-5 py-3.5 font-semibold">Location</th>
                        <th scope="col" className="px-5 py-3.5 font-semibold">Joined</th>
                        <th scope="col" className="px-5 py-3.5 font-semibold text-right">Total donated</th>
                        <th scope="col" className="px-5 py-3.5 font-semibold">KYC</th>
                        <th scope="col" className="px-5 py-3.5"><span className="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {donors.map((d) => (
                        <tr key={d._id} className={d.permanentMember ? 'bg-amber-50 hover:bg-amber-100/70 shadow-[inset_4px_0_0_0_#f59e0b] transition-colors' : 'hover:bg-emerald-50/40 transition-colors'}>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full text-white grid place-items-center text-sm font-bold shrink-0 ${d.permanentMember ? 'bg-amber-500' : 'bg-gradient-to-br from-emerald-500 to-teal-600'}`}>{initialsOf(d.fullName)}</div>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-semibold text-slate-900"><Highlight text={d.fullName} query={debouncedSearch} /></span>
                                  {d.permanentMember && <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white"><Star className="w-3 h-3" fill="currentColor" aria-hidden />Permanent donor</span>}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">
                            <p className="[overflow-wrap:anywhere] min-w-[11rem]"><Highlight text={d.email} query={debouncedSearch} /></p>
                            <p className="text-xs text-slate-500"><Highlight text={d.mobileNo} query={debouncedSearch} /></p>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">
                            {locationOf(d) ? <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden />{locationOf(d)}</span> : <span className="text-slate-400">—</span>}
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">{fmtDate(d.createdDate)}</td>
                          <td className="px-5 py-3.5 text-right font-bold text-emerald-600">{inr(d.donationStats?.totalAmount)}</td>
                          <td className="px-5 py-3.5"><KycBadge status={d.kycStatus} /></td>
                          <td className="px-5 py-3.5 text-right">
                            {d.permanentMember ? (
                              <button onClick={() => openPermanent(d._id)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800 bg-amber-200 hover:bg-amber-500 hover:text-white px-3 py-1.5 rounded-lg border border-amber-400 transition-colors cursor-pointer whitespace-nowrap">
                                View permanent profile <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                              </button>
                            ) : (
                              <button onClick={() => setSelectedDonorId(d._id)} className="text-sm font-semibold text-slate-700 hover:text-white hover:bg-emerald-600 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-emerald-600 transition-colors cursor-pointer whitespace-nowrap">
                                View details
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-100 fab-avoid">
              <p className="text-sm text-slate-500">
                {((currentPage - 1) * perPage + 1).toLocaleString('en-IN')}–{Math.min(currentPage * perPage, matchCount).toLocaleString('en-IN')} of {matchCount.toLocaleString('en-IN')}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} aria-label="Previous page" className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                  <ChevronLeft className="w-4 h-4" aria-hidden /> Previous
                </button>
                <span className="text-sm text-slate-600 px-2">Page <b className="text-slate-900">{currentPage}</b> of {totalPages}</span>
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} aria-label="Next page" className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                  Next <ChevronRight className="w-4 h-4" aria-hidden />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
