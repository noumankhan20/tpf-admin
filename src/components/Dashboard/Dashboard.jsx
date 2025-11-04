"use client";

import { useState } from 'react';
import Sidebar from '../Layout/SideBar';
import Navbar from '../Layout/NavBar';
import {
    Users,
    DollarSign,
    TrendingUp,
    Briefcase,
    ArrowUp,
    Calendar,
    FileText
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

// Mock Data
const volunteers = [
    { id: 1, name: "Alex Johnson", hours: 45, area: "Food Distribution" },
    { id: 2, name: "Sarah Williams", hours: 32, area: "Medical Camp" },
    { id: 3, name: "Miguel Rodriguez", hours: 28, area: "Education" },
    { id: 4, name: "Emma Chen", hours: 60, area: "Shelter Management" },
    { id: 5, name: "Raj Patel", hours: 15, area: "Women Empowerment" },
];

const donations = [
    { id: 1, donor: "Jane Cooper", amount: 250.00, date: "2023-10-26", category: "Shelter" },
    { id: 2, donor: "John Smith", amount: 50.00, date: "2023-10-25", category: "Food" },
    { id: 3, donor: "Emily White", amount: 1000.00, date: "2023-10-25", category: "Medical Aid" },
    { id: 4, donor: "Michael Brown", amount: 75.00, date: "2023-10-24", category: "Education" },
    { id: 5, donor: "Sarah Jones", amount: 500.00, date: "2023-10-23", category: "Shelter" },
    { id: 6, donor: "Robert Chen", amount: 150.00, date: "2023-10-22", category: "Women Empowerment" },
];

const campaigns = [
    { id: 1, name: "Winter Shelter Fund", category: "Shelter", active: true, raised: 12500, goal: 15000 },
    { id: 2, name: "Food for Families", category: "Food", active: true, raised: 8750, goal: 10000 },
    { id: 3, name: "Clean Water Project", category: "Medical Aid", active: true, raised: 5200, goal: 7500 },
    { id: 4, name: "Education for All", category: "Education", active: true, raised: 9800, goal: 12000 },
];

const benefitRequests = [
    { id: 1, name: "Rohit Sharma", amount: 1200.00 },
    { id: 2, name: "Ananya Patel", amount: 850.00 },
    { id: 3, name: "Vikram Singh", amount: 2000.00 },
    { id: 4, name: "Meera Kapoor", amount: 1500.00 },
    { id: 5, name: "Rajiv Kumar", amount: 750.00 },
    { id: 6, name: "Priya Desai", amount: 1100.00 },
];

const employees = 15;

export default function Dashboard() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("Dashboard");

    // Calculate totals
    const totalVolunteers = volunteers.length;
    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
    const activeCampaigns = campaigns.filter(c => c.active).length;
    const totalBenefitAmount = benefitRequests.reduce((sum, r) => sum + r.amount, 0);

    // Prepare chart data
    const categoryData = [
        { name: 'Food', amount: 0 },
        { name: 'Education', amount: 0 },
        { name: 'Women Empowerment', amount: 0 },
        { name: 'Medical Aid', amount: 0 },
        { name: 'Shelter', amount: 0 }
    ];

    donations.forEach(donation => {
        const category = categoryData.find(c => c.name === donation.category);
        if (category) category.amount += donation.amount;
    });

    const stats = [
        {
            title: "Total Volunteers",
            value: totalVolunteers,
            icon: Users,
            trend: "+5.2%",
            bgColor: "bg-blue-50",
            iconColor: "text-blue-600",
            borderColor: "border-blue-100"
        },
        {
            title: "Total Donations",
            value: `₹${totalDonations.toLocaleString()}`,
            icon: DollarSign,
            trend: "+8.7%",
            bgColor: "bg-green-50",
            iconColor: "text-green-600",
            borderColor: "border-green-100"
        },
        {
            title: "Active Campaigns",
            value: activeCampaigns,
            icon: TrendingUp,
            trend: "+2 new",
            bgColor: "bg-purple-50",
            iconColor: "text-purple-600",
            borderColor: "border-purple-100"
        },
        {
            title: "Total Employees",
            value: employees,
            icon: Briefcase,
            trend: "+3 hired",
            bgColor: "bg-orange-50",
            iconColor: "text-orange-600",
            borderColor: "border-orange-100"
        }
    ];

    const recentActivities = [
        { id: 1, action: "New donation received", donor: "Jane Cooper", amount: "₹250", time: "2 hours ago" },
        { id: 2, action: "Campaign milestone", campaign: "Winter Shelter", milestone: "80%", time: "5 hours ago" },
        { id: 3, action: "Volunteer registered", volunteer: "Alex Johnson", time: "1 day ago" },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
                isMobileOpen={isMobileSidebarOpen}
                setIsMobileOpen={setIsMobileSidebarOpen}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar onMenuClick={() => setIsMobileSidebarOpen(true)} />

                <main className="flex-1 overflow-auto">
                    <div className="max-w-7xl mx-auto p-6 space-y-6">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
                                    <p className="text-blue-100">Welcome back! Here's what's happening today.</p>
                                </div>
                                <div className="hidden md:flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                                    <Calendar size={20} />
                                    <span className="font-medium">Nov 04, 2025</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, index) => {
                                const Icon = stat.icon;
                                return (
                                    <div
                                        key={index}
                                        className={`bg-white rounded-xl shadow-sm border ${stat.borderColor} p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-1`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                                <Icon className={stat.iconColor} size={24} strokeWidth={2} />
                                            </div>
                                            <div className="flex items-center text-sm text-green-600 font-medium">
                                                <ArrowUp size={16} className="mr-1" />
                                                {stat.trend}
                                            </div>
                                        </div>
                                        <h3 className="text-gray-600 text-sm font-medium mb-2">{stat.title}</h3>
                                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Donation Chart */}
                            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">Donations by Category</h2>
                                        <p className="text-sm text-gray-500 mt-1">Monthly donation breakdown</p>
                                    </div>
                                    <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option>This Month</option>
                                        <option>Last Month</option>
                                        <option>Last 3 Months</option>
                                    </select>
                                </div>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={categoryData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                            <XAxis 
                                                dataKey="name" 
                                                stroke="#9ca3af" 
                                                style={{ fontSize: '12px' }}
                                                tickLine={false}
                                            />
                                            <YAxis 
                                                stroke="#9ca3af" 
                                                style={{ fontSize: '12px' }}
                                                tickLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                }}
                                                cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                                            />
                                            <Bar 
                                                dataKey="amount" 
                                                name="Amount (₹)" 
                                                fill="#3b82f6" 
                                                radius={[8, 8, 0, 0]}
                                                maxBarSize={60}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Campaign Progress */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900">Campaign Progress</h2>
                                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
                                </div>
                                
                                <div className="space-y-5">
                                    {campaigns.slice(0, 3).map((campaign) => {
                                        const progress = (campaign.raised / campaign.goal) * 100;
                                        return (
                                            <div key={campaign.id} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium text-gray-900 text-sm">{campaign.name}</h4>
                                                    <span className="text-xs font-semibold text-gray-600">{Math.round(progress)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                                    <div 
                                                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                    <span>₹{campaign.raised.toLocaleString()}</span>
                                                    <span>Goal: ₹{campaign.goal.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <button className="w-full mt-6 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-medium text-sm transition-colors">
                                    View All Campaigns
                                </button>
                            </div>
                        </div>

                        {/* Bottom Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Benefit Requests */}
                            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">80G Benefit Requests</h2>
                                        <p className="text-sm text-gray-500 mt-1">Recent certification requests</p>
                                    </div>
                                    <div className="px-4 py-2 bg-blue-50 rounded-lg">
                                        <p className="text-xs text-gray-600 font-medium">Total Amount</p>
                                        <p className="text-lg font-bold text-blue-600">₹{totalBenefitAmount.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {benefitRequests.map((request) => (
                                        <div 
                                            key={request.id} 
                                            className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                                                    {request.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{request.name}</p>
                                                    <p className="text-xs text-gray-500">Certificate Request</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-900">₹{request.amount.toLocaleString()}</p>
                                                <p className="text-xs text-gray-500">Tax benefit</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button className="w-full mt-4 text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2">
                                    View All Requests →
                                </button>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                                    <FileText size={20} className="text-gray-400" />
                                </div>
                                
                                <div className="space-y-4">
                                    {recentActivities.map((activity) => (
                                        <div key={activity.id} className="flex space-x-3">
                                            <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-600"></div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {activity.donor && `${activity.donor} • ${activity.amount}`}
                                                    {activity.campaign && `${activity.campaign} • ${activity.milestone}`}
                                                    {activity.volunteer && activity.volunteer}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button className="w-full mt-6 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-medium text-sm transition-colors">
                                    View All Activity
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}