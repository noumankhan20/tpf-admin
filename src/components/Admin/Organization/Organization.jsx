'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import NotificationBell from '../../Common/NotificationBell';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
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

export default function OrganizationVerifyPage() {
   const router = useRouter();

   // Tab State
   const [activeTab, setActiveTab] = useState('registrations'); // 'registrations' or 'campaigns'

   // Selection state
   const [selectedForm, setSelectedForm] = useState(null);
   const [selectedCampaignRequest, setSelectedCampaignRequest] = useState(null);

   // Ground Report Modal State
   const [isGroundReportModalOpen, setIsGroundReportModalOpen] = useState(false);
   const [groundReportStatus, setGroundReportStatus] = useState(null); // 'verified', 'rejected', 'pending', 'approved', 'clarification'
   const [groundReportReason, setGroundReportReason] = useState('');

   // UI State
   const [showSuccessMessage, setShowSuccessMessage] = useState(false);
   const [showErrorMessage, setShowErrorMessage] = useState(false);

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
   }, { skip: activeTab !== 'registrations' });

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

   const displayForms = activeTab === 'registrations' ? registrationsList : campaignsList;

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
         alert("Please enter a message.");
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
         setShowSuccessMessage(true);
         setTimeout(() => setShowSuccessMessage(false), 3000);
      } catch (error) {
         console.error('Failed to update status:', error);
         setShowErrorMessage(true);
         setTimeout(() => setShowErrorMessage(false), 3000);
      }
   };

   return (
      <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
         {/* Notifications / Alerts */}
         <AnimatePresence>
            {showSuccessMessage && (
               <motion.div
                  initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
                  className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] bg-gradient-to-r from-emerald-600 to-emerald-400 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3"
               >
                  <span>Request Status Updated!</span>
               </motion.div>
            )}
            {showErrorMessage && (
               <motion.div
                  initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
                  className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] bg-gradient-to-r from-red-600 to-red-400 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3"
               >
                  <span>Action Failed! Please try again.</span>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Header */}
         <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0 shadow-sm">
            <div className="flex items-center space-x-6">
               <div className="flex items-center space-x-4">
                  <button
                     onClick={() => router.push('/select-portal?category=work')}
                     className="p-2 hover:bg-gray-100 rounded-full transition"
                  >
                     <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <h1 className="text-xl font-bold text-gray-800">Organization Center</h1>
               </div>

               <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button
                     onClick={() => { setActiveTab('registrations'); setCurrentPage(1); }}
                     className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'registrations' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                     Registration Requests
                  </button>
                  <button
                     onClick={() => { setActiveTab('campaigns'); setCurrentPage(1); }}
                     className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'campaigns' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                     Campaign Requests
                  </button>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <NotificationBell moduleFilter="ORGANIZATION" />
            </div>
         </header>

         {/* Main Content */}
         <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full overflow-hidden flex flex-col print:overflow-visible print:p-0">

            <StatCards totalCount={totalCount} stats={stats} isOrganization={true} />

            <FilterBar
               searchQuery={searchQuery} setSearchQuery={setSearchQuery}
               statusFilter={statusFilter} setStatusFilter={setStatusFilter}
               dateFilter={dateFilter} setDateFilter={setDateFilter}
               sortOrder={sortOrder} setSortOrder={setSortOrder}
               activeFilterCount={activeFilterCount}
               clearFilters={clearAllFilters}
               isOrganization={true}
            />

            {/* Content Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
               {activeTab === 'registrations' ? (
                  <>
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

                     <RequestDetail
                        selectedForm={selectedForm}
                        onOpenGroundReport={handleOpenGroundReport}
                     />
                  </>
               ) : (
                  <>
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

                     <CampaignRequestDetail
                        selectedRequest={selectedCampaignRequest}
                        onOpenStatusUpdate={handleOpenGroundReport}
                     />
                  </>
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
