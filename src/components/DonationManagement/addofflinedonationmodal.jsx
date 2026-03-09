"use client";

import { useState, useEffect } from "react";
import { X, User, Mail, Phone, FileText, Building2, Hash, Calendar, IndianRupee, CheckCircle2, AlertCircle, Smartphone } from "lucide-react";
import { useCreateOfflineDonationByAdminMutation, useGetCampaignDropdownQuery } from "@/utils/slices/donationApiSlice";

const METHOD_CONFIG = {
    RTGS: {
        label: "RTGS",
        fields: ["bankName", "bankAccountName", "transactionDate", "utrNumber"],
    },
    NEFT: {
        label: "NEFT",
        fields: ["bankName", "bankAccountName", "transactionDate", "referenceNumber"],
    },
    IMPS: {
        label: "IMPS",
        fields: ["bankName", "bankAccountName", "transactionDate", "referenceNumber"],
    },
    CHEQUE: {
        label: "Cheque",
        fields: ["chequeNumber", "chequeDate", "bankName", "branchName"],
    },
    UPI: {
        label: "UPI",
        fields: ["upiId", "paymentApp", "transactionDate"],
    },
};

const DONATION_TYPES = ["ZAKAAT", "LILLAH", "IMDAD", "SADQAH", "RIBA"];

const FIELD_META = {
    bankName: { label: "Bank Name", icon: Building2, type: "text", placeholder: "e.g. State Bank of India" },
    bankAccountName: { label: "Account Holder Name", icon: User, type: "text", placeholder: "Name on bank account" },
    transactionDate: { label: "Transaction Date", icon: Calendar, type: "date" },
    utrNumber: { label: "UTR Number", icon: Hash, type: "text", placeholder: "22-digit UTR number" },
    referenceNumber: { label: "Reference Number", icon: Hash, type: "text", placeholder: "Transaction reference" },
    chequeNumber: { label: "Cheque Number", icon: Hash, type: "text", placeholder: "6-digit cheque number" },
    chequeDate: { label: "Cheque Date", icon: Calendar, type: "date" },
    branchName: { label: "Branch Name", icon: Building2, type: "text", placeholder: "Bank branch name" },
    upiId: { label: "UPI ID", icon: Hash, type: "text", placeholder: "e.g. donor@upi" },
};
const PAYMENT_APPS = ["GooglePay", "PhonePe", "Paytm", "BHIM", "Other"];
function FormField({ label, icon: Icon, type = "text", name, value, onChange, placeholder, required }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
            </label>
            <div className="relative group">
                {Icon && (
                    <Icon
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors duration-150"
                    />
                )}
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full border border-gray-200 rounded-lg py-2.5 pr-3.5 text-sm text-gray-800 bg-white placeholder:text-gray-300 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/8 transition-all duration-150"
                    style={{ paddingLeft: Icon ? "2.5rem" : "0.875rem" }}
                />
            </div>
        </div>
    );
}

