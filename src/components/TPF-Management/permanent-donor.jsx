"use client";
import { useState } from 'react';
import { ArrowLeft, Search, Users, IndianRupee, TrendingUp, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Sample data for permanent donors
const permanentDonors = [
  { id: 1, name: "Alice Johnson", email: "alice@email.com", amount: 150, date: "2024-12-01", status: "active",
    history: [
      { id: 1, amount: 500, campaign: "Education Fund", date: "2024-12-10", method: "Credit Card" },
      { id: 2, amount: 300, campaign: "Healthcare Initiative", date: "2024-11-15", method: "Bank Transfer" },
      { id: 3, amount: 200, campaign: "Community Development", date: "2024-10-20", method: "PayPal" }
    ]
   },
  { id: 2, name: "Bob Smith", email: "bob@email.com", amount: 200, date: "2024-12-01", status: "active",
    history: [
      { id: 1, amount: 500, campaign: "Education Fund", date: "2024-12-10", method: "Credit Card" },
      { id: 2, amount: 300, campaign: "Healthcare Initiative", date: "2024-11-15", method: "Bank Transfer" },
      { id: 3, amount: 200, campaign: "Community Development", date: "2024-10-20", method: "PayPal" }
    ]
   },
  { id: 3, name: "Carol White", email: "carol@email.com", amount: 100, date: "2024-12-01", status: "active",
    history: [
      { id: 1, amount: 500, campaign: "Education Fund", date: "2024-12-10", method: "Credit Card" },
      { id: 2, amount: 300, campaign: "Healthcare Initiative", date: "2024-11-15", method: "Bank Transfer" },
      { id: 3, amount: 200, campaign: "Community Development", date: "2024-10-20", method: "PayPal" }
    ]
  },
];

export default function PermanentDonorModule() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [selectedDonor, setSelectedDonor] = useState(null);
  const router = useRouter();
  // Filter donors based on search
  const filteredDonors = permanentDonors.filter(donor =>
    donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    donor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate overall statistics dynamically based on donor history
  const totalDonationsAll = permanentDonors.reduce((sum, donor) => {
    const totalDonation = donor.history.reduce((total, donation) => total + donation.amount, 0);
    return sum + totalDonation;
  }, 0);

  const totalSubscribers = permanentDonors.length;
  const avgDonationAll = totalDonationsAll / totalSubscribers;

  // Pagination for donors
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

  if (selectedDonor) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 text-center">
            <button
              onClick={handleBackToDonorsClick} 
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Donors
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{selectedDonor.name}</h1>
            <p className="text-gray-600 mt-1">Detailed donor information and donation history</p>
          </div>

          {/* Donor Details Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Donor Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{selectedDonor.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Donations</p>
                <p className="font-medium text-green-600">₹{selectedDonor.history.reduce((total, donation) => total + donation.amount, 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Number of Donations</p>
                <p className="font-medium">{selectedDonor.history.length}</p>
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
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Campaign</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedDonor.history.map(donation => (
                    <tr key={donation.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{donation.date}</td>
                      <td className="px-4 py-3 text-sm">{donation.campaign}</td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600">
                        ₹{donation.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm">{donation.method}</td>
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto text-center">
        {/* Header Section */}
        <div className="mb-6">
          <button
            onClick={handleBackToTPFManagementClick}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to TPF Management
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Permanent Donor Information</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            This module displays details of permanent donors, including their donations and other relevant information.
          </p>
        </div>

        {/* Overall Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 transition-shadow hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-1">Total Donations</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">
                  ₹{totalDonationsAll.toLocaleString()}
                </p>
              </div>
              <div className="flex-shrink-0">
                <IndianRupee className="w-8 h-8 md:w-10 md:h-10 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 transition-shadow hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-1">Total Subscribers</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{totalSubscribers}</p>
              </div>
              <div className="flex-shrink-0">
                <Users className="w-8 h-8 md:w-10 md:h-10 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 transition-shadow hover:shadow-lg sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-1">Average Donation</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">
                  ₹{avgDonationAll.toFixed(0)}
                </p>
              </div>
              <div className="flex-shrink-0">
                <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-base md:text-lg lg:text-xl font-semibold">Permanent Donors List</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Donors Table - Same for Mobile and Desktop */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <div className="overflow-x-auto ">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 md:px-4 py-3 text-center text-xs lg:text-sm font-semibold text-gray-700">Donor Name</th>
                  <th className="px-2 md:px-4 py-3 text-center text-xs lg:text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-2 md:px-4 py-3 text-center text-xs lg:text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-2 md:px-4 py-3 text-center text-xs lg:text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-2 md:px-4 py-3 text-center text-xs lg:text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-2 md:px-4 py-3 text-center text-xs lg:text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getPaginatedDonors().map(donor => (
                  <tr key={donor.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-2 md:px-4 py-3 text-xs lg:text-sm font-medium">{donor.name}</td>
                    <td className="px-2 md:px-4 py-3 text-xs lg:text-sm text-gray-600">{donor.email}</td>
                    <td className="px-2 md:px-4 py-3 text-xs lg:text-sm font-medium text-green-600">
                      ₹{donor.amount.toLocaleString()}
                    </td>
                    <td className="px-2 md:px-4 py-3 text-xs lg:text-sm">{donor.date}</td>
                    <td className="px-2 md:px-4 py-3 text-xs lg:text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        donor.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {donor.status}
                      </span>
                    </td>
                    <td className="px-2 md:px-4 py-3 text-xs lg:text-sm">
                      <button
                        onClick={() => setSelectedDonor(donor)}
                        className="text-red-600 hover:text-red-800 font-medium cursor-pointer"
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
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
              <p className="text-xs md:text-sm text-gray-600 text-center sm:text-left">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredDonors.length)} of {filteredDonors.length} donors
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center px-3 py-2 text-sm md:text-base">
                  <span className="text-gray-700 font-medium">{currentPage}</span>
                  <span className="text-gray-500 mx-1">/</span>
                  <span className="text-gray-500">{totalPages}</span>
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}