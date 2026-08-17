'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import NotificationBell from '../../Common/NotificationBell';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import {
   useGetAllOrganizationsQuery,
   useUpdateOrganizationVerificationStatusMutation,
   useGetOrganizationStatsQuery,
   useGetAllCampaignRequestsQuery,
   useUpdateCampaignRequestStatusMutation
} from '@/utils/slices/organizationApiSlice';

// Components
import { StatCards } from './components/StatCards';
import { FilterBar } from './components/FilterBar';
import { RequestsList } from './components/RequestsList';
import { RequestDetail } from './components/RequestDetail';
import { CampaignRequestsList } from './components/CampaignRequestsList';
import { CampaignRequestDetail } from './components/CampaignRequestDetail';
import { GroundReportModal } from './components/GroundReportModal';
import { EditRequestDetail } from './components/EditRequestDetail';

export default function OrganizationVerifyPage() {
   const router = useRouter();

   // Tab State
   const [activeTab, setActiveTab] = useState('registrations'); // 'registrations', 'campaigns', 'edits'

   // Selection state
   const [selectedForm, setSelectedForm] = useState(null);
   const [selectedCampaignRequest, setSelectedCampaignRequest] = useState(null);

   // Ground Report Modal State
   const [isGroundReportModalOpen, setIsGroundReportModalOpen] = useState(false);
   const [groundReportStatus, setGroundReportStatus] = useState(null); // 'verified', 'rejected', 'pending', 'approved', 'clarification'
   const [groundReportReason, setGroundReportReason] = useState('');


   // Filtering & Sorting State
   const [searchQuery, setSearchQuery] = useState('');
   const [statusFilter, setStatusFilter] = useState('all');
   const [dateFilter, setDateFilter] = useState('all');
   const [sortOrder, setSortOrder] = useState('desc');
   const [debouncedSearch, setDebouncedSearch] = useState('');

   // Pagination State
   const [currentPage, setCurrentPage] = useState(1);
   const itemsPerPage = 8;

   // API Hooks
   const { data: orgsData, isLoading: isLoadingOrgs, refetch: refetchOrgs } = useGetAllOrganizationsQuery({
      limit: 1000,
      search: debouncedSearch,
      verificationStatus: statusFilter === 'all' ? undefined : statusFilter
   }, { skip: activeTab !== 'registrations' && activeTab !== 'edits' });

   const { data: campaignRequestsData, isLoading: isLoadingCampaigns, refetch: refetchCampaigns } = useGetAllCampaignRequestsQuery(undefined, {
      skip: activeTab !== 'campaigns'
   });

   const { data: statsData } = useGetOrganizationStatsQuery();
   const [updateOrgStatus, { isLoading: isUpdatingOrg }] = useUpdateOrganizationVerificationStatusMutation();
   const [updateCampaignStatus, { isLoading: isUpdatingCampaign }] = useUpdateCampaignRequestStatusMutation();

   const isUpdating = isUpdatingOrg || isUpdatingCampaign;

   // Debounce Search
   useEffect(() => {
      const handler = setTimeout(() => {
         setDebouncedSearch(searchQuery);
         setCurrentPage(1);
      }, 300);
      return () => clearTimeout(handler);
   }, [searchQuery]);

   // Stats Calculation - From Dedicated stats endpoint
   const stats = useMemo(() => {
      const s = statsData?.data?.byVerificationStatus || [];
      const statsObj = { pending: 0, verified: 0, rejected: 0 };
      s.forEach(item => {
         if (item._id) statsObj[item._id] = item.count;
      });
      return statsObj;
   }, [statsData]);

   const totalCount = statsData?.data?.totalCount?.[0]?.count || orgsData?.total || 0;

   // Campaign Stats Calculation
   const campaignsStats = useMemo(() => {
      if (!campaignRequestsData?.data) return { pending: 0, approved: 0, rejected: 0, total: 0 };
      const data = campaignRequestsData.data;
      return {
         pending: data.filter(r => r.status === 'pending').length,
         approved: data.filter(r => r.status === 'approved').length,
         rejected: data.filter(r => r.status === 'rejected' || r.status === 'clarification').length,
         total: data.length
      };
   }, [campaignRequestsData]);

   // Filtering Logic (Client side refined filtering if needed)
   const registrationsList = useMemo(() => {
      if (!orgsData?.data) return [];

      let filtered = [...orgsData.data];

      // Date Filter
      if (dateFilter !== 'all') {
         filtered = filtered.filter(form => {
            const formDate = new Date(form.createdAt);
            const now = new Date();
            const diffTime = Math.abs(now - formDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (dateFilter === 'today') return diffDays <= 1;
            if (dateFilter === 'week') return diffDays <= 7;
            if (dateFilter === 'month') return diffDays <= 30;
            if (dateFilter === 'year') return diffDays <= 365;
            return true;
         });
      }

      // Sorting
      return filtered.sort((a, b) => {
         const dateA = new Date(a.createdAt);
         const dateB = new Date(b.createdAt);
         return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
   }, [orgsData, dateFilter, sortOrder]);

   const campaignsList = useMemo(() => {
      if (!campaignRequestsData?.data) return [];
      let filtered = [...campaignRequestsData.data];

      if (statusFilter !== 'all') {
         filtered = filtered.filter(req => req.status === statusFilter);
      }

      if (debouncedSearch) {
         filtered = filtered.filter(req =>
            req.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            req.organizationName.toLowerCase().includes(debouncedSearch.toLowerCase())
         );
      }

      return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
   }, [campaignRequestsData, statusFilter, debouncedSearch]);

   const editsList = useMemo(() => {
      if (!orgsData?.data) return [];
      return orgsData.data.filter(org => org.editRequests?.status === 'pending');
   }, [orgsData]);

   const displayForms = activeTab === 'registrations' ? registrationsList : (activeTab === 'edits' ? editsList : campaignsList);

   // Pagination Logic
   const totalPages = Math.ceil(displayForms.length / itemsPerPage);
   const startIndex = (currentPage - 1) * itemsPerPage;
   const endIndex = Math.min(startIndex + itemsPerPage, displayForms.length);
   const paginatedForms = displayForms.slice(startIndex, endIndex);

   // Auto-select
   useEffect(() => {
      if (activeTab === 'registrations') {
         if (selectedForm && !displayForms.find(f => f._id === selectedForm._id)) {
            setSelectedForm(null);
         }
      } else {
         if (selectedCampaignRequest && !displayForms.find(f => f._id === selectedCampaignRequest._id)) {
            setSelectedCampaignRequest(null);
         }
      }
   }, [displayForms, selectedForm, selectedCampaignRequest, activeTab]);

   const activeFilterCount = (statusFilter !== 'all' ? 1 : 0) + (dateFilter !== 'all' ? 1 : 0) + (debouncedSearch !== '' ? 1 : 0);

   const clearAllFilters = () => {
      setStatusFilter('all');
      setDateFilter('all');
      setSearchQuery('');
      setSortOrder('desc');
   };

   // Actions
   const handleOpenGroundReport = (status) => {
      setGroundReportStatus(status);
      setGroundReportReason('');
      setIsGroundReportModalOpen(true);
   };

   const handleSubmitGroundReport = async () => {
      if (!groundReportReason.trim()) {
         toast.warning("Please enter a message.");
         return;
      }

      try {
         if (activeTab === 'registrations') {
            if (!selectedForm) return;
            await updateOrgStatus({
               id: selectedForm._id,
               verificationStatus: groundReportStatus,
               verificationNotes: groundReportReason
            }).unwrap();
            setSelectedForm(null);
         } else {
            if (!selectedCampaignRequest) return;
            await updateCampaignStatus({
               id: selectedCampaignRequest._id,
               status: groundReportStatus,
               adminStatement: groundReportReason
            }).unwrap();
            setSelectedCampaignRequest(null);
         }

         setIsGroundReportModalOpen(false);
         toast.success("Request status updated successfully!");
      } catch (error) {
         console.error('Failed to update status:', error);
         toast.error(error?.data?.message || "Action failed! Please try again.");
      }
   };

   return (
      <div className="min-h-screen bg-[#f7f8fa] font-sans flex flex-col">
         
         {/* Page Header */}
         <header className="px-6 py-4 bg-white border-b border-slate-200/80 shrink-0 shadow-2xs no-print">
            <div className="max-w-[1600px] mx-auto flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <button
                     onClick={() => router.back()}
                     className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition cursor-pointer"
                     title="Go back"
                  >
                     <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                     <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Organization verification</h1>
                     <p className="text-xs text-slate-500 font-normal">Review and process organization registrations, campaign proposals, and profile updates.</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <NotificationBell moduleFilter="ORGANIZATION" />
               </div>
            </div>
         </header>

         {/* Main Content Workspace */}
         <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full overflow-hidden flex flex-col print:overflow-visible print:p-0">

            {/* Navigation Tabs */}
            <div className="flex items-center bg-slate-100/80 p-1 rounded-lg w-fit mb-6 border border-slate-200/60 no-print">
               <button
                  onClick={() => { setActiveTab('registrations'); setCurrentPage(1); }}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                     activeTab === 'registrations'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                  }`}
               >
                  Registrations
               </button>
               <button
                  onClick={() => { setActiveTab('campaigns'); setCurrentPage(1); }}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                     activeTab === 'campaigns'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                  }`}
               >
                  Campaign requests
               </button>
               <button
                  onClick={() => { setActiveTab('edits'); setCurrentPage(1); }}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                     activeTab === 'edits'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                  }`}
               >
                  <span>Profile changes</span>
                  {editsList.length > 0 && (
                     <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-medium">
                        {editsList.length}
                     </span>
                  )}
               </button>
            </div>

             {/* Content Workspace */}
             <div className="flex-1 flex flex-col min-h-0">
                {activeTab === 'registrations' ? (
                   selectedForm ? (
                      <div className="space-y-4">
                         <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs no-print">
                            <button
                               onClick={() => setSelectedForm(null)}
                               className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold text-xs transition cursor-pointer"
                            >
                               <ArrowLeft size={15} />
                               <span>Back to Queue List</span>
                            </button>
                            <span className="text-xs text-slate-500 font-medium">Viewing Registration Details</span>
                         </div>
                         <RequestDetail
                            selectedForm={selectedForm}
                            onOpenGroundReport={handleOpenGroundReport}
                         />
                      </div>
                   ) : (
                      <div className="space-y-6">
                         <StatCards
                            totalCount={totalCount}
                            stats={stats}
                            isOrganization={true}
                         />
                         <FilterBar
                            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                            dateFilter={dateFilter} setDateFilter={setDateFilter}
                            sortOrder={sortOrder} setSortOrder={setSortOrder}
                            activeFilterCount={activeFilterCount}
                            clearFilters={clearAllFilters}
                            isOrganization={true}
                         />
                         <RequestsList
                            isLoading={isLoadingOrgs}
                            displayForms={paginatedForms}
                            selectedForm={selectedForm}
                            setSelectedForm={setSelectedForm}
                            totalCount={displayForms.length}
                            startIndex={startIndex + 1}
                            endIndex={Math.min(startIndex + itemsPerPage, displayForms.length)}
                            activeFilterCount={activeFilterCount}
                            clearFilters={clearAllFilters}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            totalPages={totalPages}
                         />
                      </div>
                   )
                ) : activeTab === 'edits' ? (
                   selectedForm ? (
                      <div className="space-y-4">
                         <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs no-print">
                            <button
                               onClick={() => setSelectedForm(null)}
                               className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold text-xs transition cursor-pointer"
                            >
                               <ArrowLeft size={15} />
                               <span>Back to Queue List</span>
                            </button>
                            <span className="text-xs text-slate-500 font-medium">Viewing Edit Request Comparison</span>
                         </div>
                         <EditRequestDetail
                            org={selectedForm}
                            onProcessed={() => {
                               setSelectedForm(null);
                               refetchOrgs();
                            }}
                         />
                      </div>
                   ) : (
                      <div className="space-y-6">
                         <StatCards
                            totalCount={totalCount}
                            stats={stats}
                            isOrganization={true}
                         />
                         <FilterBar
                            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                            dateFilter={dateFilter} setDateFilter={setDateFilter}
                            sortOrder={sortOrder} setSortOrder={setSortOrder}
                            activeFilterCount={activeFilterCount}
                            clearFilters={clearAllFilters}
                            isOrganization={true}
                         />
                         <RequestsList
                            isLoading={isLoadingOrgs}
                            displayForms={paginatedForms}
                            selectedForm={selectedForm}
                            setSelectedForm={setSelectedForm}
                            totalCount={displayForms.length}
                            startIndex={startIndex + 1}
                            endIndex={Math.min(startIndex + itemsPerPage, displayForms.length)}
                            activeFilterCount={activeFilterCount}
                            clearFilters={clearAllFilters}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            totalPages={totalPages}
                         />
                      </div>
                   )
                ) : (
                   selectedCampaignRequest ? (
                      <div className="space-y-4">
                         <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs no-print">
                            <button
                               onClick={() => setSelectedCampaignRequest(null)}
                               className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold text-xs transition cursor-pointer"
                            >
                               <ArrowLeft size={15} />
                               <span>Back to Campaign Queue</span>
                            </button>
                            <span className="text-xs text-slate-500 font-medium">Viewing Campaign Request Proposal</span>
                         </div>
                         <CampaignRequestDetail
                            selectedRequest={selectedCampaignRequest}
                            onOpenStatusUpdate={handleOpenGroundReport}
                         />
                      </div>
                   ) : (
                      <div className="space-y-6">
                         <StatCards
                            totalCount={campaignsStats.total}
                            stats={campaignsStats}
                            isOrganization={false}
                         />
                         <FilterBar
                            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                            dateFilter={dateFilter} setDateFilter={setDateFilter}
                            sortOrder={sortOrder} setSortOrder={setSortOrder}
                            activeFilterCount={activeFilterCount}
                            clearFilters={clearAllFilters}
                            isOrganization={false}
                         />
                         <CampaignRequestsList
                            isLoading={isLoadingCampaigns}
                            displayForms={paginatedForms}
                            selectedForm={selectedCampaignRequest}
                            setSelectedForm={setSelectedCampaignRequest}
                            totalCount={displayForms.length}
                            startIndex={startIndex + 1}
                            endIndex={Math.min(startIndex + itemsPerPage, displayForms.length)}
                            activeFilterCount={activeFilterCount}
                            clearFilters={clearAllFilters}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            totalPages={totalPages}
                         />
                      </div>
                   )
                )}
             </div>
          </main>

         <GroundReportModal
            isOpen={isGroundReportModalOpen}
            onClose={() => setIsGroundReportModalOpen(false)}
            status={groundReportStatus}
            reason={groundReportReason}
            setReason={setGroundReportReason}
            onSubmit={handleSubmitGroundReport}
            isUpdating={isUpdating}
            isOrganizationUpdate={activeTab === 'registrations'}
         />
      </div>
   );
}
