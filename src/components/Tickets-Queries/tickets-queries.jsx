"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ChevronDown, ArrowLeft, ChevronLeft, Check, ChevronRight, X, Eye, Calendar, Mail, User, MessageSquare, Clock, TrendingUp, AlertCircle, FileText, Inbox } from 'lucide-react';
import { useGetAllTicketsQuery, useMarkTicketAsResolvedMutation } from '@/utils/slices/ticketApiSlice';
import { useRouter } from 'next/navigation';


// Helper function to format date and time
const toISTDate = (dateString) => {
  const utcDate = new Date(dateString);

  // IST offset = +5:30 = 330 minutes
  const istOffsetMs = 330 * 60 * 1000;

  return new Date(utcDate.getTime() + istOffsetMs);
};


const formatDateTime = (dateString) => {
  const date = toISTDate(dateString);

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
};


const formatDateShort = (dateString) => {
  const date = toISTDate(dateString);
  const now = toISTDate(new Date().toISOString());

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const diffDays =
    (startOfToday - startOfDate) / (1000 * 60 * 60 * 24);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


const AdminPanel = () => {
  const router = useRouter();
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
  const [markTicketAsResolved, { isLoading: isMarkingResolved }] = useMarkTicketAsResolvedMutation();
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
  const QUERY_BADGE_CLASS = () =>
    "bg-slate-50 text-slate-700 border border-slate-200";

  const STATUS_BADGE_CLASSES = {
    Unresolved: 'bg-blue-50 text-red-700 border-blue-200',
    Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  const getStatusBadgeClass = (status) =>
    STATUS_BADGE_CLASSES[status] ||
    'bg-gray-50 text-gray-600 border-gray-200';

  // Handle mark as resolved
  const handleMarkAsResolved = async (ticketId) => {
    try {
      await markTicketAsResolved(ticketId).unwrap();
      setSelectedTicket(null);
    } catch (error) {
      console.error('Failed to mark ticket as resolved:', error);
    }
  };

  // Message detail modal
  const MessageModal = ({ ticket, onClose }) => (
    <div
      className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 px-6 py-5 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Message Details</h2>
          </div>
          <div className="flex items-center gap-2">
            {ticket.status === 'Resolved' ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium border border-slate-200">
                <Check className="w-4 h-4 text-emerald-600" />
                Resolved
              </span>
            ) : (
              <button
                onClick={() => handleMarkAsResolved(ticket._id)}
                disabled={isMarkingResolved}
                className="px-4 py-2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                {isMarkingResolved ? 'Marking...' : 'Mark as Resolved'}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200/50 rounded-xl transition-all duration-200 group"
            >
              <X className="w-5 h-5 text-slate-500 group-hover:text-slate-700" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Full Name */}
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-slate-400" />
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Full Name</label>
              </div>
              <p className="text-slate-900 font-medium text-base">{ticket.fullName}</p>
            </div>

            {/* Email */}
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email</label>
              </div>
              <p className="text-slate-900 font-medium text-sm break-all">{ticket.email}</p>
            </div>

            {/* Query Type */}
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Query Type</label>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border ${QUERY_BADGE_CLASS(ticket.queryType)}`}>
                <span className="capitalize">{ticket.queryType}</span>
              </span>
            </div>
            {ticket.queryType === 'other' && ticket.otherCategory && (
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all duration-200">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Other Category
                  </label>
                </div>
                <p className="text-slate-900 font-medium text-sm">
                  {ticket.otherCategory}
                </p>
              </div>
            )}

            {/* Date & Time */}
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Date & Time</label>
              </div>
              <p className="text-slate-900 font-medium text-sm">{formatDateTime(ticket.createdAt)}</p>
            </div>
          </div>

          {/* Message Content */}
          <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/30 p-5 rounded-2xl border border-emerald-200">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <label className="text-sm font-medium text-emerald-900 uppercase tracking-wider">Message Content</label>
            </div>
            <div className="bg-white p-4 rounded-xl border border-emerald-100">
              <p className="text-slate-700 whitespace-pre-wrap break-words leading-relaxed text-sm">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-3 border-slate-200 border-t-emerald-600 mb-4"></div>
          <p className="text-slate-600 font-medium">Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-3xl shadow-xl border border-slate-200 max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-slate-900 font-semibold text-xl mb-2">Something went wrong</p>
          <p className="text-slate-600 mb-6 text-sm">
            {error?.data?.message || error?.error || "Failed to load tickets"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all duration-200 font-medium text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <main className="w-full">
        {/* Back Button */}
        <div className="px-4 lg:px-8 pt-6">
          <button
           onClick={() => router.push('/select-portal?category=communication')}
            className="flex items-center cursor-pointer gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white transition-all border border-slate-200 hover:border-slate-300 hover:shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Header Section */}
        <div className="px-4 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Title */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 mb-2">
                Tickets & Queries Management
              </h1>
              <p className="text-base text-slate-500">Manage and respond to customer inquiries</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Tickets</p>
                    <p className="text-4xl font-semibold text-slate-900">{stats.total}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                    <Inbox className="w-7 h-7 text-slate-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Today's Tickets</p>
                    <p className="text-4xl font-semibold text-slate-900">{stats.today}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center">
                    <Clock className="w-7 h-7 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="px-4 lg:px-8 pb-8">
          <div className="max-w-7xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Search and Filters */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or message..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 bg-white text-sm placeholder:text-slate-400"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 font-medium text-sm"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showFilters && (
                <div className="pt-4 mt-4 border-t border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Query Type</label>
                  <select
                    value={queryTypeFilter}
                    onChange={(e) => setQueryTypeFilter(e.target.value)}
                    className="w-full sm:w-64 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 bg-white text-sm"
                  >
                    <option value="all">All Query Types</option>
                    {queryTypes.map(type => (
                      <option key={type} value={type} className="capitalize">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {paginatedTickets.map((ticket) => (
                    <tr key={ticket._id} className="hover:bg-slate-50/50 transition-all duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-medium text-sm">
                            {ticket.fullName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-slate-900">{ticket.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{ticket.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${QUERY_BADGE_CLASS(ticket.queryType)}`}>
                          <span className="capitalize">{ticket.queryType}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${getStatusBadgeClass(
                            ticket.status
                          )}`}
                        >
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDateShort(ticket.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="inline-flex cursor-pointer items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-800 text-white rounded-xl transition-all duration-200 font-medium text-sm"
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
            <div className="lg:hidden divide-y divide-slate-100">
              {paginatedTickets.map((ticket) => (
                <div key={ticket._id} className="p-5 hover:bg-slate-50/50 transition-all duration-150">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-medium flex-shrink-0">
                        {ticket.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-medium text-slate-900 mb-1">{ticket.fullName}</p>
                        <p className="text-sm text-slate-600 break-all">{ticket.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${QUERY_BADGE_CLASS(ticket.queryType)}`}>
                        <span className="capitalize">{ticket.queryType}</span>
                      </span>
                      <p className="text-sm text-slate-500">
                        {formatDateShort(ticket.createdAt)}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all duration-200 font-medium text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      View Message
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {paginatedTickets.length === 0 && (
              <div className="p-16 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-slate-900 font-medium text-lg mb-1">No tickets found</p>
                <p className="text-slate-500 text-sm">Try adjusting your search or filters</p>
              </div>
            )}

            {/* Pagination */}
            {filteredTickets.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-slate-600">
                  Showing <span className="font-medium text-slate-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium text-slate-900">{Math.min(currentPage * itemsPerPage, filteredTickets.length)}</span> of <span className="font-medium text-slate-900">{filteredTickets.length}</span> results
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-medium px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                    {currentPage} / {totalPages || 1}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
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