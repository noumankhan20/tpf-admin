"use client";

import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
  X,
  CreditCard,
  Building,
  User,
  Filter,
} from "lucide-react";
import { useGetOfflineDonationsQuery, useApproveOfflineDonationsMutation, useRejectOfflineDonationsMutation } from '@/utils/slices/donationApiSlice';

// ==================== STATUS BADGE COMPONENT ====================
const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    approved: "bg-green-100 text-green-800 border-green-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.pending
        }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// ==================== FILTER MODAL ====================
const FilterModal = ({ isOpen, onClose, filters, setFilters, onApply }) => {
  if (!isOpen) return null;

  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    setFilters(localFilters);
    onApply();
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      method: '',
      status: '',
    };
    setLocalFilters(resetFilters);
    setFilters(resetFilters);
    onApply();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Filter Donations</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={localFilters.startDate}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, startDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={localFilters.endDate}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, endDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min Amount</label>
                <input
                  type="number"
                  placeholder="Min"
                  value={localFilters.minAmount}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, minAmount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max Amount</label>
                <input
                  type="number"
                  placeholder="Max"
                  value={localFilters.maxAmount}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, maxAmount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              value={localFilters.method}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, method: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            >
              <option value="">All Methods</option>
              <option value="RTGS">RTGS</option>
              <option value="NEFT">NEFT</option>
              <option value="IMPS">IMPS</option>
              <option value="CHEQUE">CHEQUE</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={localFilters.status}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
          </div>
        </div>

        <div className="border-t px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={handleReset}
            className="px-4 py-2 cursor-pointer bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 cursor-pointer bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== DETAILS MODAL ====================
