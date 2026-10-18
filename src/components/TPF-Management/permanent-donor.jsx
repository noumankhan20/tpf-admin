"use client";
import { Suspense, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, Search, Users, IndianRupee, TrendingUp, CalendarClock, X, ChevronLeft,
  ChevronRight, FileText, Download, AlertTriangle, CalendarCheck, Mail, Phone, RotateCcw,
  ArrowUpDown, Receipt, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetPermanentDonorsQuery } from '@/utils/slices/adminApiSlice';

/* ---------- helpers ---------- */
const DAY = 24 * 60 * 60 * 1000;
const inr = (n) => `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })
    : '—';

const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata',
      })
    : '—';

const startOfToday = () => {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
};

// Whole days from today until the date (negative = already passed)
const daysUntil = (d) => (d ? Math.round((new Date(d).getTime() - startOfToday()) / DAY) : null);

// overdue | soon (within 30 days) | upcoming | none
const renewalState = (donor) => {
  const days = daysUntil(donor.nextDonationDate);
  if (days === null) return 'none';
  if (days < 0) return 'overdue';
  if (days <= 30) return 'soon';
  return 'upcoming';
};

const RENEWAL_STYLE = {
  overdue: 'bg-red-50 text-red-700 ring-red-200',
  soon: 'bg-amber-50 text-amber-700 ring-amber-200',
  upcoming: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  none: 'bg-slate-50 text-slate-500 ring-slate-200',
};

const renewalLabel = (donor) => {
  const days = daysUntil(donor.nextDonationDate);
  if (days === null) return '—';
  if (days < 0) return `Overdue ${Math.abs(days)}d`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days <= 60) return `In ${days} days`;
  return `In ${Math.round(days / 30)} months`;
};

const STATUS_STYLE = {
  active: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-slate-200 text-slate-700',
};

const initialsOf = (name) =>
  (name || '?').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

const SORTS = {
  recent: { label: 'Most recent contribution', fn: (a, b) => new Date(b.lastContributionAt || 0) - new Date(a.lastContributionAt || 0) },
  total: { label: 'Highest total donated', fn: (a, b) => (b.totalAmountDonated || 0) - (a.totalAmountDonated || 0) },
  renewal: { label: 'Next donation (soonest)', fn: (a, b) => new Date(a.nextDonationDate || 8.64e15) - new Date(b.nextDonationDate || 8.64e15) },
  name: { label: 'Name (A–Z)', fn: (a, b) => (a.fullName || '').localeCompare(b.fullName || '') },
};

const inputCls =
  'w-full border border-slate-300 bg-white rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all';

function StatCard({ icon: Icon, label, value, hint, tone = 'emerald', onClick, active }) {
  const tones = {
    emerald: 'from-emerald-100 to-emerald-200 text-emerald-600',
    blue: 'from-blue-100 to-blue-200 text-blue-600',
    purple: 'from-purple-100 to-purple-200 text-purple-600',
    amber: 'from-amber-100 to-amber-200 text-amber-600',
    red: 'from-red-100 to-red-200 text-red-600',
  };
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-pressed={onClick ? !!active : undefined}
      className={`text-left bg-white rounded-2xl shadow-sm p-5 border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500
        ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}
        ${active ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200'}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">{label}</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 break-words">{value}</p>
          {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
        </div>
        <div className={`hidden sm:block p-3 bg-gradient-to-br rounded-xl shrink-0 ${tones[tone]}`}>
          <Icon className="w-6 h-6" aria-hidden />
        </div>
      </div>
    </Tag>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500
        ${active ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
    >
      {children}
    </button>
  );
}

/* ---------- donor detail (year-grouped, colour-coded) ---------- */
// One colour per financial year, picked from the start year so a year always keeps its colour.
const YEAR_PALETTE = [
  { dot: 'bg-emerald-500', bar: 'bg-emerald-500', soft: 'bg-emerald-50', hover: 'hover:bg-emerald-100/70', border: 'border-emerald-300', text: 'text-emerald-700', chip: 'bg-emerald-100 text-emerald-800' },
  { dot: 'bg-blue-500', bar: 'bg-blue-500', soft: 'bg-blue-50', hover: 'hover:bg-blue-100/70', border: 'border-blue-300', text: 'text-blue-700', chip: 'bg-blue-100 text-blue-800' },
  { dot: 'bg-violet-500', bar: 'bg-violet-500', soft: 'bg-violet-50', hover: 'hover:bg-violet-100/70', border: 'border-violet-300', text: 'text-violet-700', chip: 'bg-violet-100 text-violet-800' },
  { dot: 'bg-amber-500', bar: 'bg-amber-500', soft: 'bg-amber-50', hover: 'hover:bg-amber-100/70', border: 'border-amber-300', text: 'text-amber-700', chip: 'bg-amber-100 text-amber-800' },
  { dot: 'bg-rose-500', bar: 'bg-rose-500', soft: 'bg-rose-50', hover: 'hover:bg-rose-100/70', border: 'border-rose-300', text: 'text-rose-700', chip: 'bg-rose-100 text-rose-800' },
  { dot: 'bg-cyan-500', bar: 'bg-cyan-500', soft: 'bg-cyan-50', hover: 'hover:bg-cyan-100/70', border: 'border-cyan-300', text: 'text-cyan-700', chip: 'bg-cyan-100 text-cyan-800' },
  { dot: 'bg-orange-500', bar: 'bg-orange-500', soft: 'bg-orange-50', hover: 'hover:bg-orange-100/70', border: 'border-orange-300', text: 'text-orange-700', chip: 'bg-orange-100 text-orange-800' },
  { dot: 'bg-indigo-500', bar: 'bg-indigo-500', soft: 'bg-indigo-50', hover: 'hover:bg-indigo-100/70', border: 'border-indigo-300', text: 'text-indigo-700', chip: 'bg-indigo-100 text-indigo-800' },
];
const yearColor = (fy) => YEAR_PALETTE[(parseInt(fy, 10) || 0) % YEAR_PALETTE.length];

// Indian FY label ("2026-27") for a date, used when a payment has no stored financialYear
const fyOfDate = (date) => {
  const ist = new Date(new Date(date).getTime() + 5.5 * 60 * 60 * 1000);
  const y = ist.getUTCMonth() >= 3 ? ist.getUTCFullYear() : ist.getUTCFullYear() - 1;
  return `${y}-${String(y + 1).slice(2)}`;
};

const ROWS_PER_YEAR = 10;

function DonorDetail({ d, currentFY, onBack }) {
  const state = renewalState(d);

  // Group payments by financial year; years that only exist in the donor's yearly summary still show up.
  const years = useMemo(() => {
    const map = {};
    const ensure = (fy) => (map[fy] ||= { fy, total: 0, count: 0, donations: [], lastAt: null });
    (d.donations || []).forEach((x) => {
      const y = ensure(x.financialYear || fyOfDate(x.createdAt));
      y.donations.push(x);
      y.total += x.amount || 0;
      y.count += 1;
      if (!y.lastAt || new Date(x.createdAt) > new Date(y.lastAt)) y.lastAt = x.createdAt;
    });
    (d.fyHistory || []).forEach((h) => {
      if (!h.financialYear || map[h.financialYear]) return;
      const y = ensure(h.financialYear);
      y.total = h.totalAmount || 0;
      y.count = h.donationCount || 0;
      y.lastAt = h.lastDonatedAt || null;
    });
    if (d.currentFY && !map[d.currentFY]) {
      const y = ensure(d.currentFY);
      y.total = d.totalCurrentFY || 0;
    }
    return Object.values(map).sort((a, b) => b.fy.localeCompare(a.fy)); // newest first
  }, [d]);

  const maxTotal = Math.max(1, ...years.map((y) => y.total));
  // Newest two years open by default; the rest stay collapsed so decades of data stay scannable
  const [open, setOpen] = useState(() => new Set(years.slice(0, 2).map((y) => y.fy)));
  const [expandedRows, setExpandedRows] = useState(() => new Set());
  const flip = (set, key) => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
  };
  const allOpen = years.length > 0 && open.size === years.length;

  const jumpTo = (fy) => {
    setOpen((s) => new Set(s).add(fy));
    setTimeout(() => document.getElementById(`fy-${fy}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/40 to-slate-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 mb-4 transition-all hover:gap-3 group cursor-pointer rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" aria-hidden />
          <span className="font-medium">Back to Permanent Donors</span>
          <span className="hidden sm:inline text-xs text-slate-400">(Esc)</span>
        </button>

        {/* Identity */}
        <div className="bg-white rounded-2xl shadow-sm p-5 md:p-7 border border-slate-200 mb-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white grid place-items-center text-lg font-bold shrink-0">
                {initialsOf(d.fullName)}
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 break-words">{d.fullName || 'Unnamed donor'}</h1>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-600">
                  {d.email && <span className="inline-flex items-center gap-1.5 break-all"><Mail className="w-4 h-4 shrink-0" aria-hidden />{d.email}</span>}
                  {d.mobileNo && <span className="inline-flex items-center gap-1.5"><Phone className="w-4 h-4 shrink-0" aria-hidden />{d.mobileNo}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize ${STATUS_STYLE[d.status] || STATUS_STYLE.cancelled}`}>{d.status}</span>
              {state !== 'none' && (
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ring-1 ${RENEWAL_STYLE[state]}`}>Next donation: {renewalLabel(d)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Key numbers */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-5">
          <StatCard icon={IndianRupee} label="Total donated" value={inr(d.totalAmountDonated)} hint={`${d.totalContributions || 0} contribution(s) across ${years.length} year(s)`} />
          <StatCard icon={TrendingUp} tone="purple" label={`This FY${currentFY ? ` (${currentFY})` : ''}`} value={inr(d.totalCurrentFY)} />
          <StatCard icon={Receipt} tone="blue" label="Last contribution" value={d.lastContributionAmount != null ? inr(d.lastContributionAmount) : '—'} hint={fmtDate(d.lastContributionAt)} />
          <StatCard icon={CalendarClock} tone={state === 'overdue' ? 'red' : state === 'soon' ? 'amber' : 'emerald'} label="Next donation date" value={fmtDate(d.nextDonationDate)} hint="One year after last contribution" />
          <StatCard icon={CalendarCheck} tone="blue" label="First contribution" value={fmtDate(d.firstContributionAt)} />
          <StatCard icon={Users} tone="purple" label="Member since" value={fmtDate(d.createdAt)} />
        </div>

        {/* Year by year chart */}
        {years.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6 border border-slate-200 mb-5">
            <h2 className="text-lg font-bold text-slate-900">Year by year</h2>
            <p className="text-xs text-slate-500 mb-4">Each financial year (Apr–Mar) has its own colour. Click a bar to jump to its payments.</p>
            <div className="overflow-x-auto pb-2">
              <div className="flex items-end gap-3 h-44 min-w-full w-max">
                {[...years].reverse().map((y) => {
                  const c = yearColor(y.fy);
                  return (
                    <button
                      key={y.fy}
                      type="button"
                      onClick={() => jumpTo(y.fy)}
                      aria-label={`${y.fy}: ${inr(y.total)}`}
                      className="group flex flex-col items-center justify-end gap-1 w-16 h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                    >
                      <span className={`text-[11px] font-bold ${c.text}`}>{inr(y.total)}</span>
                      <span
                        className={`w-full rounded-t-lg ${c.bar} opacity-90 group-hover:opacity-100 transition-all`}
                        style={{ height: `${Math.max(6, (y.total / maxTotal) * 100)}px` }}
                      />
                      <span className="text-[11px] font-semibold text-slate-600">{y.fy}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Profile */}
          <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6 border border-slate-200 lg:col-span-1 h-fit">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Profile</h2>
            <dl className="space-y-3 text-sm">
              {[['Gender', d.gender], ['Profession', d.profession], ['Address', d.address]].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{k}</dt>
                  <dd className="text-slate-900 font-medium break-words">{v || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Payments grouped by year */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg"><FileText className="w-5 h-5 text-indigo-600" aria-hidden /></div>
                <h2 className="text-lg font-bold text-slate-900">Contribution history</h2>
              </div>
              {years.length > 1 && (
                <button
                  onClick={() => setOpen(allOpen ? new Set() : new Set(years.map((y) => y.fy)))}
                  className="text-sm font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer rounded px-2 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  {allOpen ? 'Collapse all' : 'Expand all'}
                </button>
              )}
            </div>

            {years.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 text-center py-12 text-slate-500">No contributions recorded</div>
            ) : (
              <div className="space-y-3">
                {years.map((y) => {
                  const c = yearColor(y.fy);
                  const isOpen = open.has(y.fy);
                  const showAll = expandedRows.has(y.fy);
                  const rows = showAll ? y.donations : y.donations.slice(0, ROWS_PER_YEAR);
                  return (
                    <section key={y.fy} id={`fy-${y.fy}`} className={`bg-white rounded-2xl border ${c.border} overflow-hidden scroll-mt-4`}>
                      <button
                        type="button"
                        onClick={() => setOpen((s) => flip(s, y.fy))}
                        aria-expanded={isOpen}
                        aria-controls={`fy-body-${y.fy}`}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left ${c.soft} ${c.hover} transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500`}
                      >
                        <span className={`w-3 h-3 rounded-full shrink-0 ${c.dot}`} aria-hidden />
                        <span className="flex-1 min-w-0">
                          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className={`font-bold ${c.text}`}>FY {y.fy}</span>
                            {y.fy === currentFY && <span className={`text-[10px] font-bold uppercase rounded px-1.5 py-0.5 ${c.chip}`}>Current</span>}
                          </span>
                          <span className="block text-xs text-slate-500">
                            {y.count} payment{y.count === 1 ? '' : 's'}{y.lastAt ? ` · last on ${fmtDate(y.lastAt)}` : ''}
                          </span>
                        </span>
                        <span className={`text-lg font-bold ${c.text}`}>{inr(y.total)}</span>
                        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-500 shrink-0" aria-hidden /> : <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" aria-hidden />}
                      </button>

                      {isOpen && (
                        <div id={`fy-body-${y.fy}`} className="px-4 pb-3">
                          {y.donations.length === 0 ? (
                            <p className="py-4 text-sm text-slate-500">Yearly total only — no individual payments are stored for this year.</p>
                          ) : (
                            <>
                              <div className="hidden sm:grid grid-cols-[1.5fr_1fr_0.8fr_0.8fr_1.6fr] gap-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-100">
                                <span>Date</span><span>Amount</span><span>Tip</span><span>Mode</span><span>Txn ID</span>
                              </div>
                              <ul className="divide-y divide-slate-100">
                                {rows.map((x) => (
                                  <li key={x._id} className="grid grid-cols-2 sm:grid-cols-[1.5fr_1fr_0.8fr_0.8fr_1.6fr] gap-x-3 gap-y-0.5 py-2.5 text-sm items-center">
                                    <span className="text-slate-700">{fmtDateTime(x.createdAt)}</span>
                                    <span className={`font-bold sm:text-left text-right ${c.text}`}>{inr(x.amount)}</span>
                                    <span className="text-slate-500 text-xs sm:text-sm">{x.tipAmount ? `Tip ${inr(x.tipAmount)}` : <span className="hidden sm:inline">—</span>}</span>
                                    <span className="text-slate-500 text-xs sm:text-sm sm:text-left text-right">{x.paymentMode || x.gateway || '—'}</span>
                                    <span className="col-span-2 sm:col-span-1 text-[11px] text-slate-400 font-mono break-all">{x.txnid}</span>
                                  </li>
                                ))}
                              </ul>
                              {y.donations.length > ROWS_PER_YEAR && (
                                <button
                                  onClick={() => setExpandedRows((s) => flip(s, y.fy))}
                                  className={`mt-2 text-sm font-semibold ${c.text} hover:underline cursor-pointer`}
                                >
                                  {showAll ? 'Show fewer' : `Show all ${y.donations.length} payments`}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- page ---------- */
export default function PermanentDonorModule() {
  // useSearchParams needs a Suspense boundary
  return (
    <Suspense fallback={null}>
      <PermanentDonorPage />
    </Suspense>
  );
}

function PermanentDonorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: response, isLoading, isError, refetch } = useGetPermanentDonorsQuery({});

  const donors = useMemo(() => response?.data || [], [response]);
  const currentFY = response?.currentFY || '';

  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState('');
  const [renewal, setRenewal] = useState('');
  const [fy, setFy] = useState('');
  const [minTotal, setMinTotal] = useState('');
  const [sortKey, setSortKey] = useState('recent');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  // Deep link from the main donors page: /tpf-management/permanent-donors?donor=<userId>
  const linkedUserId = searchParams.get('donor');
  const [linkDismissed, setLinkDismissed] = useState(false);

  const linkedDonor = !linkDismissed && linkedUserId ? donors.find((d) => d.userId === linkedUserId) : null;
  const selectedDonor = donors.find((d) => d._id === selectedId) || linkedDonor || null;
  const closeDetail = () => { setSelectedId(null); setLinkDismissed(true); };

  // Escape returns from the detail view
  const detailOpen = Boolean(selectedDonor);
  useEffect(() => {
    if (!detailOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { setSelectedId(null); setLinkDismissed(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detailOpen]);

  const fyOptions = useMemo(() => {
    const set = new Set();
    donors.forEach((d) => {
      if (d.currentFY) set.add(d.currentFY);
      (d.fyHistory || []).forEach((h) => h.financialYear && set.add(h.financialYear));
      (d.donations || []).forEach((x) => x.financialYear && set.add(x.financialYear));
    });
    return [...set].sort().reverse();
  }, [donors]);

  const thisFyTotal = useMemo(
    () => donors.filter((d) => d.currentFY === currentFY).reduce((s, d) => s + (d.totalCurrentFY || 0), 0),
    [donors, currentFY]
  );
  const counts = useMemo(() => {
    const c = { overdue: 0, soon: 0 };
    donors.forEach((d) => {
      const s = renewalState(d);
      if (s === 'overdue') c.overdue += 1;
      if (s === 'soon') c.soon += 1;
    });
    return c;
  }, [donors]);

  const totalDonated = response?.stats?.totalDonations || 0;
  const average = response?.stats?.averageDonation || 0;

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const min = Number(minTotal) || 0;
    return donors
      .filter((d) => {
        if (q && !(`${d.fullName || ''} ${d.email || ''} ${d.mobileNo || ''}`.toLowerCase().includes(q))) return false;
        if (status && d.status !== status) return false;
        if (renewal && renewalState(d) !== renewal) return false;
        if (min && (d.totalAmountDonated || 0) < min) return false;
        if (fy) {
          const inFy =
            d.currentFY === fy ||
            (d.fyHistory || []).some((h) => h.financialYear === fy) ||
            (d.donations || []).some((x) => x.financialYear === fy);
          if (!inFy) return false;
        }
        return true;
      })
      .sort(SORTS[sortKey].fn);
  }, [donors, searchQuery, status, renewal, fy, minTotal, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const activeFilterCount = [searchQuery, status, renewal, fy, minTotal].filter(Boolean).length;
  const resetPage = () => setCurrentPage(1);
  const clearFilters = () => {
    setSearchQuery(''); setStatus(''); setRenewal(''); setFy(''); setMinTotal(''); setCurrentPage(1);
  };

  const exportCsv = () => {
    const header = [
      'Name', 'Email', 'Mobile', 'Status', 'Total Donated', 'Contributions', 'Current FY', 'Current FY Total',
      'First Contribution', 'Last Contribution', 'Last Amount', 'Next Donation Date',
    ];
    const rows = filtered.map((d) => [
      d.fullName, d.email, d.mobileNo, d.status, d.totalAmountDonated || 0, d.totalContributions || 0, d.currentFY,
      d.totalCurrentFY || 0, fmtDate(d.firstContributionAt), fmtDate(d.lastContributionAt), d.lastContributionAmount ?? '',
      fmtDate(d.nextDonationDate),
    ]);
    const csv = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `permanent-donors-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pageBg = 'min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/40 to-slate-100';

  /* ---------- detail view ---------- */
  if (selectedDonor) {
    return <DonorDetail key={selectedDonor._id} d={selectedDonor} currentFY={currentFY} onBack={closeDetail} />;
  }

  if (isLoading) {
    return (
      <div className={`${pageBg} flex items-center justify-center`} role="status" aria-live="polite">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-emerald-600 mb-4" />
          <p className="text-slate-600 text-lg font-medium">Loading permanent donors...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`${pageBg} flex items-center justify-center`}>
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-4 border border-red-200 text-center" role="alert">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" aria-hidden />
          </div>
          <p className="text-red-600 text-lg font-semibold">Failed to load donors</p>
          <button onClick={refetch} className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 cursor-pointer">
            Try again
          </button>
        </div>
      </div>
    );
  }

  /* ---------- list view ---------- */
  return (
    <div className={`${pageBg} p-4 md:p-6 lg:p-8`}>
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 mb-4 transition-all hover:gap-3 group cursor-pointer rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" aria-hidden />
          <span className="font-medium">Back</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Permanent Donors</h1>
            <p className="text-slate-600 mt-1">Members who gave ₹1,000 or more. Next donation is due one year after their last contribution.</p>
          </div>
          <button
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            <Download className="w-4 h-4" aria-hidden />
            Export {filtered.length} to CSV
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4 mb-6">
          <StatCard icon={Users} tone="blue" label="Permanent donors" value={donors.length} />
          <StatCard icon={IndianRupee} label="Total donated" value={inr(totalDonated)} />
          <StatCard icon={TrendingUp} tone="purple" label={`This FY${currentFY ? ` (${currentFY})` : ''}`} value={inr(thisFyTotal)} />
          <StatCard icon={IndianRupee} tone="purple" label="Average per donor" value={inr(average)} />
          <StatCard
            icon={CalendarClock} tone="amber" label="Due in 30 days" value={counts.soon}
            onClick={() => { setRenewal(renewal === 'soon' ? '' : 'soon'); resetPage(); }} active={renewal === 'soon'}
          />
          <StatCard
            icon={AlertTriangle} tone="red" label="Overdue" value={counts.overdue}
            onClick={() => { setRenewal(renewal === 'overdue' ? '' : 'overdue'); resetPage(); }} active={renewal === 'overdue'}
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-5 mb-6 border border-slate-200">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" aria-hidden />
              <label htmlFor="pd-search" className="sr-only">Search donors</label>
              <input
                id="pd-search"
                type="search"
                placeholder="Search by name, email or mobile..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); resetPage(); }}
                className={`${inputCls} pl-10`}
              />
            </div>
            <div className="flex items-center gap-2 lg:w-72">
              <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" aria-hidden />
              <label htmlFor="pd-sort" className="sr-only">Sort by</label>
              <select id="pd-sort" value={sortKey} onChange={(e) => { setSortKey(e.target.value); resetPage(); }} className={inputCls}>
                {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-col xl:flex-row xl:items-center gap-4">
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Next donation filter">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 mr-1">Next donation</span>
              {[['', 'All'], ['overdue', 'Overdue'], ['soon', 'Due in 30 days'], ['upcoming', 'Upcoming']].map(([v, l]) => (
                <Chip key={v || 'all'} active={renewal === v} onClick={() => { setRenewal(v); resetPage(); }}>{l}</Chip>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Status filter">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 mr-1">Status</span>
              {[['', 'All'], ['active', 'Active'], ['paused', 'Paused'], ['cancelled', 'Cancelled']].map(([v, l]) => (
                <Chip key={v || 'all'} active={status === v} onClick={() => { setStatus(v); resetPage(); }}>{l}</Chip>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="pd-fy" className="block text-xs font-semibold text-slate-500 mb-1">Donated in financial year</label>
              <select id="pd-fy" value={fy} onChange={(e) => { setFy(e.target.value); resetPage(); }} className={inputCls}>
                <option value="">Any year</option>
                {fyOptions.map((o) => <option key={o} value={o}>FY {o}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="pd-min" className="block text-xs font-semibold text-slate-500 mb-1">Minimum total donated</label>
              <select id="pd-min" value={minTotal} onChange={(e) => { setMinTotal(e.target.value); resetPage(); }} className={inputCls}>
                <option value="">Any amount</option>
                {[1000, 5000, 10000, 25000, 50000, 100000].map((n) => <option key={n} value={n}>{inr(n)}+</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                disabled={activeFilterCount === 0}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 border border-red-300 rounded-xl hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                <RotateCcw className="w-4 h-4" aria-hidden />
                Clear filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 border border-slate-200">
          <p className="text-sm text-slate-600 mb-4" aria-live="polite">
            Showing <span className="font-semibold text-slate-900">{filtered.length}</span> of {donors.length} permanent donors
          </p>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-slate-400" aria-hidden />
              </div>
              <p className="text-slate-600 text-lg font-medium">{donors.length === 0 ? 'No permanent donors yet' : 'No donors match these filters'}</p>
              {donors.length > 0 && <p className="text-slate-400 text-sm mt-1">Try clearing a filter or changing your search</p>}
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="lg:hidden space-y-3">
                {pageRows.map((d) => (
                  <button
                    key={d._id}
                    onClick={() => setSelectedId(d._id)}
                    className="w-full text-left bg-slate-50 rounded-xl p-4 border border-slate-200 hover:shadow-md transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white grid place-items-center text-sm font-bold shrink-0">{initialsOf(d.fullName)}</div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{d.fullName || 'Unnamed donor'}</p>
                          <p className="text-xs text-slate-500 truncate">{d.email || d.mobileNo}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${STATUS_STYLE[d.status] || STATUS_STYLE.cancelled}`}>{d.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200 text-sm">
                      <div><p className="text-xs text-slate-500">Total donated</p><p className="font-bold text-emerald-600">{inr(d.totalAmountDonated)}</p></div>
                      <div><p className="text-xs text-slate-500">Last contribution</p><p className="font-semibold text-slate-800">{fmtDate(d.lastContributionAt)}</p></div>
                      <div className="col-span-2 flex items-center justify-between">
                        <div><p className="text-xs text-slate-500">Next donation</p><p className="font-semibold text-slate-800">{fmtDate(d.nextDonationDate)}</p></div>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ${RENEWAL_STYLE[renewalState(d)]}`}>{renewalLabel(d)}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th scope="col" className="px-4 py-3">Donor</th>
                      <th scope="col" className="px-4 py-3">Mobile</th>
                      <th scope="col" className="px-4 py-3 text-right">Total donated</th>
                      <th scope="col" className="px-4 py-3 text-right">Times</th>
                      <th scope="col" className="px-4 py-3">Last contribution</th>
                      <th scope="col" className="px-4 py-3">Next donation</th>
                      <th scope="col" className="px-4 py-3 text-center">Status</th>
                      <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pageRows.map((d) => (
                      <tr key={d._id} onClick={() => setSelectedId(d._id)} className="hover:bg-emerald-50/50 transition-colors cursor-pointer">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white grid place-items-center text-xs font-bold shrink-0">{initialsOf(d.fullName)}</div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate max-w-[14rem]">{d.fullName || 'Unnamed donor'}</p>
                              <p className="text-xs text-slate-500 truncate max-w-[14rem]">{d.email || '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{d.mobileNo || '—'}</td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600">{inr(d.totalAmountDonated)}</td>
                        <td className="px-4 py-3 text-right text-slate-700">{d.totalContributions || 0}</td>
                        <td className="px-4 py-3">
                          <p className="text-slate-800 font-medium">{fmtDate(d.lastContributionAt)}</p>
                          {d.lastContributionAmount != null && <p className="text-xs text-slate-500">{inr(d.lastContributionAmount)}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-slate-800 font-medium">{fmtDate(d.nextDonationDate)}</p>
                          <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ring-1 ${RENEWAL_STYLE[renewalState(d)]}`}>{renewalLabel(d)}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLE[d.status] || STATUS_STYLE.cancelled}`}>{d.status}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedId(d._id); }}
                            className="text-emerald-600 hover:text-emerald-800 font-semibold hover:underline cursor-pointer rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                            aria-label={`View details for ${d.fullName || 'donor'}`}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-5 border-t border-slate-200 gap-4 fab-avoid">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <label htmlFor="pd-size">Rows per page</label>
                  <select id="pd-size" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); resetPage(); }} className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white">
                    {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    aria-label="Previous page"
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" aria-hidden /> <span className="hidden sm:inline">Previous</span>
                  </button>
                  <span className="text-sm text-slate-600 px-2">Page <b className="text-slate-900">{page}</b> of {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    aria-label="Next page"
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span className="hidden sm:inline">Next</span> <ChevronRight className="w-4 h-4" aria-hidden />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
