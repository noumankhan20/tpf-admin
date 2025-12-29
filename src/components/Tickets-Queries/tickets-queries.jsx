"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ChevronDown, ArrowLeft, ChevronLeft, ChevronRight, X, Eye, Calendar, Mail, User, MessageSquare, Clock, TrendingUp, AlertCircle, FileText, Inbox } from 'lucide-react';
import { useGetAllTicketsQuery } from '@/utils/slices/ticketApiSlice';
// Helper function to format date and time
const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  const timeOptions = { hour: '2-digit', minute: '2-digit' };

  const formattedDate = date.toLocaleDateString('en-US', dateOptions);
  const formattedTime = date.toLocaleTimeString('en-US', timeOptions);

  return `${formattedDate} at ${formattedTime}`;
};

const formatDateShort = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const AdminPanel = () => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [queryTypeFilter, setQueryTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 10;
  const {
    data,
    isLoading,
    isError,
    error,
  } = useGetAllTicketsQuery();
  const tickets = data?.tickets || [];

  // Get unique query types for filter
  const queryTypes = useMemo(() => {
    const types = [...new Set(tickets.map(ticket => ticket.queryType))];
    return types.sort();
  }, [tickets]);

  // Statistics
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      total: tickets.length,
      today: tickets.filter(t => new Date(t.createdAt) >= today).length,
      byType: tickets.reduce((acc, t) => {
        acc[t.queryType] = (acc[t.queryType] || 0) + 1;
        return acc;
      }, {})
    };
  }, [tickets]);

  // Filter and search logic
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch =
        ticket.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesQueryType = queryTypeFilter === 'all' || ticket.queryType === queryTypeFilter;
      return matchesSearch && matchesQueryType;
    });
  }, [tickets, searchTerm, queryTypeFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, queryTypeFilter]);

  // Query type badge colors
  const getQueryTypeBadge = (type) => {
    const badges = {
      volunteer: 'bg-blue-100 text-blue-700 border-blue-300',
      bug: 'bg-red-100 text-red-700 border-red-300',
      feedback: 'bg-green-100 text-green-700 border-green-300',
      general: 'bg-gray-100 text-gray-700 border-gray-300'
    };
    return badges[type] || badges.general;
  };

  const getQueryTypeIcon = (type) => {
    const icons = {
      volunteer: '🙋',
      bug: '🐛',
      feedback: '💬',
      general: '📋'
    };
    return icons[type] || icons.general;
  };

  // Message detail modal
  const MessageModal = ({ ticket, onClose }) => (
    <div
      className="fixed inset-0 bg-white/30 bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-white">Message Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {/* Full Name */}
            <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-emerald-600" />
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Name</label>
              </div>
              <p className="text-gray-900 font-semibold text-base sm:text-lg">{ticket.fullName}</p>
            </div>

            {/* Email */}
            <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-emerald-600" />
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
              </div>
              <p className="text-gray-900 font-medium text-sm sm:text-base break-all">{ticket.email}</p>
            </div>

            {/* Query Type */}
            <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="w-4 h-4 text-emerald-600" />
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Query Type</label>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border ${getQueryTypeBadge(ticket.queryType)}`}>
                <span>{getQueryTypeIcon(ticket.queryType)}</span>
                <span className="capitalize">{ticket.queryType}</span>
              </span>
            </div>

            {/* Date & Time */}
            <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date & Time</label>
              </div>
              <p className="text-gray-900 font-medium text-sm sm:text-base">{formatDateTime(ticket.createdAt)}</p>
            </div>
          </div>

          {/* Message Content */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 sm:p-5 rounded-xl border-2 border-emerald-200">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <label className="text-sm font-bold text-emerald-900 uppercase tracking-wide">Message Content</label>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
              <p className="text-gray-700 whitespace-pre-wrap break-words overflow-wrap-anywhere leading-relaxed text-sm sm:text-base">
                {ticket.message}
              </p>

            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600"></div>
          <p className="mt-4 text-gray-700 font-semibold text-lg">Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-6 sm:p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-900 font-bold text-xl mb-2">Something went wrong</p>
          <p className="text-gray-600 mb-4">
            {error?.data?.message || error?.error || "Failed to load tickets"}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="w-full">
        {/* Back Button */}
        <div className="px-4 lg:px-8 pt-6">
          <button
            onClick={() => window.history.back()}
            className="flex cursor-pointer items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:text-emerald-700 hover:bg-white transition-all border-2 border-gray-300 hover:border-emerald-400 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Header Section */}
        <div className="px-4 lg:px-8 py-8">
          <div className="max-w-5xl mx-auto">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent mb-3">
                Ticket & Queries Management
              </h1>
              <p className="text-base sm:text-lg text-gray-600 font-medium">Manage and respond to customer inquiries</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
              <div className="bg-white p-6 rounded-2xl border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-2">Total Tickets</p>
                    <p className="text-4xl sm:text-5xl font-bold text-blue-900">{stats.total}</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Inbox className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border-2 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-emerald-600 uppercase tracking-wide mb-2">Today's Tickets</p>
                    <p className="text-4xl sm:text-5xl font-bold text-emerald-900">{stats.today}</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="px-4 lg:px-8 pb-8">
          <div className="max-w-7xl mx-auto bg-white rounded-3xl border-2 border-gray-200 shadow-xl overflow-hidden">
            {/* Search and Filters */}
            <div className="p-4 sm:p-6 lg:p-8 border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or message..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white font-medium placeholder:text-gray-400"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-gray-300 rounded-2xl hover:bg-emerald-50 hover:border-emerald-400 transition-all duration-200 font-bold"
                >
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showFilters && (
                <div className="pt-5 mt-5 border-t-2 border-gray-100">
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Filter by Query Type</label>
                  <select
                    value={queryTypeFilter}
                    onChange={(e) => setQueryTypeFilter(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white font-semibold"
                  >
                    <option value="all">All Query Types</option>
                    {queryTypes.map(type => (
                      <option key={type} value={type} className="capitalize font-semibold">
                        {getQueryTypeIcon(type)} {type}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Full Name</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Query Type</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y-2 divide-gray-100">
                  {paginatedTickets.map((ticket) => (
                    <tr key={ticket._id} className="hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50 transition-all duration-200">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                            {ticket.fullName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-bold text-gray-900">{ticket.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 font-medium">{ticket.email}</td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border-2 ${getQueryTypeBadge(ticket.queryType)}`}>
                          <span>{getQueryTypeIcon(ticket.queryType)}</span>
                          <span className="capitalize">{ticket.queryType}</span>
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 font-bold">{formatDateShort(ticket.createdAt)}</td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-bold"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden divide-y-2 divide-gray-100">
              {paginatedTickets.map((ticket) => (
                <div key={ticket._id} className="p-5 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50 transition-all duration-200">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
                        {ticket.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-bold text-gray-900 mb-1">{ticket.fullName}</p>
                        <p className="text-sm text-gray-600 break-all font-medium">{ticket.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-4 border-t-2 border-gray-100">
                      <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border-2 ${getQueryTypeBadge(ticket.queryType)}`}>
                        <span>{getQueryTypeIcon(ticket.queryType)}</span>
                        <span className="capitalize">{ticket.queryType}</span>
                      </span>
                      <p className="text-sm font-bold text-gray-500">
                        {formatDateShort(ticket.createdAt)}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-bold"
                    >
                      <Eye className="w-5 h-5" />
                      View Message
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {paginatedTickets.length === 0 && (
              <div className="p-16 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-600 font-bold text-xl mb-2">No tickets found</p>
                <p className="text-gray-400 font-medium">Try adjusting your search or filters</p>
              </div>
            )}

            {/* Pagination */}
            {filteredTickets.length > 0 && (
              <div className="px-6 py-6 border-t-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-600 font-semibold">
                  Showing <span className="font-bold text-gray-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredTickets.length)}</span> of <span className="font-bold text-gray-900">{filteredTickets.length}</span> results
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-3 border-2 border-gray-300 rounded-xl hover:bg-emerald-50 hover:border-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-bold px-5 py-3 bg-white rounded-xl border-2 border-gray-300 shadow-sm">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-3 border-2 border-gray-300 rounded-xl hover:bg-emerald-50 hover:border-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedTicket && (
        <MessageModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
};

export default AdminPanel;