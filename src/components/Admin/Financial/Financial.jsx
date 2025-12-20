'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
   ArrowLeft,
   Bell,
   Search,
   CheckCircle,
   XCircle,
   User,
   Building,
   FileText,
   MapPin,
   Briefcase,
   CreditCard,
   Globe,
   Phone,
   Mail,
   Calendar,
   Users,
   Filter,
   SortAsc,
   SortDesc,
   ChevronLeft,
   ChevronRight,
   ChevronsLeft,
   ChevronsRight,
   Clock,
   TrendingUp,
   X as XIcon,
   Printer
} from 'lucide-react';
import { useGetAllFormsQuery, useUpdateFormStatusMutation } from '@/utils/slices/financialAidApiSlice';

export default function FinancialAidVerifyPage() {
   const router = useRouter();

   // Tab and selection state
   const [activeTab, setActiveTab] = useState('myself'); // 'myself' or 'other'
   const [selectedForm, setSelectedForm] = useState(null);
   const [rejectReason, setRejectReason] = useState('');
   const [isRejecting, setIsRejecting] = useState(false);

   const [showSuccessMessage, setShowSuccessMessage] = useState(false);
   const [showErrorMessage, setShowErrorMessage] = useState(false);

   // Search state with debouncing
   const [searchQuery, setSearchQuery] = useState('');
   const [debouncedSearch, setDebouncedSearch] = useState('');

   // Filter state
   const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
   const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month', 'year'

   // Sort state
   const [sortBy, setSortBy] = useState('createdAt'); // 'createdAt', 'fullName', 'status'
   const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

   // Pagination state
   const [currentPage, setCurrentPage] = useState(1);
   const [pageSize] = useState(10);

   // Debounce search query
   React.useEffect(() => {
      const timer = setTimeout(() => {
         setDebouncedSearch(searchQuery);
         setCurrentPage(1); // Reset to first page on search
      }, 300);
      return () => clearTimeout(timer);
   }, [searchQuery]);

   // Auto-hide success message
   React.useEffect(() => {
      if (showSuccessMessage) {
         const timer = setTimeout(() => {
            setShowSuccessMessage(false);
         }, 3000);
         return () => clearTimeout(timer);
      }
   }, [showSuccessMessage]);

   // Auto-hide error message
   React.useEffect(() => {
      if (showErrorMessage) {
         const timer = setTimeout(() => {
            setShowErrorMessage(false);
         }, 3000);
         return () => clearTimeout(timer);
      }
   }, [showErrorMessage]);

   // Reset page when filters change
   React.useEffect(() => {
      setCurrentPage(1);
   }, [activeTab, statusFilter, dateFilter, sortBy, sortOrder]);

   // Fetch logic with all filters
   const { data: formsData, isLoading, isError } = useGetAllFormsQuery({
      formType: activeTab, // Use formType instead of type
      status: statusFilter !== 'all' ? statusFilter : undefined,
      search: debouncedSearch,
      sortBy,
      sortOrder,
      page: currentPage,
      limit: pageSize,
      dateFilter
   });

   const [updateStatus, { isLoading: isUpdating }] = useUpdateFormStatusMutation();

   const handleApprove = async (id) => {
      try {
         await updateStatus({ id, status: 'approved' }).unwrap();
         setSelectedForm(null);
         setShowSuccessMessage(true);
      } catch (err) {
         console.error("Failed to approve:", err);
         setShowErrorMessage(true);
      }
   };

   const handleReject = async (id) => {
      if (!rejectReason.trim()) {
         setShowErrorMessage(true); // Show error for empty reason
         return;
      }
      try {
         await updateStatus({ id, status: 'rejected', remarks: rejectReason }).unwrap();
         setIsRejecting(false);
         setRejectReason('');
         setSelectedForm(null);
         setShowSuccessMessage(true);
      } catch (err) {
         console.error("Failed to reject:", err);
         setShowErrorMessage(true);
      }
   };

   // Clear all filters
   const clearAllFilters = () => {
      setSearchQuery('');
      setStatusFilter('all');
      setDateFilter('all');
      setSortBy('createdAt');
      setSortOrder('desc');
      setCurrentPage(1);
   };

   // Calculate derived values (Fallback for backend API mismatch)
   const rawForms = formsData?.data || [];

   // If backend doesn't return 'total' (new format), use 'count' (old format) or array length
   const totalCount = formsData?.total ?? formsData?.count ?? rawForms.length;

   // Stats Calculation (Use backend stats if available, else calculate locally)
   const stats = formsData?.stats || {
      pending: rawForms.filter(f => f.status === 'pending').length,
      approved: rawForms.filter(f => f.status === 'approved').length,
      rejected: rawForms.filter(f => f.status === 'rejected').length
   };

   // Tab Counts (Use backend if available, else calculate locally)
   // Note: If backend returns paginated data without counts, local calc only counts current page!
   // But if backend returns ALL data (old format), this works perfectly.
   const tabCounts = formsData?.tabCounts || {
      myself: rawForms.filter(f => (f.formType === 'myself' || !f.isOrganization)).length,
      other: rawForms.filter(f => f.formType === 'other').length,
      // Fallback: If formType missing, check isOrganization
      organization: rawForms.filter(f => f.isOrganization).length
   };

   // Pagination Calculation
   // If backend provides pagination, use it. Else calculate from total.
   const totalPages = formsData?.totalPages || Math.ceil(totalCount / pageSize);
   const startIndex = (currentPage - 1) * pageSize + 1;
   const endIndex = Math.min(currentPage * pageSize, totalCount);

   // Determine which forms to display
   // If backend paginates (returns ~10 items), use rawForms.
   // If backend returns ALL items (old format), we must slice locally.
   const isBackendPaginated = formsData?.page !== undefined;
   const displayForms = isBackendPaginated ? rawForms : rawForms.slice((currentPage - 1) * pageSize, currentPage * pageSize);

   // Get active filter count
   const activeFilterCount = [
      statusFilter !== 'all',
      dateFilter !== 'all',
      debouncedSearch !== '',
   ].filter(Boolean).length;

   const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    #printable-form, #printable-form * {
      visibility: visible;
    }
    #printable-form {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: auto;
      background: white;
      z-index: 9999;
      padding: 0;
      margin: 0;
      overflow: visible;
    }
    /* Hide scrollbars/overflow on parent to prevent extra blank pages */
    html, body {
      overflow: visible !important;
      height: auto !important;
    }
    .avoid-break {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .no-print {
      display: none !important;
    }
  }
