"use client"
import React, { useState } from 'react';
import { AlertCircle, CheckCircle, FileText, MessageSquare, Users, TrendingUp, Clock, Shield, Receipt, Search, Filter, Eye, Trash2, Download, ChevronRight, ChevronDown, MoreVertical, Loader2, ArrowLeft, X, Menu, Edit, ExternalLink, User } from 'lucide-react';
import { useFetchCampaignsQuery } from '@/utils/slices/campaignSlice';
import { useRouter } from 'next/navigation';
export default function CampaignAdminDashboard() {
  const [view, setView] = useState('list');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedRow, setExpandedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(50);
  const router = useRouter();
  const { data: apiResponse, isLoading, isError, error, refetch } = useFetchCampaignsQuery({
    page: currentPage,
    limit: limit
  });

  const campaigns = apiResponse?.campaigns || [];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getProgressPercentage = (raised, goal) => {
    if (!goal || goal === 0) return 0;
    return (raised / goal) * 100;
  };

  const getStatusColor = (status) => {
    const colors = {
      'FORM_VERIFIED': 'bg-blue-100 text-blue-800 border-blue-200',
      'FORM_SUBMITTED': 'bg-purple-100 text-purple-800 border-purple-200',
      'APPROVED': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'UNDER_REVIEW': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'PENDING_DOCS': 'bg-orange-100 text-orange-800 border-orange-200',
      'REJECTED': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const beneficiaryName = campaign.beneficiaryName || '';
    const campaignId = campaign._id || '';
    const title = campaign.title || '';

    const matchesSearch =
      beneficiaryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaignId.includes(searchQuery) ||
      title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterStatus === 'all' ? true :
      filterStatus === 'active' ? campaign.isActive :
        filterStatus === 'urgent' ? campaign.isUrgent :
          filterStatus === 'inactive' ? !campaign.isActive : true;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.isActive).length,
    inactive: campaigns.filter(c => !c.isActive).length,
    urgent: campaigns.filter(c => c.isUrgent).length,
    totalRaised: campaigns.reduce((sum, c) => sum + (c.raisedAmount || 0), 0),
    totalDonors: campaigns.reduce((sum, c) => sum + (c.totalDonors || 0), 0)
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-white p-4 rounded-full shadow-lg">
              <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
            </div>
          </div>
          <p className="text-xl font-semibold text-gray-900 mb-2">Loading campaigns...</p>
          <p className="text-sm text-gray-500">Please wait while we fetch the data</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-100 mb-6 shadow-lg">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Failed to Load Campaigns</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {error?.data?.message || error?.message || 'An error occurred while fetching campaigns'}
          </p>
          <button
            onClick={refetch}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (view === 'detail' && selectedCampaign) {
    const campaign = selectedCampaign;
    const progressPercentage = getProgressPercentage(campaign.raisedAmount || 0, campaign.targetAmount || 0);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <button
              onClick={() => setView('list')}
              className="flex items-center cursor-pointer gap-2 text-sm font-medium text-gray-600 hover:text-emerald-600 mb-4 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Campaigns
            </button>

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 break-words">
                  {campaign.title || campaign.beneficiaryName || 'Untitled Campaign'}
                </h1>
                {campaign.organization && (
                  <p className="text-sm text-gray-500 flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {campaign.organization}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(campaign.campaignStatus)}`}
                >
                  {campaign.campaignStatus?.replace(/_/g, ' ')}
                </span>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(campaign.workflowStatus)}`}>
                  {campaign.workflowStatus?.replace(/_/g, ' ') || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 hover:shadow-md transition-shadow">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Fundraising Progress
                </h2>

                <div className="space-y-5">
                  <div className="flex items-baseline justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-3xl sm:text-4xl font-bold text-emerald-600">
                        ₹{(campaign.raisedAmount || 0).toLocaleString('en-IN')}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        raised of ₹{(campaign.targetAmount || 0).toLocaleString('en-IN')} goal
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-3xl sm:text-4xl font-bold text-gray-900">{progressPercentage.toFixed(0)}%</p>
                      <p className="text-sm text-gray-500 mt-2">funded</p>
                    </div>
                  </div>

                  <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 transition-all duration-700 rounded-full shadow-sm"
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        {campaign.totalDonors === 0 ? 'No donors yet' : `${campaign.totalDonors} ${campaign.totalDonors === 1 ? 'donor' : 'donors'}`}
                      </span>
                    </div>
                    {campaign.deadline && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          Ends {formatDate(campaign.deadline)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {campaign.about && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 hover:shadow-md transition-shadow">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">About This Campaign</h2>
                  <div className="prose prose-sm sm:prose max-w-none">
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                      {campaign.about}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Tax Benefits</p>
                      <p className="text-base sm:text-lg font-bold text-gray-900">
                        {campaign.taxBenefits ? '80G Available' : 'Not Available'}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl ${campaign.taxBenefits ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                      <Receipt className={`w-5 h-5 ${campaign.taxBenefits ? 'text-emerald-600' : 'text-gray-400'}`} />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Zakat Verified</p>
                      <p className="text-base sm:text-lg font-bold text-gray-900">
                        {campaign.zakatVerified ? 'Verified' : 'Not Verified'}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl ${campaign.zakatVerified ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                      <Shield className={`w-5 h-5 ${campaign.zakatVerified ? 'text-emerald-600' : 'text-gray-400'}`} />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 hover:shadow-md transition-all sm:col-span-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Last Updated</p>
                      <p className="text-sm sm:text-base font-bold text-gray-900">
                        {formatDate(campaign.updatedAt)}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-100">
                      <Clock className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Impact Goals</h2>
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>

                {!campaign.impactGoals || campaign.impactGoals.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 mb-4">
                      <TrendingUp className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">No impact goals defined yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {campaign.impactGoals.map((goal, index) => (
                      <div key={index} className="flex gap-3 p-4 bg-gradient-to-r from-emerald-50 to-transparent rounded-xl border border-emerald-100 hover:border-emerald-200 transition-colors">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <p className="text-sm text-gray-900 flex-1">{goal}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    Donor Messages ({campaign.donorMessages?.length || 0})
                  </h2>
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                </div>

                {!campaign.donorMessages || campaign.donorMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 mb-4">
                      <MessageSquare className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">No messages from donors yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {campaign.donorMessages.map((message, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                        <p className="text-sm text-gray-900">{message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {campaign.category && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</h3>
                  <p className="text-base font-bold text-gray-900">{campaign.category}</p>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 hover:shadow-md transition-shadow">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center justify-between">
                  <span>Documents</span>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                    {campaign.documents?.length || 0}
                  </span>
                </h3>

                {!campaign.documents || campaign.documents.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 mb-3">
                      <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 font-medium">No documents uploaded</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {campaign.documents.map((doc, index) => (
                      <div key={index} className="group p-3 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-between gap-3 transition-colors border border-transparent hover:border-gray-200">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="flex-shrink-0 w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <FileText className="w-4 h-4 text-emerald-600" />
                          </div>
                          <span className="text-sm text-gray-900 truncate font-medium">
                            {doc.name || doc}
                          </span>
                        </div>
                        <Download className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 flex-shrink-0 cursor-pointer transition-colors" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            {/* Back Button (Left) */}
            <button
              onClick={() => router.push("/select-portal")}
              className="flex items-center cursor-pointer gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-white transition-all border border-gray-300 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {/* Center Heading */}
            <div className="absolute left-1/2 -translate-x-1/2 text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
                Campaign Management
              </h1>
              <p className="text-sm sm:text-base text-gray-500">
                Manage and track all donation campaigns
              </p>
            </div>

            {/* Refresh Button (Right) */}
            <button
              onClick={refetch}
              className="px-4 sm:px-6 py-2.5 sm:py-3 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all transform hover:-translate-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">Total</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl sm:rounded-2xl shadow-sm border border-emerald-200 p-4 sm:p-6 hover:shadow-md transition-all transform hover:-translate-y-1">
            <p className="text-xs sm:text-sm font-medium text-emerald-600 mb-1 sm:mb-2">Active</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-600">{stats.active}</p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all transform hover:-translate-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">Inactive</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats.inactive}</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-white rounded-xl sm:rounded-2xl shadow-sm border border-red-200 p-4 sm:p-6 hover:shadow-md transition-all transform hover:-translate-y-1">
            <p className="text-xs sm:text-sm font-medium text-red-600 mb-1 sm:mb-2">Urgent</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600">{stats.urgent}</p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all transform hover:-translate-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">Raised</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              ₹{(stats.totalRaised / 1000).toFixed(0)}K
            </p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all transform hover:-translate-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">Donors</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats.totalDonors}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, title or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Campaign</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Raised</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Donors</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Updated</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCampaigns.map((campaign) => {
                  const progress = getProgressPercentage(campaign.raisedAmount || 0, campaign.targetAmount || 0);

                  return (
                    <tr key={campaign._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {campaign.title || campaign.beneficiaryName || 'Untitled Campaign'}
                          </p>
                          {campaign.title && campaign.beneficiaryName && (
                            <p className="text-xs text-gray-500 mt-0.5">{campaign.beneficiaryName}</p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(campaign.campaignStatus)}`}
                          >
                            {campaign.campaignStatus?.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="w-full max-w-xs">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
                            <span className="font-semibold">{progress.toFixed(0)}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            ₹{(campaign.raisedAmount || 0).toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            of ₹{(campaign.targetAmount || 0).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{campaign.totalDonors || 0}</p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{formatDate(campaign.updatedAt)}</p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedCampaign(campaign);
                              setView('detail');
                            }}
                            className="p-2 text-gray-600 cursor-pointer hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden divide-y divide-gray-200">
            {filteredCampaigns.map((campaign) => {
              const progress = getProgressPercentage(campaign.raisedAmount || 0, campaign.targetAmount || 0);
              const isExpanded = expandedRow === campaign._id;

              return (
                <div key={campaign._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="mb-3">
                    <div className="flex items-start justify-between mb-2 gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 mb-1 break-words">
                          {campaign.title || campaign.beneficiaryName || 'Untitled Campaign'}
                        </h3>
                        {campaign.title && campaign.beneficiaryName && (
                          <p className="text-xs text-gray-500 mb-1">{campaign.beneficiaryName}</p>
                        )}
                        <p className="text-xs text-gray-400 font-mono">
                          ID: {campaign._id.slice(0, 8)}...
                        </p>
                      </div>
                      <button
                        onClick={() => setExpandedRow(isExpanded ? null : campaign._id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                      >
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(campaign.campaignStatus)}`}
                      >
                        {campaign.campaignStatus?.replace(/_/g, ' ')}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(campaign.workflowStatus)}`}>
                        {campaign.workflowStatus?.replace(/_/g, ' ') || 'Unknown'}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs font-medium text-gray-600 mb-2">
                      <span>{progress.toFixed(0)}% funded</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {campaign.totalDonors || 0}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-base font-bold text-gray-900">
                        ₹{(campaign.raisedAmount || 0).toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-gray-500">
                        of ₹{(campaign.targetAmount || 0).toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-500">Updated</p>
                      <p className="text-xs font-semibold text-gray-700">
                        {formatDate(campaign.updatedAt)}
                      </p>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="pt-3 border-t border-gray-200 space-y-3">
                      {campaign.impactGoals && campaign.impactGoals.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Impact Goals</p>
                          <div className="space-y-2">
                            {campaign.impactGoals.map((goal, idx) => (
                              <div key={idx} className="flex gap-2 p-2.5 bg-gradient-to-r from-emerald-50 to-transparent rounded-lg border border-emerald-100">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                                  {idx + 1}
                                </div>
                                <p className="text-xs text-gray-700 flex-1">{goal}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Tax</p>
                          <p className="text-xs font-bold text-gray-900">
                            {campaign.taxBenefits ? '80G' : 'N/A'}
                          </p>
                        </div>
                        <div className="text-center p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Zakat</p>
                          <p className="text-xs font-bold text-gray-900">
                            {campaign.zakatVerified ? 'Yes' : 'No'}
                          </p>
                        </div>
                        <div className="text-center p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Docs</p>
                          <p className="text-xs font-bold text-gray-900">
                            {campaign.documents?.length || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setSelectedCampaign(campaign);
                        setView('detail');
                      }}
                      className="flex-1 py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                    >
                      View Details
                    </button>

                    <button className="p-2.5 border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCampaigns.length === 0 && (
            <div className="text-center py-16 px-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gray-100 mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No campaigns found</h3>
            </div>
          )}
        </div>

        {filteredCampaigns.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-900">{filteredCampaigns.length}</span> of <span className="font-semibold text-gray-900">{campaigns.length}</span> campaigns
            </p>
          </div>
        )}
      </div>
    </div>
  );
}