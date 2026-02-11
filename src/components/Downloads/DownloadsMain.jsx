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
    ArrowLeft,
    Calendar,
    Filter,
    ChevronDown,
    FileJson,
    PieChart,
    HelpCircle,
    Info,
    DownloadCloud
} from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { useCreateAuditLogMutation } from '../../utils/slices/auditLogApiSlice';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:7000/api';

const RESOURCES = [
    {
        id: 'online_donations',
        title: 'Online Donations',
        description: 'Online donation records',
        icon: CreditCard,
        theme: 'emerald',
        endpoint: '/donations/get',
        dataKey: 'donations',
        fileName: 'online_donations',
        columns: [
            { header: 'Date', key: 'date', width: 15, format: (val) => val ? new Date(val).toLocaleDateString() : '-' },
            { header: 'Name', key: 'fullName', width: 25, fallback: 'Anonymous' },
            { header: 'Email', key: 'email', width: 30, fallback: '-' },
            { header: 'Amount', key: 'amount', width: 15, format: (val) => `₹${val}` },
            { header: 'Type', key: 'donationType', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Txn ID', key: 'id', width: 25 },
        ],
        dateKey: 'date'
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
        ],
        dateKey: 'submittedOn'
    },
    {
        id: 'expenses',
        title: 'Expenses',
        description: 'Operational and purchase costs',
        icon: Receipt,
        theme: 'orange',
        endpoint: '/inventory/expenses',
        dataKey: 'data',
        fileName: 'expenses',
        columns: [
            { header: 'Date', key: 'date', width: 15, format: (val) => val ? new Date(val).toLocaleDateString() : '-' },
            { header: 'Title/Description', key: 'description', width: 30 },
            { header: 'Amount', key: 'amount', width: 15, format: (val) => `₹${val}` },
            { header: 'Type', key: 'expenseType', width: 20 },
            { header: 'Payment Method', key: 'paymentMethod', width: 15 },
            { header: 'Recorded By', key: 'recordedBy.fullName', width: 20, fallback: '-' },
        ],
        dateKey: 'date'
    },
    {
        id: 'all_donations',
        title: 'All Donations',
        description: 'Consolidated Online, Offline and Expenses',
        icon: PieChart,
        theme: 'emerald',
        fileName: 'all_donations_report',
        columns: [
            { header: 'Date', key: 'finalDate', width: 15, format: (val) => val ? new Date(val).toLocaleDateString() : '-' },
            { header: 'Description/From', key: 'finalDescription', width: 30 },
            { header: 'Amount', key: 'finalAmount', width: 15, format: (val) => `₹${val}` },
            { header: 'Category', key: 'finalCategory', width: 20 },
            { header: 'Sub-Type', key: 'finalType', width: 20 },
            { header: 'Status', key: 'finalStatus', width: 15 }
        ],
        dateKey: 'finalDate'
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

const DOWNLOAD_INSTRUCTIONS = [
    {
        title: 'Select Report Type',
        text: 'Choose between All Donations, Offline Donations, Expenses, or Online Donations using the top navigation buttons.',
        icon: Filter
    },
    {
        title: 'Apply Date Filters',
        text: 'Use the Time Interval dropdown to select common periods like "This Month" or define a "Custom Range" for specific dates.',
        icon: Calendar
    },
    {
        title: 'Choose Format',
        text: 'Export your filtered data as a professional PDF for printing or a clean Excel sheet for further analysis.',
        icon: FileSpreadsheet
    }
];

const FINANCIAL_RESOURCE_IDS = ['all_donations', 'offline_donations', 'expenses', 'online_donations'];

const PERIODS = [
    { label: 'All Records', value: 'all' },
    { label: 'This Month', value: 'this_month' },
    { label: 'Last Month', value: 'last_month' },
    { label: 'This Financial Year', value: 'this_fy' },
    { label: 'Last Financial Year', value: 'last_fy' },
    { label: 'Custom Range', value: 'custom' },
];

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const filterDataByPeriod = (data, dateKey, period, customRange = null) => {
    if (!period || period === 'all') return data;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return data.filter(item => {
        const itemDateRaw = getValue(item, dateKey);
        if (!itemDateRaw) return false;
        const itemDate = new Date(itemDateRaw);
        if (isNaN(itemDate.getTime())) return false;

        // Reset hours for accurate comparison
        const itemYear = itemDate.getFullYear();
        const itemMonth = itemDate.getMonth();

        switch (period) {
            case 'custom':
                if (!customRange?.start || !customRange?.end) return true;
                const start = new Date(customRange.start);
                const end = new Date(customRange.end);
                end.setHours(23, 59, 59, 999);
                return itemDate >= start && itemDate <= end;
            case 'this_month':
                return itemMonth === currentMonth && itemYear === currentYear;
            case 'last_month': {
                const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
                return itemMonth === lastMonthDate.getMonth() && itemYear === lastMonthDate.getFullYear();
            }
            case 'this_fy': {
                const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
                const startDate = new Date(fyStartYear, 3, 1);
                const endDate = new Date(fyStartYear + 1, 2, 31, 23, 59, 59);
                return itemDate >= startDate && itemDate <= endDate;
            }
            case 'last_fy': {
                const fyStartYear = (currentMonth >= 3 ? currentYear : currentYear - 1) - 1;
                const startDate = new Date(fyStartYear, 3, 1);
                const endDate = new Date(fyStartYear + 1, 2, 31, 23, 59, 59);
                return itemDate >= startDate && itemDate <= endDate;
            }
            default:
                if (period.startsWith('month_')) {
                    const monthIndex = parseInt(period.split('_')[1]);
                    return itemMonth === monthIndex && itemYear === currentYear;
                }
                return true;
        }
    });
};

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
    const [createAuditLog] = useCreateAuditLogMutation();

    const [financialFilters, setFinancialFilters] = useState({
        typeId: 'all_donations',
        period: 'all',
        startDate: '',
        endDate: ''
    });

    const financialResources = RESOURCES.filter(r => FINANCIAL_RESOURCE_IDS.includes(r.id));
    const otherResources = RESOURCES.filter(r => !FINANCIAL_RESOURCE_IDS.includes(r.id));
    const selectedFinancialResource = financialResources.find(r => r.id === financialFilters.typeId) || financialResources[0];

    const fetchData = async (resource) => {
        try {
            if (resource.id === 'all_donations') {
                const [online, offline, expenses] = await Promise.all([
                    fetchData(RESOURCES.find(r => r.id === 'online_donations')),
                    fetchData(RESOURCES.find(r => r.id === 'offline_donations')),
                    fetchData(RESOURCES.find(r => r.id === 'expenses'))
                ]);

                return [
                    ...online.map(d => ({
                        ...d,
                        finalDate: d.date,
                        finalDescription: d.fullName || 'Anonymous',
                        finalAmount: d.amount,
                        finalCategory: 'Online',
                        finalType: d.donationType,
                        finalStatus: d.status
                    })),
                    ...offline.map(d => ({
                        ...d,
                        finalDate: d.submittedOn,
                        finalDescription: d.fullName || '-',
                        finalAmount: d.amount,
                        finalCategory: 'Offline',
                        finalType: d.method,
                        finalStatus: d.status
                    })),
                    ...expenses.map(d => ({
                        ...d,
                        finalDate: d.date,
                        finalDescription: d.description,
                        finalAmount: d.amount,
                        finalCategory: 'Expense',
                        finalType: d.expenseType,
                        finalStatus: 'N/A'
                    }))
                ].sort((a, b) => new Date(b.finalDate) - new Date(a.finalDate));
            }

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

    const handleDownload = async (resource, type, customFilters = null) => {
        setLoading({ id: resource.id, type });
        const toastId = toast.loading(`Preparing ${resource.title} export...`);

        try {
            let data = await fetchData(resource);

            // Apply filters if provided
            if (customFilters && customFilters.period && customFilters.period !== 'all') {
                data = filterDataByPeriod(
                    data,
                    resource.dateKey || 'createdAt',
                    customFilters.period,
                    { start: customFilters.startDate, end: customFilters.endDate }
                );
            }

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

            // Create Audit Log using RTK Mutation
            try {
                await createAuditLog({
                    action: `Downloaded ${resource.title} Report`,
                    entity: resource.title,
                    details: {
                        format: type.toUpperCase(),
                        recordCount: data.length,
                        period: customFilters?.period || 'all',
                        dateRange: customFilters?.period === 'custom' ? `${customFilters.startDate} to ${customFilters.endDate}` : null
                    }
                }).unwrap();
            } catch (auditError) {
                console.error("Failed to create audit log:", auditError);
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
                <button  onClick={() => router.push('/select-portal?category=monitoring')} className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-white border-2 border-gray-200 group-hover:border-emerald-500 flex items-center justify-center transition-all shadow-sm group-hover:shadow-md">
                        <ArrowLeft size={20} strokeWidth={2.5} className="group-hover:text-emerald-600" />
                    </div>
                    <span className="font-bold text-sm">Back</span>
                </button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Downloads & Reports</h1>
                <p className="text-gray-600">Export system records and data for external use.</p>
            </div>

            {/* Refactored Layout */}
            <div className="space-y-12">
                {/* 0. Instructions & Guide - At the Top now */}
                <section className="bg-emerald-900/5 border border-emerald-100/50 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <HelpCircle className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wider">How to Export Financial Reports</h2>
                                <p className="text-sm font-medium text-gray-500">Master the financial intelligence tools</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {DOWNLOAD_INSTRUCTIONS.map((step, idx) => (
                                <div key={idx} className="relative">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-lg shadow-emerald-200">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                                <step.icon size={16} className="text-emerald-500" />
                                                {step.title}
                                            </h3>
                                            <p className="text-gray-500 text-sm font-medium leading-relaxed">
                                                {step.text}
                                            </p>
                                        </div>
                                    </div>
                                    {idx < 2 && (
                                        <div className="hidden lg:block absolute top-4 left-full w-full h-px border-t border-dashed border-emerald-200 -ml-4 z-0"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 1. Primary Financial Section - Full Width */}
                <section>
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-1 shadow-2xl shadow-emerald-900/5 overflow-hidden">
                        <div className="bg-gradient-to-br from-emerald-50 via-white to-white rounded-[2.25rem] p-8 md:p-12 relative">
                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 right-0 w-1/3 h-full overflow-hidden pointer-events-none">
                                <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl"></div>
                                <div className="absolute top-1/2 -right-12 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl"></div>
                            </div>

                            <div className="relative z-10">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
                                    <div className="max-w-2xl">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-200 group-hover:scale-110 transition-transform">
                                                <PieChart className="w-8 h-8 text-white" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h2 className="text-3xl font-bold text-gray-900">Financial Reports</h2>
                                                </div>
                                                <p className="text-gray-500 text-lg font-medium max-w-md mt-1">
                                                    Access and export professional financial reports with precise data filtering.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        {financialResources.map(res => (
                                            <button
                                                key={res.id}
                                                onClick={() => setFinancialFilters({ ...financialFilters, typeId: res.id })}
                                                className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${financialFilters.typeId === res.id
                                                    ? 'bg-gray-900 text-white shadow-xl shadow-gray-200 -translate-y-1'
                                                    : 'bg-white text-gray-500 hover:bg-gray-50 border-2 border-gray-200'
                                                    }`}
                                            >
                                                {res.title}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Filters Grid */}
                                <div className="bg-white/50 backdrop-blur-sm border-2 border-white rounded-[2rem] p-8 mt-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                        {/* Period Selection */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 px-1">
                                                <Calendar className="w-4 h-4 text-emerald-500" />
                                                Time Interval
                                            </label>
                                            <div className="relative group">
                                                <select
                                                    value={financialFilters.period}
                                                    onChange={(e) => setFinancialFilters({ ...financialFilters, period: e.target.value })}
                                                    className="w-full pl-5 pr-12 py-4 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-700 appearance-none focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer shadow-sm hover:shadow-md"
                                                >
                                                    <optgroup label="Standard Periods" className="font-bold">
                                                        {PERIODS.map(p => (
                                                            <option key={p.value} value={p.value}>{p.label}</option>
                                                        ))}
                                                    </optgroup>
                                                    <optgroup label="Specific Month (This Year)" className="font-bold">
                                                        {MONTHS.map((m, i) => (
                                                            <option key={i} value={`month_${i}`}>{m}</option>
                                                        ))}
                                                    </optgroup>
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
                                            </div>
                                        </div>

                                        {/* Dynamic Custom Range Inputs */}
                                        {financialFilters.period === 'custom' && (
                                            <>
                                                <div className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-300">
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 px-1">
                                                        <Calendar className="w-4 h-4 text-emerald-500" />
                                                        Start Date
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={financialFilters.startDate}
                                                        onChange={(e) => setFinancialFilters({ ...financialFilters, startDate: e.target.value })}
                                                        className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                                                    />
                                                </div>
                                                <div className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-300">
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 px-1">
                                                        <Calendar className="w-4 h-4 text-emerald-500" />
                                                        End Date
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={financialFilters.endDate}
                                                        onChange={(e) => setFinancialFilters({ ...financialFilters, endDate: e.target.value })}
                                                        className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {/* Action Buttons */}
                                        <div className={`flex items-end gap-3 ${financialFilters.period === 'custom' ? 'lg:col-span-1' : 'md:col-span-1 lg:col-span-3'}`}>
                                            <div className="flex gap-3 w-full">
                                                <button
                                                    onClick={() => handleDownload(selectedFinancialResource, 'excel', financialFilters)}
                                                    disabled={loading.id !== null}
                                                    className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 active:scale-95 transition-all disabled:opacity-50 shadow-sm hover:shadow-md group/btn"
                                                >
                                                    {loading.id === selectedFinancialResource.id && loading.type === 'excel' ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <FileSpreadsheet className="w-5 h-5 text-emerald-500 group-hover/btn:rotate-12 transition-transform" />
                                                    )}
                                                    <span className="hidden sm:inline">Export Excel</span>
                                                    <span className="sm:hidden">Excel</span>
                                                </button>

                                                <button
                                                    onClick={() => handleDownload(selectedFinancialResource, 'pdf', financialFilters)}
                                                    disabled={loading.id !== null}
                                                    className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black hover:shadow-2xl hover:shadow-gray-200 active:scale-95 transition-all disabled:opacity-50"
                                                >
                                                    {loading.id === selectedFinancialResource.id && loading.type === 'pdf' ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <FileText className="w-5 h-5" />
                                                    )}
                                                    <span className="hidden sm:inline">Export PDF</span>
                                                    <span className="sm:hidden">PDF</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Secondary Records Grid */}
                <section>
                    <div className="flex items-center justify-between mb-8 px-2">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wider">Administrative Records</h2>
                            <p className="text-sm font-medium text-gray-400 mt-1">General system-level database exports</p>
                        </div>
                        <div className="h-px bg-gray-100 flex-1 mx-8 hidden sm:block"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {otherResources.map((resource) => {
                            const Icon = resource.icon;
                            const theme = getThemeClasses(resource.theme);
                            const isExcelLoading = loading.id === resource.id && loading.type === 'excel';
                            const isPdfLoading = loading.id === resource.id && loading.type === 'pdf';

                            return (
                                <div
                                    key={resource.id}
                                    className="group bg-white border-2 border-gray-100 rounded-[2rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-gray-900/5 hover:-translate-y-2 transition-all duration-500"
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <div className={`w-16 h-16 rounded-[1.25rem] ${theme.bg} flex items-center justify-center shadow-2xl relative overflow-hidden transition-transform duration-500 group-hover:scale-110`}>
                                            <Icon className="w-8 h-8 text-white relative z-10" strokeWidth={2.5} />
                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                        </div>
                                        <div className={`w-10 h-10 rounded-full border-2 border-gray-50 flex items-center justify-center group-hover:border-${resource.theme}-200 bg-gray-50/50 transition-colors`}>
                                            <ArrowRight className={`w-5 h-5 ${theme.text} opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0`} />
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{resource.title}</h3>
                                        <p className="text-gray-400 font-medium text-sm leading-relaxed">
                                            {resource.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => handleDownload(resource, 'excel')}
                                            disabled={loading.id !== null}
                                            className={`flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-bold text-gray-600 bg-gray-50 border-2 border-transparent rounded-2xl hover:bg-white hover:border-gray-200 active:scale-95 transition-all disabled:opacity-50`}
                                        >
                                            {isExcelLoading ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} className={theme.text} />}
                                            EXCEL
                                        </button>
                                        <button
                                            onClick={() => handleDownload(resource, 'pdf')}
                                            disabled={loading.id !== null}
                                            className={`flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-bold text-gray-600 bg-gray-50 border-2 border-transparent rounded-2xl hover:bg-white hover:border-gray-200 active:scale-95 transition-all disabled:opacity-50`}
                                        >
                                            {isPdfLoading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} className={theme.text} />}
                                            PDF
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
}