`;

   return (
      <>
         <AnimatePresence>
              {showSuccessMessage && (
  <motion.div
    initial={{ opacity: 0, y: -50 }}
    animate={{ opacity: 1, y: 0 }}
    className="fixed top-4 left-1/2 -translate-x-1/2 z-50 
               bg-gradient-to-r from-emerald-600 to-emerald-400 text-white px-6 py-4 rounded-lg shadow-2xl 
               flex items-center gap-3 max-w-md w-[90%] sm:w-auto"
  >
    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <div>
      <p className="font-semibold">Form Approved Successfully!</p>
    </div>
  </motion.div>
  
)}

         {showErrorMessage && (
  <motion.div
    initial={{ opacity: 0, y: -50 }}
    animate={{ opacity: 1, y: 0 }}
    className="fixed top-4 left-1/2 -translate-x-1/2 z-50 
         bg-gradient-to-r from-red-600 to-red-400 text-white px-6 py-4 rounded-lg shadow-2xl 
         flex items-center gap-3 max-w-md w-[90%] sm:w-auto"
  >
    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
    <div>
      <p className="font-semibold">Submission Failed!</p>
      <p className="text-sm text-red-100">Please try again later</p>
    </div>
  </motion.div>
)}
         </AnimatePresence>
         <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            {/* Header */}
            <style>{printStyles}</style>
            <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0 shadow-sm">
               <div className="flex items-center space-x-4">
                  <button
                     onClick={() => router.push('/select-portal')}
                     className="p-2 hover:bg-gray-100 rounded-full transition"
                  >
                     <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <h1 className="text-xl font-bold text-gray-800">Verify Financial Aid Forms</h1>
               </div>
               <button className="p-2 hover:bg-gray-100 rounded-full transition relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
               </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full overflow-hidden flex flex-col">

               {/* Statistics Dashboard */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                     <div className="flex items-center justify-between mb-2">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <span className="text-2xl font-bold text-gray-800">{totalCount}</span>
                     </div>
                     <h3 className="text-sm font-semibold text-gray-600">Total Forms</h3>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                     <div className="flex items-center justify-between mb-2">
                        <Clock className="w-8 h-8 text-orange-600" />
                        <span className="text-2xl font-bold text-orange-600">{stats?.pending || 0}</span>
                     </div>
                     <h3 className="text-sm font-semibold text-gray-600">Pending</h3>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                     <div className="flex items-center justify-between mb-2">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                        <span className="text-2xl font-bold text-green-600">{stats?.approved || 0}</span>
                     </div>
                     <h3 className="text-sm font-semibold text-gray-600">Approved</h3>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                     <div className="flex items-center justify-between mb-2">
                        <XCircle className="w-8 h-8 text-red-600" />
                        <span className="text-2xl font-bold text-red-600">{stats?.rejected || 0}</span>
                     </div>
                     <h3 className="text-sm font-semibold text-gray-600">Rejected</h3>
                  </div>
               </div>

               {/* Tabs */}
               <div className="flex space-x-6 border-b border-gray-200 mb-4 shrink-0">
                  <button
                     onClick={() => { setActiveTab('myself'); setSelectedForm(null); }}
                     className={`pb-3 px-2 text-sm font-medium transition-colors relative flex items-center gap-2 ${activeTab === 'myself' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'
                        }`}
                  >
                     Myself
                     {tabCounts?.myself > 0 && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full font-semibold">
                           {tabCounts.myself}
                        </span>
                     )}
                  </button>
                  <button
                     onClick={() => { setActiveTab('other'); setSelectedForm(null); }}
                     className={`pb-3 px-2 text-sm font-medium transition-colors relative flex items-center gap-2 ${activeTab === 'other' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'
                        }`}
                  >
                     Others
                     {tabCounts?.other > 0 && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full font-semibold">
                           {tabCounts.other}
                        </span>
                     )}
                  </button>
               </div>

               {/* Filter Bar */}
               <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
                  <div className="flex flex-wrap gap-3 items-center">
                     {/* Search */}
                     <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                           type="text"
                           placeholder="Search by name, email..."
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-9 pr-4 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                     </div>

                     {/* Status Filter */}
                     <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                     >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                     </select>

                     {/* Date Filter */}
                     <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                     >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                     </select>

                     {/* Sort By */}


                     {/* Sort Order */}
                     <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                     >
                        {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                        {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                     </button>

                     {/* Clear Filters */}
                     {activeFilterCount > 0 && (
                        <button
                           onClick={clearAllFilters}
                           className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                        >
                           <XIcon className="w-4 h-4" />
                           Clear ({activeFilterCount})
                        </button>
                     )}
                  </div>

                  {/* Active Filters Display */}
                  {activeFilterCount > 0 && (
                     <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
                        {statusFilter !== 'all' && (
                           <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium flex items-center gap-1">
                              Status: {statusFilter}
                              <button onClick={() => setStatusFilter('all')} className="hover:bg-blue-200 rounded-full p-0.5">
                                 <XIcon className="w-3 h-3" />
                              </button>
                           </span>
                        )}
                        {dateFilter !== 'all' && (
                           <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium flex items-center gap-1">
                              Date: {dateFilter}
                              <button onClick={() => setDateFilter('all')} className="hover:bg-blue-200 rounded-full p-0.5">
                                 <XIcon className="w-3 h-3" />
                              </button>
                           </span>
                        )}
                        {debouncedSearch !== '' && (
                           <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium flex items-center gap-1">
                              Search: "{debouncedSearch}"
                              <button onClick={() => setSearchQuery('')} className="hover:bg-blue-200 rounded-full p-0.5">
                                 <XIcon className="w-3 h-3" />
                              </button>
                           </span>
                        )}
                     </div>
                  )}
               </div>


               {/* Content Grid */}
               <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

                  {/* LEFT: List Column */}
                  <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-sm">
                     <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                           <h2 className="text-lg font-semibold text-gray-800">Submitted Forms</h2>
                           {totalCount > 0 && (
                              <span className="text-sm text-gray-600">
                                 {startIndex}-{endIndex} of {totalCount}
                              </span>
                           )}
                        </div>
                        {activeFilterCount > 0 && (
                           <p className="text-xs text-gray-500">
                              {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                           </p>
                        )}
                     </div>

                     <div className="overflow-y-auto flex-1 p-3 space-y-2 custom-scrollbar">
                        {isLoading && <p className="text-center text-gray-600 p-8">Loading applications...</p>}

                        {!isLoading && displayForms?.map((form) => (
                           <div
                              key={form._id}
                              onClick={() => { setSelectedForm(form); setIsRejecting(false); }}
                              className={`p-4 rounded-xl border cursor-pointer transition-all group ${selectedForm?._id === form._id
                                 ? 'bg-blue-50 border-blue-500 shadow-md'
                                 : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                                 }`}
                           >
                              <div className="flex justify-between items-start mb-2">
                                 <span className={`font-semibold text-lg truncate ${selectedForm?._id === form._id ? 'text-blue-600' : 'text-gray-800'}`}>
                                    {form.fullName || form.organizationName}
                                 </span>
                                 <Badge status={form.status} />
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                                 <Mail size={12} /> {form.email}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                 <Calendar size={12} /> {new Date(form.createdAt).toLocaleDateString()}
                              </div>
                           </div>
                        ))}

                        {!isLoading && displayForms?.length === 0 && (
                           <div className="text-center text-gray-500 p-8 flex flex-col items-center">
                              <FileText className="w-12 h-12 mb-2 opacity-30 text-gray-400" />
                              <p className="font-medium mb-1">No forms found</p>
                              {activeFilterCount > 0 ? (
                                 <>
                                    <p className="text-xs text-gray-400 mb-3">Try adjusting your filters</p>
                                    <button
                                       onClick={clearAllFilters}
                                       className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                       Clear all filters
                                    </button>
                                 </>
                              ) : (
                                 <p className="text-xs text-gray-400">No submissions yet</p>
                              )}
                           </div>
                        )}
                     </div>

                     {/* Pagination Controls */}
                     {totalPages > 1 && (
                        <div className="border-t border-gray-200 p-3 bg-gray-50">
                           <div className="flex items-center justify-between gap-2">
                              <div className="flex gap-1">
                                 <button
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                    className="px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="First page"
                                 >
                                    <ChevronsLeft className="w-4 h-4" />
                                 </button>
                                 <button
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    disabled={currentPage === 1}
                                    className="px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Previous page"
                                 >
                                    <ChevronLeft className="w-4 h-4" />
                                 </button>
                              </div>

                              <div className="flex items-center gap-1">
                                 {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                       pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                       pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                       pageNum = totalPages - 4 + i;
                                    } else {
                                       pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                       <button
                                          key={pageNum}
                                          onClick={() => setCurrentPage(pageNum)}
                                          className={`px-3 py-1 text-xs border rounded transition-colors ${currentPage === pageNum
                                             ? 'bg-blue-600 text-white border-blue-600'
                                             : 'bg-white border-gray-300 hover:bg-gray-100'
                                             }`}
                                       >
                                          {pageNum}
                                       </button>
                                    );
                                 })}
                              </div>

                              <div className="flex gap-1">
                                 <button
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Next page"
                                 >
                                    <ChevronRight className="w-4 h-4" />
                                 </button>
                                 <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Last page"
                                 >
                                    <ChevronsRight className="w-4 h-4" />
                                 </button>
                              </div>
                           </div>
                        </div>
                     )}
                  </div>

                  {/* RIGHT: Details Column */}
                  <div
                     id="printable-form"
                     className="lg:col-span-8 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col relative shadow-sm">
                     {selectedForm ? (
                        <div className="flex flex-col h-full">
                           {/* Detail Header */}
                           <div className="p-6 border-b border-gray-200 bg-white backdrop-blur-sm z-10 sticky top-0">
                              <div className="flex justify-between items-start">
                                 <div>
                                    <h2 className="text-3xl font-bold text-gray-800 mb-2">{selectedForm.fullName || selectedForm.organizationName}</h2>
                                    <div className="flex items-center gap-3 text-sm">
                                       <span className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-1.5 text-gray-700">
                                          {selectedForm.isOrganization ? <Building size={14} className="text-blue-600" /> : <User size={14} className="text-emerald-600" />}
                                          {selectedForm.isOrganization ? 'Organization' : 'Individual'}
                                       </span>
                                       <span className="text-gray-600">ID: {selectedForm._id}</span>
                                       <button
                                          onClick={() => window.print()}
                                          className="no-print p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                                          title="Print Form"
                                       >
                                          <Printer size={20} />
                                       </button>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-sm text-gray-600 uppercase tracking-widest mb-5 font-semibold">Current Status</p>
                                    <Badge status={selectedForm.status} size="large" />
                                 </div>
                              </div>
                           </div>

                           {/* SCROLLABLE FORM DATA */}
                           <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar pb-32">

                              {/* SECTION 1: Personal / Basic Info */}
                              <DetailSection title="Basic Information" icon={<User className="text-blue-600" />}>
                                 <Grid>
                                    <Field label="Full Name" value={selectedForm.fullName} />
                                    <Field label="Contact Number" value={selectedForm.contactNumber} icon={<Phone size={14} />} />
                                    <Field label="Email Address" value={selectedForm.email} icon={<Mail size={14} />} />
                                    {!selectedForm.isOrganization && (
                                       <>
                                          <Field label="Date of Birth" value={selectedForm.dateOfBirth} />
                                          <Field label="Gender" value={selectedForm.gender} />
                                          <Field label="Marital Status" value={selectedForm.maritalStatus} />
                                          <Field label="Relation" value={selectedForm.relation} />
                                          <Field label="Relation Name" value={selectedForm.relationName} />
                                       </>
                                    )}
                                 </Grid>
                              </DetailSection>

                              {/* SECTION 2: Address */}
                              <DetailSection title="Address Details" icon={<MapPin className="text-blue-600" />}>
                                 <Grid cols={1}>
                                    <Field label="Current Address" value={selectedForm.currentAddress} />
                                    <Field label="Permanent Address" value={selectedForm.permanentAddress} />
                                    <Field label="Address Same?" value={selectedForm.sameAddress ? 'Yes' : 'No'} />
                                 </Grid>
                              </DetailSection>

                              {/* SECTION 3: Organization Specifics */}
                              {selectedForm.isOrganization && (
                                 <DetailSection title="Organization Details" icon={<Building className="text-blue-400" />}>
                                    <Grid>
                                       <Field label="Organization Name" value={selectedForm.organizationName} />
                                       <Field label="Non-Profit Type" value={selectedForm.nonProfit} />
                                       <Field label="Registration Number" value={selectedForm.registrationNumber} />
                                       <Field label="Website" value={selectedForm.ngoWebsite} isLink />
                                       <Field label="Founder Name" value={selectedForm.founderName} />
                                       <Field label="Founder Email" value={selectedForm.founderEmail} />
                                       <Field label="Founder Mobile" value={selectedForm.founderMobile} />
                                       <Field label="Contact Person" value={selectedForm.contactName} />
                                       <Field label="Contact Email" value={selectedForm.contactEmail} />
                                       <Field label="Designation" value={selectedForm.designation} />
                                       <Field label="Budget" value={selectedForm.budget} />
                                       <Field label="Employee Strength" value={selectedForm.employeeStrength} />
                                       <Field label="Volunteer Strength" value={selectedForm.volunteerStrength} />
                                       <Field label="Crowdfunded Before?" value={selectedForm.crowdfundedBefore} />
                                       <div className="col-span-full">
                                          <Field label="Causes Supported" value={selectedForm.causeSupported?.join(', ')} />
                                       </div>
                                       <div className="col-span-full">
                                          <Field label="About NGO" value={selectedForm.aboutNGO} />
                                       </div>
                                    </Grid>
                                 </DetailSection>
                              )}

                              {/* SECTION 4: Professional & Financial (Individual) */}
                              {!selectedForm.isOrganization && (
                                 <DetailSection title="Professional & Financial" icon={<Briefcase className="text-blue-600" />}>
                                    <Grid>
                                       <Field label="Occupation" value={selectedForm.occupation} />
                                       <Field label="Monthly Income" value={selectedForm.monthlyIncome ? `₹${selectedForm.monthlyIncome}` : 'N/A'} />
                                       <Field label="Number of Dependents" value={selectedForm.numberOfDependents} />
                                    </Grid>
                                 </DetailSection>
                              )}

                              {/* SECTION 5: Banking Details */}
                              <DetailSection title="Banking Information" icon={<CreditCard className="text-blue-600" />}>
                                 <Grid>
                                    <Field label="Bank Name & Branch" value={selectedForm.bankNameBranch} />
                                    <Field label="Account Number" value={selectedForm.accountNumber} copyable />
                                    <Field label="IFSC Code" value={selectedForm.ifscCode} copyable />
                                 </Grid>
                              </DetailSection>

                              {/* SECTION 6: Identity & Certifications */}
                              <DetailSection title="Identity & Certifications" icon={<FileText className="text-blue-600" />}>
                                 <Grid>
                                    {!selectedForm.isOrganization ? (
                                       <>
                                          <Field label="ID Type" value={selectedForm.idType} />
                                          <Field label="Government ID Number" value={selectedForm.govIdNumber} />
                                       </>
                                    ) : (
                                       <>
                                          <Field label="Has 80G?" value={selectedForm.has80G} />
                                          <Field label="80G Expiry" value={selectedForm.expiryDate} />
                                          <Field label="Has FCRA?" value={selectedForm.hasFCRA} />
                                          <Field label="PAN Card No" value={selectedForm.panCard} />
                                       </>
                                    )}
                                 </Grid>
                              </DetailSection>

                              {/* SECTION 7: Request Details (Hardship) */}
                              <DetailSection title="Aid Request Details" icon={<Users className="text-blue-600" />}>
                                 <Grid cols={1}>
                                    <Field label="Aid Type Requested" value={selectedForm.aidType} />
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                       <p className="text-gray-600 text-xs uppercase tracking-wider font-bold mb-2">Hardship Description</p>
                                       <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedForm.hardshipDescription || 'No description provided.'}</p>
                                    </div>
                                 </Grid>
                              </DetailSection>

                              {/* SECTION 8: Documents (Links) */}
                              <DetailSection title="Uploaded Documents" icon={<FileText className="text-blue-600" />}>
                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <DocLink label="Government ID" url={selectedForm.govIdDocumentPath} />
                                    <DocLink label="Bank Statement" url={selectedForm.bankStatementPath} />

                                    {selectedForm.isOrganization && (
                                       <>
                                          <DocLink label="80G Certificate" url={selectedForm.certification80GPath} />
                                          <DocLink label="PAN Card Image" url={selectedForm.panCardImagePath} />
                                       </>
                                    )}

                                    {selectedForm.supportingDocumentsPaths?.map((path, idx) => (
                                       <DocLink key={idx} label={`Supporting Doc ${idx + 1}`} url={path} />
                                    ))}
                                 </div>
                              </DetailSection>

                           </div>

                           {/* Footer / Action Bar */}
                           {selectedForm.status === 'pending' && (
                              <div className="border-t border-gray-200 p-6 bg-white absolute bottom-0 w-full backdrop-blur-md z-20">
                                 {isRejecting ? (
                                    <div className="animate-in slide-in-from-bottom-2 fade-in duration-300 bg-white border border-red-300 rounded-xl p-4 shadow-2xl">
                                       <h4 className="text-red-600 font-semibold mb-2 flex items-center gap-2">
                                          <XCircle size={16} /> Reject Application
                                       </h4>
                                       <textarea
                                          className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm text-gray-800 focus:border-red-500 focus:outline-none mb-3 resize-none"
                                          rows="3"
                                          placeholder="Enter detailed reason for rejection..."
                                          value={rejectReason}
                                          onChange={(e) => setRejectReason(e.target.value)}
                                          autoFocus
                                       />
                                       <div className="flex justify-end gap-3">
                                          <button
                                             onClick={() => setIsRejecting(false)}
                                             className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition"
                                          >
                                             Cancel
                                          </button>
                                          <button
                                             onClick={() => handleReject(selectedForm._id)}
                                             disabled={isUpdating}
                                             className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-lg transition"
                                          >
                                             Confirm Rejection
                                          </button>
                                       </div>
                                    </div>
                                 ) : (
                                    <div className="flex justify-end gap-4">
                                       <button
                                          onClick={() => setIsRejecting(true)}
                                          className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl border border-red-200 transition-all font-semibold"
                                       >
                                          <XCircle size={18} />
                                          Reject
                                       </button>
                                       <button
                                          onClick={() => handleApprove(selectedForm._id)}
                                          disabled={isUpdating}
                                          className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-500/20 transition-all font-bold text-lg hover:-translate-y-1"
                                       >
                                          <CheckCircle size={20} />
                                          Approve
                                       </button>
                                    </div>
                                 )}
                              </div>
                           )}
                        </div>
                     ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8 text-center bg-gray-50">
                           <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                              <FileText className="w-10 h-10 text-blue-500/30" />
                           </div>
                           <h3 className="text-xl font-semibold text-gray-700 mb-2">No Application Selected</h3>
                           <p className="max-w-xs mx-auto text-gray-600">Select a form from the list on the left to view full details and perform actions.</p>
                        </div>
                     )}
                  </div>
               </div>
            </main>

         </div>
      </>
   );
}


/* --- HELPER COMPONENTS --- */

function DetailSection({ title, icon, children }) {
   return (
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 avoid-break">
         <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
               {icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
         </div>
         {children}
      </div>
   );
}

function Grid({ children, cols = 2 }) {
   return (
      <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-x-8 gap-y-6`}>
         {children}
      </div>
   );
}

