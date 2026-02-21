"use client";
import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Users, IndianRupee, TrendingUp, User } from 'lucide-react';
import { useGetAllDonorsQuery, useGetDonorDetailsQuery } from '@/utils/slices/donationApiSlice';

export default function DonorModule() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDonorId, setSelectedDonorId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddDonor, setShowAddDonor] = useState(false);
  const [selectedRange, setSelectedRange] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);


  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);
  // Fetch all donors data
  const { data: allDonorsData, isLoading: isLoadingAll, error: errorAll } = useGetAllDonorsQuery({
    page: currentPage,
    search: debouncedSearch,
    range: selectedRange,
    includeStats: true,
  });

  // Fetch selected donor details
  const { data: donorDetailsData, isLoading: isLoadingDetails, error: errorDetails } = useGetDonorDetailsQuery(
    selectedDonorId,
    { skip: !selectedDonorId }
  );

  // Extract data from API response
  const totalDonations = allDonorsData?.totalAmountDonated || 0;
  const totalPages = allDonorsData?.totalPages || 0;
  const avgDonation = allDonorsData?.averageDonationAmount || 0;
  const topDonors = allDonorsData?.topDonors || [];
  const donorsData = allDonorsData?.donors || [];
  const globalTotalDonors = allDonorsData?.globalTotalDonors || 0;
  const handleBackClick = () => {
    if (selectedDonorId) {
      setSelectedDonorId(null);
    } else {
      window.location.href = '/tpf-management';
    }
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
    if (isLoadingDetails) {
      return (
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
          <div className="text-xl text-gray-600">Loading donor details...</div>
        </div>
      );
    }

    if (errorDetails) {
      return (
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
          <div className="text-xl text-red-600">Error loading donor details</div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={handleBackClick}
              className="flex items-center cursor-pointer text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Donors
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{donorDetailsData?.fullName}</h1>
            <p className="text-gray-600 mt-1">Detailed donor information and donation history</p>
          </div>

          {/* Donor Details Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Donor Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{donorDetailsData?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{donorDetailsData?.mobileNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Donations</p>
                <p className="font-medium text-green-600">₹{donorDetailsData?.totalAmountDonated?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Number of Donations</p>
                <p className="font-medium">{donorDetailsData?.totalDonations}</p>
              </div>
            </div>
          </div>

          {/* Donation History */}
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
                      <td className="px-4 py-3 text-sm">
                        {new Date(donation.donationDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600">
                        ₹{donation.amountDonated?.toLocaleString()}
                      </td>
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
        {/* Header Section */}
        <div className="mb-6">
          <button
            onClick={handleBackClick}
            className="flex items-center text-gray-600 cursor-pointer hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to TPF Management
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Donor Information</h1>
          <p className="text-gray-600 mt-1">
            All users are donors by default. View donor information and donation statistics.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Donations</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalDonations.toLocaleString()}</p>
              </div>
              <IndianRupee className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Donors</p>
                <p className="text-2xl font-bold text-gray-900">{globalTotalDonors}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Donation</p>
                <p className="text-2xl font-bold text-gray-900">₹{avgDonation.toFixed(0)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Top Donor</p>
                <p className="text-2xl font-bold text-gray-900">₹{topDonors[0]?.donationStats?.totalAmount?.toLocaleString() || 0}</p>
              </div>
              <User className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Top Donors Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Top Donors</h2>
          <div className="space-y-3">
            {topDonors.map((donor, index) => (
              <div key={donor._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                    {index + 1}
                  </div>
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

        {/* Actions Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 tracking-tight">All Donors</h2>
              <p className="text-sm text-gray-400 mt-0.5">Manage and view donor activity</p>
            </div>
          </div>

          {/* Search + Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
            {/* Search — centered / flex-grow */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
              />
            </div>

            {/* Filter Dropdown — right side */}
            <div className="relative">
              <select
                value={selectedRange}
                onChange={(e) => {
                  setSelectedRange(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none pl-4 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-all font-medium"
              >
                <option value="all">All Time</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="thisYear">This Year</option>
              </select>
              {/* Custom chevron */}
              <svg
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Donors Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined Since</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Donations</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {donorsData.map(donor => (
                  <tr
                    key={donor._id}
                    className="hover:bg-blue-50/40 transition-colors duration-150 group"
                  >
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-800">
                      {donor.fullName}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{donor.email}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{donor.mobileNo}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">
                      {new Date(donor.createdDate).toLocaleDateString()}
                    </td>
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

        {/* Add Donor Modal */}
        {showAddDonor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Add New Donor</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowAddDonor(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowAddDonor(false);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Donor
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}