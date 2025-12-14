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
} from "lucide-react";

// ==================== MOCK DATA ====================
const INITIAL_DONATIONS = [
  {
    id: "OD001",
    donorId: "DNR12345",
    method: "IMPS",
    amount: 5000,
    remarks: "Monthly contribution",
    status: "pending",
    submittedOn: "2024-12-10T10:30:00",
    approvedOn: null,
    referenceNumber: "IMPS2024120001",
    bankName: "HDFC Bank",
    bankAccountName: "John Doe",
    transactionDate: "2024-12-10",
  },
  {
    id: "OD002",
    donorId: "DNR12346",
    method: "CHEQUE",
    amount: 10000,
    remarks: "Annual donation",
    status: "approved",
    submittedOn: "2024-12-08T14:20:00",
    approvedOn: "2024-12-09T09:15:00",
    chequeNumber: "CHQ123456",
    chequeDate: "2024-12-07",
    bankName: "SBI",
    branchName: "Mumbai Central",
  },
  {
    id: "OD003",
    donorId: "DNR12347",
    method: "NEFT",
    amount: 7500,
    remarks: "Emergency fund",
    status: "rejected",
    submittedOn: "2024-12-05T16:45:00",
    approvedOn: null,
    referenceNumber: "NEFT2024120501",
    bankName: "ICICI Bank",
    bankAccountName: "Jane Smith",
    transactionDate: "2024-12-05",
  },
  {
    id: "OD004",
    donorId: "DNR12348",
    method: "RTGS",
    amount: 50000,
    remarks: "Large contribution",
    status: "pending",
    submittedOn: "2024-12-12T11:00:00",
    approvedOn: null,
    utrNumber: "RTGS2024121200001",
    bankName: "Axis Bank",
    bankAccountName: "Robert Johnson",
    transactionDate: "2024-12-12",
  },
];