function Toast({ toast }) {
    if (!toast) return null;
    const isSuccess = toast.type === "success";
    return (
        <div
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border whitespace-nowrap"
            style={{
                animation: "toastIn 0.25s cubic-bezier(0.16,1,0.3,1) forwards",
                background: isSuccess ? "#f0fdf4" : "#fff1f2",
                color: isSuccess ? "#166534" : "#9f1239",
                borderColor: isSuccess ? "#bbf7d0" : "#fecdd3",
            }}
        >
            {isSuccess ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            {toast.message}
        </div>
    );
}

export default function AddOfflineDonationModal({ isOpen, onClose, onSuccess }) {
    const [createDonation, { isLoading: isCreating }] = useCreateOfflineDonationByAdminMutation();
    const [mounted, setMounted] = useState(false);
    const [toast, setToast] = useState(null);
    const { data, isLoading: isCampaignLoading } = useGetCampaignDropdownQuery();

    const campaigns = data?.campaigns || [];
    const [formData, setFormData] = useState({
        donorName: "",
        donorEmail: "",
        donorPhone: "",
        method: "RTGS",
        donationType: "",
        amount: "",
        campaignId: "",
        remarks: "",
        bankName: "",
        bankAccountName: "",
        transactionDate: "",
        referenceNumber: "",
        utrNumber: "",
        chequeNumber: "",
        chequeDate: "",
        branchName: "",
        upiId: "",
        paymentApp: "",
    });

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => setMounted(true), 10);
            document.body.style.overflow = "hidden";
        } else {
            setMounted(false);
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const showToast = (message, type = "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleSubmit = async () => {
        if (!formData.donorName || !formData.donorEmail || !formData.amount) {
            showToast("Donor name, email, and amount are required.");
            return;
        }
        if (!formData.campaignId) {
            showToast("Please select a campaign.");
            return;
        }
        if (!formData.donationType) {
            showToast("Please select a donation type.");
            return;
        }
        try {
            const res = await createDonation(formData).unwrap();
            showToast(`Donation recorded — ID: ${res.donation.transactionId}`, "success");
            setTimeout(() => { onSuccess?.(); onClose(); }, 1800);
        } catch (err) {
            showToast(err?.data?.message || "Failed to create donation.");
        }
    };

    const activeFields = METHOD_CONFIG[formData.method].fields;

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700&display=swap');
        .donation-modal { font-family: 'Inter', sans-serif; }
        .modal-enter { animation: modalEnter 0.28s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes modalEnter { from { opacity:0; transform:translateY(12px) scale(0.985); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(-6px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        .scrollbar-thin::-webkit-scrollbar { width: 3px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 99px; }
        input[type="date"]::-webkit-calendar-picker-indicator { opacity:0.35; cursor:pointer; }
        .method-pill { transition: all 0.12s ease; }
        .section-label { letter-spacing: 0.12em; }
      `}</style>

            <Toast toast={toast} />

            <div
                className="donation-modal fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(8px)" }}
                onClick={onClose}
            >
                <div
                    className={`relative w-full max-w-[560px] bg-white rounded-2xl shadow-xl overflow-hidden ${mounted ? "modal-enter" : "opacity-0"}`}
                    style={{ border: "1px solid #e5e7eb" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Emerald accent bar */}
                    <div className="h-[3px] w-full bg-gradient-to-r from-emerald-400 to-emerald-600" />

                    {/* Header */}
                    <div className="px-7 pt-5 pb-4 flex items-center justify-between border-b border-gray-100">
                        <div>
                            <h2 className="text-[17px] font-semibold text-gray-900 tracking-tight leading-snug">Record Offline Donation</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-150"
                        >
                            <X size={16} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Scrollable body */}
                    <div className="px-7 py-5 space-y-5 overflow-y-auto max-h-[60vh] scrollbar-thin">

                        {/* Donor Info */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-semibold section-label uppercase text-gray-900">Donor Information</p>
                            <FormField required label="Full Name" icon={User} name="donorName" value={formData.donorName} onChange={handleChange} placeholder="e.g. Abdullah" />
                            <div className="grid grid-cols-2 gap-3">
                                <FormField required label="Email Address" icon={Mail} type="email" name="donorEmail" value={formData.donorEmail} onChange={handleChange} placeholder="donor@email.com" />
                                <FormField label="Phone Number" icon={Phone} name="donorPhone" value={formData.donorPhone} onChange={handleChange} placeholder="+91 98765 43210" />
                            </div>
                        </div>

                        <div className="border-t border-dashed border-gray-100" />

                        {/* Campaign Selection */}
                        <div className="space-y-2">
                            <p className="text-[10px] font-semibold section-label uppercase text-gray-900">Campaign</p>
                            <div className="relative group">
                                <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" />
                                <select
                                    name="campaignId"
                                    disabled={isCampaignLoading}
                                    value={formData.campaignId}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg py-2.5 pr-3.5 text-sm text-gray-800 bg-white focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/8 transition-all duration-150"
                                    style={{ paddingLeft: "2.5rem" }}
                                >
                                    <option value="">{isCampaignLoading ? "Loading campaigns..." : "Select Campaign"}</option>
                                    {campaigns.map((campaign) => (
                                        <option key={campaign._id} value={campaign._id}>{campaign.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Donation Type */}
                        <div className="space-y-2.5">
                            <p className="text-[10px] font-semibold section-label uppercase text-gray-900">
                                Donation Type <span className="text-rose-400">*</span>
                            </p>
                            <div className="grid grid-cols-5 gap-2">
                                {DONATION_TYPES.map((type) => {
                                    const isActive = formData.donationType === type;
                                    return (
                                        <button
                                            key={type}
                                            onClick={() => setFormData({ ...formData, donationType: type })}
                                            className={`method-pill py-2 rounded-lg text-xs font-semibold border ${isActive
                                                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                                                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50"
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="space-y-2">
                            <p className="text-[10px] font-semibold section-label uppercase text-gray-900">Donation Amount</p>
                            <div className="relative group">
                                <IndianRupee size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    onWheel={(e) => e.target.blur()}
                                    step="1"
                                    placeholder="0.00"
                                    className="w-full border border-gray-200 rounded-lg py-3 pl-9 pr-4 text-[22px] font-semibold text-gray-900 bg-white placeholder:text-gray-200 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/8 transition-all duration-150 tracking-tight [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>
                        </div>

                        <div className="border-t border-dashed border-gray-100" />

                        {/* Payment Method */}
                        <div className="space-y-2.5">
                            <p className="text-[10px] font-semibold section-label uppercase text-gray-900">Payment Method</p>
                            <div className="grid grid-cols-5 gap-2">
                                {Object.entries(METHOD_CONFIG).map(([key, cfg]) => {
                                    const isActive = formData.method === key;
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => setFormData({ ...formData, method: key })}
                                            className={`method-pill py-2 rounded-lg text-xs font-semibold border ${isActive
                                                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                                                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50"
                                                }`}
                                        >
                                            {cfg.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Method-specific fields */}
                        {/* Method-specific fields */}
                        <div className="space-y-2.5">
                            <p className="text-[10px] font-semibold section-label uppercase text-gray-400">{formData.method} Details</p>
                            <div className="grid grid-cols-2 gap-3">
                                {activeFields.map((fieldKey) => {
                                    // Special case: paymentApp as a select
                                    if (fieldKey === "paymentApp") {
                                        return (
                                            <div key="paymentApp" className="flex flex-col gap-1.5">
                                                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Payment App</label>
                                                <div className="relative group">
                                                    <Smartphone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors duration-150" />
                                                    <select
                                                        name="paymentApp"
                                                        value={formData.paymentApp}
                                                        onChange={handleChange}
                                                        className="w-full border border-gray-200 rounded-lg py-2.5 pr-3.5 text-sm text-gray-800 bg-white focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/8 transition-all duration-150 appearance-none"
                                                        style={{ paddingLeft: "2.5rem" }}
                                                    >
                                                        <option value="">Select App</option>
                                                        {PAYMENT_APPS.map((app) => (
                                                            <option key={app} value={app}>{app}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        );
                                    }

                                    const meta = FIELD_META[fieldKey];
                                    return (
                                        <FormField
                                            key={fieldKey}
                                            label={meta.label}
                                            icon={meta.icon}
                                            type={meta.type}
                                            name={fieldKey}
                                            value={formData[fieldKey]}
                                            onChange={handleChange}
                                            placeholder={meta.placeholder}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        <div className="border-t border-dashed border-gray-100" />

                        {/* Remarks */}
                        <div className="space-y-2">
                            <p className="text-[10px] font-semibold section-label uppercase text-gray-400">
                                Remarks <span className="normal-case font-normal tracking-normal text-gray-300">(optional)</span>
                            </p>
                            <div className="relative group">
                                <FileText size={13} className="absolute left-3.5 top-3 text-gray-300 group-focus-within:text-emerald-500 transition-colors" />
                                <textarea
                                    name="remarks"
                                    value={formData.remarks}
                                    onChange={handleChange}
                                    rows={2}
                                    placeholder="Any notes or context about this donation..."
                                    className="w-full border border-gray-200 rounded-lg py-2.5 pl-9 pr-3.5 text-sm text-gray-800 bg-white placeholder:text-gray-300 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/8 transition-all duration-150 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-7 py-4 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                            <span>Donation will be immediately approved</span>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:border-gray-300 hover:text-gray-800 transition-all duration-150"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isCreating || isCampaignLoading}
                                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                                style={{
                                    background: "linear-gradient(135deg, #10b981, #059669)",
                                    boxShadow: "0 1px 10px -2px rgba(16,185,129,0.45)",
                                }}
                            >
                                {isCreating ? (
                                    <>
                                        <svg className="animate-spin h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        Creating...
                                    </>
                                ) : "Create Donation"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}