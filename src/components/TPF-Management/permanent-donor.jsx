"use client";
import { useState } from 'react';
import { ArrowLeft, Search, Users, IndianRupee, TrendingUp, Calendar, Filter, X, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetPermanentDonorsQuery } from '@/utils/slices/adminApiSlice';

export default function PermanentDonorModule() {
  const formatISTDateTime = (timestamp) => {
    if (!timestamp) return "—";

    return new Date(timestamp).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [planType, setPlanType] = useState(null);
  const [status, setStatus] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const {
    data: donorsResponse,
    isLoading,
    isError,
  } = useGetPermanentDonorsQuery({ planType, status });
  
  const permanentDonors = donorsResponse?.data || [];
  const stats = donorsResponse?.stats || {};

  const totalDonations = stats.totalDonations || 0;
  const totalSubscribers = stats.totalSubscribers || 0;
  const averageDonation = stats.averageDonation || 0;
  const router = useRouter();
  
  const filteredDonors = permanentDonors.filter(donor =>
    donor.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    donor.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPaginatedDonors = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDonors.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = Math.ceil(filteredDonors.length / itemsPerPage);

  const handleBackToTPFManagementClick = () => {
    router.push('/tpf-management');
  };

  const handleBackToDonorsClick = () => {
    setCurrentPage(1);
    setSelectedDonor(null);
  };

  const clearFilters = () => {
    setPlanType(null);
    setStatus(null);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const hasActiveFilters = planType || status || searchQuery;

  if (selectedDonor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-emerald-100 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={handleBackToDonorsClick}
              className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 mb-4 transition-all hover:gap-3 group"
            >
              <ArrowLeft className="w-5 h-5 transition-transform cursor-pointer group-hover:-translate-x-1" />
              <span className="font-medium cursor-pointer">Back to Donors</span>
            </button>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-slate-200">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                    {selectedDonor.fullName}
                  </h1>
                  <p className="text-slate-600">{selectedDonor.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    selectedDonor.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-200'
                      : selectedDonor.status === 'paused'
                      ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-200'
                      : 'bg-slate-100 text-slate-700 ring-2 ring-slate-200'
                  }`}>
                    {selectedDonor.status?.charAt(0).toUpperCase() + selectedDonor.status?.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Donor Details Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">Donor Information</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-600 mb-1 font-medium">Email Address</p>
                <p className="font-semibold text-slate-900 break-all">{selectedDonor.email}</p>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-600 mb-1 font-medium">Mobile Number</p>
                <p className="font-semibold text-slate-900">{selectedDonor.mobileNo || "—"}</p>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-600 mb-1 font-medium">Gender</p>
                <p className="font-semibold text-slate-900">{selectedDonor.gender || "—"}</p>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                <p className="text-sm text-emerald-700 mb-1 font-medium">Total Donated</p>
                <p className="font-bold text-xl text-emerald-700">
                  ₹{(selectedDonor.totalAmountDonated || 0).toLocaleString('en-IN')}
                </p>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 sm:col-span-2">
                <p className="text-sm text-blue-700 mb-1 font-medium">Next Donation Date</p>
                <p className="font-semibold text-blue-900">{formatISTDateTime(selectedDonor.nextDonationDate)}</p>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 sm:col-span-2">
                <p className="text-sm text-purple-700 mb-1 font-medium">Registration Date</p>
                <p className="font-semibold text-purple-900">
                  {new Date(selectedDonor.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Donation History */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">Donation History</h2>
            </div>
            
            {/* Mobile View - Cards */}
            <div className="block md:hidden space-y-4">
              {(selectedDonor.modificationHistory || []).length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500">No donation history available</p>
                </div>
              ) : (
                (selectedDonor.modificationHistory || []).map(donation => (
                  <div key={donation._id} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xs text-slate-600 font-medium mb-1">Date & Time</p>
                        <p className="text-sm font-semibold text-slate-900">{formatISTDateTime(donation.timestamp)}</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {donation.newPlan}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                      <div>
                        <p className="text-xs text-slate-600 font-medium mb-1">Amount</p>
                        <p className="text-lg font-bold text-emerald-600">₹{donation.newAmount.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-600 font-medium mb-1">Notes</p>
                        <p className="text-sm text-slate-700">{donation.notes || "—"}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-slate-200">
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(selectedDonor.modificationHistory || []).length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                        No donation history available
                      </td>
                    </tr>
                  ) : (
                    (selectedDonor.modificationHistory || []).map((donation, index) => (
                      <tr key={donation._id} className={`hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                        <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                          {formatISTDateTime(donation.timestamp)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                            {donation.newPlan}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-base font-bold text-emerald-600">
                          ₹{donation.newAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{donation.notes || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-blue-600 mb-4"></div>
          <p className="text-slate-600 text-lg font-medium">Loading permanent donors...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-4 border border-red-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-red-600 text-lg font-semibold">Failed to load donors</p>
            <p className="text-slate-600 mt-2">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          <button
            onClick={handleBackToTPFManagementClick}
            className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 mb-4 transition-all hover:gap-3 group"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">Back to TPF Management</span>
          </button>
          
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-2">
              Permanent Donor Information
            </h1>
            <p className="text-slate-600 text-base md:text-lg">
              Manage and view details of permanent donors and their contribution history
            </p>
          </div>
        </div>

        {/* Overall Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all hover:-translate-y-1 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-2 font-medium">Total Donations</p>
                <p className="text-2xl md:text-3xl font-bold text-slate-900">
                  ₹{totalDonations.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl group-hover:scale-110 transition-transform">
                <IndianRupee className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all hover:-translate-y-1 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-2 font-medium">Total Subscribers</p>
                <p className="text-2xl md:text-3xl font-bold text-slate-900">{totalSubscribers}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all hover:-translate-y-1 group sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-2 font-medium">Average Donation</p>
                <p className="text-2xl md:text-3xl font-bold text-slate-900">
                  ₹{averageDonation.toFixed(0)}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-6 border border-slate-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h2 className="text-lg md:text-xl font-bold text-slate-900">Permanent Donors List</h2>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 sm:min-w-[280px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              
              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  hasActiveFilters
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && (
                  <span className="bg-white text-blue-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {[planType, status, searchQuery].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Plan Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Plan Type</label>
                  <select
                    value={planType || ""}
                    onChange={(e) => {
                      setPlanType(e.target.value || null);
                      setCurrentPage(1);
                    }}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">All Plans</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select
                    value={status || ""}
                    onChange={(e) => {
                      setStatus(e.target.value || null);
                      setCurrentPage(1);
                    }}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Clear Filters Button */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    disabled={!hasActiveFilters}
                    className="w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 border-2 border-red-600 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-red-600"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Donors Table/Cards */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-slate-200">
          {filteredDonors.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-500 text-lg font-medium">No donors found</p>
              <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <>
              {/* Mobile View - Cards */}
              <div className="block lg:hidden space-y-4">
                {getPaginatedDonors().map(donor => (
                  <div key={donor._id} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 text-lg mb-1">{donor.fullName}</h3>
                        <p className="text-sm text-slate-600 break-all">{donor.email}</p>
                      </div>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        donor.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : donor.status === 'paused'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {donor.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-600 font-medium">Mobile:</span>
                        <span className="text-slate-900 font-semibold">{donor.mobileNo}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-600 font-medium">Registered:</span>
                        <span className="text-slate-900">
                          {new Date(donor.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setSelectedDonor(donor)}
                      className="w-full cursor-pointer bg-emerald-500 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-slate-200">
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Donor Name</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Mobile</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Registered</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {getPaginatedDonors().map((donor, index) => (
                      <tr key={donor._id} className={`hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">{donor.fullName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{donor.email}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{donor.mobileNo}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(donor.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            donor.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : donor.status === 'paused'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {donor.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedDonor(donor)}
                            className="text-emerald-500 hover:text-emerald-700 cursor-pointer font-semibold hover:underline transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-6 border-t border-slate-200 gap-4">
                  <p className="text-sm text-slate-600 text-center sm:text-left">
                    Showing <span className="font-semibold text-slate-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                    <span className="font-semibold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredDonors.length)}</span> of{' '}
                    <span className="font-semibold text-slate-900">{filteredDonors.length}</span> donors
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = idx + 1;
                        } else if (currentPage <= 3) {
                          pageNum = idx + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + idx;
                        } else {
                          pageNum = currentPage - 2 + idx;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-10 h-10 rounded-lg font-medium transition-all ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}