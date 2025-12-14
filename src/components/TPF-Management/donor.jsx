"use client";
import { useState } from 'react';
import { ArrowLeft, Search, Plus, Users, IndianRupee, TrendingUp, User } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Sample data
const donorsData = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1 234 567 8900",
    totalDonations: 5000,
    donationCount: 12,
    joinDate: "2022-03-15", // New field added here
    lastDonation: "2024-12-10",
    history: [
      { id: 1, amount: 500, campaign: "Education Fund", date: "2024-12-10", method: "Credit Card" },
      { id: 2, amount: 300, campaign: "Healthcare Initiative", date: "2024-11-15", method: "Bank Transfer" },
      { id: 3, amount: 200, campaign: "Community Development", date: "2024-10-20", method: "PayPal" }
    ]
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@email.com",
    phone: "+1 234 567 8901",
    totalDonations: 8500,
    donationCount: 15,
    joinDate: "2022-09-15", // New field added here
    lastDonation: "2024-12-12",
    history: [
      { id: 1, amount: 1000, campaign: "Emergency Relief", date: "2024-12-12", method: "Credit Card" },
      { id: 2, amount: 750, campaign: "Education Fund", date: "2024-11-25", method: "Credit Card" }
    ]
  },
  {
    id: 3,
    name: "Michael Johnson",
    email: "michael.j@email.com",
    phone: "+1 234 567 8902",
    totalDonations: 3200,
    donationCount: 8,
    joinDate: "2022-03-15", // New field added here
    lastDonation: "2024-12-08",
    history: [
      { id: 1, amount: 400, campaign: "Clean Water Project", date: "2024-12-08", method: "Bank Transfer" }
    ]
  }
];

const donationTrends = [
  { month: "Jul", amount: 12000 },
  { month: "Aug", amount: 15000 },
  { month: "Sep", amount: 18000 },
  { month: "Oct", amount: 16000 },
  { month: "Nov", amount: 22000 },
  { month: "Dec", amount: 25000 }
];

export default function DonorModule() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddDonor, setShowAddDonor] = useState(false);
  const itemsPerPage = 10;

  // Calculate statistics
  const totalDonations = donorsData.reduce((sum, donor) => sum + donor.totalDonations, 0);
  const totalDonors = donorsData.length;
  const avgDonation = totalDonations / totalDonors;
  const topDonors = [...donorsData].sort((a, b) => b.totalDonations - a.totalDonations).slice(0, 3);

  // Filter donors based on search
  const filteredDonors = donorsData.filter(donor =>
    donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    donor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredDonors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDonors = filteredDonors.slice(startIndex, startIndex + itemsPerPage);

  const handleBackClick = () => {
    if (selectedDonor) {
      setSelectedDonor(null);
    } else {
      // Navigate to /tpf-management
      window.location.href = '/tpf-management';
    }
  };

  if (selectedDonor) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={handleBackClick}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
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
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{selectedDonor.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Donations</p>
                <p className="font-medium text-green-600">₹{selectedDonor.totalDonations.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Number of Donations</p>
                <p className="font-medium">{selectedDonor.donationCount}</p>
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <button
            onClick={handleBackClick}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
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
                <p className="text-2xl font-bold text-gray-900">{totalDonors}</p>
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
                <p className="text-2xl font-bold text-gray-900">₹{topDonors[0]?.totalDonations.toLocaleString()}</p>
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
              <div key={donor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{donor.name}</p>
                    <p className="text-sm text-gray-600">{donor.email}</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-blue-600">₹{donor.totalDonations.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold">All Donors</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Donors Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Joined Since</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total Donations</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedDonors.map(donor => (
                  <tr key={donor.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{donor.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{donor.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{donor.phone}</td>
                    <td className="px-4 py-3 text-sm">{new Date(donor.joinDate).toLocaleDateString()}</td> {/* Format joinDate */}
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">
                      ₹{donor.totalDonations.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
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
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredDonors.length)} of {filteredDonors.length} donors
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
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
                      // Add donor logic here
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