const OfflineDonationDetailsModal = ({ isOpen, onClose, donation, onApprove, onRejectClick, }) => {
  if (!isOpen || !donation) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm  flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Donation Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Donor Name</p>
              <p className="font-medium text-gray-900">{donation.fullName || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <div className="mt-1">
                <StatusBadge status={donation.status} />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900">{donation.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Mobile</p>
              <p className="font-medium text-gray-900">{donation.mobile || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Method</p>
              <p className="font-medium text-gray-900">{donation.method}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Amount</p>
              <p className="font-medium text-gray-900">
                ₹{donation.amount.toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Submitted On</p>
              <p className="font-medium text-gray-900">
                {formatDate(donation.submittedOn)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Mobile No</p>
              <p className="font-medium text-gray-900">{donation.mobile}</p>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-4">
              {donation.method} Details
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {(donation.method === "IMPS" || donation.method === "NEFT") && (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Reference Number</p>
                    <p className="font-medium text-gray-900">
                      {donation.referenceNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Transaction Date</p>
                    <p className="font-medium text-gray-900">
                      {donation.transactionDate ? new Date(donation.transactionDate).toLocaleDateString("en-IN") : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bank Name</p>
                    <p className="font-medium text-gray-900">
                      {donation.bankName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Account Holder</p>
                    <p className="font-medium text-gray-900">
                      {donation.bankAccountName || "N/A"}
                    </p>
                  </div>
                </>
              )}

              {donation.method === "RTGS" && (
                <>
                  <div>
                    <p className="text-sm text-gray-600">UTR Number</p>
                    <p className="font-medium text-gray-900">
                      {donation.utrNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Transaction Date</p>
                    <p className="font-medium text-gray-900">
                      {donation.transactionDate ? new Date(donation.transactionDate).toLocaleDateString("en-IN") : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bank Name</p>
                    <p className="font-medium text-gray-900">
                      {donation.bankName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Account Holder</p>
                    <p className="font-medium text-gray-900">
                      {donation.bankAccountName}
                    </p>
                  </div>
                </>
              )}

              {donation.method === "CHEQUE" && (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Cheque Number</p>
                    <p className="font-medium text-gray-900">
                      {donation.chequeNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bank Name</p>
                    <p className="font-medium text-gray-900">
                      {donation.bankName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Branch Name</p>
                    <p className="font-medium text-gray-900">
                      {donation.branchName}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {donation.remarks && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-1">Remarks</p>
              <p className="text-sm text-blue-800">{donation.remarks}</p>
            </div>
          )}
        </div>

        <div className="border-t px-6 py-4 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 cursor-pointer bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>

          {donation.status === "pending" && (
            <>
              <button
                onClick={() => {
                  onApprove(donation.id);
                  onClose();
                }}
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>

              <button
                onClick={() => {
                  onRejectClick(donation.id);
                  onClose(); // close details modal
                }}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>

            </>
          )}

        </div>

      </div>
    </div>
  );
};

const RejectDonationModal = ({
  isOpen,
  onClose,
  donationId,
  onReject,
  isLoading,
}) => {
  const [remarks, setRemarks] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!remarks.trim()) {
      alert("Remarks are required");
      return;
    }
    onReject(donationId, remarks);
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Reject Donation
          </h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Please provide a reason for rejecting this donation.
          </p>

          <textarea
            rows={4}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter rejection remarks..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
          />
        </div>

        <div className="border-t px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? "Rejecting..." : "Reject Donation"}
          </button>
        </div>
      </div>
    </div>
  );
};


// ==================== TABLE COMPONENT ====================
const OfflineDonationTable = ({ donations, onView, onApprove }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted On
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {donations.map((donation) => (
              <tr key={donation.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {donation.fullName || "N/A"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{donation.email}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {donation.method}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">
                      ₹{donation.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={donation.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">
                      {formatDate(donation.submittedOn)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(donation)}
                      className="text-blue-600 hover:text-blue-900 transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4">
        {donations.map((donation) => (
          <div
            key={donation.id}
            className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-900">
                  {donation.fullName || "N/A"}
                </span>
              </div>
              <StatusBadge status={donation.status} />
            </div>

            <div className="text-sm text-gray-600">
              {donation.email}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Method</p>
                <div className="flex items-center mt-1">
                  <CreditCard className="w-3 h-3 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-900">
                    {donation.method}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Amount</p>
                <div className="flex items-center mt-1">
                  <span className="text-sm font-medium text-gray-900">
                    ₹{donation.amount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500">Submitted On</p>
              <div className="flex items-center mt-1">
                <Calendar className="w-3 h-3 text-gray-400 mr-1" />
                <span className="text-sm text-gray-500">
                  {formatDate(donation.submittedOn)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => onView(donation)}
                className="flex-1 px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

// ==================== MAIN PAGE COMPONENT ====================
export default function OfflineDonationPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectDonationId, setRejectDonationId] = useState(null);

  const [rejectOfflineDonation, { isLoading: isRejecting }] =
    useRejectOfflineDonationsMutation();

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    method: '',
    status: '',
  });

  const [approveOfflineDonation] = useApproveOfflineDonationsMutation();

  const queryParams = useMemo(() => {
    const params = {};
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.minAmount) params.minAmount = filters.minAmount;
    if (filters.maxAmount) params.maxAmount = filters.maxAmount;
    if (filters.method) params.method = filters.method;
    if (filters.status) params.status = filters.status;
    return params;
  }, [filters]);

  const { data, error, isLoading, refetch } = useGetOfflineDonationsQuery(queryParams);

  const donations = data?.donations || [];
  const totalAmount = data?.totalAmount || 0;
  const pagination = data?.pagination || { currentPage: 1, totalPages: 1, totalDonations: 0 };

  const stats = useMemo(() => {
    return {
      total: donations.length,
      pending: donations.filter((d) => d.status === "pending").length,
      approved: donations.filter((d) => d.status === "approved").length,
    };
  }, [donations]);

  const handleApprove = async (id) => {
    try {
      const response = await approveOfflineDonation({ donationId: id }).unwrap();
      alert(response.message);
      refetch();
    } catch (error) {
      console.error("Error approving donation", error);
      alert("Error approving donation");
    }
  };

  const handleViewDetails = (donation) => {
    setSelectedDonation(donation);
    setIsDetailsModalOpen(true);
  };

  const handleApplyFilters = () => {
    refetch();
  };

  const openRejectModal = (donationId) => {
    setRejectDonationId(donationId);
    setIsRejectModalOpen(true);
  };



  const handleReject = async (donationId, remarks) => {
    try {
      const res = await rejectOfflineDonation({
        donationId,
        remarks,
      }).unwrap();

      alert(res.message);
      setIsRejectModalOpen(false);
      setRejectDonationId(null);
      refetch();
    } catch (err) {
      console.error(err);
      alert(err?.data?.message || "Failed to reject donation");
    }
  };



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center cursor-pointer text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Offline Donations
              </h1>
              <p className="text-gray-600 mt-1">
                Verify and approve offline donation entries
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Offline
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {isLoading ? "..." : stats.total}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {isLoading ? "..." : stats.pending}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {isLoading ? "..." : stats.approved}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {isLoading ? "..." : `₹${totalAmount.toLocaleString('en-IN')}`}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500">Loading offline donations...</p>
          </div>
        )}

        {error && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-red-500">Error loading offline donations. Please try again.</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                All Offline Donations
              </h2>
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
            <div className="p-6">
              {donations.length > 0 ? (
                <OfflineDonationTable
                  donations={donations}
                  onView={handleViewDetails}
                  onApprove={handleApprove}
                />
              ) : (
                <div className="text-center py-12">
                  <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No offline donations yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <OfflineDonationDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        donation={selectedDonation}
        onApprove={handleApprove}
        onRejectClick={openRejectModal}
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onApply={handleApplyFilters}
      />
      <RejectDonationModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        donationId={rejectDonationId}
        onReject={handleReject}
        isLoading={isRejecting}
      />

    </div>
  );
}