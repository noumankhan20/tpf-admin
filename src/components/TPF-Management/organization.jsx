"use client";
import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Building2, ShieldCheck, CheckCircle, Clock, Filter, Tag, MapPin, MapPinned, X, ChevronDown, Printer, ExternalLink } from 'lucide-react';
import { useGetAllOrganizationsQuery, useGetOrganizationByIdQuery, useGetOrganizationStatsQuery, useUpdateOrganizationVerificationStatusMutation } from '@/utils/slices/organizationApiSlice';
import { toast } from 'react-toastify';
import { toTitleCase, formatFieldValue } from '@/utils/formatters';
import { PrintableOrganizationForm } from '../Admin/Organization/components/PrintableOrganizationForm';
import { Badge } from '../Admin/Organization/components/Badge';
import { getMediaUrl } from '@/utils/media';

export default function OrganizationModule() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedOrgId, setSelectedOrgId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedType, setSelectedType] = useState("all");
    const [selectedState, setSelectedState] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const queryParams = {
        page: currentPage,
        limit: 10,
        search: debouncedSearch,
        ...(selectedStatus !== 'all' ? { verificationStatus: selectedStatus } : {})
    };

    const { data: allOrgsData, isLoading: isLoadingAll, error: errorAll } = useGetAllOrganizationsQuery(queryParams);
    const { data: statsData, isLoading: isLoadingStats } = useGetOrganizationStatsQuery();
    const { data: orgDetailsResponse, isLoading: isLoadingDetails, error: errorDetails } = useGetOrganizationByIdQuery(
        selectedOrgId,
        { skip: !selectedOrgId }
    );

    const [verifyOrg] = useUpdateOrganizationVerificationStatusMutation();

    const handleVerify = async (status) => {
        try {
            await verifyOrg({ id: selectedOrgId, verificationStatus: status, verificationNotes: `Status updated to ${status}` }).unwrap();
            toast.success(`Organization marked as ${status}`);
        } catch (err) {
            toast.error('Failed to update organization status');
        }
    };

    const organizations = allOrgsData?.data || [];
    const totalPages = allOrgsData?.totalPages || 1;

    // Extract unique values for dynamic filters
    const availableStates = [...new Set(organizations.map(org => org.state).filter(Boolean))].sort();
    const availableCities = [...new Set(organizations.map(org => org.city).filter(Boolean))].sort();

    // Local Filtering for robust UI
    const filteredOrganizations = organizations.filter(org => {
        const matchesType = selectedType === 'all' ||
            (selectedType === 'ngo' && org.isNGO) ||
            (selectedType === 'corporate' && !org.isNGO);
        const matchesState = !selectedState || org.state === selectedState;
        const matchesCity = !selectedCity || org.city === selectedCity;
        return matchesType && matchesState && matchesCity;
    });

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedStatus("all");
        setSelectedType("all");
        setSelectedState("");
        setSelectedCity("");
        setCurrentPage(1);
    };

    const stats = statsData?.data || {};
    const totalCount = stats.totalCount?.[0]?.count || 0;
    const verifiedCount = stats.byVerificationStatus?.find(s => s._id === 'verified')?.count || 0;
    const pendingCount = stats.byVerificationStatus?.find(s => s._id === 'pending')?.count || 0;
    const ngoCount = stats.byType?.find(t => t._id === true)?.count || 0;

    const handleBackClick = () => {
        if (selectedOrgId) {
            setSelectedOrgId(null);
        } else {
            window.location.href = '/select-portal';
        }
    };

    if (isLoadingAll || isLoadingStats) {
        return (
            <div className="min-h-screen bg-slate-50/60 p-6 flex items-center justify-center">
                <div className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                    Loading organizations...
                </div>
            </div>
        );
    }

    if (errorAll) {
        return (
            <div className="min-h-screen bg-slate-50/60 p-6 flex items-center justify-center">
                <div className="text-sm font-semibold text-rose-600 bg-rose-50 px-4 py-3 rounded-lg border border-rose-200/80">
                    Error loading organizations data. Please try again.
                </div>
            </div>
        );
    }

    if (selectedOrgId) {
        if (isLoadingDetails) {
            return (
                <div className="min-h-screen bg-slate-50/60 p-6 flex items-center justify-center">
                    <div className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                        Loading organization details...
                    </div>
                </div>
            );
        }
        if (errorDetails) {
            return (
                <div className="min-h-screen bg-slate-50/60 p-6 flex items-center justify-center">
                    <div className="text-sm font-semibold text-rose-600 bg-rose-50 px-4 py-3 rounded-lg border border-rose-200/80">
                        Error loading organization details. Please try again.
                    </div>
                </div>
            );
        }

        const orgInfo = orgDetailsResponse?.data;
        if (!orgInfo) return null;

        return (
            <>
                <PrintableOrganizationForm org={orgInfo} />
                <div className="min-h-screen bg-[#f7f8fa] py-8 px-6 no-print font-sans">
                    <div className="max-w-5xl mx-auto space-y-6">
                        
                        {/* Profile Workspace Container */}
                        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                            
                            {/* Organization Dossier Header */}
                            <div className="p-8 border-b border-slate-100 bg-white">
                                <div className="flex items-center justify-between mb-6">
                                    <button
                                        onClick={handleBackClick}
                                        className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-900 transition cursor-pointer"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                                        Back to directory
                                    </button>
                                    
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => window.print()}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200/80 rounded-lg text-xs font-medium transition cursor-pointer"
                                            title="Print official application form"
                                        >
                                            <Printer size={13} />
                                            <span>Print official form</span>
                                        </button>
                                        <Badge status={orgInfo.verificationStatus} />
                                    </div>
                                </div>

                                {/* Identity Block */}
                                <div className="flex items-start gap-5">
                                    {orgInfo.organizationLogo ? (
                                        <img
                                            src={getMediaUrl(orgInfo.organizationLogo)}
                                            alt="Organization Logo"
                                            className="w-14 h-14 rounded-xl object-contain border border-slate-200 shrink-0 p-1 bg-white"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center font-semibold text-xl shrink-0">
                                            {orgInfo.organizationName ? orgInfo.organizationName.charAt(0).toUpperCase() : 'O'}
                                        </div>
                                    )}
                                    <div>
                                        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight leading-snug">
                                            {toTitleCase(orgInfo.organizationName)}
                                        </h1>
                                        <div className="flex items-center gap-2 text-sm text-slate-500 font-normal mt-1">
                                            <span>{orgInfo.isNGO ? 'NGO / Non-profit' : 'Corporate (For-profit)'}</span>
                                            {(orgInfo.city || orgInfo.state) && (
                                                <>
                                                    <span>·</span>
                                                    <span>{toTitleCase(orgInfo.city || '')}{orgInfo.state ? `, ${toTitleCase(orgInfo.state)}` : ''}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Dossier Body */}
                            <div className="p-8 space-y-8">
                                
                                {/* 1. Organization Snapshot */}
                                <div>
                                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                                        Organization snapshot
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs">
                                        <div>
                                            <p className="text-xs font-medium text-slate-500 mb-0.5">Official organization email</p>
                                            <p className="text-sm font-normal text-slate-900">{orgInfo.organizationEmail || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-slate-500 mb-0.5">Official website</p>
                                            {orgInfo.officialWebsite ? (
                                                <a
                                                    href={orgInfo.officialWebsite.startsWith('http') ? orgInfo.officialWebsite : `https://${orgInfo.officialWebsite}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm font-medium text-blue-600 hover:underline inline-flex items-center gap-1"
                                                >
                                                    {orgInfo.officialWebsite}
                                                    <ExternalLink size={11} />
                                                </a>
                                            ) : (
                                                <p className="text-sm font-normal text-slate-400">N/A</p>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-slate-500 mb-0.5">Registered location</p>
                                            <p className="text-sm font-normal text-slate-900">{toTitleCase(orgInfo.city || '')}, {toTitleCase(orgInfo.state || '')}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-slate-500 mb-0.5">Registration date</p>
                                            <p className="text-sm font-normal text-slate-900">{new Date(orgInfo.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. About the Organization */}
                                {orgInfo.organizationDescription && (
                                    <div className="pt-6 border-t border-slate-100">
                                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                                            About the organization
                                        </h3>
                                        <p className="text-sm font-normal text-slate-700 leading-relaxed max-w-3xl whitespace-pre-wrap">
                                            {orgInfo.organizationDescription}
                                        </p>
                                    </div>
                                )}

                                {/* 3. Primary Contact Person */}
                                <div className="pt-6 border-t border-slate-100">
                                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                                        Primary contact
                                    </h3>
                                    <div className="mb-4">
                                        <p className="text-base font-semibold text-slate-900">{toTitleCase(orgInfo.contactDetails?.contactName || 'N/A')}</p>
                                        <p className="text-xs font-normal text-slate-500 mt-0.5">{toTitleCase(orgInfo.contactDetails?.designation || 'Primary Representative')}</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs">
                                        <div>
                                            <p className="text-xs font-medium text-slate-500 mb-0.5">Official contact email</p>
                                            <p className="text-sm font-normal text-slate-900">{orgInfo.contactDetails?.contactEmail || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-slate-500 mb-0.5">Mobile number</p>
                                            <p className="text-sm font-normal text-slate-900">{orgInfo.contactDetails?.contactNumber || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* 4. Governance & Operations */}
                                {orgInfo.isNGO ? (
                                    <div className="pt-6 border-t border-slate-100">
                                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                                            NGO compliance & capacity
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-medium text-slate-900">Founder & executive</h4>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium mb-0.5">Founder name</p>
                                                    <p className="text-sm font-normal text-slate-900">{orgInfo.ngoDetails?.founderName || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium mb-0.5">Founder email</p>
                                                    <p className="text-sm font-normal text-slate-900">{orgInfo.ngoDetails?.founderEmail || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium mb-0.5">Founder mobile</p>
                                                    <p className="text-sm font-normal text-slate-900">{orgInfo.ngoDetails?.founderMobile || 'N/A'}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="text-xs font-medium text-slate-900">Certifications</h4>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium mb-0.5">80G certification</p>
                                                    <p className="text-sm font-normal text-slate-900">{orgInfo.ngoDetails?.has80G || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium mb-0.5">FCRA certification</p>
                                                    <p className="text-sm font-normal text-slate-900">{orgInfo.ngoDetails?.hasFCRA || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium mb-0.5">PAN card number</p>
                                                    <p className="text-sm font-normal text-slate-900">{formatFieldValue('panCard', orgInfo.ngoDetails?.panCard)}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="text-xs font-medium text-slate-900">Capacity & turnover</h4>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium mb-0.5">Annual turnover</p>
                                                    <p className="text-sm font-normal text-slate-900">{formatFieldValue('turnover', orgInfo.ngoDetails?.annualTurnover || orgInfo.ngoDetails?.annualBudget)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium mb-0.5">Employee count</p>
                                                    <p className="text-sm font-normal text-slate-900">{orgInfo.ngoDetails?.employeeStrength || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium mb-0.5">Volunteer strength</p>
                                                    <p className="text-sm font-normal text-slate-900">{orgInfo.ngoDetails?.volunteerStrength || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="pt-6 border-t border-slate-100">
                                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                                            Corporate governance & business details
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-medium text-slate-900">Director details</h4>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium mb-0.5">Director name</p>
                                                    <p className="text-sm font-normal text-slate-900">{orgInfo.companyDetails?.directorName || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium mb-0.5">Director email</p>
                                                    <p className="text-sm font-normal text-slate-900">{orgInfo.companyDetails?.directorEmail || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium mb-0.5">Director phone</p>
                                                    <p className="text-sm font-normal text-slate-900">{orgInfo.companyDetails?.directorMobile || 'N/A'}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="text-xs font-medium text-slate-900">Business operations</h4>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium mb-0.5">Business domain</p>
                                                    <p className="text-sm font-normal text-slate-900">{toTitleCase(orgInfo.companyDetails?.businessDomain || '') || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium mb-0.5">Employee count</p>
                                                    <p className="text-sm font-normal text-slate-900">{orgInfo.companyDetails?.numberOfEmployees || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium mb-0.5">Years active</p>
                                                    <p className="text-sm font-normal text-slate-900">{orgInfo.companyDetails?.yearsInOperation || 'N/A'}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="text-xs font-medium text-slate-900">Turnover & CSR</h4>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium mb-0.5">Annual turnover</p>
                                                    <p className="text-sm font-normal text-slate-900">{formatFieldValue('turnover', orgInfo.companyDetails?.annualTurnover || orgInfo.companyDetails?.annualRevenue)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium mb-0.5">CSR initiatives</p>
                                                    <p className="text-sm font-normal text-slate-900">{formatFieldValue('csr', orgInfo.companyDetails?.csrInitiatives)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="min-h-screen bg-[#f7f8fa] p-6 font-sans">
            <div className="max-w-[1600px] mx-auto space-y-6">
                
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <button
                            onClick={handleBackClick}
                            className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-800 transition mb-2 cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1.5" />
                            Back to portal selection
                        </button>
                        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Organization directory</h1>
                        <p className="text-xs text-slate-500 font-normal">
                            Search, filter, and inspect registered organizations across the platform.
                        </p>
                    </div>
                </div>

                {/* Quiet Operational Metrics Summary */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    <div className="grid grid-cols-2 lg:grid-cols-4 divide-y divide-x-0 lg:divide-y-0 lg:divide-x divide-slate-100">
                        
                        <div className="p-4 flex flex-col justify-between">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Entities</span>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-2xl font-bold text-slate-900 tracking-tight">{totalCount}</span>
                                <span className="text-xs text-slate-400 font-medium">Directory</span>
                            </div>
                        </div>

                        <div className="p-4 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Verified</span>
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            </div>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-2xl font-bold text-slate-900 tracking-tight">{verifiedCount}</span>
                                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">Approved</span>
                            </div>
                        </div>

                        <div className="p-4 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Verification</span>
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                            </div>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-2xl font-bold text-slate-900 tracking-tight">{pendingCount}</span>
                                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">Review queue</span>
                            </div>
                        </div>

                        <div className="p-4 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">NGO Entities</span>
                                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                            </div>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-2xl font-bold text-slate-900 tracking-tight">{ngoCount}</span>
                                <span className="text-xs text-slate-400 font-medium">Non-profit</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Filter & Table Container */}
                <div className="bg-white rounded-xl shadow-2xs border border-slate-200/80 overflow-hidden">
                    
                    {/* Toolbar Header */}
                    <div className="p-5 border-b border-slate-100 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-bold text-slate-900">Registered Organizations</h2>
                                <p className="text-xs text-slate-500 font-medium">Filtered list of verified, pending, and corporate applications</p>
                            </div>
                        </div>

                        {/* Search & Filters Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                            
                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-10 pr-3.5 py-2 text-xs font-medium border border-slate-200/90 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition font-medium"
                                />
                            </div>

                            {/* Verification Status Filter */}
                            <div className="relative">
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => {
                                        setSelectedStatus(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full appearance-none pl-3.5 pr-8 py-2 text-xs font-semibold border border-slate-200/90 rounded-lg bg-slate-50 text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 transition cursor-pointer"
                                >
                                    <option value="all">All Verification Statuses</option>
                                    <option value="verified">Verified Only</option>
                                    <option value="pending">Pending Only</option>
                                    <option value="rejected">Rejected Only</option>
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>

                            {/* Org Type Filter */}
                            <div className="relative">
                                <select
                                    value={selectedType}
                                    onChange={(e) => {
                                        setSelectedType(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full appearance-none pl-3.5 pr-8 py-2 text-xs font-semibold border border-slate-200/90 rounded-lg bg-slate-50 text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 transition cursor-pointer"
                                >
                                    <option value="all">All Classification Types</option>
                                    <option value="ngo">NGO / Non-Profit</option>
                                    <option value="corporate">Corporate Entity</option>
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>

                            {/* State Filter */}
                            <div className="relative">
                                <select
                                    value={selectedState}
                                    onChange={(e) => {
                                        setSelectedState(e.target.value);
                                        setSelectedCity("");
                                        setCurrentPage(1);
                                    }}
                                    className="w-full appearance-none pl-3.5 pr-8 py-2 text-xs font-semibold border border-slate-200/90 rounded-lg bg-slate-50 text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 transition cursor-pointer disabled:opacity-50"
                                >
                                    <option value="">All States</option>
                                    {availableStates.map(state => (
                                        <option key={state} value={state}>{toTitleCase(state)}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>

                            {/* City Filter */}
                            <div className="relative">
                                <select
                                    value={selectedCity}
                                    onChange={(e) => {
                                        setSelectedCity(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    disabled={!selectedState && availableCities.length === 0}
                                    className="w-full appearance-none pl-3.5 pr-8 py-2 text-xs font-semibold border border-slate-200/90 rounded-lg bg-slate-50 text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 transition cursor-pointer disabled:opacity-50"
                                >
                                    <option value="">All Cities</option>
                                    {availableCities.map(city => (
                                        <option key={city} value={city}>{toTitleCase(city)}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>

                        </div>

                        {/* Counter & Reset Bar */}
                        <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
                            <span className="font-semibold text-slate-600">
                                Showing <strong className="text-slate-900">{filteredOrganizations.length}</strong> matching records
                            </span>
                            <button
                                onClick={clearFilters}
                                className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 transition cursor-pointer font-semibold"
                            >
                                <X size={13} />
                                Reset Filters
                            </button>
                        </div>
                    </div>

                    {/* High Density Enterprise Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    <th className="px-5 py-3">Organization</th>
                                    <th className="px-5 py-3">Location</th>
                                    <th className="px-5 py-3">Type</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {filteredOrganizations.map(org => (
                                    <tr key={org._id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <p className="font-bold text-slate-900">{toTitleCase(org.organizationName)}</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">{org.organizationEmail}</p>
                                        </td>
                                        <td className="px-5 py-3.5 font-medium text-slate-700">
                                            {toTitleCase(org.city || '')}, {toTitleCase(org.state || '')}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                                                org.isNGO ? 'bg-indigo-50 text-indigo-700 border-indigo-200/60' : 'bg-slate-100 text-slate-700 border-slate-200/60'
                                            }`}>
                                                {org.isNGO ? 'NGO / Non-Profit' : 'Corporate'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
                                                org.verificationStatus === 'verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' :
                                                org.verificationStatus === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200/60' : 'bg-rose-50 text-rose-700 border-rose-200/60'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                    org.verificationStatus === 'verified' ? 'bg-emerald-500' :
                                                    org.verificationStatus === 'pending' ? 'bg-amber-500' : 'bg-rose-500'
                                                }`} />
                                                {toTitleCase(org.verificationStatus.replace(/_/g, ' '))}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <button
                                                onClick={() => setSelectedOrgId(org._id)}
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50/60 hover:bg-blue-100/80 px-3 py-1 rounded border border-blue-200/60 transition cursor-pointer"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredOrganizations.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-5 py-12 text-center text-slate-400 font-medium">
                                            No organizations found matching your selected criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {totalPages > 1 && (
                        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>
                                Page <strong className="text-slate-900">{currentPage}</strong> of <strong className="text-slate-900">{totalPages}</strong>
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
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
