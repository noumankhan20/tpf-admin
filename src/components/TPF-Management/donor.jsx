"use client";
import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Users, IndianRupee, TrendingUp, User, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useGetAllDonorsQuery, useGetDonorDetailsQuery } from '@/utils/slices/donationApiSlice';
import KYCVerificationPage from '../Admin/KYCDetails/KYCDetails';

export default function DonorModule() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDonorId, setSelectedDonorId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRange, setSelectedRange] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    minTotalDonation: "",
    maxTotalDonation: "",
    minDonationAmount: "",
    maxDonationAmount: "",
    selectedDate: "",
    joinedSince: "",
    kycPending: "",
    kycStatus: "",
  });

  const setFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));

  const resetFilters = () => {
    setFilters({
      minTotalDonation: "",
      maxTotalDonation: "",
      minDonationAmount: "",
      maxDonationAmount: "",
      selectedDate: "",
      joinedSince: "",
      kycPending: "",
      kycStatus: "",
    });
    setCurrentPage(1);
  };

  const cleanedFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
  );

  const activeFilterCount = Object.values(filters).filter(v => v !== "").length;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: allDonorsData, isLoading: isLoadingAll, error: errorAll } = useGetAllDonorsQuery({
    page: currentPage,
    search: debouncedSearch,
    range: selectedRange,
    includeStats: true,
    ...cleanedFilters,
  });

  const { data: donorDetailsData, isLoading: isLoadingDetails, error: errorDetails } = useGetDonorDetailsQuery(
    selectedDonorId,
    { skip: !selectedDonorId }
  );

  const totalDonations = allDonorsData?.totalAmountDonated || 0;
  const totalPages = allDonorsData?.totalPages || 0;
  const avgDonation = allDonorsData?.averageDonationAmount || 0;
  const topDonors = allDonorsData?.topDonors || [];
  const donorsData = allDonorsData?.donors || [];
  const globalTotalDonors = allDonorsData?.globalTotalDonors || 0;

  const handleBackClick = () => {
    if (selectedDonorId) setSelectedDonorId(null);
    else window.location.href = '/select-portal';
  };

  if (isLoadingAll) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading donors...</div>
      </div>
    );
  }

  if (errorAll) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-xl text-red-600">Error loading donors data</div>
      </div>
    );
  }

  if (selectedDonorId) {
    if (isLoadingDetails) return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading donor details...</div>
      </div>
    );
    if (errorDetails) return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-xl text-red-600">Error loading donor details</div>
      </div>
    );

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <button onClick={handleBackClick} className="flex items-center cursor-pointer text-gray-600 hover:text-gray-900 mb-4">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Donors
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{donorDetailsData?.fullName}</h1>
            <p className="text-gray-600 mt-1">Detailed donor information and donation history</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Donor Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-600">Email</p><p className="font-medium">{donorDetailsData?.email}</p></div>
              <div><p className="text-sm text-gray-600">Phone</p><p className="font-medium">{donorDetailsData?.mobileNo}</p></div>
              <div><p className="text-sm text-gray-600">Total Donations</p><p className="font-medium text-green-600">₹{donorDetailsData?.totalAmountDonated?.toLocaleString()}</p></div>
              <div><p className="text-sm text-gray-600">Number of Donations</p><p className="font-medium">{donorDetailsData?.totalDonations}</p></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Donation History</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {donorDetailsData?.donations?.map((donation, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{new Date(donation.donationDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600">₹{donation.amountDonated?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">{donation.paymentMode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <button onClick={handleBackClick} className="flex items-center text-gray-600 cursor-pointer hover:text-gray-900 mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Donor Information</h1>
          <p className="text-gray-600 mt-1">All users are donors by default. View donor information and donation statistics.</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">Total Donations</p><p className="text-2xl font-bold text-gray-900">₹{totalDonations.toLocaleString()}</p></div>
              <IndianRupee className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">Total Donors</p><p className="text-2xl font-bold text-gray-900">{globalTotalDonors}</p></div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">Average Donation</p><p className="text-2xl font-bold text-gray-900">₹{avgDonation.toFixed(0)}</p></div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">Top Donor</p><p className="text-2xl font-bold text-gray-900">₹{topDonors[0]?.donationStats?.totalAmount?.toLocaleString() || 0}</p></div>
              <User className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Top Donors */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Top Donors</h2>
          <div className="space-y-3">
            {topDonors.map((donor, index) => (
              <div key={donor._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold mr-3">{index + 1}</div>
                  <div>
                    <p className="font-medium">{donor.fullName}</p>
                    <p className="text-sm text-gray-600">{donor.email}</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-blue-600">₹{donor.donationStats?.totalAmount?.toLocaleString() || 0}</p>
              </div>
            ))}
          </div>
        </div>

        {/* All Donors Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 tracking-tight">All Donors</h2>
              <p className="text-sm text-gray-400 mt-0.5">Manage and view donor activity</p>
            </div>
          </div>

          {/* Search + Filter Toggle Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
              />
            </div>
            <button
              onClick={() => setIsFilterOpen(prev => !prev)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border rounded-xl transition-all ${isFilterOpen || activeFilterCount > 0
                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center">{activeFilterCount}</span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isFilterOpen ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Inline Filter Panel — expands below search bar */}
          {isFilterOpen && (
            <div className="mt-3 border border-gray-200 rounded-2xl bg-gray-50/70 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                {/* Joined on exact date */}
                <div>
                  <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Joined on date</label>
                  <input
                    type="date"
                    value={filters.selectedDate}
                    onChange={e => { setFilter("selectedDate", e.target.value); setCurrentPage(1); }}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>

                {/* Joined since */}
                <div>
                  <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Joined since</label>
                  <input
                    type="date"
                    value={filters.joinedSince}
                    onChange={e => { setFilter("joinedSince", e.target.value); setCurrentPage(1); }}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>

                {/* KYC Status */}
                <div>
                  <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">KYC Status</label>
                  <div className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-200 rounded-lg">
                    <span className="text-sm text-gray-600">KYC Verified Only</span>
                    <button
                      onClick={() => { setFilter("kycStatus", filters.kycStatus === "verified" ? "" : "verified"); setCurrentPage(1); }}
                      className={`relative shrink-0 w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none ${filters.kycStatus === "verified" ? "bg-emerald-500" : "bg-gray-200"}`}
                    >
                      <span className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${filters.kycStatus === "verified" ? "translate-x-4" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Donation Range */}
                <div>
                  <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Donation range</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">₹</span>
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minTotalDonation}
                        onChange={e => { setFilter("minTotalDonation", e.target.value); setCurrentPage(1); }}
                        className="w-full pl-6 pr-2 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                    </div>
                    <span className="text-gray-300 text-sm">–</span>
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">₹</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxTotalDonation}
                        onChange={e => { setFilter("maxTotalDonation", e.target.value); setCurrentPage(1); }}
                        className="w-full pl-6 pr-2 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Reset button — aligned with other fields */}
                {activeFilterCount > 0 && (
                  <div className="flex items-end">
                    <button
                      onClick={resetFilters}
                      className="w-full py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-all"
                    >
                      Reset all filters
                    </button>
                  </div>
                )}
              </div>

              {/* Active filter pills */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-200">
                  {Object.entries(filters).map(([key, value]) => {
                    if (!value) return null;
                    return (
                      <span key={key} className="flex items-center gap-1 px-2.5 py-1 bg-white text-emerald-700 border border-emerald-200 rounded-full text-xs">
                        {key}: {value}
                        <button
                          onClick={() => { setFilter(key, ""); setCurrentPage(1); }}
                          className="text-emerald-400 hover:text-emerald-600 leading-none"
                        >×</button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Donors Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-100 mt-4">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">City/State</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined Since</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Donations</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {donorsData.map(donor => (
                  <tr key={donor._id} className="hover:bg-blue-50/40 transition-colors duration-150 group">
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-800">{donor.fullName}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{donor.email}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{donor.mobileNo}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">
                      {[...new Set([donor.city, donor.state])]
                        .filter(Boolean)
                        .map(val => val.charAt(0).toUpperCase() + val.slice(1))
                        .join(", ") || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{new Date(donor.createdDate).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 text-sm">
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        ₹{donor.donationStats?.totalAmount?.toLocaleString() || 0}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm">
                      <button
                        onClick={() => setSelectedDonorId(donor._id)}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-white hover:bg-red-500 px-3 py-1.5 rounded-lg border border-red-200 hover:border-red-500 transition-all duration-150 cursor-pointer"
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
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-400">
                Page <span className="font-medium text-gray-600">{currentPage}</span> of{" "}
                <span className="font-medium text-gray-600">{totalPages}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}