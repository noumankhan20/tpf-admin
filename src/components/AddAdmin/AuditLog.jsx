"use client";
import { useState, useMemo } from "react";
import { ArrowLeft, AlertCircle, Search, Filter, X, Clock, CheckCircle, Loader2 } from "lucide-react";
import { useGetAuditLogsQuery } from "../../utils/slices/auditLogApiSlice";

export default function AuditLogs() {
  const { data: logs = [], isLoading: loading } = useGetAuditLogsQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // useEffect removed as hook handles fetching


  const uniqueRoles = ["All", ...new Set(logs.flatMap((log) => log.role || []))];

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const nameMatch = log.adminName?.toLowerCase().includes(searchTerm.toLowerCase());
      const emailMatch = log.adminEmail?.toLowerCase().includes(searchTerm.toLowerCase());
      const actionMatch = log.action?.toLowerCase().includes(searchTerm.toLowerCase());
      const entityMatch = log.entity?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSearch = nameMatch || emailMatch || actionMatch || entityMatch;
      const matchesRole = roleFilter === "All" || (log.role && log.role.includes(roleFilter));

      return matchesSearch && matchesRole;
    });
  }, [searchTerm, roleFilter, logs]);

  const getAdminActivities = (adminEmail) => {
    const adminLog = logs.find((log) => log.adminEmail === adminEmail);
    // If there is no history array (legacy logs), wrap individual log in an array
    if (adminLog && !adminLog.history) return [adminLog];
    return adminLog?.history || [];
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const getInitials = (name) => {
    if (!name) return "AD";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <button onClick={() => window.history.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base cursor-pointer">Back</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">Audit Logs</h1>
          <p className="text-gray-600 mt-2 text-center text-sm md:text-base">Track admin activities and system changes</p>
        </div>

        <div className="bg-white rounded-lg shadow mb-4 md:mb-6 p-3 md:p-4">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
              <input type="text" placeholder="Search by admin name, action, or entity..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base">
              <Filter className="w-4 h-4 md:w-5 md:h-5" />
              <span>Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Role</label>
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  {uniqueRoles.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recent Activity Performed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log._id || log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-800 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">{getInitials(log.adminName)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{log.adminName}</p>
                          <p className="text-sm text-gray-500">{log.adminEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-emerald-800 rounded">{log.role && log.role[0] ? log.role[0] : 'Admin'}</span>
                    </td>
                    <td className="px-6 py-4"><p className="text-sm text-gray-900">{log.action}</p></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(log.createdAt || log.timestamp)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => setSelectedAdmin(log)} className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors cursor-pointer">View History</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:hidden space-y-3 md:space-y-4">
          {filteredLogs.map((log) => (
            <div key={log._id || log.id} className="bg-white rounded-lg shadow p-3 md:p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 md:w-10 md:h-10 bg-emerald-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-xs md:text-sm">{getInitials(log.adminName)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm md:text-base truncate">{log.adminName}</p>
                    <p className="text-xs md:text-sm text-gray-500 truncate">{log.adminEmail}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-emerald-800 rounded">{log.role && log.role[0]}</span>
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">{log.entity}</span>
                </div>
                <p className="text-xs md:text-sm text-gray-900">{log.action}</p>
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                  <Clock className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                  <span className="truncate">{formatDate(log.createdAt || log.timestamp)}</span>
                </div>
              </div>
              <button onClick={() => setSelectedAdmin(log)} className="w-full px-3 md:px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs md:text-sm font-medium">View Past Activities</button>
            </div>
          ))}
        </div>

        {filteredLogs.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 md:p-12 text-center">
            <AlertCircle className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No audit logs found</h3>
            <p className="text-sm md:text-base text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-transparent backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-50"
          onClick={() => setSelectedAdmin(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] md:max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-2">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 truncate">Activity History</h2>
                <p className="text-xs md:text-sm text-gray-600 mt-1 truncate">{selectedAdmin.adminName} - {selectedAdmin.adminEmail}</p>
              </div>
              <button onClick={() => setSelectedAdmin(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(85vh-100px)] md:max-h-[calc(80vh-120px)]">
              <div className="space-y-3 md:space-y-4">
                {getAdminActivities(selectedAdmin.adminEmail).map((activity) => (
                  <div key={activity._id || activity.id} className="relative pl-6 md:pl-8 pb-6 md:pb-8 border-l-2 border-gray-200 last:pb-0">
                    <div className="absolute left-0 top-0 w-3 h-3 md:w-4 md:h-4 rounded-full -translate-x-[7px] md:-translate-x-[9px] bg-green-500" />
                    <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <h3 className="font-medium text-gray-900 text-sm md:text-base flex-1 min-w-0">{activity.action}</h3>
                        <span className="px-2 py-1 text-xs font-medium rounded flex items-center gap-1 flex-shrink-0 bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3" />
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs md:text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Entity:</span>
                          <span className="px-2 py-0.5 bg-white rounded text-xs">{activity.entity}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                          <span className="truncate">{formatDate(activity.timestamp || activity.createdAt)}</span>
                        </span>
                      </div>
                      {activity.details && Object.keys(activity.details).length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                          <p className="font-medium mb-1">Details:</p>
                          <pre className="whitespace-pre-wrap font-mono bg-gray-50 p-2 rounded">{JSON.stringify(activity.details, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}