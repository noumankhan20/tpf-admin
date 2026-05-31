'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    IndianRupee,
    Plus,
    Search,
    X,
    Calendar,
    FileText,
    Building2,
    User,
    Users,
    Package,
    Receipt,
    TrendingDown,
    Loader2,
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock,
    Filter,
    CreditCard,
    ShoppingCart,
    Banknote,
    Trash2,
    MapPin,
    Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

// Redux hooks
import {
    useGetExpensesQuery,
    useCreateExpenseMutation
} from '@/utils/slices/InventoryAndAsset/expenseApiSlice';
import { useGetAdminListQuery } from '@/utils/slices/adminApiSlice';
import { useGetCampaignListQuery } from '@/utils/slices/campaignSlice';
import { useGetPurchasesQuery } from '@/utils/slices/InventoryAndAsset/purchaseApiSlice';
import { useGetVendorsQuery } from '@/utils/slices/InventoryAndAsset/vendorApiSlice';
import { useGetAgreementsQuery } from '@/utils/slices/documentationApiSlice';
import {
    useGetVolunteersQuery,
    useGetApprovedVouchersQuery,
} from '@/utils/slices/vouchersApiSlice';
import { 
    useCreatePurchaseMutation 
} from '@/utils/slices/InventoryAndAsset/purchaseApiSlice';
import { 
    useCreateVendorMutation 
} from '@/utils/slices/InventoryAndAsset/vendorApiSlice';
import { useGetItemsQuery } from '@/utils/slices/InventoryAndAsset/itemApiSlice';
import { useGetStatesQuery, useLazyGetCitiesQuery } from '@/utils/slices/locationApiSlice';
import { INDIAN_LOCATIONS, STATES as FALLBACK_STATES } from '@/utils/locations';

const getExpenseIconInfo = (type) => {
    switch (type) {
        case 'PURCHASE':
            return {
                icon: <ShoppingCart size={20} className="text-amber-600" />,
                bg: 'bg-amber-50 text-amber-600'
            };
        case 'OPERATIONAL':
            return {
                icon: <Briefcase size={20} className="text-blue-600" />,
                bg: 'bg-blue-50 text-blue-600'
            };
        case 'BENEFICIARY':
            return {
                icon: <Users size={20} className="text-rose-600" />,
                bg: 'bg-rose-50 text-rose-600'
            };
        case 'SALARY':
            return {
                icon: <User size={20} className="text-emerald-600" />,
                bg: 'bg-emerald-50 text-emerald-600'
            };
        case 'REIMBURSEMENT':
            return {
                icon: <Banknote size={20} className="text-purple-600" />,
                bg: 'bg-purple-50 text-purple-600'
            };
        case 'DOCUMENTATION_SERVICE_PAYMENT':
            return {
                icon: <FileText size={20} className="text-cyan-600" />,
                bg: 'bg-cyan-50 text-cyan-600'
            };
        default:
            return {
                icon: <TrendingDown size={20} className="text-gray-600" />,
                bg: 'bg-gray-50 text-gray-600'
            };
    }
};

const formatExpenseDescription = (description) => {
    if (!description) return null;
    
    const hasEmailsOrDomains = description.includes('@') || description.includes('www.') || /\.[a-z]{2,4}\b/i.test(description);
    
    if (!hasEmailsOrDomains) {
        return <h3 className="text-base font-bold text-gray-900 leading-snug">{description}</h3>;
    }
    
    const words = description.split(/\s+/);
    const elements = [];
    let normalTextBuffer = [];
    
    const flushNormalText = () => {
        if (normalTextBuffer.length > 0) {
            elements.push(
                <span key={`text-${elements.length}`} className="text-sm font-bold text-gray-800 leading-relaxed mr-1.5 align-middle">
                    {normalTextBuffer.join(' ')}
                </span>
            );
            normalTextBuffer = [];
        }
    };
    
    words.forEach((word, index) => {
        const cleanWord = word.trim();
        if (!cleanWord) return;
        
        if (cleanWord.endsWith(':')) {
            flushNormalText();
            elements.push(
                <div key={`label-${index}`} className="w-full mt-3 first:mt-0 mb-1.5">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 border border-gray-200/50 px-2.5 py-1 rounded-lg inline-block">
                        {cleanWord.slice(0, -1)}
                    </span>
                </div>
            );
            return;
        }
        
        if (cleanWord.includes('@')) {
            flushNormalText();
            elements.push(
                <span 
                    key={`email-${index}`} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/50 hover:bg-blue-50 text-blue-600 border border-blue-100/70 rounded-xl text-xs font-semibold my-1 mr-2 transition-colors cursor-default align-middle"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    {cleanWord}
                </span>
            );
            return;
        }
        
        const isDomain = (cleanWord.includes('.') && !cleanWord.includes('@')) || cleanWord.startsWith('www.');
        if (isDomain) {
            flushNormalText();
            elements.push(
                <span 
                    key={`domain-${index}`} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-600 border border-emerald-100/70 rounded-xl text-xs font-semibold my-1 mr-2 transition-colors cursor-default align-middle"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {cleanWord}
                </span>
            );
            return;
        }
        
        normalTextBuffer.push(cleanWord);
    });
    
    flushNormalText();
    
    return (
        <div className="flex flex-wrap items-center mt-1">
            {elements}
        </div>
    );
};

const getMethodIcon = (method) => {
    switch (method) {
        case 'CASH':
            return <Banknote size={12} className="text-amber-600" />;
        case 'BANK_TRANSFER':
            return <Building2 size={12} className="text-blue-600" />;
        case 'UPI':
            return <CreditCard size={12} className="text-purple-600" />;
        default:
            return <CreditCard size={12} className="text-gray-600" />;
    }
};

