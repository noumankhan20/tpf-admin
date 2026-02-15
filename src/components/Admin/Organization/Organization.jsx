'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import NotificationBell from '../../Common/NotificationBell';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useGetAllFormsQuery, useUpdateFormStatusMutation } from '@/utils/slices/financialAidApiSlice';

// Components
import { StatCards } from './components/StatCards';
import { FilterBar } from './components/FilterBar';
import { RequestsList } from './components/RequestsList';
import { RequestDetail } from './components/RequestDetail';
import { GroundReportModal } from './components/GroundReportModal';

export default function OrganizationVerifyPage() {
   const router = useRouter();

   // Selection state
   const [selectedForm, setSelectedForm] = useState(null);

   // Ground Report Modal State
   const [isGroundReportModalOpen, setIsGroundReportModalOpen] = useState(false);
   const [groundReportStatus, setGroundReportStatus] = useState(null); // 'approved' (active), 'rejected', 'inactive'
   const [groundReportReason, setGroundReportReason] = useState('');
   const [imagePreviews, setImagePreviews] = useState([]);
   const [groundImages, setGroundImages] = useState([]); // File objects

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
   const { data: formsData, isLoading, refetch } = useGetAllFormsQuery({
      formType: 'organization', // Fetch only organization forms
      limit: 1000
   });

   const [updateFormStatus, { isLoading: isUpdating }] = useUpdateFormStatusMutation();

   // Debounce Search
   useEffect(() => {
      const handler = setTimeout(() => {
         setDebouncedSearch(searchQuery);
         setCurrentPage(1);
      }, 300);
      return () => clearTimeout(handler);
   }, [searchQuery]);

   // Stats Calculation
   const stats = useMemo(() => {
      if (!formsData?.data) return { pending: 0, approved: 0, rejected: 0, inactive: 0, active: 0 };
      return formsData.data.reduce((acc, form) => {
         const status = form.status === 'approved' ? 'active' : form.status;
         acc[status] = (acc[status] || 0) + 1;
         // Also count 'approved' as 'active' for stats consistency if needed
         if (form.status === 'approved') acc['active'] = (acc['active'] || 0) + 1;
         return acc;
      }, { pending: 0, approved: 0, rejected: 0, inactive: 0, active: 0 });
   }, [formsData]);

   const totalCount = formsData?.data?.length || 0;

   // Filtering Logic
   const displayForms = useMemo(() => {
      if (!formsData?.data) return [];

      let filtered = formsData.data.filter(form => {
         // Status Filter
         if (statusFilter !== 'all') {
            if (statusFilter === 'active' && form.status !== 'approved' && form.status !== 'active') return false;
            if (statusFilter !== 'active' && form.status !== statusFilter) return false;
         }

         // Search Filter
         if (debouncedSearch) {
            const searchLower = debouncedSearch.toLowerCase();
            const matchesName = (form.fullName || form.organizationName || '').toLowerCase().includes(searchLower);
            const matchesEmail = (form.email || '').toLowerCase().includes(searchLower);
            const matchesId = (form._id || '').toLowerCase().includes(searchLower);
            if (!matchesName && !matchesEmail && !matchesId) return false;
         }

         // Date Filter
         if (dateFilter !== 'all') {
            const formDate = new Date(form.createdAt);
            const now = new Date();
            const diffTime = Math.abs(now - formDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (dateFilter === 'today' && diffDays > 1) return false;
            if (dateFilter === 'week' && diffDays > 7) return false;
            if (dateFilter === 'month' && diffDays > 30) return false;
            if (dateFilter === 'year' && diffDays > 365) return false;
         }

         return true;
      });

      // Sorting
      return filtered.sort((a, b) => {
         const dateA = new Date(a.createdAt);
         const dateB = new Date(b.createdAt);
         return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
   }, [formsData, statusFilter, debouncedSearch, dateFilter, sortOrder]);

   // Pagination Logic
   const totalPages = Math.ceil(displayForms.length / itemsPerPage);
   const startIndex = (currentPage - 1) * itemsPerPage;
   const endIndex = Math.min(startIndex + itemsPerPage, displayForms.length);
   const paginatedForms = displayForms.slice(startIndex, endIndex);

   // Auto-select
   useEffect(() => {
      if (selectedForm && !displayForms.find(f => f._id === selectedForm._id)) {
         setSelectedForm(null);
      }
   }, [displayForms, selectedForm]);

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
      setGroundImages([]);
      setImagePreviews([]);
      setIsGroundReportModalOpen(true);
   };

   const handleImageChange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
         setGroundImages(prev => [...prev, ...files]);
         const newPreviews = files.map(file => URL.createObjectURL(file));
         setImagePreviews(prev => [...prev, ...newPreviews]);
      }
   };

   const removeImage = (index) => {
      setGroundImages(prev => prev.filter((_, i) => i !== index));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
   };

   const handleSubmitGroundReport = async () => {
      if (!groundReportReason.trim()) {
         alert("Please enter a message.");
         return;
      }

      if (!selectedForm) return;

      const formData = new FormData();
      // Map 'active' to 'approved' for backend compatibility if needed
      const apiStatus = groundReportStatus === 'active' ? 'approved' : groundReportStatus;
      formData.append('status', apiStatus);
      formData.append('groundReportReason', groundReportReason);

      if (groundReportStatus !== 'clarification') {
         groundImages.forEach(image => {
            formData.append('groundReportImages', image);
         });
      }

      try {
         await updateFormStatus({ id: selectedForm._id, formData }).unwrap();

         setIsGroundReportModalOpen(false);
         setShowSuccessMessage(true);
         setTimeout(() => setShowSuccessMessage(false), 3000);

         setSelectedForm(null);
      } catch (error) {
         console.error('Failed to update status:', error);
         setShowErrorMessage(true);
         setTimeout(() => setShowErrorMessage(false), 3000);
      }
   };

   // Print Styles
   const printStyles = `
      @media print {
         body * { visibility: hidden; }
         #printable-form, #printable-form * { visibility: visible; }
         #printable-form { position: absolute; left: 0; top: 0; width: 100%; height: auto; overflow: visible !important; }
         .no-print { display: none !important; }
         .print-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
         .print-col-span-2 { grid-column: span 2; }
         .avoid-break { break-inside: avoid; page-break-inside: avoid; }
      }
   `;

   return (
      <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
         <style>{printStyles}</style>

         {/* Notifications / Alerts */}
         <AnimatePresence>
            {showSuccessMessage && (
               <motion.div
                  initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
                  className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 to-emerald-400 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3"
               >
                  <span>Organization Status Updated Successfully!</span>
               </motion.div>
            )}
            {showErrorMessage && (
               <motion.div
                  initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
                  className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-red-600 to-red-400 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3"
               >
                  <span>Action Failed! Please try again.</span>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Header */}
         <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0 shadow-sm">
            <div className="flex items-center space-x-4">
               <button
                  onClick={() => router.push('/select-portal?category=work')}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
               >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
               </button>
               <h1 className="text-xl font-bold text-gray-800">Verify Organization Forms</h1>
            </div>
            <div className="flex items-center gap-4">
               <NotificationBell moduleFilter="FINANCIAL_AID" />
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
               <RequestsList
                  isLoading={isLoading}
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
                  isOrganizationPage={true}
               />
            </div>
         </main>

         <GroundReportModal
            isOpen={isGroundReportModalOpen}
            onClose={() => setIsGroundReportModalOpen(false)}
            status={groundReportStatus}
            reason={groundReportReason}
            setReason={setGroundReportReason}
            images={imagePreviews}
            onImageChange={handleImageChange}
            onRemoveImage={removeImage}
            onSubmit={handleSubmitGroundReport}
            isUpdating={isUpdating}
         />
      </div>
   );
}