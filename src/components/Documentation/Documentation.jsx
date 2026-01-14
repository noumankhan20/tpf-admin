'use client';
import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2, FileText, ArrowLeft, CheckCircle, XCircle, Clock, Download, TrendingUp, Calendar, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetAgreementsQuery, useDeleteAgreementMutation } from '@/utils/slices/documentationApiSlice';
import Modal from "./PopModal"
export default function Documentation() {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgreementId, setSelectedAgreementId] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 50;
  // Draft (UI-only)
  const [draftStatus, setDraftStatus] = useState('');
  const [draftAgreementType, setDraftAgreementType] = useState('');
  const [draftFromDate, setDraftFromDate] = useState('');
  const [draftToDate, setDraftToDate] = useState('');

  // Applied (used in API)
  const [appliedFilters, setAppliedFilters] = useState({
    status: '',
    agreementType: '',
    fromDate: '',
    toDate: '',
  });

  const router = useRouter();

  // RTK Query hook
  const { data, isLoading, isError, error } = useGetAgreementsQuery({
    page,
    limit,
    status: appliedFilters.status,
    agreementType: appliedFilters.agreementType,
    fromDate: appliedFilters.fromDate,
    toDate: appliedFilters.toDate,
    search: searchQuery,
  });

  const [deleteAgreement, { isLoading: isDeleting }] =
    useDeleteAgreementMutation();

  // Extract agreements from API response
  const agreements = data?.data || [];
  const pagination = data?.pagination;
  const stats = [
    {
      title: 'Draft Agreements',
      count: agreements.filter(a => a.status === 'Draft').length,
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Active Agreements',
      count: agreements.filter(a => a.status === 'Active').length,
      icon: CheckCircle,
      color: 'from-emerald-500 to-emerald-600',
      lightColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      title: 'Terminated',
      count: agreements.filter(a => a.status === 'Terminated').length,
      icon: XCircle,
      color: 'from-red-500 to-red-600',
      lightColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
    {
      title: 'Completed',
      count: agreements.filter(a => a.status === 'Completed').length,
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
      lightColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    }
  ];

  const getStatusBadge = (status) => {
    const statusStyles = {
      Draft: 'bg-blue-100 text-blue-700 border-blue-200',
      Active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      Completed: 'bg-orange-100 text-orange-700 border-orange-200',
      Terminated: 'bg-red-100 text-red-700 border-red-200',
      Signed: 'bg-purple-100 text-purple-700 border-purple-200',
      Cancelled: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return statusStyles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const handleView = (id) => {
    setSelectedAgreementId(id);
    setIsModalOpen(true);
  };

  const handleEdit = (id) => {
    router.push(`/documentation-management/edit/${id}`);
  };


  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure?\nThis will permanently delete the agreement and all related files.'
    );

    if (!confirmDelete) return;

    try {
      await deleteAgreement(id).unwrap();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete agreement');
    }
  };


  const handleCreateNew = () => {
    router.push('/documentation-management/add-agreement');
  };

  const handleViewBusiness = () => {
    router.push('/documentation-management/view-business');
  };

  // Format parties array to string
  const formatParties = (parties) => {
    if (!parties || parties.length === 0) return 'N/A';
    return parties.join(', ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      {/* Enhanced Header */}
      <header className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white shadow-2xl relative overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={() => router.push("/select-portal")}
                  className="p-2.5 hover:bg-white/10 rounded-lg cursor-pointer transition-all text-white/80 hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                    Documentation Management
                  </h1>
                  <p className="text-emerald-100 text-sm md:text-base mt-1">
                    MoU & Contract Management System
                  </p>
                </div>
              </div>
              <p className="text-emerald-50 text-right max-w-2xl">
                Centralized hub for managing agreements, contracts, and memorandums with tracking
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleViewBusiness}
                className="flex items-center cursor-pointer gap-2 px-6 py-3 bg-white text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all font-semibold shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <Eye className="w-5 h-5" />
                View Business Resolutions
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleCreateNew}
                className="flex items-center cursor-pointer gap-2 px-6 py-3 bg-white text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all font-semibold shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Create Agreement
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${stat.lightColor} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-7 h-7 ${stat.textColor}`} />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-4xl font-bold text-gray-900">
                    {stat.count}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Search & Actions Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1 w-full">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search agreements, parties, or reference numbers..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-6 py-3 border-2 rounded-xl transition-all font-medium ${showFilters
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Filter className="w-5 h-5" />
                Filters
                {showFilters && <span className="text-xs bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center">✓</span>}
              </button>
            </div>
          </div>

          {/* Enhanced Filter Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t-2 border-gray-100 animate-slideDown">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Agreement Type
                  </label>
                  <select
                    value={draftAgreementType}
                    onChange={(e) => setDraftAgreementType(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                  >
                    <option value="">All Types</option>
                    <option value="MoU">MoU</option>
                    <option value="Contract">Contract</option>
                    <option value="Service Agreement">Service Agreement</option>
                    <option value="Partnership Agreement">Partnership Agreement</option>
                    <option value="NDA">NDA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={draftStatus}
                    onChange={(e) => setDraftStatus(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                  >
                    <option value="">All Statuses</option>
                    <option value="Draft">Draft</option>
                    <option value="Signed">Signed</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Terminated">Terminated</option>
                  </select>

                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={draftFromDate}
                    onChange={(e) => setDraftFromDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={draftToDate}
                    onChange={(e) => setDraftToDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => {
                    setAppliedFilters({
                      status: draftStatus,
                      agreementType: draftAgreementType,
                      fromDate: draftFromDate,
                      toDate: draftToDate,
                    });
                    setPage(1);          // reset pagination
                    setShowFilters(false);
                  }}
                  className="px-6 py-2 bg-emerald-500 text-white rounded-xl"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    // clear draft
                    setDraftStatus('');
                    setDraftAgreementType('');
                    setDraftFromDate('');
                    setDraftToDate('');

                    // clear applied
                    setAppliedFilters({
                      status: '',
                      agreementType: '',
                      fromDate: '',
                      toDate: '',
                    });

                    setPage(1);
                    setShowFilters(false);
                  }}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Agreements Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Agreement Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Parties
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Signing Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
                        <p className="text-sm text-gray-500">Loading agreements...</p>
                      </div>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                          <XCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <p className="text-xl font-semibold text-gray-900 mb-2">Error loading agreements</p>
                        <p className="text-sm text-gray-500">{error?.data?.message || 'Something went wrong'}</p>
                      </div>
                    </td>
                  </tr>
                ) : agreements.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <FileText className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-xl font-semibold text-gray-900 mb-2">No agreements found</p>
                        <p className="text-sm text-gray-500 mb-6">Create your first agreement to get started</p>
                        <button
                          onClick={handleCreateNew}
                          className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all font-medium shadow-lg"
                        >
                          Create Agreement
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  agreements.map((agreement) => (
                    <tr key={agreement.id} className="hover:bg-emerald-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                          {agreement.agreementTitle}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 font-medium">{agreement.agreementType}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate" title={formatParties(agreement.parties)}>
                          {formatParties(agreement.parties)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 font-medium">
                          {agreement.signingDate ? new Date(agreement.signingDate).toLocaleDateString('en-GB') : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(agreement.createdAt).toLocaleDateString('en-GB')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusBadge(
                            agreement.status
                          )}`}
                        >
                          {agreement.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(agreement.id)}
                            className="p-2 text-emerald-600 cursor-pointer hover:bg-emerald-50 rounded-lg transition-all"
                            title="View"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(agreement.id)}
                            className="p-2 text-blue-600 cursor-pointer hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(agreement.id)}
                            disabled={isDeleting}
                            className="p-2 text-red-600 cursor-pointer hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Enhanced Pagination */}
        {agreements.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 font-medium">
              Showing{" "}
              <span className="text-emerald-600 font-bold">
                {(page - 1) * limit + 1}
              </span>{" "}
              to{" "}
              <span className="text-emerald-600 font-bold">
                {Math.min(page * limit, pagination?.totalRecords || 0)}
              </span>{" "}
              of{" "}
              <span className="text-emerald-600 font-bold">
                {pagination?.totalRecords || 0}
              </span>{" "}
              results
            </div>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-5 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold">
                {page}
              </button>
              <button
                disabled={page === pagination?.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-5 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        agreementId={selectedAgreementId}
      />
    </div>
  );
}