export default function ExpenseManagement() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedExpenseType, setSelectedExpenseType] = useState('ALL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('ALL');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');

    // API Hooks
    const { data: expensesResponse, isLoading, refetch } = useGetExpensesQuery({
        type: selectedExpenseType !== 'ALL' ? selectedExpenseType : undefined,
        search: searchQuery,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        paymentMethod: paymentMethodFilter !== 'ALL' ? paymentMethodFilter : undefined,
        minAmount: minAmount || undefined,
        maxAmount: maxAmount || undefined
    });
    const { data: adminsResponse } = useGetAdminListQuery();
    const { data: campaignsResponse } = useGetCampaignListQuery();
    const { data: purchasesResponse } = useGetPurchasesQuery();
    const { data: vendorsResponse } = useGetVendorsQuery();
    const { data: agreementsResponse } = useGetAgreementsQuery();

    const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();

    // Form State
    const [formData, setFormData] = useState({
        expenseType: 'SALARY',
        amount: '',
        description: '',
        adminId: '',
        campaignId: '',
        purchaseId: '',
        vendorId: '',
        agreementId: '',
        paymentMethod: 'CASH',
        transactionId: '',
        notes: '',
        reimbursementType: 'ADMIN',
        volunteerName: '',
        volunteerPhone: '',
        volunteerLocation: '',
        volunteerId: '',
        voucherId: '',
        proofFile: null,
        transactionDate: new Date().toISOString().split('T')[0],
        transactionTime: ''
    });

    const { data: volunteersResponse } = useGetVolunteersQuery();
    const { data: vouchersResponse } = useGetApprovedVouchersQuery(formData.volunteerId, {
        skip: !formData.volunteerId
    });

    // Sub-modal states
    const [showAddPurchaseModal, setShowAddPurchaseModal] = useState(false);
    const [showAddVendorModal, setShowAddVendorModal] = useState(false);

    // Purchase Form State (for sub-modal)
    const [purchaseFormData, setPurchaseFormData] = useState({
        vendorId: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        paymentStatus: 'PENDING',
        proofFile: null,
        lineItems: []
    });

    // Vendor Form State (for sub-modal)
    const [vendorIdType, setVendorIdType] = useState('GST');
    const [vendorFormData, setVendorFormData] = useState({
        fullName: '',
        contactNumber: '',
        vendorGST: '',
        state: '',
        city: '',
        fullAddress: '',
        status: 'ACTIVE',
        vendorType: 'NORMAL'
    });

    // Mutations and data for sub-modals
    const [createPurchase, { isLoading: isCreatingPurchase }] = useCreatePurchaseMutation();
    const [createVendor, { isLoading: isCreatingVendor }] = useCreateVendorMutation();
    const { data: itemsResponse } = useGetItemsQuery({ status: 'ACTIVE' });
    const items = itemsResponse?.data || [];
    const { data: apiStates, isLoading: isLoadingStates } = useGetStatesQuery();
    const [triggerGetCities, { data: apiCities, isLoading: isLoadingCities }] = useLazyGetCitiesQuery();
    const states = apiStates || FALLBACK_STATES;

    const volunteers = volunteersResponse?.data || [];
    const approvedVouchers = vouchersResponse?.data || [];

    const expenses = expensesResponse?.data || [];
    const admins = adminsResponse?.data || [];
    const campaigns = campaignsResponse?.data || [];
    const purchases = purchasesResponse?.data || [];
    const vendors = vendorsResponse?.data || [];
    const agreements = agreementsResponse?.data || [];

    // Custom Searchable Campaign Dropdown State & Logic
    const [campaignDropdownOpen, setCampaignDropdownOpen] = useState(false);
    const [campaignSearch, setCampaignSearch] = useState('');
    const [campaignPage, setCampaignPage] = useState(1);
    const campaignRef = React.useRef(null);

    // Handle outside clicks for Campaign Dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (campaignRef.current && !campaignRef.current.contains(event.target)) {
                setCampaignDropdownOpen(false);
            }
        }
        if (campaignDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [campaignDropdownOpen]);

    // Filter campaigns based on search query
    const filteredCampaigns = React.useMemo(() => {
        if (!campaigns) return [];
        // Sort campaigns by default (latest first by updatedAt or createdAt)
        const sorted = [...campaigns].sort((a, b) => {
            const dateA = new Date(a.updatedAt || a.createdAt || 0);
            const dateB = new Date(b.updatedAt || b.createdAt || 0);
            return dateB - dateA;
        });

        if (!campaignSearch) return sorted;
        const searchLower = campaignSearch.toLowerCase();
        return sorted.filter(c => c.title?.toLowerCase().includes(searchLower));
    }, [campaigns, campaignSearch]);

    // Paginate matching campaigns (20 per page)
    const ITEMS_PER_PAGE = 20;
    const totalCampaignPages = Math.ceil(filteredCampaigns.length / ITEMS_PER_PAGE) || 1;
    
    // Adjust current page if search reduces the matches below page range
    useEffect(() => {
        if (campaignPage > totalCampaignPages) {
            setCampaignPage(totalCampaignPages);
        }
    }, [filteredCampaigns.length, totalCampaignPages, campaignPage]);

    const paginatedCampaigns = React.useMemo(() => {
        const startIndex = (campaignPage - 1) * ITEMS_PER_PAGE;
        return filteredCampaigns.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredCampaigns, campaignPage]);

    // Find currently selected campaign details
    const selectedCampaignDetails = campaigns.find(c => c._id === formData.campaignId);

    // Custom Searchable Purchase Dropdown State & Logic
    const [purchaseDropdownOpen, setPurchaseDropdownOpen] = useState(false);
    const [purchaseSearch, setPurchaseSearch] = useState('');
    const [purchasePage, setPurchasePage] = useState(1);
    const purchaseRef = React.useRef(null);

    // Handle outside clicks for Purchase Dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (purchaseRef.current && !purchaseRef.current.contains(event.target)) {
                setPurchaseDropdownOpen(false);
            }
        }
        if (purchaseDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [purchaseDropdownOpen]);

    // Filter purchases based on search query
    const filteredPurchases = React.useMemo(() => {
        if (!purchases) return [];
        // Sort purchases by default (latest first by purchaseDate or createdAt)
        const sorted = [...purchases].sort((a, b) => {
            const dateA = new Date(a.purchaseDate || a.createdAt || 0);
            const dateB = new Date(b.purchaseDate || b.createdAt || 0);
            return dateB - dateA;
        });

        if (!purchaseSearch) return sorted;
        const searchLower = purchaseSearch.toLowerCase();
        return sorted.filter(p => {
            const vendorName = p.vendorId?.fullName?.toLowerCase() || '';
            const amount = p.totalAmount?.toString() || '';
            return vendorName.includes(searchLower) || amount.includes(searchLower);
        });
    }, [purchases, purchaseSearch]);

    // Paginate matching purchases (20 per page)
    const ITEMS_PER_PAGE_PURCHASE = 20;
    const totalPurchasePages = Math.ceil(filteredPurchases.length / ITEMS_PER_PAGE_PURCHASE) || 1;
    
    // Adjust current page if search reduces the matches below page range
    useEffect(() => {
        if (purchasePage > totalPurchasePages) {
            setPurchasePage(totalPurchasePages);
        }
    }, [filteredPurchases.length, totalPurchasePages, purchasePage]);

    const paginatedPurchases = React.useMemo(() => {
        const startIndex = (purchasePage - 1) * ITEMS_PER_PAGE_PURCHASE;
        return filteredPurchases.slice(startIndex, startIndex + ITEMS_PER_PAGE_PURCHASE);
    }, [filteredPurchases, purchasePage]);

    // Find currently selected purchase details
    const selectedPurchaseDetails = purchases.find(p => p._id === formData.purchaseId);

    // Custom Searchable Volunteer Dropdown State & Logic
    const [volunteerDropdownOpen, setVolunteerDropdownOpen] = useState(false);
    const [volunteerSearch, setVolunteerSearch] = useState('');
    const [volunteerPage, setVolunteerPage] = useState(1);
    const volunteerRef = React.useRef(null);

    // Handle outside clicks for Volunteer Dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (volunteerRef.current && !volunteerRef.current.contains(event.target)) {
                setVolunteerDropdownOpen(false);
            }
        }
        if (volunteerDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [volunteerDropdownOpen]);

    // Filter volunteers based on search query
    const filteredVolunteers = React.useMemo(() => {
        if (!volunteers) return [];
        // Sort volunteers by default (alphabetical by fullName)
        const sorted = [...volunteers].sort((a, b) => {
            const nameA = a.fullName || '';
            const nameB = b.fullName || '';
            return nameA.localeCompare(nameB);
        });

        if (!volunteerSearch) return sorted;
        const searchLower = volunteerSearch.toLowerCase();
        return sorted.filter(v => {
            const name = v.fullName?.toLowerCase() || '';
            const email = v.email?.toLowerCase() || '';
            return name.includes(searchLower) || email.includes(searchLower);
        });
    }, [volunteers, volunteerSearch]);

    // Paginate matching volunteers (20 per page)
    const ITEMS_PER_PAGE_VOLUNTEER = 20;
    const totalVolunteerPages = Math.ceil(filteredVolunteers.length / ITEMS_PER_PAGE_VOLUNTEER) || 1;
    
    // Adjust current page if search reduces the matches below page range
    useEffect(() => {
        if (volunteerPage > totalVolunteerPages) {
            setVolunteerPage(totalVolunteerPages);
        }
    }, [filteredVolunteers.length, totalVolunteerPages, volunteerPage]);

    const paginatedVolunteers = React.useMemo(() => {
        const startIndex = (volunteerPage - 1) * ITEMS_PER_PAGE_VOLUNTEER;
        return filteredVolunteers.slice(startIndex, startIndex + ITEMS_PER_PAGE_VOLUNTEER);
    }, [filteredVolunteers, volunteerPage]);

    // Find currently selected volunteer details
    const selectedVolunteerDetails = volunteers.find(v => v._id === formData.volunteerId);

    // Custom Searchable Vendor Dropdown State & Logic
    const [vendorDropdownOpen, setVendorDropdownOpen] = useState(false);
    const [vendorSearch, setVendorSearch] = useState('');
    const [vendorPage, setVendorPage] = useState(1);
    const vendorRef = React.useRef(null);

    // Handle outside clicks for Vendor Dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (vendorRef.current && !vendorRef.current.contains(event.target)) {
                setVendorDropdownOpen(false);
            }
        }
        if (vendorDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [vendorDropdownOpen]);

    // Filter vendors based on search query
    const filteredVendors = React.useMemo(() => {
        if (!vendors) return [];
        // Sort vendors alphabetically by fullName
        const sorted = [...vendors].sort((a, b) => {
            const nameA = a.fullName || '';
            const nameB = b.fullName || '';
            return nameA.localeCompare(nameB);
        });

        if (!vendorSearch) return sorted;
        const searchLower = vendorSearch.toLowerCase();
        return sorted.filter(v => v.fullName?.toLowerCase().includes(searchLower) || v.contactNumber?.includes(searchLower));
    }, [vendors, vendorSearch]);

    // Paginate matching vendors (20 per page)
    const ITEMS_PER_PAGE_VENDOR = 20;
    const totalVendorPages = Math.ceil(filteredVendors.length / ITEMS_PER_PAGE_VENDOR) || 1;
    
    // Adjust current page if search reduces the matches below page range
    useEffect(() => {
        if (vendorPage > totalVendorPages) {
            setVendorPage(totalVendorPages);
        }
    }, [filteredVendors.length, totalVendorPages, vendorPage]);

    const paginatedVendors = React.useMemo(() => {
        const startIndex = (vendorPage - 1) * ITEMS_PER_PAGE_VENDOR;
        return filteredVendors.slice(startIndex, startIndex + ITEMS_PER_PAGE_VENDOR);
    }, [filteredVendors, vendorPage]);

    // Find currently selected vendor details
    const selectedVendorDetails = vendors.find(v => v._id === formData.vendorId);

    // Custom Searchable Agreement Dropdown State & Logic
    const [agreementDropdownOpen, setAgreementDropdownOpen] = useState(false);
    const [agreementSearch, setAgreementSearch] = useState('');
    const [agreementPage, setAgreementPage] = useState(1);
    const agreementRef = React.useRef(null);

    // Handle outside clicks for Agreement Dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (agreementRef.current && !agreementRef.current.contains(event.target)) {
                setAgreementDropdownOpen(false);
            }
        }
        if (agreementDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [agreementDropdownOpen]);

    // Filter agreements based on search query
    const filteredAgreements = React.useMemo(() => {
        if (!agreements) return [];
        // Sort agreements alphabetically by title
        const sorted = [...agreements].sort((a, b) => {
            const titleA = a.title || '';
            const titleB = b.title || '';
            return titleA.localeCompare(titleB);
        });

        if (!agreementSearch) return sorted;
        const searchLower = agreementSearch.toLowerCase();
        return sorted.filter(a => {
            const title = a.title?.toLowerCase() || '';
            const partyName = a.parties?.[0]?.name?.toLowerCase() || '';
            return title.includes(searchLower) || partyName.includes(searchLower);
        });
    }, [agreements, agreementSearch]);

    // Paginate matching agreements (20 per page)
    const ITEMS_PER_PAGE_AGREEMENT = 20;
    const totalAgreementPages = Math.ceil(filteredAgreements.length / ITEMS_PER_PAGE_AGREEMENT) || 1;
    
    // Adjust current page if search reduces the matches below page range
    useEffect(() => {
        if (agreementPage > totalAgreementPages) {
            setAgreementPage(totalAgreementPages);
        }
    }, [filteredAgreements.length, totalAgreementPages, agreementPage]);

    const paginatedAgreements = React.useMemo(() => {
        const startIndex = (agreementPage - 1) * ITEMS_PER_PAGE_AGREEMENT;
        return filteredAgreements.slice(startIndex, startIndex + ITEMS_PER_PAGE_AGREEMENT);
    }, [filteredAgreements, agreementPage]);

    // Find currently selected agreement details
    const selectedAgreementDetails = agreements.find(a => a._id === formData.agreementId);

    // Custom Searchable Admin/Employee Dropdown State & Logic
    const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
    const [adminSearch, setAdminSearch] = useState('');
    const [adminPage, setAdminPage] = useState(1);
    const adminRef = React.useRef(null);

    // Handle outside clicks for Admin Dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (adminRef.current && !adminRef.current.contains(event.target)) {
                setAdminDropdownOpen(false);
            }
        }
        if (adminDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [adminDropdownOpen]);

    // Filter admins based on search query
    const filteredAdmins = React.useMemo(() => {
        if (!admins) return [];
        // Sort admins alphabetically by fullName
        const sorted = [...admins].sort((a, b) => {
            const nameA = a.fullName || '';
            const nameB = b.fullName || '';
            return nameA.localeCompare(nameB);
        });

        if (!adminSearch) return sorted;
        const searchLower = adminSearch.toLowerCase();
        return sorted.filter(a => {
            const name = a.fullName?.toLowerCase() || '';
            const email = a.email?.toLowerCase() || '';
            return name.includes(searchLower) || email.includes(searchLower);
        });
    }, [admins, adminSearch]);

    // Paginate matching admins (20 per page)
    const ITEMS_PER_PAGE_ADMIN = 20;
    const totalAdminPages = Math.ceil(filteredAdmins.length / ITEMS_PER_PAGE_ADMIN) || 1;
    
    // Adjust current page if search reduces the matches below page range
    useEffect(() => {
        if (adminPage > totalAdminPages) {
            setAdminPage(totalAdminPages);
        }
    }, [filteredAdmins.length, totalAdminPages, adminPage]);

    const paginatedAdmins = React.useMemo(() => {
        const startIndex = (adminPage - 1) * ITEMS_PER_PAGE_ADMIN;
        return filteredAdmins.slice(startIndex, startIndex + ITEMS_PER_PAGE_ADMIN);
    }, [filteredAdmins, adminPage]);

    // Find currently selected admin details
    const selectedAdminDetails = admins.find(a => a._id === formData.adminId);

    // Extract unique values for dynamic filters
    const availablePaymentMethods = [...new Set(expenses.map(e => e.paymentMethod).filter(Boolean))].sort();


    // Local Filtering for robust UI behavior
    const filteredExpenses = expenses.filter(expense => {
        // Search
        const searchStr = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery ||
            expense.description?.toLowerCase().includes(searchStr) ||
            expense.transactionId?.toLowerCase().includes(searchStr) ||
            expense.amount?.toString().includes(searchStr);

        // Expense Type
        const matchesType = selectedExpenseType === 'ALL' || expense.expenseType === selectedExpenseType;

        // Payment Method
        const matchesPayment = paymentMethodFilter === 'ALL' || expense.paymentMethod === paymentMethodFilter;

        // Date Range
        const expDate = new Date(expense.date).setHours(0, 0, 0, 0);
        const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
        const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

        const matchesStartDate = !start || expDate >= start;
        const matchesEndDate = !end || expDate <= end;

        // Amount Range
        const matchesMinAmount = !minAmount || expense.amount >= parseFloat(minAmount);
        const matchesMaxAmount = !maxAmount || expense.amount <= parseFloat(maxAmount);

        return matchesSearch && matchesType && matchesPayment && matchesStartDate && matchesEndDate && matchesMinAmount && matchesMaxAmount;
    });

    const expenseTypes = [
        { value: 'ALL', label: 'All Expenses', color: 'gray' },
        { value: 'SALARY', label: 'Salary', color: 'blue' },
        { value: 'BENEFICIARY', label: 'Beneficiary', color: 'green' },
        { value: 'PURCHASE', label: 'Purchase', color: 'purple' },
        { value: 'REIMBURSEMENT', label: 'Reimbursement', color: 'orange' },
        { value: 'OPERATIONAL', label: 'Operational', color: 'teal' },
        { value: 'DOCUMENTATION_SERVICE', label: 'Documentation Service Payment', color: 'amber' },
        { value: 'OTHER', label: 'Other', color: 'gray' },
    ];

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('amount', formData.amount);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('expenseType', formData.expenseType);
            formDataToSend.append('paymentMethod', formData.paymentMethod);

            if (formData.transactionId) formDataToSend.append('transactionId', formData.transactionId);
            if (formData.notes) formDataToSend.append('notes', formData.notes);
            formDataToSend.append('transactionDate', formData.transactionDate);
            if (formData.transactionTime) formDataToSend.append('transactionTime', formData.transactionTime);

            if (formData.expenseType === 'SALARY' && formData.adminId) {
                formDataToSend.append('adminId', formData.adminId);
            }
            if (formData.campaignId) {
                formDataToSend.append('campaignId', formData.campaignId);
            }
            if (formData.expenseType === 'PURCHASE' && formData.purchaseId) {
                formDataToSend.append('purchaseId', formData.purchaseId);
            }
            if (formData.vendorId) {
                formDataToSend.append('vendorId', formData.vendorId);
            }
            if (formData.expenseType === 'DOCUMENTATION_SERVICE' && formData.agreementId) {
                formDataToSend.append('agreementId', formData.agreementId);
            }

            if (formData.expenseType === 'REIMBURSEMENT') {
                if (formData.reimbursementType === 'ADMIN' && formData.adminId) {
                    formDataToSend.append('reimbursementTo[adminId]', formData.adminId);
                } else if (formData.reimbursementType === 'VOLUNTEER' && formData.volunteerId) {
                    formDataToSend.append('reimbursementTo[volunteerDetails][name]', formData.volunteerName); // Still keeping old fields for safety
                    formDataToSend.append('reimbursementTo[volunteerDetails][phone]', formData.volunteerPhone);
                    formDataToSend.append('reimbursementTo[volunteerDetails][location]', formData.volunteerLocation);
                    formDataToSend.append('reimbursementTo[volunteerId]', formData.volunteerId);
                    if (formData.voucherId) formDataToSend.append('voucherId', formData.voucherId);
                }
            }

            if (formData.proofFile) {
                formDataToSend.append('proof', formData.proofFile);
            }

            await createExpense(formDataToSend).unwrap();
            setShowAddModal(false);
            resetForm();
            toast.success('Expense recorded successfully');
        } catch (error) {
            console.error('Failed to create expense:', error);
            toast.error(error?.data?.message || 'Failed to create expense');
        }
    };

    const resetForm = () => {
        setFormData({
            expenseType: 'SALARY',
            amount: '',
            description: '',
            adminId: '',
            campaignId: '',
            purchaseId: '',
            vendorId: '',
            agreementId: '',
            paymentMethod: 'CASH',
            transactionId: '',
            notes: '',
            reimbursementType: 'ADMIN',
            volunteerName: '',
            volunteerPhone: '',
            volunteerLocation: '',
            volunteerId: '',
            voucherId: '',
            proofFile: null,
            transactionDate: new Date().toISOString().split('T')[0],
            transactionTime: ''
        });
    };

    // Sub-modal handlers
    const addLineItem = () => {
        setPurchaseFormData(prev => ({
            ...prev,
            lineItems: [...prev.lineItems, { itemId: '', qty: '', price: '', unit: '' }]
        }));
    };

    const removeLineItem = (index) => {
        setPurchaseFormData(prev => ({
            ...prev,
            lineItems: prev.lineItems.filter((_, i) => i !== index)
        }));
    };

    const updateLineItem = (index, field, value) => {
        setPurchaseFormData(prev => {
            const updatedLines = [...prev.lineItems];
            if (field === 'itemId') {
                const selectedItem = items.find(item => item._id === value);
                updatedLines[index] = {
                    ...updatedLines[index],
                    itemId: value,
                    unit: selectedItem?.unit || ''
                };
            } else {
                updatedLines[index] = { ...updatedLines[index], [field]: value };
            }
            return { ...prev, lineItems: updatedLines };
        });
    };

    const handleCreatePurchaseSubmit = async (e) => {
        e.preventDefault();
        if (purchaseFormData.lineItems.length === 0) {
            toast.warning("Please add at least one item.");
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('vendorId', purchaseFormData.vendorId);
        formDataToSend.append('purchaseDate', purchaseFormData.purchaseDate);
        formDataToSend.append('paymentStatus', purchaseFormData.paymentStatus);

        const itemsPayload = purchaseFormData.lineItems.map(item => ({
            itemId: item.itemId,
            quantity: Number(item.qty),
            price: Number(item.price)
        }));
        formDataToSend.append('items', JSON.stringify(itemsPayload));

        if (purchaseFormData.proofFile) {
            formDataToSend.append('proof', purchaseFormData.proofFile);
        }

        try {
            const result = await createPurchase(formDataToSend).unwrap();
            toast.success('Purchase recorded successfully');
            setShowAddPurchaseModal(false);
            // Automatically select the new purchase in the main form
            setFormData(prev => ({ ...prev, purchaseId: result.data._id }));
        } catch (err) {
            console.error('Failed to save purchase:', err);
            toast.error(err?.data?.message || 'Failed to save purchase');
        }
    };

    const handleCreateVendorSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!/^[0-9]{10}$/.test(vendorFormData.contactNumber)) {
                toast.warning('Contact number must be a valid 10-digit number');
                return;
            }

            // Validate Identification Type & Format
            const idVal = vendorFormData.vendorGST.trim().toUpperCase();
            if (!idVal) {
                toast.warning('Identification document value is required');
                return;
            }
            if (vendorIdType === 'GST' && !/^[0-9A-Z]{15}$/.test(idVal)) {
                toast.warning('GST number must be exactly 15 alphanumeric characters');
                return;
            }
            if (vendorIdType === 'PAN' && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(idVal)) {
                toast.warning('PAN Card number must be exactly 10 alphanumeric characters (5 letters, 4 digits, 1 letter)');
                return;
            }
            if (vendorIdType === 'AADHAAR' && !/^[0-9]{12}$/.test(idVal)) {
                toast.warning('Aadhaar Card number must be exactly 12 digits');
                return;
            }

            const submissionData = {
                ...vendorFormData,
                vendorGST: `${vendorIdType}: ${idVal}`
            };

            const result = await createVendor(submissionData).unwrap();
            toast.success('Vendor created successfully');
            setShowAddVendorModal(false);
            setVendorFormData({
                fullName: '',
                contactNumber: '',
                vendorGST: '',
                state: '',
                city: '',
                fullAddress: '',
                status: 'ACTIVE',
                vendorType: 'NORMAL'
            });
            setVendorIdType('GST');
            // Automatically select the new vendor in the main form
            setFormData(prev => ({ ...prev, vendorId: result.data._id }));
        } catch (err) {
            console.error('Failed to save vendor:', err);
            toast.error(err?.data?.message || 'Failed to save vendor');
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedExpenseType('ALL');
        setStartDate('');
        setEndDate('');
        setPaymentMethodFilter('ALL');
        setMinAmount('');
        setMaxAmount('');
    };

    const getExpenseTypeColor = (type) => {
        const typeInfo = expenseTypes.find(t => t.value === type);
        return typeInfo?.color || 'gray';
    };

    if (!isMounted) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <TrendingDown className="text-emerald-600" size={24} />
                            Expense Management
                        </h1>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-md active:scale-95"
                    >
                        <Plus size={18} />
                        Record Expense
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search & Filters */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm mb-8 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search description, TXN ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold"
                            />
                        </div>

                        {/* Category Dropdown */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            <select
                                value={selectedExpenseType}
                                onChange={(e) => setSelectedExpenseType(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                            >
                                {expenseTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>

                        {/* Payment Method Dropdown */}
                        <div className="relative">
                            <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            <select
                                value={paymentMethodFilter}
                                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                            >
                                <option value="ALL">All Payment Methods</option>
                                {availablePaymentMethods.map(method => (
                                    <option key={method} value={method}>{method}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>

                        {/* Date Range - Start */}
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold"
                            />
                        </div>

                        {/* Date Range - End */}
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold"
                                placeholder="End Date"
                            />
                        </div>

                        {/* Amount Range */}
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={minAmount}
                                    onChange={(e) => setMinAmount(e.target.value)}
                                    className="w-full pl-8 pr-2 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold"
                                />
                            </div>
                            <div className="relative flex-1">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={maxAmount}
                                    onChange={(e) => setMaxAmount(e.target.value)}
                                    className="w-full pl-8 pr-2 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold"
                                />
                            </div>
                        </div>

                        {/* Clear Filters Button */}
                        <button
                            onClick={clearFilters}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all"
                        >
                            <X size={16} />
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-20">
                        <Loader2 className="animate-spin text-emerald-600 mx-auto mb-4" size={48} />
                        <p className="text-gray-500">Loading expenses...</p>
                    </div>
                )}

                {/* Expenses List */}
                {!isLoading && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-800">Recent Expenses</h2>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
                                {filteredExpenses.length} Results
                            </p>
                        </div>
                        <AnimatePresence>
                            {filteredExpenses.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                        <TrendingDown size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">No results found</h3>
                                    <p className="text-gray-500">Try adjusting your filters to find what you're looking for.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Desktop View Table */}
                                    <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full">
                                                <thead>
                                                    <tr className="bg-gray-50 border-b border-gray-200">
                                                        {["Type", "Date & Time", "Recipient", "Campaign", "Description", "Method", "Amount", "Status"].map((h) => (
                                                            <th key={h} className="px-5 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                                                {h}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {filteredExpenses.map((expense) => {
                                                        // Recipient mapping
                                                        let recipientName = "—";
                                                        let recipientSub = "";
                                                        
                                                        if (expense.adminId) {
                                                            recipientName = expense.adminId.fullName;
                                                            recipientSub = "Admin / Employee";
                                                        } else if (expense.volunteerId) {
                                                            recipientName = expense.volunteerId.fullName;
                                                            recipientSub = "Volunteer";
                                                        } else if (expense.vendorId) {
                                                            recipientName = expense.vendorId.fullName;
                                                            recipientSub = "Vendor";
                                                        } else if (expense.agreementId) {
                                                            recipientName = expense.agreementId.agreementTitle;
                                                            recipientSub = "Agreement";
                                                        }
                                                        
                                                        return (
                                                            <tr key={expense._id} className="hover:bg-gray-50/50 transition-colors group">
                                                                <td className="px-5 py-4">
                                                                    <div className="flex flex-col gap-1 items-start">
                                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-500 text-white shadow-sm shadow-rose-500/10">
                                                                            <ArrowLeft size={10} /> DR
                                                                        </span>
                                                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded-md mt-1">
                                                                            {expense.expenseType}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-5 py-4 whitespace-nowrap">
                                                                    <p className="text-sm font-bold text-gray-800">
                                                                        {new Date(expense.date || expense.transactionDate).toLocaleDateString("en-IN", {
                                                                            day: "2-digit", month: "short", year: "numeric"
                                                                        })}
                                                                    </p>
                                                                    <p className="text-xs text-gray-400">
                                                                        {new Date(expense.date || expense.transactionDate).toLocaleTimeString("en-IN", {
                                                                            hour: "2-digit", minute: "2-digit", hour12: true
                                                                        })}
                                                                    </p>
                                                                </td>
                                                                <td className="px-5 py-4">
                                                                    <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{recipientName}</p>
                                                                    {recipientSub && (
                                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{recipientSub}</p>
                                                                    )}
                                                                </td>
                                                                <td className="px-5 py-4">
                                                                    <p className="text-sm font-bold text-gray-600 truncate max-w-[140px]">
                                                                        {expense.campaignId?.title || "—"}
                                                                    </p>
                                                                </td>
                                                                <td className="px-5 py-4">
                                                                    <div className="max-w-[280px]">
                                                                        {formatExpenseDescription(expense.description)}
                                                                        {expense.notes && (
                                                                            <p className="text-[10px] text-gray-400 italic mt-1 truncate" title={expense.notes}>
                                                                                "{expense.notes}"
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-5 py-4 whitespace-nowrap">
                                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                                                                        {getMethodIcon(expense.paymentMethod)}
                                                                        {expense.paymentMethod}
                                                                    </div>
                                                                    {expense.transactionId && (
                                                                        <p className="text-[9px] font-black text-gray-400 tracking-tighter uppercase mt-0.5">TXN: {expense.transactionId}</p>
                                                                    )}
                                                                </td>
                                                                <td className="px-5 py-4 whitespace-nowrap">
                                                                    <p className="text-[15px] font-black text-rose-600">
                                                                        -₹{expense.amount.toLocaleString("en-IN")}
                                                                    </p>
                                                                </td>
                                                                <td className="px-5 py-4">
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                                        <span className="w-1 h-1 rounded-full bg-emerald-500" />
                                                                        Paid
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    
                                    {/* Mobile View Cards */}
                                    <div className="lg:hidden space-y-3">
                                        {filteredExpenses.map((expense) => {
                                            let recipientName = "—";
                                            let recipientSub = "";
                                            
                                            if (expense.adminId) {
                                                recipientName = expense.adminId.fullName;
                                                recipientSub = "Admin";
                                            } else if (expense.volunteerId) {
                                                recipientName = expense.volunteerId.fullName;
                                                recipientSub = "Volunteer";
                                            } else if (expense.vendorId) {
                                                recipientName = expense.vendorId.fullName;
                                                recipientSub = "Vendor";
                                            } else if (expense.agreementId) {
                                                recipientName = expense.agreementId.agreementTitle;
                                                recipientSub = "Agreement";
                                            }
                                            
                                            return (
                                                <div key={expense._id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-rose-500 text-white">
                                                                    DR
                                                                </span>
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded-md">
                                                                    {expense.expenseType}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-400">
                                                                {new Date(expense.date || expense.transactionDate).toLocaleDateString("en-IN", {
                                                                    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                                                                })}
                                                            </p>
                                                        </div>
                                                        <p className="text-base font-black text-rose-600">
                                                            -₹{expense.amount.toLocaleString("en-IN")}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="space-y-2 border-t border-gray-50 pt-3">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Recipient</span>
                                                            <span className="text-gray-700 font-bold text-xs truncate max-w-[180px]">{recipientName} {recipientSub && <span className="text-[10px] text-gray-400">({recipientSub})</span>}</span>
                                                        </div>
                                                        {expense.campaignId && (
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Campaign</span>
                                                                <span className="text-gray-700 font-bold text-xs truncate max-w-[180px]">{expense.campaignId.title}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Method</span>
                                                            <span className="flex items-center gap-1 text-gray-700 text-xs font-bold">
                                                                {getMethodIcon(expense.paymentMethod)} {expense.paymentMethod}
                                                            </span>
                                                        </div>
                                                        <div className="border-t border-gray-50 pt-2.5 mt-2">
                                                            {formatExpenseDescription(expense.description)}
                                                            {expense.notes && (
                                                                <p className="text-[11px] text-gray-400 italic mt-1 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                                    "{expense.notes}"
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            {/* Add Expense Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Record New Expense</h2>
                                    <p className="text-sm text-gray-500">Track organizational expenses</p>
                                </div>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                                <div className="p-8 space-y-6 overflow-y-auto flex-1">
                                    {/* Expense Type */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Expense Type *</label>
                                        <select
                                            required
                                            value={formData.expenseType}
                                            onChange={(e) => setFormData(p => ({ ...p, expenseType: e.target.value }))}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                        >
                                            {expenseTypes.filter(t => t.value !== 'ALL').map(type => (
                                                <option key={type.value} value={type.value}>{type.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Amount */}
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Amount (₹) *</label>
                                            <div className="relative">
                                                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="number"
                                                    required
                                                    value={formData.amount}
                                                    onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))}
                                                    placeholder="0.00"
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-lg font-bold"
                                                />
                                            </div>
                                        </div>

                                        {/* Payment Method */}
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Payment Method *</label>
                                            <div className="relative">
                                                <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <select
                                                    required
                                                    value={formData.paymentMethod}
                                                    onChange={(e) => setFormData(p => ({ ...p, paymentMethod: e.target.value }))}
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                                >
                                                    <option value="CASH">Cash</option>
                                                    <option value="BANK_TRANSFER">Bank Transfer</option>
                                                    <option value="UPI">UPI</option>
                                                    <option value="CHEQUE">Cheque</option>
                                                    <option value="CARD">Card</option>
                                                    <option value="OTHER">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Transaction Date */}
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Date of Transaction *</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="date"
                                                    required
                                                    value={formData.transactionDate}
                                                    onChange={(e) => setFormData(p => ({ ...p, transactionDate: e.target.value }))}
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* Transaction Time */}
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Transaction Time (Optional)</label>
                                            <div className="relative">
                                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="time"
                                                    value={formData.transactionTime}
                                                    onChange={(e) => setFormData(p => ({ ...p, transactionTime: e.target.value }))}
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Description *</label>
                                        <textarea
                                            required
                                            rows="2"
                                            value={formData.description}
                                            onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                            placeholder="What was this expense for?"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                                        ></textarea>
                                    </div>

                                    {/* Conditional Fields Based on Expense Type */}
                                    {formData.expenseType === 'SALARY' && (
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Select Employee *</label>
                                            <div ref={adminRef} className="relative">
                                                {/* Hidden input for HTML5 form validation */}
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.adminId}
                                                    onChange={() => {}}
                                                    className="absolute w-0 h-0 opacity-0 pointer-events-none"
                                                />

                                                <div 
                                                    onClick={() => setAdminDropdownOpen(prev => !prev)}
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 outline-none transition-all flex items-center justify-between cursor-pointer select-none relative"
                                                >
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                    <span className={`text-sm ${selectedAdminDetails ? 'text-gray-900 font-medium' : 'text-gray-400 font-medium'}`}>
                                                        {selectedAdminDetails 
                                                            ? `${selectedAdminDetails.fullName} (${selectedAdminDetails.email})` 
                                                            : 'Choose Admin'}
                                                    </span>
                                                    <ChevronDown className={`text-gray-400 transition-transform duration-200 ${adminDropdownOpen ? 'rotate-180' : ''}`} size={18} />
                                                </div>

                                                {/* Dropdown panel */}
                                                <AnimatePresence>
                                                    {adminDropdownOpen && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            transition={{ duration: 0.15 }}
                                                            className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-[60] p-4 flex flex-col space-y-3"
                                                        >
                                                            {/* Search field */}
                                                            <div className="relative">
                                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search by name or email..."
                                                                    value={adminSearch}
                                                                    onChange={(e) => {
                                                                        setAdminSearch(e.target.value);
                                                                        setAdminPage(1); // Reset to page 1 on search
                                                                    }}
                                                                    onClick={(e) => e.stopPropagation()} // Stop closing dropdown on click
                                                                    className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none text-xs font-semibold"
                                                                />
                                                                {adminSearch && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setAdminSearch('');
                                                                            setAdminPage(1);
                                                                        }}
                                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {/* Paginated Options List */}
                                                            <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                                                <div 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setFormData(p => ({ ...p, adminId: '' }));
                                                                        setAdminDropdownOpen(false);
                                                                    }}
                                                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all cursor-pointer font-medium ${!formData.adminId ? 'bg-emerald-50/70 text-emerald-700 font-semibold border-l-2 border-emerald-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
                                                                >
                                                                    Choose Admin (None)
                                                                </div>

                                                                {paginatedAdmins.length === 0 ? (
                                                                    <div className="text-center py-4 text-xs text-gray-400 font-medium">
                                                                        No admins match your search.
                                                                    </div>
                                                                ) : (
                                                                    paginatedAdmins.map(admin => {
                                                                        const isSelected = formData.adminId === admin._id;
                                                                        return (
                                                                            <div
                                                                                key={admin._id}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setFormData(p => ({ ...p, adminId: admin._id }));
                                                                                    setAdminDropdownOpen(false);
                                                                                }}
                                                                                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all cursor-pointer font-medium ${isSelected ? 'bg-emerald-50/70 text-emerald-700 font-semibold border-l-2 border-emerald-600' : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'}`}
                                                                            >
                                                                                {admin.fullName} ({admin.email})
                                                                            </div>
                                                                        );
                                                                    })
                                                                )}
                                                            </div>

                                                            {/* Pagination controls */}
                                                            {totalAdminPages > 1 && (
                                                                <div className="flex items-center justify-between border-t pt-3 border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest select-none">
                                                                    <button
                                                                        type="button"
                                                                        disabled={adminPage === 1}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setAdminPage(p => Math.max(1, p - 1));
                                                                        }}
                                                                        className="px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-gray-50 transition-all flex items-center gap-0.5 text-gray-600 border border-gray-100 cursor-pointer"
                                                                    >
                                                                        <ChevronLeft size={12} />
                                                                        Prev
                                                                    </button>
                                                                    <span>
                                                                        Page {adminPage} of {totalAdminPages}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        disabled={adminPage === totalAdminPages}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setAdminPage(p => Math.min(totalAdminPages, p + 1));
                                                                        }}
                                                                        className="px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-gray-50 transition-all flex items-center gap-0.5 text-gray-600 border border-gray-100 cursor-pointer"
                                                                    >
                                                                        Next
                                                                        <ChevronRight size={12} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    )}

                                    {/* Campaign Selection for SALARY, REIMBURSEMENT, and BENEFICIARY */}
                                    {(formData.expenseType === 'BENEFICIARY' ||
                                        (formData.expenseType === 'SALARY' && formData.adminId) ||
                                        (formData.expenseType === 'REIMBURSEMENT' && (formData.adminId || formData.volunteerId))
                                    ) && (
                                            <div ref={campaignRef} className="relative">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                                    Select Campaign {formData.expenseType !== 'BENEFICIARY' && '(Optional)'}
                                                </label>
                                                
                                                {/* Hidden input for HTML5 form validation */}
                                                <input
                                                    type="text"
                                                    required={formData.expenseType === 'BENEFICIARY'}
                                                    value={formData.campaignId}
                                                    onChange={() => {}}
                                                    className="absolute w-0 h-0 opacity-0 pointer-events-none"
                                                />

                                                <div 
                                                    onClick={() => setCampaignDropdownOpen(prev => !prev)}
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 outline-none transition-all flex items-center justify-between cursor-pointer select-none relative"
                                                >
                                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                    <span className={`text-sm ${selectedCampaignDetails ? 'text-gray-900 font-medium' : 'text-gray-400 font-medium'}`}>
                                                        {selectedCampaignDetails ? selectedCampaignDetails.title : 'Choose Campaign'}
                                                    </span>
                                                    <ChevronDown className={`text-gray-400 transition-transform duration-200 ${campaignDropdownOpen ? 'rotate-180' : ''}`} size={18} />
                                                </div>

                                                {/* Dropdown panel */}
                                                <AnimatePresence>
                                                    {campaignDropdownOpen && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            transition={{ duration: 0.15 }}
                                                            className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-[60] p-4 flex flex-col space-y-3"
                                                        >
                                                            {/* Search field */}
                                                            <div className="relative">
                                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search campaigns..."
                                                                    value={campaignSearch}
                                                                    onChange={(e) => {
                                                                        setCampaignSearch(e.target.value);
                                                                        setCampaignPage(1); // Reset to page 1 on search
                                                                    }}
                                                                    onClick={(e) => e.stopPropagation()} // Stop closing dropdown on click
                                                                    className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none text-xs font-semibold"
                                                                />
                                                                {campaignSearch && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setCampaignSearch('');
                                                                            setCampaignPage(1);
                                                                        }}
                                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {/* Paginated Options List */}
                                                            <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                                                <div 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setFormData(p => ({ ...p, campaignId: '' }));
                                                                        setCampaignDropdownOpen(false);
                                                                    }}
                                                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all cursor-pointer font-medium ${!formData.campaignId ? 'bg-emerald-50/70 text-emerald-700 font-semibold border-l-2 border-emerald-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
                                                                >
                                                                    Choose Campaign (None)
                                                                </div>

                                                                {paginatedCampaigns.length === 0 ? (
                                                                    <div className="text-center py-4 text-xs text-gray-400 font-medium">
                                                                        No campaigns match your search.
                                                                    </div>
                                                                ) : (
                                                                    paginatedCampaigns.map(campaign => {
                                                                        const isSelected = formData.campaignId === campaign._id;
                                                                        return (
                                                                            <div
                                                                                key={campaign._id}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setFormData(p => ({ ...p, campaignId: campaign._id }));
                                                                                    setCampaignDropdownOpen(false);
                                                                                }}
                                                                                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all cursor-pointer font-medium ${isSelected ? 'bg-emerald-50/70 text-emerald-700 font-semibold border-l-2 border-emerald-600' : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'}`}
                                                                            >
                                                                                {campaign.title}
                                                                            </div>
                                                                        );
                                                                    })
                                                                )}
                                                            </div>

                                                            {/* Pagination controls */}
                                                            {totalCampaignPages > 1 && (
                                                                <div className="flex items-center justify-between border-t pt-3 border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest select-none">
                                                                    <button
                                                                        type="button"
                                                                        disabled={campaignPage === 1}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setCampaignPage(p => Math.max(1, p - 1));
                                                                        }}
                                                                        className="px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-gray-50 transition-all flex items-center gap-0.5 text-gray-600 border border-gray-100 cursor-pointer"
                                                                    >
                                                                        <ChevronLeft size={12} />
                                                                        Prev
                                                                    </button>
                                                                    <span>
                                                                        Page {campaignPage} of {totalCampaignPages}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        disabled={campaignPage === totalCampaignPages}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setCampaignPage(p => Math.min(totalCampaignPages, p + 1));
                                                                        }}
                                                                        className="px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-gray-50 transition-all flex items-center gap-0.5 text-gray-600 border border-gray-100 cursor-pointer"
                                                                    >
                                                                        Next
                                                                        <ChevronRight size={12} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}

                                    {formData.expenseType === 'PURCHASE' && (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Link Purchase *</label>
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        setPurchaseFormData({
                                                            vendorId: '',
                                                            purchaseDate: new Date().toISOString().split('T')[0],
                                                            paymentStatus: 'PENDING',
                                                            proofFile: null,
                                                            lineItems: []
                                                        });
                                                        setShowAddPurchaseModal(true);
                                                    }}
                                                    className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                                                >
                                                    <Plus size={10} />
                                                    Add New Purchase
                                                </button>
                                            </div>
                                            <div ref={purchaseRef} className="relative">
                                                {/* Hidden input for HTML5 form validation */}
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.purchaseId}
                                                    onChange={() => {}}
                                                    className="absolute w-0 h-0 opacity-0 pointer-events-none"
                                                />

                                                <div 
                                                    onClick={() => setPurchaseDropdownOpen(prev => !prev)}
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 outline-none transition-all flex items-center justify-between cursor-pointer select-none relative"
                                                >
                                                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                    <span className={`text-sm ${selectedPurchaseDetails ? 'text-gray-900 font-medium' : 'text-gray-400 font-medium'}`}>
                                                        {selectedPurchaseDetails 
                                                            ? `${selectedPurchaseDetails.vendorId?.fullName || 'Unknown Vendor'} - ₹${selectedPurchaseDetails.totalAmount}` 
                                                            : 'Choose Purchase'}
                                                    </span>
                                                    <ChevronDown className={`text-gray-400 transition-transform duration-200 ${purchaseDropdownOpen ? 'rotate-180' : ''}`} size={18} />
                                                </div>

                                                {/* Dropdown panel */}
                                                <AnimatePresence>
                                                    {purchaseDropdownOpen && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            transition={{ duration: 0.15 }}
                                                            className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-[60] p-4 flex flex-col space-y-3"
                                                        >
                                                            {/* Search field */}
                                                            <div className="relative">
                                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search by vendor name or amount..."
                                                                    value={purchaseSearch}
                                                                    onChange={(e) => {
                                                                        setPurchaseSearch(e.target.value);
                                                                        setPurchasePage(1); // Reset to page 1 on search
                                                                    }}
                                                                    onClick={(e) => e.stopPropagation()} // Stop closing dropdown on click
                                                                    className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none text-xs font-semibold"
                                                                />
                                                                {purchaseSearch && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setPurchaseSearch('');
                                                                            setPurchasePage(1);
                                                                        }}
                                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {/* Paginated Options List */}
                                                            <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                                                <div 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setFormData(p => ({ ...p, purchaseId: '' }));
                                                                        setPurchaseDropdownOpen(false);
                                                                    }}
                                                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all cursor-pointer font-medium ${!formData.purchaseId ? 'bg-emerald-50/70 text-emerald-700 font-semibold border-l-2 border-emerald-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
                                                                >
                                                                    Choose Purchase (None)
                                                                </div>

                                                                {paginatedPurchases.length === 0 ? (
                                                                    <div className="text-center py-4 text-xs text-gray-400 font-medium">
                                                                        No purchases match your search.
                                                                    </div>
                                                                ) : (
                                                                    paginatedPurchases.map(purchase => {
                                                                        const isSelected = formData.purchaseId === purchase._id;
                                                                        return (
                                                                            <div
                                                                                key={purchase._id}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setFormData(p => ({ ...p, purchaseId: purchase._id }));
                                                                                    setPurchaseDropdownOpen(false);
                                                                                }}
                                                                                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all cursor-pointer font-medium ${isSelected ? 'bg-emerald-50/70 text-emerald-700 font-semibold border-l-2 border-emerald-600' : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'}`}
                                                                            >
                                                                                {purchase.vendorId?.fullName || 'Unknown Vendor'} - ₹{purchase.totalAmount}
                                                                            </div>
                                                                        );
                                                                    })
                                                                )}
                                                            </div>

                                                            {/* Pagination controls */}
                                                            {totalPurchasePages > 1 && (
                                                                <div className="flex items-center justify-between border-t pt-3 border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest select-none">
                                                                    <button
                                                                        type="button"
                                                                        disabled={purchasePage === 1}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setPurchasePage(p => Math.max(1, p - 1));
                                                                        }}
                                                                        className="px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-gray-50 transition-all flex items-center gap-0.5 text-gray-600 border border-gray-100 cursor-pointer"
                                                                    >
                                                                        <ChevronLeft size={12} />
                                                                        Prev
                                                                    </button>
                                                                    <span>
                                                                        Page {purchasePage} of {totalPurchasePages}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        disabled={purchasePage === totalPurchasePages}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setPurchasePage(p => Math.min(totalPurchasePages, p + 1));
                                                                        }}
                                                                        className="px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-gray-50 transition-all flex items-center gap-0.5 text-gray-600 border border-gray-100 cursor-pointer"
                                                                    >
                                                                        Next
                                                                        <ChevronRight size={12} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    )}

                                    {formData.expenseType === 'DOCUMENTATION_SERVICE' && (
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Select Documentation Agreement *</label>
                                            <div ref={agreementRef} className="relative">
                                                {/* Hidden input for HTML5 form validation */}
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.agreementId}
                                                    onChange={() => {}}
                                                    className="absolute w-0 h-0 opacity-0 pointer-events-none"
                                                />

                                                <div 
                                                    onClick={() => setAgreementDropdownOpen(prev => !prev)}
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 outline-none transition-all flex items-center justify-between cursor-pointer select-none relative"
                                                >
                                                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                    <span className={`text-sm ${selectedAgreementDetails ? 'text-gray-900 font-medium' : 'text-gray-400 font-medium'}`}>
                                                        {selectedAgreementDetails 
                                                            ? `${selectedAgreementDetails.title} - ${selectedAgreementDetails.parties?.[0]?.name || 'Unknown'}` 
                                                            : 'Choose Agreement'}
                                                    </span>
                                                    <ChevronDown className={`text-gray-400 transition-transform duration-200 ${agreementDropdownOpen ? 'rotate-180' : ''}`} size={18} />
                                                </div>

                                                {/* Dropdown panel */}
                                                <AnimatePresence>
                                                    {agreementDropdownOpen && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            transition={{ duration: 0.15 }}
                                                            className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-[60] p-4 flex flex-col space-y-3"
                                                        >
                                                            {/* Search field */}
                                                            <div className="relative">
                                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search by title or party name..."
                                                                    value={agreementSearch}
                                                                    onChange={(e) => {
                                                                        setAgreementSearch(e.target.value);
                                                                        setAgreementPage(1); // Reset to page 1 on search
                                                                    }}
                                                                    onClick={(e) => e.stopPropagation()} // Stop closing dropdown on click
                                                                    className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none text-xs font-semibold"
                                                                />
                                                                {agreementSearch && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setAgreementSearch('');
                                                                            setAgreementPage(1);
                                                                        }}
                                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {/* Paginated Options List */}
                                                            <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                                                <div 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setFormData(p => ({ ...p, agreementId: '' }));
                                                                        setAgreementDropdownOpen(false);
                                                                    }}
                                                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all cursor-pointer font-medium ${!formData.agreementId ? 'bg-emerald-50/70 text-emerald-700 font-semibold border-l-2 border-emerald-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
                                                                >
                                                                    Choose Agreement (None)
                                                                </div>

                                                                {paginatedAgreements.length === 0 ? (
                                                                    <div className="text-center py-4 text-xs text-gray-400 font-medium">
                                                                        No agreements match your search.
                                                                    </div>
                                                                ) : (
                                                                    paginatedAgreements.map(agreement => {
                                                                        const isSelected = formData.agreementId === agreement._id;
                                                                        return (
                                                                            <div
                                                                                key={agreement._id}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setFormData(p => ({ ...p, agreementId: agreement._id }));
                                                                                    setAgreementDropdownOpen(false);
                                                                                }}
                                                                                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all cursor-pointer font-medium ${isSelected ? 'bg-emerald-50/70 text-emerald-700 font-semibold border-l-2 border-emerald-600' : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'}`}
                                                                            >
                                                                                {agreement.title} - {agreement.parties?.[0]?.name || 'Unknown'}
                                                                            </div>
                                                                        );
                                                                    })
                                                                )}
                                                            </div>

                                                            {/* Pagination controls */}
                                                            {totalAgreementPages > 1 && (
                                                                <div className="flex items-center justify-between border-t pt-3 border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest select-none">
                                                                    <button
                                                                        type="button"
                                                                        disabled={agreementPage === 1}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setAgreementPage(p => Math.max(1, p - 1));
                                                                        }}
                                                                        className="px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-gray-50 transition-all flex items-center gap-0.5 text-gray-600 border border-gray-100 cursor-pointer"
                                                                    >
                                                                        <ChevronLeft size={12} />
                                                                        Prev
                                                                    </button>
                                                                    <span>
                                                                        Page {agreementPage} of {totalAgreementPages}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        disabled={agreementPage === totalAgreementPages}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setAgreementPage(p => Math.min(totalAgreementPages, p + 1));
                                                                        }}
                                                                        className="px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-gray-50 transition-all flex items-center gap-0.5 text-gray-600 border border-gray-100 cursor-pointer"
                                                                    >
                                                                        Next
                                                                        <ChevronRight size={12} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    )}

                                    {formData.expenseType === 'REIMBURSEMENT' && (
                                        <>
                                            <div>
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Reimbursement To *</label>
                                                <select
                                                    required
                                                    value={formData.reimbursementType}
                                                    onChange={(e) => setFormData(p => ({ ...p, reimbursementType: e.target.value }))}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                                >
                                                    <option value="ADMIN">Admin</option>
                                                    <option value="VOLUNTEER">Volunteer</option>
                                                </select>
                                            </div>

                                            {formData.reimbursementType === 'ADMIN' ? (
                                                <div>
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Select Employee *</label>
                                                    <div ref={adminRef} className="relative">
                                                        {/* Hidden input for HTML5 form validation */}
                                                        <input
                                                            type="text"
                                                            required
                                                            value={formData.adminId}
                                                            onChange={() => {}}
                                                            className="absolute w-0 h-0 opacity-0 pointer-events-none"
                                                        />

                                                        <div 
                                                            onClick={() => setAdminDropdownOpen(prev => !prev)}
                                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 outline-none transition-all flex items-center justify-between cursor-pointer select-none relative"
                                                        >
                                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                            <span className={`text-sm ${selectedAdminDetails ? 'text-gray-900 font-medium' : 'text-gray-400 font-medium'}`}>
                                                                {selectedAdminDetails 
                                                                    ? `${selectedAdminDetails.fullName} (${selectedAdminDetails.email})` 
                                                                    : 'Choose Admin'}
                                                            </span>
                                                            <ChevronDown className={`text-gray-400 transition-transform duration-200 ${adminDropdownOpen ? 'rotate-180' : ''}`} size={18} />
                                                        </div>

                                                        {/* Dropdown panel */}
                                                        <AnimatePresence>
                                                            {adminDropdownOpen && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: -10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: -10 }}
                                                                    transition={{ duration: 0.15 }}
                                                                    className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-[60] p-4 flex flex-col space-y-3"
                                                                >
                                                                    {/* Search field */}
                                                                    <div className="relative">
                                                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Search by name or email..."
                                                                            value={adminSearch}
                                                                            onChange={(e) => {
                                                                                setAdminSearch(e.target.value);
                                                                                setAdminPage(1); // Reset to page 1 on search
                                                                            }}
                                                                            onClick={(e) => e.stopPropagation()} // Stop closing dropdown on click
                                                                            className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none text-xs font-semibold"
                                                                        />
                                                                        {adminSearch && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setAdminSearch('');
                                                                                    setAdminPage(1);
                                                                                }}
                                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                                            >
                                                                                <X size={14} />
                                                                            </button>
                                                                        )}
                                                                    </div>

                                                                    {/* Paginated Options List */}
                                                                    <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                                                        <div 
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setFormData(p => ({ ...p, adminId: '' }));
                                                                                setAdminDropdownOpen(false);
                                                                            }}
                                                                            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all cursor-pointer font-medium ${!formData.adminId ? 'bg-emerald-50/70 text-emerald-700 font-semibold border-l-2 border-emerald-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
                                                                        >
                                                                            Choose Admin (None)
                                                                        </div>

                                                                        {paginatedAdmins.length === 0 ? (
                                                                            <div className="text-center py-4 text-xs text-gray-400 font-medium">
                                                                                No admins match your search.
                                                                            </div>
                                                                        ) : (
                                                                            paginatedAdmins.map(admin => {
                                                                                const isSelected = formData.adminId === admin._id;
                                                                                return (
                                                                                    <div
                                                                                        key={admin._id}
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            setFormData(p => ({ ...p, adminId: admin._id }));
                                                                                            setAdminDropdownOpen(false);
                                                                                        }}
                                                                                        className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all cursor-pointer font-medium ${isSelected ? 'bg-emerald-50/70 text-emerald-700 font-semibold border-l-2 border-emerald-600' : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'}`}
                                                                                    >
                                                                                        {admin.fullName} ({admin.email})
                                                                                    </div>
                                                                                );
                                                                            })
                                                                        )}
                                                                    </div>

                                                                    {/* Pagination controls */}
                                                                    {totalAdminPages > 1 && (
                                                                        <div className="flex items-center justify-between border-t pt-3 border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest select-none">
                                                                            <button
                                                                                type="button"
                                                                                disabled={adminPage === 1}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setAdminPage(p => Math.max(1, p - 1));
                                                                                }}
                                                                                className="px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-gray-50 transition-all flex items-center gap-0.5 text-gray-600 border border-gray-100 cursor-pointer"
                                                                            >
                                                                                <ChevronLeft size={12} />
                                                                                Prev
                                                                            </button>
                                                                            <span>
                                                                                Page {adminPage} of {totalAdminPages}
                                                                            </span>
                                                                            <button
                                                                                type="button"
                                                                                disabled={adminPage === totalAdminPages}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setAdminPage(p => Math.min(totalAdminPages, p + 1));
                                                                                }}
                                                                                className="px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-gray-50 transition-all flex items-center gap-0.5 text-gray-600 border border-gray-100 cursor-pointer"
                                                                            >
                                                                                Next
                                                                                <ChevronRight size={12} />
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div ref={volunteerRef} className="relative">
                                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Select a Volunteer *</label>
                                                        
                                                        {/* Hidden input for HTML5 form validation */}
                                                        <input
                                                            type="text"
                                                            required
                                                            value={formData.volunteerId}
                                                            onChange={() => {}}
                                                            className="absolute w-0 h-0 opacity-0 pointer-events-none"
                                                        />

                                                        <div 
                                                            onClick={() => setVolunteerDropdownOpen(prev => !prev)}
                                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 outline-none transition-all flex items-center justify-between cursor-pointer select-none relative"
                                                        >
                                                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                            <span className={`text-sm ${selectedVolunteerDetails ? 'text-gray-900 font-medium' : 'text-gray-400 font-medium'}`}>
                                                                {selectedVolunteerDetails 
                                                                    ? `${selectedVolunteerDetails.fullName} (${selectedVolunteerDetails.email})` 
                                                                    : 'Choose Volunteer'}
                                                            </span>
                                                            <ChevronDown className={`text-gray-400 transition-transform duration-200 ${volunteerDropdownOpen ? 'rotate-180' : ''}`} size={18} />
                                                        </div>

                                                        {/* Dropdown panel */}
                                                        <AnimatePresence>
                                                            {volunteerDropdownOpen && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: -10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: -10 }}
                                                                    transition={{ duration: 0.15 }}
                                                                    className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-[60] p-4 flex flex-col space-y-3"
                                                                >
                                                                    {/* Search field */}
                                                                    <div className="relative">
                                                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Search by volunteer name or email..."
                                                                            value={volunteerSearch}
                                                                            onChange={(e) => {
                                                                                setVolunteerSearch(e.target.value);
                                                                                setVolunteerPage(1); // Reset to page 1 on search
                                                                            }}
                                                                            onClick={(e) => e.stopPropagation()} // Stop closing dropdown on click
                                                                            className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none text-xs font-semibold"
                                                                        />
                                                                        {volunteerSearch && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setVolunteerSearch('');
                                                                                    setVolunteerPage(1);
                                                                                }}
                                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                                            >
                                                                                <X size={14} />
                                                                            </button>
                                                                        )}
                                                                    </div>

                                                                    {/* Paginated Options List */}
                                                                    <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                                                        <div 
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setFormData(p => ({ ...p, volunteerId: '', voucherId: '', amount: '', description: '' }));
                                                                                setVolunteerDropdownOpen(false);
                                                                            }}
                                                                            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all cursor-pointer font-medium ${!formData.volunteerId ? 'bg-emerald-50/70 text-emerald-700 font-semibold border-l-2 border-emerald-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
                                                                        >
                                                                            Choose Volunteer (None)
                                                                        </div>

                                                                        {paginatedVolunteers.length === 0 ? (
                                                                            <div className="text-center py-4 text-xs text-gray-400 font-medium">
                                                                                No volunteers match your search.
                                                                            </div>
                                                                        ) : (
                                                                            paginatedVolunteers.map(volunteer => {
                                                                                const isSelected = formData.volunteerId === volunteer._id;
                                                                                return (
                                                                                    <div
                                                                                        key={volunteer._id}
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            setFormData(p => ({ ...p, volunteerId: volunteer._id, voucherId: '', amount: '', description: '' }));
                                                                                            setVolunteerDropdownOpen(false);
                                                                                        }}
                                                                                        className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all cursor-pointer font-medium ${isSelected ? 'bg-emerald-50/70 text-emerald-700 font-semibold border-l-2 border-emerald-600' : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'}`}
                                                                                    >
                                                                                        {volunteer.fullName} ({volunteer.email})
                                                                                    </div>
                                                                                );
                                                                            })
                                                                        )}
                                                                    </div>

                                                                    {/* Pagination controls */}
                                                                    {totalVolunteerPages > 1 && (
                                                                        <div className="flex items-center justify-between border-t pt-3 border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest select-none">
                                                                            <button
                                                                                type="button"
                                                                                disabled={volunteerPage === 1}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setVolunteerPage(p => Math.max(1, p - 1));
                                                                                }}
                                                                                className="px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-gray-50 transition-all flex items-center gap-0.5 text-gray-600 border border-gray-100 cursor-pointer"
                                                                            >
                                                                                <ChevronLeft size={12} />
                                                                                Prev
                                                                            </button>
                                                                            <span>
                                                                                Page {volunteerPage} of {totalVolunteerPages}
                                                                            </span>
                                                                            <button
                                                                                type="button"
                                                                                disabled={volunteerPage === totalVolunteerPages}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setVolunteerPage(p => Math.min(totalVolunteerPages, p + 1));
                                                                                }}
                                                                                className="px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-gray-50 transition-all flex items-center gap-0.5 text-gray-600 border border-gray-100 cursor-pointer"
                                                                            >
                                                                                Next
                                                                                <ChevronRight size={12} />
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>

                                                    {formData.volunteerId && (
                                                        <div>
                                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Select a Voucher *</label>
                                                            <div className="relative">
                                                                <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                                <select
                                                                    required
                                                                    value={formData.voucherId}
                                                                    onChange={(e) => {
                                                                        const vId = e.target.value;
                                                                        const selectedV = approvedVouchers.find(v => v._id === vId);
                                                                        setFormData(p => ({
                                                                            ...p,
                                                                            voucherId: vId,
                                                                            amount: selectedV?.amount || '',
                                                                            description: selectedV?.description || ''
                                                                        }));
                                                                    }}
                                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                                                >
                                                                    <option value="">Choose Approved Voucher</option>
                                                                    {approvedVouchers.map(v => (
                                                                        <option key={v._id} value={v._id}>
                                                                            #{v._id.slice(-6).toUpperCase()} - ₹{v.amount} ({v.description})
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            {approvedVouchers.length === 0 && (
                                                                <p className="text-xs text-orange-500 mt-1">No approved and pending vouchers found for this volunteer.</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Optional Vendor */}
                                    {(formData.expenseType === 'OPERATIONAL' || formData.expenseType === 'OTHER') && (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vendor (Optional)</label>
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        setVendorFormData({
                                                            fullName: '',
                                                            contactNumber: '',
                                                            vendorGST: '',
                                                            state: '',
                                                            city: '',
                                                            fullAddress: '',
                                                            status: 'ACTIVE'
                                                        });
                                                        setShowAddVendorModal(true);
                                                    }}
                                                    className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                                                >
                                                    <Plus size={10} />
                                                    Add New Vendor
                                                </button>
                                            </div>
                                            <div ref={vendorRef} className="relative">
                                                {/* Hidden input for HTML5 form validation */}
                                                <input
                                                    type="text"
                                                    value={formData.vendorId}
                                                    onChange={() => {}}
                                                    className="absolute w-0 h-0 opacity-0 pointer-events-none"
                                                />

                                                <div 
                                                    onClick={() => setVendorDropdownOpen(prev => !prev)}
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 outline-none transition-all flex items-center justify-between cursor-pointer select-none relative"
                                                >
                                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                    <span className={`text-sm ${selectedVendorDetails ? 'text-gray-900 font-medium' : 'text-gray-400 font-medium'}`}>
                                                        {selectedVendorDetails 
                                                            ? selectedVendorDetails.fullName 
                                                            : 'Choose Vendor'}
                                                    </span>
                                                    <ChevronDown className={`text-gray-400 transition-transform duration-200 ${vendorDropdownOpen ? 'rotate-180' : ''}`} size={18} />
                                                </div>

                                                {/* Dropdown panel */}
                                                <AnimatePresence>
                                                    {vendorDropdownOpen && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            transition={{ duration: 0.15 }}
                                                            className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-[60] p-4 flex flex-col space-y-3"
                                                        >
                                                            {/* Search field */}
                                                            <div className="relative">
                                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search by vendor name or contact number..."
                                                                    value={vendorSearch}
                                                                    onChange={(e) => {
                                                                        setVendorSearch(e.target.value);
                                                                        setVendorPage(1); // Reset to page 1 on search
                                                                    }}
                                                                    onClick={(e) => e.stopPropagation()} // Stop closing dropdown on click
                                                                    className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none text-xs font-semibold"
                                                                />
                                                                {vendorSearch && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setVendorSearch('');
                                                                            setVendorPage(1);
                                                                        }}
                                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {/* Paginated Options List */}
                                                            <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                                                <div 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setFormData(p => ({ ...p, vendorId: '' }));
                                                                        setVendorDropdownOpen(false);
                                                                    }}
                                                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all cursor-pointer font-medium ${!formData.vendorId ? 'bg-emerald-50/70 text-emerald-700 font-semibold border-l-2 border-emerald-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
                                                                >
                                                                    Choose Vendor (None)
                                                                </div>

                                                                {paginatedVendors.length === 0 ? (
                                                                    <div className="text-center py-4 text-xs text-gray-400 font-medium">
                                                                        No vendors match your search.
                                                                    </div>
                                                                ) : (
                                                                    paginatedVendors.map(vendor => {
                                                                        const isSelected = formData.vendorId === vendor._id;
                                                                        return (
                                                                            <div
                                                                                key={vendor._id}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setFormData(p => ({ ...p, vendorId: vendor._id }));
                                                                                    setVendorDropdownOpen(false);
                                                                                }}
                                                                                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all cursor-pointer font-medium ${isSelected ? 'bg-emerald-50/70 text-emerald-700 font-semibold border-l-2 border-emerald-600' : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'}`}
                                                                            >
                                                                                {vendor.fullName}
                                                                            </div>
                                                                        );
                                                                    })
                                                                )}
                                                            </div>

                                                            {/* Pagination controls */}
                                                            {totalVendorPages > 1 && (
                                                                <div className="flex items-center justify-between border-t pt-3 border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest select-none">
                                                                    <button
                                                                        type="button"
                                                                        disabled={vendorPage === 1}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setVendorPage(p => Math.max(1, p - 1));
                                                                        }}
                                                                        className="px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-gray-50 transition-all flex items-center gap-0.5 text-gray-600 border border-gray-100 cursor-pointer"
                                                                    >
                                                                        <ChevronLeft size={12} />
                                                                        Prev
                                                                    </button>
                                                                    <span>
                                                                        Page {vendorPage} of {totalVendorPages}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        disabled={vendorPage === totalVendorPages}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setVendorPage(p => Math.min(totalVendorPages, p + 1));
                                                                        }}
                                                                        className="px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-gray-50 transition-all flex items-center gap-0.5 text-gray-600 border border-gray-100 cursor-pointer"
                                                                    >
                                                                        Next
                                                                        <ChevronRight size={12} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    )}

                                    {/* Transaction ID */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Transaction ID (Optional)</label>
                                        <input
                                            type="text"
                                            value={formData.transactionId}
                                            onChange={(e) => setFormData(p => ({ ...p, transactionId: e.target.value }))}
                                            placeholder="e.g., TXN123456"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Additional Notes</label>
                                        <textarea
                                            rows="2"
                                            value={formData.notes}
                                            onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                                            placeholder="Any additional information..."
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                                        ></textarea>
                                    </div>

                                    {/* Proof Upload */}
                                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 border-dashed">
                                        <label className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 block">Upload Proof (Optional)</label>
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) => setFormData(p => ({ ...p, proofFile: e.target.files[0] }))}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="p-6 border-t border-gray-100 bg-gray-50/50 shrink-0">
                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        {isCreating ? <Loader2 className="animate-spin" size={20} /> : 'Save Expense Entry'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Sub-Modal: Add New Purchase */}
            <AnimatePresence>
                {showAddPurchaseModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddPurchaseModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">New Purchase Entry</h2>
                                    <p className="text-sm text-gray-500">Record procurement for this expense</p>
                                </div>
                                <button onClick={() => setShowAddPurchaseModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
                            </div>

                            <form onSubmit={handleCreatePurchaseSubmit} className="flex flex-col flex-1 overflow-hidden">
                                <div className="p-8 space-y-6 overflow-y-auto flex-1">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Vendor *</label>
                                            <select required value={purchaseFormData.vendorId} onChange={(e) => setPurchaseFormData(p => ({ ...p, vendorId: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none appearance-none font-medium">
                                                <option value="">Select Vendor</option>
                                                {vendors.map(v => <option key={v._id} value={v._id}>{v.fullName}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Date *</label>
                                            <input type="date" required value={purchaseFormData.purchaseDate} onChange={(e) => setPurchaseFormData(p => ({ ...p, purchaseDate: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none font-medium" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Status *</label>
                                            <select required value={purchaseFormData.paymentStatus} onChange={(e) => setPurchaseFormData(p => ({ ...p, paymentStatus: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none appearance-none font-medium">
                                                <option value="PENDING">Pending</option>
                                                <option value="PAID">Paid</option>
                                                <option value="PARTIALLY_PAID">Partial</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-3 border-b pb-2 border-gray-100">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Line Items</label>
                                            <button type="button" onClick={addLineItem} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"><Plus size={14} /> Add Item</button>
                                        </div>
                                        <div className="space-y-3">
                                            {purchaseFormData.lineItems.map((line, idx) => (
                                                <div key={idx} className="flex gap-3 items-start">
                                                    <div className="flex-1">
                                                        <select required value={line.itemId} onChange={(e) => updateLineItem(idx, 'itemId', e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 outline-none text-sm font-medium">
                                                            <option value="">Choose item...</option>
                                                            {items.map(item => <option key={item._id} value={item._id}>{item.name} ({item.itemType})</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="w-24">
                                                        <input type="number" min="1" required value={line.qty} onChange={(e) => updateLineItem(idx, 'qty', e.target.value)} placeholder="Qty" className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 outline-none text-sm text-center font-bold" />
                                                    </div>
                                                    <div className="w-32">
                                                        <input type="number" min="0" required value={line.price} onChange={(e) => updateLineItem(idx, 'price', e.target.value)} placeholder="Price" className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 outline-none text-sm font-bold" />
                                                    </div>
                                                    <button type="button" onClick={() => removeLineItem(idx)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 border-dashed">
                                        <label className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 block">Invoice / Bill Copy</label>
                                        <input type="file" accept="image/*,.pdf" onChange={(e) => setPurchaseFormData(p => ({ ...p, proofFile: e.target.files[0] }))} className="block w-full text-xs text-gray-500 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:bg-emerald-100 file:text-emerald-700 font-bold" />
                                    </div>
                                </div>

                                <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm font-bold text-gray-400 uppercase">Estimated Total</span>
                                        <span className="text-2xl font-black text-gray-900">₹{purchaseFormData.lineItems.reduce((sum, item) => sum + (Number(item.qty) * Number(item.price)), 0).toLocaleString()}</span>
                                    </div>
                                    <button type="submit" disabled={isCreatingPurchase} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2">
                                        {isCreatingPurchase ? <Loader2 className="animate-spin" size={20} /> : 'Save Purchase Entry'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Sub-Modal: Add New Vendor */}
            <AnimatePresence>
                {showAddVendorModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddVendorModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
                            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Add New Vendor</h2>
                                    <p className="text-sm text-gray-500">Supplier information for procurement</p>
                                </div>
                                <button onClick={() => setShowAddVendorModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
                            </div>

                            <div className="p-8 space-y-5 overflow-y-auto flex-1">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Vendor Name *</label>
                                        <input required value={vendorFormData.fullName} onChange={(e) => setVendorFormData(prev => ({ ...prev, fullName: e.target.value }))} type="text" placeholder="e.g. MedPlus Essentials" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Vendor Type *</label>
                                        <select
                                            value={vendorFormData.vendorType}
                                            onChange={(e) => setVendorFormData(prev => ({ ...prev, vendorType: e.target.value }))}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        >
                                            <option value="NORMAL">Normal Vendor</option>
                                            <option value="INDIVIDUAL">Individual Vendor</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Contact Number *</label>
                                        <input required value={vendorFormData.contactNumber} onChange={(e) => setVendorFormData(prev => ({ ...prev, contactNumber: e.target.value }))} type="tel" placeholder="10-digit number" maxLength={10} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">ID Document Type *</label>
                                        <select
                                            value={vendorIdType}
                                            onChange={(e) => {
                                                setVendorIdType(e.target.value);
                                                setVendorFormData(prev => ({ ...prev, vendorGST: '' }));
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        >
                                            <option value="GST">GST</option>
                                            <option value="PAN">PAN Card</option>
                                            <option value="AADHAAR">Aadhaar Card</option>
                                            <option value="OTHERS">Others</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                        {vendorIdType === 'OTHERS' ? 'ID' : vendorIdType} Number *
                                    </label>
                                    <input
                                        required
                                        value={vendorFormData.vendorGST}
                                        onChange={(e) => {
                                            let val = e.target.value;
                                            if (vendorIdType === 'AADHAAR') {
                                                val = val.replace(/\D/g, ''); // Digits only
                                            }
                                            setVendorFormData(prev => ({ ...prev, vendorGST: val }));
                                        }}
                                        type="text"
                                        placeholder={
                                            vendorIdType === 'GST' ? "15-char GSTIN" :
                                            vendorIdType === 'PAN' ? "10-char PAN (ABCDE1234F)" :
                                            vendorIdType === 'AADHAAR' ? "12-digit Aadhaar" :
                                            "Enter Document ID"
                                        }
                                        maxLength={
                                            vendorIdType === 'GST' ? 15 :
                                            vendorIdType === 'PAN' ? 10 :
                                            vendorIdType === 'AADHAAR' ? 12 :
                                            30
                                        }
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all uppercase"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">State *</label>
                                        <select required value={vendorFormData.state} onChange={(e) => { const newState = e.target.value; setVendorFormData(prev => ({ ...prev, state: newState, city: '' })); if (newState) triggerGetCities(newState); }} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none">
                                            <option value="">Select State</option>
                                            {states.map(state => <option key={state} value={state}>{state}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">City *</label>
                                        <select required disabled={!vendorFormData.state || isLoadingCities} value={vendorFormData.city} onChange={(e) => setVendorFormData(prev => ({ ...prev, city: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none disabled:opacity-50">
                                            <option value="">{isLoadingCities ? 'Loading cities...' : 'Select City'}</option>
                                            {apiCities ? apiCities.map(city => <option key={city} value={city}>{city}</option>) : vendorFormData.state && INDIAN_LOCATIONS[vendorFormData.state] && INDIAN_LOCATIONS[vendorFormData.state].map(city => <option key={city} value={city}>{city}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Full Address *</label>
                                    <textarea required value={vendorFormData.fullAddress} onChange={(e) => setVendorFormData(prev => ({ ...prev, fullAddress: e.target.value }))} rows={3} placeholder="Enter complete office address..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none" />
                                </div>

                                <button onClick={handleCreateVendorSubmit} disabled={isCreatingVendor} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-[0.98] mt-4 flex items-center justify-center gap-2">
                                    {isCreatingVendor ? <Loader2 className="animate-spin" size={18} /> : 'Save Vendor'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
