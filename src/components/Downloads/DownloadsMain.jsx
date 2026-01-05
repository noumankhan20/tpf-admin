'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    FileSpreadsheet,
    FileText,
    CreditCard,
    ShoppingBag,
    Receipt,
    Store,
    Wallet,
    Globe,
    Users,
    Loader2,
    CheckCircle2,
    ArrowRight,
    ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:7000/api';

const RESOURCES = [
    {
        id: 'transactions',
        title: 'Transactions',
        description: 'Online donation records',
        icon: CreditCard,
        theme: 'emerald',
        endpoint: '/donations/get',
        dataKey: 'donations',
        fileName: 'transactions',
        columns: [
            { header: 'Date', key: 'date', width: 15, format: (val) => val ? new Date(val).toLocaleDateString() : '-' },
            { header: 'Name', key: 'fullName', width: 25, fallback: 'Anonymous' },
            { header: 'Email', key: 'email', width: 30, fallback: '-' },
            { header: 'Amount', key: 'amount', width: 15, format: (val) => `₹${val}` },
            { header: 'Type', key: 'donationType', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Txn ID', key: 'id', width: 25 },
        ]
    },
    {
        id: 'offline_donations',
        title: 'Offline Donations',
        description: 'Cash & bank transfer records',
        icon: Wallet,
        theme: 'teal',
        endpoint: '/offline-donations/get',
        dataKey: 'donations',
        fileName: 'offline_donations',
        columns: [
            { header: 'Date', key: 'submittedOn', width: 15, format: (val) => val ? new Date(val).toLocaleDateString() : '-' },
            { header: 'Name', key: 'fullName', width: 25, fallback: '-' },
            { header: 'Amount', key: 'amount', width: 15, format: (val) => `₹${val}` },
            { header: 'Type', key: 'method', width: 15 },
            { header: 'Bank', key: 'bankName', width: 20, fallback: '-' },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Approved', key: 'approvedOn', width: 15, format: (val) => val ? new Date(val).toLocaleDateString() : '-' }
        ]
    },
    {
        id: 'permanent_donors',
        title: 'Permanent Donors',
        description: 'Active subscription plans',
        icon: Globe,
        theme: 'blue',
        endpoint: '/permanent-donor/all',
        dataKey: 'subscriptions',
        fileName: 'permanent_donors',
        columns: [
            { header: 'Name', key: 'userId.fullName', width: 25, fallback: '-' },
            { header: 'Plan', key: 'planType', width: 20 },
            { header: 'Amount', key: 'amount', width: 15, format: (val) => `₹${val}` },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Next Date', key: 'nextDonationDate', width: 15, format: (val) => val ? new Date(val).toLocaleDateString() : '-' },
        ]
    },
    {
        id: 'users',
        title: 'Platform Users',
        description: 'Registered user database',
        icon: Users,
        theme: 'violet',
        endpoint: '/user/all',
        dataKey: 'users',
        fileName: 'users',
        columns: [
            { header: 'Name', key: 'fullName', width: 20 },
            { header: 'Email', key: 'email', width: 25, fallback: '-' },
            { header: 'Mobile', key: 'mobileNo', width: 15 },
            { header: 'City', key: 'address.city', width: 15, fallback: '-' },
            { header: 'State', key: 'address.state', width: 15, fallback: '-' },
            { header: 'Blood', key: 'bloodGroup', width: 10, fallback: '-' },
            { header: 'DOB', key: 'dob', width: 15, format: (val) => val ? new Date(val).toLocaleDateString() : '-' },
            { header: 'Profession', key: 'profession', width: 15, fallback: '-' },
            { header: 'Joined', key: 'createdDate', width: 15, format: (val) => val ? new Date(val).toLocaleDateString() : '-' },
        ]
    },
    {
        id: 'purchases',
        title: 'Purchases',
        description: 'Inventory stock logs',
        icon: ShoppingBag,
        theme: 'rose',
        endpoint: '/inventory/purchases',
        dataKey: 'data',
        fileName: 'purchases',
        columns: [
            { header: 'Date', key: 'purchaseDate', width: 15, format: (val) => val ? new Date(val).toLocaleDateString() : '-' },
            { header: 'Vendor', key: 'vendorId.fullName', width: 25, fallback: '-' },
            { header: 'Items', key: 'items', width: 35, format: (items) => Array.isArray(items) ? `${items.length} items` : '-' },
            { header: 'Total', key: 'totalAmount', width: 15, format: (val) => `₹${val}` },
            { header: 'Payment', key: 'paymentStatus', width: 15 },
            { header: 'Bill', key: 'bill.fileUrl', width: 40, isLink: true, format: (url) => url ? 'View Bill' : '-' },
        ]
    },
    {
        id: 'expenses',
        title: 'Expenses',
        description: 'Operational costs',
        icon: Receipt,
        theme: 'orange',
        endpoint: '/inventory/expenses',
        dataKey: 'data',
        fileName: 'expenses',
        columns: [
            { header: 'Date', key: 'date', width: 15, format: (val) => val ? new Date(val).toLocaleDateString() : '-' },
            { header: 'Title', key: 'description', width: 30 },
            { header: 'Type', key: 'expenseType', width: 20 },
            { header: 'Amount', key: 'amount', width: 15, format: (val) => `₹${val}` },
            { header: 'By', key: 'recordedBy.fullName', width: 20, fallback: '-' },
            { header: 'Payment', key: 'paymentMethod', width: 15 },
        ]
    },
    {
        id: 'vendors',
        title: 'Vendors',
        description: 'Supplier directory',
        icon: Store,
        theme: 'amber',
        endpoint: '/inventory/vendors',
        dataKey: 'data',
        fileName: 'vendors',
        columns: [
            { header: 'Name', key: 'fullName', width: 25 },
            { header: 'Phone', key: 'contactNumber', width: 15 },
            { header: 'GST ID', key: 'vendorGST', width: 20, fallback: '-' },
            { header: 'Address', key: 'fullAddress', width: 40 },
            { header: 'Status', key: 'status', width: 15 },
        ]
    }
];

const getValue = (obj, path, fallback) => {
    if (!obj) return fallback;
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
        if (current === null || current === undefined) return fallback;
        current = current[key];
    }
    return current === undefined || current === null ? fallback : current;
};

