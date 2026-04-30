'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Bell,
    Search,
    Filter,
    SortAsc,
    SortDesc,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    Clock,
    AlertCircle,
    TrendingUp,
    Users,
    Briefcase,
    Camera,
    Share2,
    FileText,
    BarChart3,
    Calendar,
    Eye,
    X as XIcon,
    Activity
} from 'lucide-react';
import {
    useGetAllTasksQuery,
    useGetCampaignProgressQuery,
    useGetCampaignsOverviewQuery,
    useGetTaskAnalyticsQuery
} from '@/utils/slices/taskManagementApiSlice';

export default function TaskManagementPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'tasks', 'campaigns'
    const [selectedCampaign, setSelectedCampaign] = useState(null);

    // Filters for tasks
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [moduleFilter, setModuleFilter] = useState('all');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(20);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Debounce search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset page when dates change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [startDate, endDate]);

    // Fetch analytics
    const { data: analyticsData, isLoading: analyticsLoading } = useGetTaskAnalyticsQuery();

    // Fetch tasks
    const { data: tasksData, isLoading: tasksLoading } = useGetAllTasksQuery({
        search: debouncedSearch,
        status: statusFilter,
        module: moduleFilter,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: pageSize,
        startDate,
        endDate
    });

    // Fetch campaigns overview
    const { data: campaignsData, isLoading: campaignsLoading } = useGetCampaignsOverviewQuery({
        search: debouncedSearch,
        status: statusFilter,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: 10
    });

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setModuleFilter('all');
        setSortBy('createdAt');
        setSortOrder('desc');
        setCurrentPage(1);
        setStartDate('');
        setEndDate('');
    };

    const activeFilterCount = [
        statusFilter !== 'all',
        moduleFilter !== 'all',
        debouncedSearch !== '',
        startDate !== '',
        endDate !== ''
    ].filter(Boolean).length;

    const getModuleIcon = (module) => {
        const icons = {
            'PHOTOGRAPHY_TASK': <Camera className="w-4 h-4" />,
            'SOCIAL_TASK': <Share2 className="w-4 h-4" />,
            'CMS_TASK': <FileText className="w-4 h-4" />,
            'FUNDRAISING_TASK': <TrendingUp className="w-4 h-4" />
        };
        return icons[module] || <Briefcase className="w-4 h-4" />;
    };

    const getModuleColor = (module) => {
        const colors = {
            'PHOTOGRAPHY_TASK': 'bg-purple-100 text-purple-700 border-purple-200',
            'SOCIAL_TASK': 'bg-blue-100 text-blue-700 border-blue-200',
            'CMS_TASK': 'bg-green-100 text-green-700 border-green-200',
            'FUNDRAISING_TASK': 'bg-orange-100 text-orange-700 border-orange-200'
        };
        return colors[module] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0 shadow-sm">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => router.push('/select-portal?category=monitoring')}

                        className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Task Management</h1>
                        <p className="text-xs text-gray-500">Monitor and track all campaign tasks</p>
                    </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full transition relative">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
            </header>

            <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full overflow-hidden flex flex-col">
                {/* Analytics Overview */}
                {!analyticsLoading && analyticsData?.data && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <StatCard
                            icon={<Activity className="text-blue-600" />}
                            count={analyticsData.data.overview.totalTasks}
                            label="Total Tasks"
                            subtext={`${analyticsData.data.overview.completionRate}% completed`}
                        />
                        <StatCard
                            icon={<CheckCircle className="text-green-600" />}
                            count={analyticsData.data.overview.completedTasks}
                            label="Completed"
                            color="green"
                        />
                        <StatCard
                            icon={<Clock className="text-orange-600" />}
                            count={analyticsData.data.overview.pendingTasks}
                            label="Pending"
                            color="orange"
                        />
                        <StatCard
                            icon={<TrendingUp className="text-purple-600" />}
                            count={analyticsData.data.campaigns.total}
                            label="Total Campaigns"
                            subtext={`${analyticsData.data.campaigns.completionRate}% completed`}
                        />
                    </div>
                )}

                {/* Tabs */}
                <div className="flex space-x-6 border-b border-gray-200 mb-4 shrink-0">
                    <TabButton
                        active={activeTab === 'overview'}
                        onClick={() => setActiveTab('overview')}
                        icon={<BarChart3 className="w-4 h-4" />}
                        label="Overview"
                    />
                    <TabButton
                        active={activeTab === 'campaigns'}
                        onClick={() => setActiveTab('campaigns')}
                        icon={<Users className="w-4 h-4" />}
                        label="Campaigns"
                        count={campaignsData?.pagination?.total}
                    />
                      <TabButton
                        active={activeTab === 'tasks'}
                        onClick={() => setActiveTab('tasks')}
                        icon={<FileText className="w-4 h-4" />}
                        label="All Tasks"
                        count={tasksData?.pagination?.total}
                    />
                </div>

                {/* Filter Bar */}
                {(activeTab === 'tasks' || activeTab === 'campaigns') && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search tasks or campaigns..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-9 pr-4 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                            </select>

                            {activeTab === 'tasks' && (
                                <select
                                    value={moduleFilter}
                                    onChange={(e) => setModuleFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Modules</option>
                                    <option value="PHOTOGRAPHY_TASK">Photography</option>
                                    <option value="SOCIAL_TASK">Social Media</option>
                                    <option value="CMS_TASK">CMS</option>
                                    <option value="FUNDRAISING_TASK">Fundraising</option>
                                </select>
                            )}

                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    placeholder="Start Date"
                                />
                                <span className="text-gray-500 text-sm">to</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    placeholder="End Date"
                                />
                            </div>

                            <button
                                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 transition-colors"
                            >
                                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                                {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
                            </button>

                            {activeFilterCount > 0 && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                                >
                                    <XIcon className="w-4 h-4" />
                                    Clear ({activeFilterCount})
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Content based on active tab */}
                {activeTab === 'overview' && (
                    <OverviewTab analyticsData={analyticsData} isLoading={analyticsLoading} />
                )}

                {activeTab === 'tasks' && (
                    <TasksTab
                        tasksData={tasksData}
                        isLoading={tasksLoading}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        getModuleIcon={getModuleIcon}
                        getModuleColor={getModuleColor}
                    />
                )}

                {activeTab === 'campaigns' && (
                    <CampaignsTab
                        campaignsData={campaignsData}
                        isLoading={campaignsLoading}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        setSelectedCampaign={setSelectedCampaign}
                    />
                )}
            </main>

            {/* Campaign Detail Modal */}
            <AnimatePresence>
                {selectedCampaign && (
                    <CampaignDetailModal
                        campaign={selectedCampaign}
                        onClose={() => setSelectedCampaign(null)}
                        getModuleIcon={getModuleIcon}
                        getModuleColor={getModuleColor}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Helper Components
function StatCard({ icon, count, label, subtext, color = 'blue' }) {
    return (
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                    {icon}
                </div>
                <span className="text-2xl font-bold text-gray-800">{count}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">{label}</h3>
            {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
    );
}

function TabButton({ active, onClick, icon, label, count }) {
    return (
        <button
            onClick={onClick}
            className={`pb-3 px-2 text-sm font-medium transition-colors relative flex items-center gap-2 ${active ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'
                }`}
        >
            {icon}
            {label}
            {count !== undefined && count > 0 && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full font-semibold">
                    {count}
                </span>
            )}
        </button>
    );
}

function OverviewTab({ analyticsData, isLoading }) {
    if (isLoading) {
        return <div className="text-center py-12 text-gray-500">Loading analytics...</div>;
    }

    if (!analyticsData?.data) {
        return <div className="text-center py-12 text-gray-500">No analytics data available</div>;
    }

    const { moduleBreakdown, recentTasks } = analyticsData.data;

    return (
        <div className="space-y-6">
            {/* Module Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Module Breakdown
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {moduleBreakdown.map((module, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">{module._id}</span>
                                <span className="text-xl font-bold text-gray-800">{module.total}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                <span>{module.completed} completed</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                                <Clock className="w-3 h-3 text-orange-600" />
                                <span>{module.pending} pending</span>
                            </div>
                            <div className="mt-2 bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{ width: `${module.total > 0 ? (module.completed / module.total) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Tasks */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Recent Tasks
                </h2>
                <div className="space-y-3">
                    {recentTasks.map((task, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex-1">
                                <p className="font-medium text-gray-800">{task.taskType}</p>
                                <p className="text-sm text-gray-600">{task.campaignId?.title}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Assigned to: {task.assignedAdminId?.fullName || 'Unassigned'}
                                </p>
                            </div>
                            <StatusBadge status={task.status} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function TasksTab({ tasksData, isLoading, currentPage, setCurrentPage, getModuleIcon, getModuleColor }) {
    if (isLoading) {
        return <div className="text-center py-12 text-gray-500">Loading tasks...</div>;
    }

    const tasks = tasksData?.data || [];
    const pagination = tasksData?.pagination || {};

    if (tasks.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 font-medium">No tasks found</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tasks.map((task) => (
                            <tr key={task._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{task.taskType}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">{task.campaignId?.title || 'N/A'}</div>
                                    <div className="text-xs text-gray-500">{task.campaignId?.beneficiaryName}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getModuleColor(task.module)}`}>
                                        {getModuleIcon(task.module)}
                                        {task.module?.replace('_TASK', '')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{task.assignedAdminId?.fullName || 'Unassigned'}</div>
                                    <div className="text-xs text-gray-500">{task.assignedAdminId?.role}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={task.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(task.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="border-t border-gray-200 p-4 flex items-center justify-between bg-gray-50 fab-avoid">
                    <div className="text-sm text-gray-600">
                        Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} tasks
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-1 text-sm font-medium">
                            Page {currentPage} of {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                            disabled={currentPage === pagination.totalPages}
                            className="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function CampaignsTab({ campaignsData, isLoading, currentPage, setCurrentPage, setSelectedCampaign }) {
    if (isLoading) {
        return <div className="text-center py-12 text-gray-500">Loading campaigns...</div>;
    }

    const campaigns = campaignsData?.data || [];
    const pagination = campaignsData?.pagination || {};

    if (campaigns.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 font-medium">No campaigns found</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaigns.map((campaign) => (
                    <div
                        key={campaign._id}
                        className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedCampaign(campaign)}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 mb-1">{campaign.title}</h3>
                                <p className="text-sm text-gray-600">{campaign.beneficiaryName}</p>
                                <p className="text-xs text-gray-500 mt-1">{campaign.location}</p>
                            </div>
                            <StatusBadge status={campaign.status} />
                        </div>

                        <div className="mt-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-gray-600">Task Progress</span>
                                <span className="font-semibold text-gray-800">
                                    {campaign.taskProgress.completed}/{campaign.taskProgress.total}
                                </span>
                            </div>
                            <div className="bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{ width: `${campaign.taskProgress.percentage}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1 text-right">
                                {campaign.taskProgress.percentage}% Complete
                            </p>
                        </div>

                        <button className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                            <Eye className="w-4 h-4" />
                            View Details
                        </button>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2 fab-avoid">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-1 text-sm font-medium">
                        Page {currentPage} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={currentPage === pagination.totalPages}
                        className="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </>
    );
}

function CampaignDetailModal({ campaign, onClose, getModuleIcon, getModuleColor }) {
    const { data: progressData, isLoading } = useGetCampaignProgressQuery(campaign._id);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{campaign.title}</h2>
                        <p className="text-gray-600 mt-1">{campaign.beneficiaryName}</p>
                        <p className="text-sm text-gray-500 mt-1">{campaign.location}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                        <XIcon className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {isLoading ? (
                        <div className="text-center py-12 text-gray-500">Loading campaign details...</div>
                    ) : progressData?.data ? (
                        <>
                            {/* Progress Summary */}
                            <div className="bg-blue-50 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                                    <span className="text-lg font-bold text-blue-600">
                                        {progressData.data.progress.percentage}%
                                    </span>
                                </div>
                                <div className="bg-white rounded-full h-3 mb-2">
                                    <div
                                        className="bg-blue-600 h-3 rounded-full transition-all"
                                        style={{ width: `${progressData.data.progress.percentage}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-600">
                                    <span>{progressData.data.progress.completed} of {progressData.data.progress.total} tasks completed</span>
                                    <span>{progressData.data.progress.pending} pending</span>
                                </div>
                            </div>

                            {/* Tasks List */}
                            <h3 className="font-semibold text-gray-800 mb-3">Tasks Timeline</h3>
                            <div className="space-y-3">
                                {progressData.data.tasks.map((task, idx) => (
                                    <div
                                        key={task._id}
                                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                                    >
                                        <div className="flex-shrink-0 mt-1">
                                            {task.status === 'COMPLETED' ? (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            ) : task.status === 'IN_PROGRESS' ? (
                                                <Clock className="w-5 h-5 text-orange-600" />
                                            ) : (
                                                <AlertCircle className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-medium text-gray-800">{task.taskType}</h4>
                                                <StatusBadge status={task.status} />
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getModuleColor(task.module)}`}>
                                                    {getModuleIcon(task.module)}
                                                    {task.module?.replace('_TASK', '')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Assigned to: {task.assignedAdminId?.fullName || 'Unassigned'}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Created: {new Date(task.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12 text-gray-500">No task data available</div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

function StatusBadge({ status }) {
    const config = {
        COMPLETED: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', label: 'Completed' },
        IN_PROGRESS: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', label: 'In Progress' },
        PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Pending' }
    }[status] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', label: status };

    return (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
            {config.label}
        </span>
    );
}