// ==================== STATUS BADGE COMPONENT ====================
const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        styles[status] || styles.pending
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// ==================== ADD OFFLINE DONATION MODAL ====================
const AddOfflineDonationModal = ({ isOpen, onClose, onAdd }) => {
  const [selectedMethod, setSelectedMethod] = useState("");
  const [formData, setFormData] = useState({
    donorId: "",
    amount: "",
    remarks: "",
    // IMPS/NEFT fields
    referenceNumber: "",
    bankName: "",
    bankAccountName: "",
    transactionDate: "",
    // RTGS fields
    utrNumber: "",
    // CHEQUE fields
    chequeNumber: "",
    chequeDate: "",
    branchName: "",
  });

  const handleMethodChange = (method) => {
    setSelectedMethod(method);
    // Reset method-specific fields
    setFormData({
      ...formData,
      referenceNumber: "",
      utrNumber: "",
      chequeNumber: "",
      chequeDate: "",
      branchName: "",
      bankName: "",
      bankAccountName: "",
      transactionDate: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const baseData = {
      id: `OD${Date.now()}`,
      donorId: formData.donorId,
      method: selectedMethod,
      amount: parseFloat(formData.amount),
      remarks: formData.remarks,
      status: "pending",
      submittedOn: new Date().toISOString(),
      approvedOn: null,
    };

    let methodSpecificData = {};

    if (selectedMethod === "IMPS" || selectedMethod === "NEFT") {
      methodSpecificData = {
        referenceNumber: formData.referenceNumber,
        bankName: formData.bankName,
        bankAccountName: formData.bankAccountName,
        transactionDate: formData.transactionDate,
      };
    } else if (selectedMethod === "RTGS") {
      methodSpecificData = {
        utrNumber: formData.utrNumber,
        bankName: formData.bankName,
        bankAccountName: formData.bankAccountName,
        transactionDate: formData.transactionDate || null,
      };
    } else if (selectedMethod === "CHEQUE") {
      methodSpecificData = {
        chequeNumber: formData.chequeNumber,
        chequeDate: formData.chequeDate,
        bankName: formData.bankName,
        branchName: formData.branchName,
      };
    }

    onAdd({ ...baseData, ...methodSpecificData });
    
    // Reset form
    setSelectedMethod("");
    setFormData({
      donorId: "",
      amount: "",
      remarks: "",
      referenceNumber: "",
      bankName: "",
      bankAccountName: "",
      transactionDate: "",
      utrNumber: "",
      chequeNumber: "",
      chequeDate: "",
      branchName: "",
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Add Offline Donation
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["IMPS", "NEFT", "RTGS", "CHEQUE"].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => handleMethodChange(method)}
                  className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                    selectedMethod === method
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {selectedMethod && (
            <>
              {/* Common Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Donor ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.donorId}
                    onChange={(e) =>
                      setFormData({ ...formData, donorId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="DNR12345"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5000"
                  />
                </div>
              </div>

              {/* Method-Specific Fields */}
              {(selectedMethod === "IMPS" || selectedMethod === "NEFT") && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">
                    {selectedMethod} Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reference Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.referenceNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            referenceNumber: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Transaction Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.transactionDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            transactionDate: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.bankName}
                        onChange={(e) =>
                          setFormData({ ...formData, bankName: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Holder Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.bankAccountName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bankAccountName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === "RTGS" && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">RTGS Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        UTR Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.utrNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, utrNumber: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Transaction Date
                      </label>
                      <input
                        type="date"
                        value={formData.transactionDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            transactionDate: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.bankName}
                        onChange={(e) =>
                          setFormData({ ...formData, bankName: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Holder Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.bankAccountName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bankAccountName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === "CHEQUE" && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">Cheque Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cheque Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.chequeNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            chequeNumber: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cheque Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.chequeDate}
                        onChange={(e) =>
                          setFormData({ ...formData, chequeDate: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.bankName}
                        onChange={(e) =>
                          setFormData({ ...formData, bankName: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Branch Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.branchName}
                        onChange={(e) =>
                          setFormData({ ...formData, branchName: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData({ ...formData, remarks: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional notes..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Donation
                </button>
              </div>
            </>
          )}

          {!selectedMethod && (
            <p className="text-center text-gray-500 py-8">
              Please select a payment method to continue
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

// ==================== DETAILS MODAL ====================
const OfflineDonationDetailsModal = ({ isOpen, onClose, donation }) => {
  if (!isOpen || !donation) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Donation Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Donation ID</p>
              <p className="font-medium text-gray-900">{donation.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <div className="mt-1">
                <StatusBadge status={donation.status} />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Donor ID</p>
              <p className="font-medium text-gray-900">{donation.donorId}</p>
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
            {donation.approvedOn && (
              <div>
                <p className="text-sm text-gray-600">Approved On</p>
                <p className="font-medium text-gray-900">
                  {formatDate(donation.approvedOn)}
                </p>
              </div>
            )}
          </div>

          {/* Method-Specific Details */}
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
                      {donation.transactionDate}
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
                      {donation.transactionDate || "N/A"}
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
                    <p className="text-sm text-gray-600">Cheque Date</p>
                    <p className="font-medium text-gray-900">
                      {donation.chequeDate}
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

          {/* Remarks */}
          {donation.remarks && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-1">Remarks</p>
              <p className="text-sm text-blue-800">{donation.remarks}</p>
            </div>
          )}
        </div>

        <div className="border-t px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== TABLE COMPONENT ====================
const OfflineDonationTable = ({ donations, onView, onApprove, onReject }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Donor ID
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
                      {donation.donorId}
                    </span>
                  </div>
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
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {donation.status === "pending" && (
                      <>
                        <button
                          onClick={() => onApprove(donation.id)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onReject(donation.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
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
                  {donation.donorId}
                </span>
              </div>
              <StatusBadge status={donation.status} />
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
                className="flex-1 px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-1"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
              {donation.status === "pending" && (
                <>
                  <button
                    onClick={() => onApprove(donation.id)}
                    className="flex-1 px-3 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => onReject(donation.id)}
                    className="px-3 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

// ==================== MAIN PAGE COMPONENT ====================
export default function OfflineDonationPage() {
  const [donations, setDonations] = useState(INITIAL_DONATIONS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: donations.length,
      pending: donations.filter((d) => d.status === "pending").length,
      approved: donations.filter((d) => d.status === "approved").length,
      rejected: donations.filter((d) => d.status === "rejected").length,
    };
  }, [donations]);

  const handleAddDonation = (newDonation) => {
    setDonations((prev) => [newDonation, ...prev]);
  };

  const handleViewDetails = (donation) => {
    setSelectedDonation(donation);
    setIsDetailsModalOpen(true);
  };

  const handleApprove = (id) => {
    setDonations((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: "approved", approvedOn: new Date().toISOString() }
          : d
      )
    );
  };

  const handleReject = (id) => {
    setDonations((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "rejected" } : d))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
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
                Add, verify and approve offline donation entries
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Offline Donation
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Offline
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.total}
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
                  {stats.pending}
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
                  {stats.approved}
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
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {stats.rejected}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Offline Donations
            </h2>
          </div>
          <div className="p-6">
            {donations.length > 0 ? (
              <OfflineDonationTable
                donations={donations}
                onView={handleViewDetails}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ) : (
              <div className="text-center py-12">
                <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No offline donations yet</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Add your first donation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddOfflineDonationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddDonation}
      />

      <OfflineDonationDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        donation={selectedDonation}
      />
    </div>
  );
}