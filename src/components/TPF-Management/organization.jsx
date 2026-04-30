"use client";
import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Building2, ShieldCheck, CheckCircle, Clock, Filter, Tag, MapPin, MapPinned, X, ChevronDown } from 'lucide-react';
import { useGetAllOrganizationsQuery, useGetOrganizationByIdQuery, useGetOrganizationStatsQuery, useUpdateOrganizationVerificationStatusMutation } from '@/utils/slices/organizationApiSlice';
import { toast } from 'react-toastify';

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
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-xl text-gray-600">Loading organizations...</div>
            </div>
        );
    }

    if (errorAll) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-xl text-red-600">Error loading organizations data</div>
            </div>
        );
    }

    if (selectedOrgId) {
        if (isLoadingDetails) {
            return (
                <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                    <div className="text-xl text-gray-600">Loading organization details...</div>
                </div>
            );
        }
        if (errorDetails) {
            return (
                <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                    <div className="text-xl text-red-600">Error loading organization details</div>
                </div>
            );
        }

        const orgInfo = orgDetailsResponse?.data;
        if (!orgInfo) return null;

        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <button
                                onClick={handleBackClick}
                                className="flex items-center cursor-pointer text-gray-600 hover:text-gray-900 mb-4"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Back to Organizations
                            </button>
                            <h1 className="text-3xl font-bold text-gray-900">{orgInfo.organizationName}</h1>
                            <p className="text-gray-600 mt-1 capitalize">{orgInfo.isNGO ? 'NGO (Non-profit)' : 'Corporate (For-profit)'}</p>
                        </div>
                        {/* Status & Actions */}
                        <div className="flex flex-col items-end space-y-3">
                            <span className={`px-4 py-2 rounded-lg font-semibold text-sm ${orgInfo.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                                    orgInfo.verificationStatus === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {orgInfo.verificationStatus.toUpperCase()}
                            </span>
                            {/* <div className="flex gap-2">
                                {orgInfo.verificationStatus !== 'verified' && (
                                    <button onClick={() => handleVerify('verified')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer">
                                        Approve
                                    </button>
                                )}
                                {orgInfo.verificationStatus !== 'rejected' && (
                                    <button onClick={() => handleVerify('rejected')} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer">
                                        Reject
                                    </button>
                                )}
                            </div> */}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Primary Details Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-900 border-b pb-2">Primary Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Email Address</p>
                                    <p className="font-semibold text-gray-900">{orgInfo.organizationEmail}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Official Website</p>
                                    <a href={orgInfo.officialWebsite} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">{orgInfo.officialWebsite || 'N/A'}</a>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Location</p>
                                    <p className="font-semibold text-gray-900">{orgInfo.city}, {orgInfo.state}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Description</p>
                                    <p className="font-medium text-gray-800 text-sm mt-1 bg-gray-50 p-3 rounded-lg">{orgInfo.organizationDescription}</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Details Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-900 border-b pb-2">Primary Contact Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Contact Person Name</p>
                                    <p className="font-semibold text-gray-900">{orgInfo.contactDetails?.contactName}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Designation</p>
                                    <p className="font-semibold text-gray-900">{orgInfo.contactDetails?.designation}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Mobile Number</p>
                                    <p className="font-semibold text-gray-900">{orgInfo.contactDetails?.contactNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Contact Email</p>
                                    <p className="font-semibold text-gray-900">{orgInfo.contactDetails?.contactEmail}</p>
                                </div>
                            </div>
                        </div>

                        {/* Sub Details (NGO or Company) */}
                        {orgInfo.isNGO ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-2">
                                <h2 className="text-xl font-semibold mb-4 text-gray-900 border-b pb-2">NGO Specific Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <h3 className="font-bold text-gray-800 mb-2">Founder Details</h3>
                                        <p className="text-sm"><span className="text-gray-500">Name:</span> {orgInfo.ngoDetails?.founderName}</p>
                                        <p className="text-sm mt-1"><span className="text-gray-500">Email:</span> {orgInfo.ngoDetails?.founderEmail}</p>
                                        <p className="text-sm mt-1"><span className="text-gray-500">Phone:</span> {orgInfo.ngoDetails?.founderMobile}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 mb-2">Certifications</h3>
                                        <p className="text-sm"><span className="text-gray-500">80G Status:</span> {orgInfo.ngoDetails?.has80G.toUpperCase()}</p>
                                        <p className="text-sm mt-1"><span className="text-gray-500">FCRA Status:</span> {orgInfo.ngoDetails?.hasFCRA.toUpperCase()}</p>
                                        <p className="text-sm mt-1"><span className="text-gray-500">PAN:</span> {orgInfo.ngoDetails?.panCard || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 mb-2">Operations</h3>
                                        <p className="text-sm"><span className="text-gray-500">Employees:</span> {orgInfo.ngoDetails?.employeeStrength}</p>
                                        <p className="text-sm mt-1"><span className="text-gray-500">Volunteers:</span> {orgInfo.ngoDetails?.volunteerStrength}</p>
                                        <p className="text-sm mt-1 line-clamp-2" title={orgInfo.ngoDetails?.causesSupported?.join(', ')}>
                                            <span className="text-gray-500">Causes:</span> {orgInfo.ngoDetails?.causesSupported?.join(', ')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-2">
                                <h2 className="text-xl font-semibold mb-4 text-gray-900 border-b pb-2">Corporate Specific Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <h3 className="font-bold text-gray-800 mb-2">Director Details</h3>
                                        <p className="text-sm"><span className="text-gray-500">Name:</span> {orgInfo.companyDetails?.directorName}</p>
                                        <p className="text-sm mt-1"><span className="text-gray-500">Email:</span> {orgInfo.companyDetails?.directorEmail}</p>
                                        <p className="text-sm mt-1"><span className="text-gray-500">Phone:</span> {orgInfo.companyDetails?.directorMobile}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 mb-2">Business Details</h3>
                                        <p className="text-sm"><span className="text-gray-500">Domain:</span> {orgInfo.companyDetails?.businessDomain}</p>
                                        <p className="text-sm mt-1"><span className="text-gray-500">Employees:</span> {orgInfo.companyDetails?.numberOfEmployees}</p>
                                        <p className="text-sm mt-1"><span className="text-gray-500">Years Active:</span> {orgInfo.companyDetails?.yearsInOperation}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 mb-2">Revenue & CSR</h3>
                                        <p className="text-sm"><span className="text-gray-500">Annual Revenue:</span> {orgInfo.companyDetails?.annualRevenue}</p>
                                        <p className="text-sm mt-1"><span className="text-gray-500">CSR Interests:</span> {orgInfo.companyDetails?.csrInitiatives}</p>
                                    </div>
                                </div>
                            </div>
                        )}
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
                        Back
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Organization Information</h1>
                    <p className="text-gray-600 mt-1">
                        View detailed stats and manage approved, pending, and rejected organizations.
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Orgs</p>
                                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <Building2 className="w-8 h-8 text-blue-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Verified</p>
                                <p className="text-2xl font-bold text-gray-900">{verifiedCount}</p>
                            </div>
                            <div className="bg-emerald-50 p-3 rounded-lg">
                                <CheckCircle className="w-8 h-8 text-emerald-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Pending</p>
                                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                            </div>
                            <div className="bg-amber-50 p-3 rounded-lg">
                                <Clock className="w-8 h-8 text-amber-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total NGOs</p>
                                <p className="text-2xl font-bold text-gray-900">{ngoCount}</p>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-lg">
                                <ShieldCheck className="w-8 h-8 text-purple-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 tracking-tight">All Organizations</h2>
                            <p className="text-sm text-gray-400 mt-0.5">Manage and view organization entries</p>
                        </div>
                    </div>

                    {/* Advanced Filter Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                            <select
                                value={selectedStatus}
                                onChange={(e) => {
                                    setSelectedStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full appearance-none pl-10 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold cursor-pointer"
                            >
                                <option value="all">All Status</option>
                                <option value="verified">Verified</option>
                                <option value="pending">Pending</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Org Type Filter */}
                        <div className="relative">
                            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                            <select
                                value={selectedType}
                                onChange={(e) => {
                                    setSelectedType(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full appearance-none pl-10 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold cursor-pointer"
                            >
                                <option value="all">All Types</option>
                                <option value="ngo">NGO / Non-profit</option>
                                <option value="corporate">Corporate</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>

                        {/* State Filter */}
                        <div className="relative">
                            <MapPinned className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                            <select
                                value={selectedState}
                                onChange={(e) => {
                                    setSelectedState(e.target.value);
                                    setSelectedCity("");
                                    setCurrentPage(1);
                                }}
                                className="w-full appearance-none pl-10 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold cursor-pointer disabled:opacity-50"
                            >
                                <option value="">All States</option>
                                {availableStates.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>

                        {/* City Filter */}
                        <div className="relative">
                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                            <select
                                value={selectedCity}
                                onChange={(e) => {
                                    setSelectedCity(e.target.value);
                                    setCurrentPage(1);
                                }}
                                disabled={!selectedState && availableCities.length === 0}
                                className="w-full appearance-none pl-10 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold cursor-pointer disabled:opacity-50"
                            >
                                <option value="">All Cities</option>
                                {availableCities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Result Count & Clear */}
                        <div className="xl:col-span-5 flex items-center justify-between border-t border-gray-50 pt-4 mt-2">
                             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
                                <Filter size={12} className="text-blue-500" />
                                {filteredOrganizations.length} Organizations Found
                            </p>
                            <button
                                onClick={clearFilters}
                                className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-red-600 transition-colors uppercase tracking-tight"
                            >
                                <X size={14} />
                                Reset Filters
                            </button>
                        </div>
                    </div>

                    {/* Organization Table */}
                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Organization</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Location</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white">
                                {filteredOrganizations.map(org => (
                                    <tr key={org._id} className="hover:bg-blue-50/40 transition-colors duration-150">
                                        <td className="px-5 py-3.5">
                                            <p className="text-sm font-semibold text-gray-800">{org.organizationName}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{org.organizationEmail}</p>
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-gray-700">{org.city}, {org.state}</td>
                                        <td className="px-5 py-3.5 text-sm text-gray-700">
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${org.isNGO ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {org.isNGO ? 'NGO / Non-profit' : 'Corporate'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-sm">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${org.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                                                    org.verificationStatus === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {org.verificationStatus.charAt(0).toUpperCase() + org.verificationStatus.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-sm">
                                            <button
                                                onClick={() => setSelectedOrgId(org._id)}
                                                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-white hover:bg-blue-600 px-3 py-1.5 rounded border border-blue-200 transition-all cursor-pointer"
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredOrganizations.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-5 py-8 text-center text-sm text-gray-500">
                                            No organizations found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100 fab-avoid">
                            <p className="text-sm text-gray-400">
                                Page <span className="font-medium text-gray-600">{currentPage}</span> of <span className="font-medium text-gray-600">{totalPages}</span>
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
            </div>
        </div>
    );
}