// Helper to get color classes based on theme
const getThemeClasses = (theme) => {
    const colors = {
        emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200', hoverBorder: 'group-hover:border-emerald-500', lightBg: 'bg-emerald-50', btnHover: 'hover:bg-emerald-50' },
        teal: { bg: 'bg-teal-500', text: 'text-teal-600', border: 'border-teal-200', hoverBorder: 'group-hover:border-teal-500', lightBg: 'bg-teal-50', btnHover: 'hover:bg-teal-50' },
        blue: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200', hoverBorder: 'group-hover:border-blue-500', lightBg: 'bg-blue-50', btnHover: 'hover:bg-blue-50' },
        violet: { bg: 'bg-violet-500', text: 'text-violet-600', border: 'border-violet-200', hoverBorder: 'group-hover:border-violet-500', lightBg: 'bg-violet-50', btnHover: 'hover:bg-violet-50' },
        rose: { bg: 'bg-rose-500', text: 'text-rose-600', border: 'border-rose-200', hoverBorder: 'group-hover:border-rose-500', lightBg: 'bg-rose-50', btnHover: 'hover:bg-rose-50' },
        orange: { bg: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-200', hoverBorder: 'group-hover:border-orange-500', lightBg: 'bg-orange-50', btnHover: 'hover:bg-orange-50' },
        amber: { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-200', hoverBorder: 'group-hover:border-amber-500', lightBg: 'bg-amber-50', btnHover: 'hover:bg-amber-50' },
    };
    return colors[theme] || colors.emerald;
};

export default function DownloadsMain() {
    const router = useRouter();
    const [loading, setLoading] = useState({ id: null, type: null });

    const fetchData = async (resource) => {
        try {
            const { data } = await axios.get(`${API_URL}${resource.endpoint}`, {
                withCredentials: true
            });

            let items = [];
            if (resource.dataKey && Array.isArray(data[resource.dataKey])) {
                items = data[resource.dataKey];
            } else if (data.data && Array.isArray(data.data)) {
                items = data.data;
            } else if (resource.dataKey && data.data && Array.isArray(data.data[resource.dataKey])) {
                items = data.data[resource.dataKey];
            } else if (Array.isArray(data)) {
                items = data;
            } else if (typeof data === 'object') {
                const arrayVal = Object.values(data).find(v => Array.isArray(v));
                if (arrayVal) items = arrayVal;
            }

            return items;
        } catch (error) {
            console.error(`Error fetching ${resource.title}:`, error);
            toast.error(`Failed to fetch ${resource.title} data`);
            throw error;
        }
    };

    const handleDownload = async (resource, type) => {
        setLoading({ id: resource.id, type });
        const toastId = toast.loading(`Preparing ${resource.title} export...`);

        try {
            const data = await fetchData(resource);

            if (!data || data.length === 0) {
                toast.update(toastId, {
                    render: `No records found for ${resource.title}`,
                    type: "info",
                    isLoading: false,
                    autoClose: 3000
                });
                return;
            }

            toast.update(toastId, {
                render: `Generating ${type.toUpperCase()} file (${data.length} records)...`,
                isLoading: true
            });

            if (type === 'excel') {
                generateExcel(data, resource);
            } else {
                await generatePDF(data, resource);
            }

            toast.update(toastId, {
                render: `Successfully exported ${data.length} records to ${type === 'excel' ? 'Excel' : 'PDF'}`,
                type: "success",
                isLoading: false,
                autoClose: 4000
            });
        } catch (error) {
            console.error("Download Error:", error);
            toast.update(toastId, {
                render: `Export failed. Please try again.`,
                type: "error",
                isLoading: false,
                autoClose: 4000
            });
        } finally {
            setLoading({ id: null, type: null });
        }
    };

    const getLogoDataUrl = (url) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const targetWidth = 400;
                const scaleFactor = targetWidth / img.width;
                canvas.width = targetWidth;
                canvas.height = img.height * scaleFactor;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve({ dataUrl: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height });
            };
            img.onerror = () => resolve(null);
            img.src = url;
        });
    };

    const generateExcel = (data, resource) => {
        const tableData = data.map(item => {
            const row = {};
            resource.columns.forEach(col => {
                let val = getValue(item, col.key, col.fallback || '');
                if (col.format) val = col.format(val);
                row[col.header] = val;
            });
            return row;
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(tableData);

        data.forEach((item, rowIndex) => {
            resource.columns.forEach((col, colIndex) => {
                if (col.isLink) {
                    const cellAddress = XLSX.utils.encode_cell({ r: rowIndex + 1, c: colIndex });
                    if (ws[cellAddress] && ws[cellAddress].v && ws[cellAddress].v.startsWith('http')) {
                        ws[cellAddress].l = { Target: ws[cellAddress].v, Tooltip: "Click to view" };
                    }
                }
            });
        });

        const wscols = resource.columns.map(col => ({ wch: col.width || 20 }));
        ws['!cols'] = wscols;
        XLSX.utils.book_append_sheet(wb, ws, resource.title);
        XLSX.writeFile(wb, `${resource.fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const generatePDF = async (data, resource) => {
        try {
            const isLandscape = resource.columns.length > 7;
            const doc = new jsPDF({ orientation: isLandscape ? 'l' : 'p' });

            try {
                const logoData = await getLogoDataUrl('/TPFAid-Logo.png');
                if (logoData) {
                    const pdfLogoWidth = 40;
                    const pdfLogoHeight = (logoData.height / logoData.width) * pdfLogoWidth;
                    doc.addImage(logoData.dataUrl, 'PNG', 14, 10, pdfLogoWidth, pdfLogoHeight);
                    doc.setFontSize(18);
                    doc.text(`${resource.title} Report`, 14, pdfLogoHeight + 20);
                    doc.setFontSize(11);
                    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, pdfLogoHeight + 28);
                    var tableStartY = pdfLogoHeight + 35;
                } else {
                    doc.setFontSize(18);
                    doc.text(`${resource.title} Report`, 14, 22);
                    doc.setFontSize(11);
                    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
                    var tableStartY = 40;
                }
            } catch (err) {
                doc.setFontSize(18);
                doc.text(`${resource.title} Report`, 14, 22);
                doc.setFontSize(11);
                doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
                var tableStartY = 40;
            }

            const tableColumn = resource.columns.map(c => c.header);
            const tableRows = data.map(item => {
                return resource.columns.map(col => {
                    let val = getValue(item, col.key, col.fallback || '');
                    if (col.format) { try { val = col.format(val); } catch (e) { val = '-'; } }
                    let strVal = val === null || val === undefined ? '-' : String(val);
                    return strVal.replace(/₹/g, 'Rs. ');
                });
            });

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: tableStartY,
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
                headStyles: { fillColor: [16, 185, 129] },
            });

            doc.save(`${resource.fileName}_${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (error) {
            console.error("PDF Error:", error);
            toast.error("Failed to generate PDF");
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <button onClick={() => router.back()} className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-white border-2 border-gray-200 group-hover:border-emerald-500 flex items-center justify-center transition-all shadow-sm group-hover:shadow-md">
                        <ArrowLeft size={20} strokeWidth={2.5} className="group-hover:text-emerald-600" />
                    </div>
                    <span className="font-bold text-sm">Back</span>
                </button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Downloads & Reports</h1>
                <p className="text-gray-600">Export system records and data for external use.</p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {RESOURCES.map((resource) => {
                    const Icon = resource.icon;
                    const theme = getThemeClasses(resource.theme);
                    const isExcelLoading = loading.id === resource.id && loading.type === 'excel';
                    const isPdfLoading = loading.id === resource.id && loading.type === 'pdf';

                    return (
                        <div
                            key={resource.id}
                            className={`group relative bg-white border-2 border-gray-100 rounded-2xl p-6 transition-all duration-300 ${theme.hoverBorder} hover:shadow-xl hover:-translate-y-1`}
                        >
                            {/* Decorative Corner */}
                            <div className={`absolute top-0 right-0 w-24 h-24 ${theme.lightBg} rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                            <div className="relative">
                                {/* Icon Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`w-14 h-14 rounded-xl ${theme.bg} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                                        <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                        <div className={`${theme.lightBg} p-2 rounded-lg`}>
                                            <ArrowRight className={`w-5 h-5 ${theme.text}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <h3 className={`text-xl font-bold text-gray-900 mb-2 group-hover:${theme.text} transition-colors`}>
                                    {resource.title}
                                </h3>
                                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                                    {resource.description}
                                </p>

                                {/* Buttons */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleDownload(resource, 'excel')}
                                        disabled={loading.id !== null}
                                        className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-gray-700 bg-white border-2 border-gray-100 rounded-xl ${theme.btnHover} hover:border-gray-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {isExcelLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <FileSpreadsheet className={`w-4 h-4 ${theme.text}`} />
                                        )}
                                        Excel
                                    </button>
                                    <button
                                        onClick={() => handleDownload(resource, 'pdf')}
                                        disabled={loading.id !== null}
                                        className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-gray-700 bg-white border-2 border-gray-100 rounded-xl ${theme.btnHover} hover:border-gray-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {isPdfLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <FileText className={`w-4 h-4 ${theme.text}`} />
                                        )}
                                        PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>All reports are generated in real-time</span>
            </div>
        </div>
    );
}