function Field({ label, value, icon, isLink, copyable }) {
   if (!value) return null;

   return (
      <div className="group">
         <p className="text-xs text-gray-600 uppercase tracking-wider font-bold mb-1.5 flex items-center gap-2">
            {icon && <span className="text-blue-600">{icon}</span>}
            {label}
         </p>
         {isLink ? (
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline hover:text-blue-700 truncate block">
               {value}
            </a>
         ) : (
            <p className="text-gray-800 font-medium text-[15px] break-words flex items-center gap-2">
               {value}
               {copyable && (
                  <button
                     onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(value);
                     }}
                     className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded text-gray-600 transition"
                     title="Copy"
                  >
                     <FileText size={12} />
                  </button>
               )}
            </p>
         )}
      </div>
   );
}

function DocLink({ label, url }) {
   if (!url) return null;
   return (
      <a
         href={url}
         target="_blank"
         rel="noopener noreferrer"
         className="flex items-center gap-3 p-4 bg-white border border-gray-200 hover:border-blue-500 rounded-lg transition-all group shadow-sm"
      >
         <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-colors">
            <FileText className="text-blue-600 w-5 h-5" />
         </div>
         <div className="overflow-hidden">
            <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors truncate">{label}</p>
            <p className="text-xs text-gray-500 truncate">Click to view document</p>
         </div>
      </a>
   );
}

function Badge({ status, size = 'normal' }) {
   const config = {
      approved: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
      rejected: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
      pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' }
   }[status] || { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' };

   const classes = `
      ${config.bg} ${config.text} border ${config.border} 
      ${size === 'large' ? 'px-4 py-1.5 text-base' : 'px-2.5 py-0.5 text-xs'} 
      rounded-full font-semibold uppercase tracking-wide
   `;

   return <span className={classes}>{status}</span>;
}