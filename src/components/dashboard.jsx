"use client";

import { useState, useEffect } from 'react';
import {
    ArrowUpRight,
    ArrowUp,
    Menu,
    Search,
    Bell,
    Sun,
    LogOut,
    Plus,
    CheckSquare,
    PieChart,
    Users,
    BarChart2,
    Settings,
    FileText,
    Calendar,
    ChevronDown,
    X
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

// Mock Data
const volunteers = [
    { id: 1, name: "Alex Johnson", hours: 45, area: "Food Distribution" },
    { id: 2, name: "Sarah Williams", hours: 32, area: "Medical Camp" },
    { id: 3, name: "Miguel Rodriguez", hours: 28, area: "Education" },
    { id: 4, name: "Emma Chen", hours: 60, area: "Shelter Management" },
    { id: 5, name: "Raj Patel", hours: 15, area: "Women Empowerment" },
    { id: 6, name: "Aisha Mohammed", hours: 50, area: "Food Distribution" },
    { id: 7, name: "David Kim", hours: 25, area: "Medical Aid" },
    { id: 8, name: "Priya Singh", hours: 42, area: "Education" },
    { id: 9, name: "John Doe", hours: 38, area: "Other" },
    { id: 10, name: "Lisa Wong", hours: 22, area: "Women Empowerment" },
    { id: 11, name: "Carlos Hernandez", hours: 30, area: "Shelter" },
    { id: 12, name: "Fatima Ahmed", hours: 55, area: "Education" },
];

const donations = [
    { id: 1, donor: "Jane Cooper", amount: 250.00, date: "2023-10-26", category: "Shelter", campaign: "Winter Shelter Fund" },
    { id: 2, donor: "John Smith", amount: 50.00, date: "2023-10-25", category: "Food", campaign: "Food for Families" },
    { id: 3, donor: "Emily White", amount: 1000.00, date: "2023-10-25", category: "Medical Aid", campaign: "Clean Water Project" },
    { id: 4, donor: "Michael Brown", amount: 75.00, date: "2023-10-24", category: "Education", campaign: "Education for All" },
    { id: 5, donor: "Sarah Jones", amount: 500.00, date: "2023-10-23", category: "Shelter", campaign: "Winter Shelter Fund" },
    { id: 6, donor: "Robert Chen", amount: 150.00, date: "2023-10-22", category: "Women Empowerment", campaign: "Women's Skills Training" },
    { id: 7, donor: "Maria Garcia", amount: 300.00, date: "2023-10-21", category: "Food", campaign: "Community Kitchen" },
    { id: 8, donor: "David Lee", amount: 200.00, date: "2023-10-20", category: "Medical Aid", campaign: "Mobile Health Clinic" },
    { id: 9, donor: "Priya Sharma", amount: 175.00, date: "2023-10-19", category: "Education", campaign: "School Supplies Drive" },
    { id: 10, donor: "Tom Wilson", amount: 125.00, date: "2023-10-18", category: "Other", campaign: "Emergency Relief Fund" },
    { id: 11, donor: "Fatima Hassan", amount: 450.00, date: "2023-10-17", category: "Women Empowerment", campaign: "Women's Skills Training" },
    { id: 12, donor: "James Anderson", amount: 350.00, date: "2023-10-16", category: "Shelter", campaign: "Homeless Support Initiative" },
];

const campaigns = [
    { id: 1, name: "Winter Shelter Fund", category: "Shelter", active: true, raised: 12500, goal: 15000 },
    { id: 2, name: "Food for Families", category: "Food", active: true, raised: 8750, goal: 10000 },
    { id: 3, name: "Clean Water Project", category: "Medical Aid", active: true, raised: 5200, goal: 7500 },
    { id: 4, name: "Education for All", category: "Education", active: true, raised: 9800, goal: 12000 },
    { id: 5, name: "Women's Skills Training", category: "Women Empowerment", active: true, raised: 4200, goal: 6000 },
    { id: 6, name: "Community Kitchen", category: "Food", active: false, raised: 3000, goal: 3000 },
    { id: 7, name: "Mobile Health Clinic", category: "Medical Aid", active: true, raised: 15000, goal: 20000 },
    { id: 8, name: "School Supplies Drive", category: "Education", active: true, raised: 2800, goal: 5000 },
    { id: 9, name: "Emergency Relief Fund", category: "Other", active: true, raised: 7500, goal: 10000 },
    { id: 10, name: "Homeless Support Initiative", category: "Shelter", active: false, raised: 8000, goal: 8000 },
];

const employees = [
    { id: 1, name: "Amelia Rodriguez", role: "Executive Director", department: "Management" },
    { id: 2, name: "Benjamin Taylor", role: "Program Manager", department: "Programs" },
    { id: 3, name: "Chloe Nguyen", role: "Finance Officer", department: "Finance" },
    { id: 4, name: "Daniel Jackson", role: "Volunteer Coordinator", department: "Operations" },
    { id: 5, name: "Emma Wilson", role: "Marketing Specialist", department: "Marketing" },
    { id: 6, name: "Felix Ahmed", role: "Fundraising Manager", department: "Development" },
    { id: 7, name: "Grace Kim", role: "Administrative Assistant", department: "Administration" },
    { id: 8, name: "Hector Ramirez", role: "Project Coordinator", department: "Programs" },
    { id: 9, name: "Isabella Chen", role: "Community Outreach Officer", department: "Outreach" },
    { id: 10, name: "Jonathan Patel", role: "IT Support Specialist", department: "IT" },
    { id: 11, name: "Kylie Martin", role: "Social Media Manager", department: "Marketing" },
    { id: 12, name: "Landon Washington", role: "Grant Writer", department: "Development" },
    { id: 13, name: "Maya Singh", role: "HR Manager", department: "Administration" },
    { id: 14, name: "Noah Thompson", role: "Field Coordinator", department: "Operations" },
    { id: 15, name: "Olivia Baker", role: "Donor Relations Officer", department: "Development" },
];

const benefitRequests = [
    { id: 1, name: "Rohit Sharma", amount: 1200.00, date: "2023-10-25", status: "Approved" },
    { id: 2, name: "Ananya Patel", amount: 850.00, date: "2023-10-24", status: "Pending" },
    { id: 3, name: "Vikram Singh", amount: 2000.00, date: "2023-10-23", status: "Approved" },
    { id: 4, name: "Meera Kapoor", amount: 1500.00, date: "2023-10-22", status: "Rejected" },
    { id: 5, name: "Rajiv Kumar", amount: 750.00, date: "2023-10-21", status: "Approved" },
    { id: 6, name: "Deepika Mehta", amount: 1350.00, date: "2023-10-20", status: "Pending" },
    { id: 7, name: "Arjun Reddy", amount: 900.00, date: "2023-10-19", status: "Approved" },
    { id: 8, name: "Neha Gupta", amount: 1100.00, date: "2023-10-18", status: "Pending" },
];

export default function Dashboard() {
    // State declarations - separate mobile vs desktop state
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [categoryFilters, setCategoryFilters] = useState({
        Food: true,
        Education: true,
        "Women Empowerment": true,
        "Medical Aid": true,
        Shelter: true,
        Other: true
    });
    const [dateRange, setDateRange] = useState({ start: '2023-10-01', end: '2023-10-31' });

    // Handle desktop sidebar collapse behavior
    useEffect(() => {
        const handleResize = () => {
            // Only apply desktop collapse logic
            if (window.innerWidth < 1024) {
                setIsSidebarCollapsed(false); // Reset collapse state on mobile
            }

            // Close mobile search on resize
            if (window.innerWidth > 640) {
                setIsSearchExpanded(false);
            }
        };

        // Initial check
        handleResize();

        // Add event listener
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Handle mobile drawer behavior
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileSidebarOpen(false); // Close mobile sidebar on desktop size
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event) => {
            const sidebar = document.getElementById('mobile-sidebar');
            if (isMobileSidebarOpen && sidebar && !sidebar.contains(event.target)) {
                setIsMobileSidebarOpen(false);
            }
        };

        if (isMobileSidebarOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobileSidebarOpen]);

    // Computed values from data
    const totalVolunteers = volunteers.length;
    const totalDonationReceived = donations.reduce((sum, donation) => sum + donation.amount, 0);
    const totalCampaignsRunning = campaigns.filter(campaign => campaign.active).length;
    const totalEmployees = employees.length;
    const totalBenefitRequests = benefitRequests.length;
    const totalBenefitAmount = benefitRequests.reduce((sum, request) => sum + request.amount, 0);

    // Prepare donation by category data for chart
    const categoryData = [
        { name: 'Food', amount: 0 },
        { name: 'Education', amount: 0 },
        { name: 'Women Empowerment', amount: 0 },
        { name: 'Medical Aid', amount: 0 },
        { name: 'Shelter', amount: 0 },
        { name: 'Other', amount: 0 }
    ];

    donations.forEach(donation => {
        const categoryItem = categoryData.find(item => item.name === donation.category);
        if (categoryItem) {
            categoryItem.amount += donation.amount;
        }
    });

    const filteredCategoryData = categoryData.filter(item => categoryFilters[item.name]);

    const toggleCategoryFilter = (category) => {
        setCategoryFilters(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'text-green-500 bg-green-500/10';
            case 'Pending': return 'text-yellow-500 bg-yellow-500/10';
            case 'Rejected': return 'text-red-500 bg-red-500/10';
            default: return 'text-gray-500 bg-emerald-500/10';
        }
    };

    // Mobile navigation links with clear labels
    const navLinks = [
        { icon: <PieChart size={22} />, label: "Dashboard", isActive: true },
        { icon: <BarChart2 size={22} />, label: "Campaigns", isActive: false },
        { icon: <Users size={22} />, label: "Donors", isActive: false },
        { icon: <FileText size={22} />, label: "Reports", isActive: false },
        { icon: <Settings size={22} />, label: "Settings", isActive: false },
    ];

    return (
       <div className="flex h-screen bg-[#F9FAFB] text-gray-900 overflow-hidden">
            {/* Mobile Sidebar Backdrop - only shows when mobile sidebar is open */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* Sidebar with separated mobile/desktop behavior */}
            <div
                id="mobile-sidebar"
                className={`fixed h-full z-50 transition-all duration-300
                  lg:relative lg:left-0 
                  ${isMobileSidebarOpen ? 'left-0' : '-left-full'} 
                  w-64 ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} 
                  bg-[#06291F]/95 backdrop-blur-md p-4 flex flex-col
                  shadow-xl lg:shadow-none border-r border-emerald-800/30
                  overflow-y-auto`}
            >
                {/* Mobile sidebar header with logo and title */}
                <div className="flex items-center mb-8 border-b border-emerald-800/30 pb-4">
                    <div className="bg-emerald-600 rounded-full h-10 w-10 flex items-center justify-center text-white mr-3 shadow-md shadow-emerald-900/20">
                        <div className="text-xl font-bold">D</div>
                    </div>
                    {/* Always show on mobile, conditionally on desktop */}
                    <div className={`flex-1 ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>
                        <h2 className="text-lg font-medium text-white">Donation Platform</h2>
                        <p className="text-sm text-emerald-300/80">Admin Panel</p>
                    </div>

                    {/* Close button - mobile only */}
                    <button
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className="ml-auto text-white bg-emerald-800/50 p-1.5 rounded-full hover:bg-emerald-700/50 lg:hidden"
                        aria-label="Close sidebar"
                    >
                        <X size={20} />
                    </button>

                    {/* Collapse button - desktop only */}
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="ml-auto text-gray-400 hover:text-white hidden lg:block"
                        aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <Menu size={20} />
                    </button>
                </div>

                {/* Navigation menu */}
                <nav className="flex-1 mt-2">
                    <ul className="space-y-3">
                        {navLinks.map((link, index) => (
                            <li key={index}>
                                <a
                                    href="#"
                                    className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${link.isActive
                                        ? 'bg-emerald-700 text-white shadow-md shadow-emerald-900/10'
                                        : 'text-emerald-100/90 hover:bg-emerald-800/50 hover:text-white'
                                        }`}
                                >
                                    <div className="flex-shrink-0">{link.icon}</div>
                                    {/* Always show on mobile, conditionally on desktop */}
                                    <span className={`ml-3 font-medium ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>
                                        {link.label}
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Bottom section with logout button */}
                <div className="mt-auto pt-4 border-t border-emerald-800/30">
                    <a
                        href="#"
                        className="flex items-center p-3 text-emerald-100/80 rounded-lg hover:bg-emerald-800/50 hover:text-white transition-colors duration-200"
                    >
                        <LogOut size={22} className="flex-shrink-0" />
                        {/* Always show on mobile, conditionally on desktop */}
                        <span className={`ml-3 font-medium ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>
                            Logout
                        </span>
                    </a>
                </div>

                {/* Mobile sidebar footer - not visible on desktop */}
                <div className="mt-4 pt-4 text-xs text-center text-emerald-700/80 lg:hidden">
                    <p>Admin Dashboard v1.2.3</p>
                </div>
            </div>

            {/* Main Content - adjusts with sidebar on desktop */}
            <div className="flex-1 flex flex-col w-full lg:w-auto overflow-hidden">
                {/* Header - with clearer mobile menu button */}
                <header className="bg-[#073528]/70 backdrop-blur-lg border-b border-emerald-800/30 p-4 flex justify-between items-center sticky top-0 z-30">
                    {/* Mobile menu toggle - only visible on mobile */}
                    <button
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="text-white bg-emerald-700/50 p-1.5 rounded-md hover:bg-emerald-600/50 lg:hidden"
                        aria-label="Open menu"
                    >
                        <Menu size={20} />
                    </button>

                    {/* Search bar - adaptive for mobile */}
                    {/* Search bar - adaptive for mobile */}
                    <div
                        className={`${isSearchExpanded
                            ? 'w-full absolute inset-x-0 px-4'
                            : 'w-auto relative'
                            } transition-all duration-200 mx-auto sm:mx-0 sm:w-80`}
                    >
                        <div
                            className={`relative flex items-center ${isSearchExpanded
                                ? 'bg-[#073528]/90 shadow-lg p-4 border-b border-emerald-800/30'
                                : ''
                                }`}
                        >
                            {/* Mobile search toggle (no X icon now) */}
                            {!isSearchExpanded && (
                                <button
                                    onClick={() => setIsSearchExpanded(true)}
                                    className="text-white bg-emerald-700/50 p-1.5 rounded-md hover:bg-emerald-600/50 sm:hidden"
                                    aria-label="Open search"
                                >
                                    <Search size={20} />
                                </button>
                            )}

                            {/* Search input - hidden on mobile until expanded */}
                            <div
                                className={`relative ${isSearchExpanded ? 'flex-1' : 'hidden sm:block w-80'
                                    }`}
                            >
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500"
                                    size={18}
                                />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-10 pr-4 py-2 bg-emerald-900/30 border border-emerald-700/50 text-emerald-50 placeholder-emerald-400/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 rounded-full shadow-inner"
                                />
                            </div>

                            {/* Cancel button - only visible when expanded */}
                            {isSearchExpanded && (
                                <button
                                    onClick={() => setIsSearchExpanded(false)}
                                    className="text-emerald-300 font-medium hover:text-white ml-3"
                                    aria-label="Cancel search"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>


                    <div className="flex items-center space-x-4">
                        <button className="text-emerald-300 hover:text-white hidden sm:block">
                            <Bell size={20} />
                        </button>
                        <div className="h-9 w-9 rounded-full bg-emerald-300 flex items-center justify-center text-emerald-800 font-bold shadow-md">
                            <span>NK</span>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content - Scrollable area */}
                <main className="flex-1 overflow-auto p-4 sm:p-5 md:p-6">
                    <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-5 md:mb-6 text-gray-900">Dashboard Overview</h1>

                    {/* Stats Cards - Responsive grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-7 md:mb-8">
                        {/* Total Volunteers */}
                        <div className="bg-[#052E22]/80 backdrop-blur-sm border border-white/5 shadow-lg shadow-emerald-500/10 p-4 sm:p-5 rounded-lg transform hover:scale-105 transition-all duration-300 ease-out hover:scale-[1.03] cursor-pointer">
                            <h3 className="text-gray-900mb-1 sm:mb-2">Total Volunteers</h3>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-500">{totalVolunteers}</p>
                            <div className="flex items-center mt-2 text-emerald-500">
                                <ArrowUp size={16} className="mr-1" />
                                <span>+5.2%</span>
                            </div>
                        </div>


                        {/* Total Donation Received */}
                        <div className="bg-[#052E22]/80 backdrop-blur-sm border border-white/5 shadow-lg shadow-emerald-500/10 p-4 sm:p-5 rounded-lg transform hover:scale-105 transition-all duration-300 ease-out hover:scale-[1.03] cursor-pointer">
                            <h3 className=" mb-1 sm:mb-2 text-gray-900">Total Donation Received</h3>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-500">₹{totalDonationReceived.toLocaleString()}</p>
                            <div className="flex items-center mt-2 text-green-400">
                                <ArrowUpRight size={16} className="mr-1" />
                                <span>+8.7% this month</span>
                            </div>
                        </div>

                        {/* Total Campaigns Running */}
                        <div className="bg-[#052E22]/80 backdrop-blur-sm border border-white/5 shadow-lg shadow-emerald-500/10 p-4 sm:p-5 rounded-lg transform hover:scale-105 transition-all duration-300 ease-out hover:scale-[1.03] cursor-pointer">
                            <h3 className="mb-1 sm:mb-2 text-gray-900">Total Campaigns Running</h3>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-500">{totalCampaignsRunning}</p>
                            <div className="flex items-center mt-2 text-green-400">
                                <span>+2 this month</span>
                            </div>
                        </div>

                        {/* Total Employees */}
                        <div className="bg-[#052E22]/80 backdrop-blur-sm border border-white/5 shadow-lg shadow-emerald-500/10 p-4 sm:p-5 rounded-lg transform hover:scale-105 transition-all duration-300 ease-out hover:scale-[1.03] cursor-pointer">
                            <h3 className=" mb-1 sm:mb-2 text-gray-900">Total Employees</h3>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-500">{totalEmployees}</p>
                            <div className="flex items-center mt-2 text-green-400">
                                <ArrowUp size={16} className="mr-1" />
                                <span>+3 new hires</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-7 md:mb-8">
                        <button className="flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-emerald-500 hover:bg-green-900 text-black rounded-md transition cursor-pointer text-sm sm:text-base">
                            <Plus size={18} className="mr-2" />
                            <span className="hidden xs:inline ">Create New</span> Campaign
                        </button>
                        <button className="flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition cursor-pointer text-sm sm:text-base">
                            <CheckSquare size={18} className="mr-2" />
                            <span className="hidden xs:inline">Approve</span> Requests
                        </button>
                    </div>

                    {/* Charts and Tables Grid - Stack on mobile, side-by-side on large screens */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-6 sm:mb-7 md:mb-8">
                        {/* Category-wise Donation Comparison Graph */}
                        <div className="lg:col-span-2 bg-[#052E22]/80 backdrop-blur-sm border border-white/5 shadow-lg shadow-emerald-500/10 rounded-lg overflow-hidden">
                            <div className="p-4 sm:p-5 md:p-6 border-b border-gray-700">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                    <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-0 text-white">Category-wise Donation</h2>
                                    <div className="flex items-center space-x-3 mt-2 sm:mt-0">
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 sm:p-4">
                                {/* Category Filter Pills - Horizontal scrolling on mobile */}
                                <div className="flex flex-nowrap gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
                                    {Object.keys(categoryFilters).map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => toggleCategoryFilter(category)}
                                            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs ${categoryFilters[category]
                                                ? 'bg-white-500/20 text-green-400 border border-green-500/30'
                                                : 'bg-white-700/50 text-gray-400 border border-gray-700'
                                                }`}
                                        >
                                            {category.length > 10 && window.innerWidth < 640
                                                ? `${category.slice(0, 8)}...`
                                                : category}
                                        </button>
                                    ))}
                                </div>

                                {/* Responsive Chart Height */}
                                <div className="h-48 sm:h-56 md:h-64 cursor-pointer">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={filteredCategoryData}
                                            margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                stroke="#999"
                                                tick={{ fontSize: 10 }}
                                                tickFormatter={(value) => {
                                                    // Abbreviate long category names on small screens
                                                    if (window.innerWidth < 640 && value.length > 6) {
                                                        return value.substring(0, 5) + '...';
                                                    }
                                                    return value;
                                                }}
                                            />
                                            <YAxis stroke="#999" tick={{ fontSize: 10 }} />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '4px' }}
                                                labelStyle={{ color: 'white' }}
                                            />
                                            <Legend
                                                wrapperStyle={{ paddingTop: '10px' }}
                                                formatter={(value) => {
                                                    // Shorter legend on small screens
                                                    if (window.innerWidth < 640) {
                                                        return 'Donation ($)';
                                                    }
                                                    return value;
                                                }}
                                            />
                                            <Bar dataKey="amount" name="Donation Amount ($)" fill="#6EE7B7" radius={[4, 4, 0, 0]} activeBar={false} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* 80G Benefit Requests Summary */}
                        <div className="bg-[#052E22]/80 backdrop-blur-sm border border-white/5 shadow-lg shadow-emerald-500/10 rounded-lg overflow-hidden">
                            <div className="p-4 sm:p-5 md:p-6 border-b border-gray-700">
                                <h2 className="text-lg sm:text-xl font-semibold text-white">80G Benefit Requests</h2>
                            </div>
                            <div className="p-4 sm:p-5 md:p-6">
                                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                                    <div className="bg-gray-700/50 p-3 sm:p-4 rounded-lg">
                                        <h4 className="text-gray-400 text-xs sm:text-sm mb-1 text-white">Total Requests</h4>
                                        <p className="text-base sm:text-xl font-bold text-white">{totalBenefitRequests}</p>
                                    </div>
                                    <div className="bg-gray-700/50 p-3 sm:p-4 rounded-lg">
                                        <h4 className="text-gray-400 text-xs sm:text-sm mb-1 text-white">Total Amount</h4>
                                        <p className="text-base sm:text-xl font-bold text-white">₹{totalBenefitAmount.toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Table with horizontal scroll for mobile */}
                                {/* Responsive Table Wrapper */}
                                <div className="w-full overflow-x-auto rounded-lg border border-emerald-800/30 bg-[#052E22]/60 backdrop-blur-sm">
                                    <div className="max-h-60 sm:max-h-80 overflow-y-auto">
                                        <table className="w-full text-left border-collapse min-w-[320px]">
                                            <thead className="sticky top-0 bg-emerald-950/80 text-gray-300 text-xs sm:text-sm">
                                                <tr>
                                                    <th className="px-4 sm:px-5 py-2 sm:py-3 font-medium">Name</th>
                                                    <th className="px-4 sm:px-5 py-2 sm:py-3 font-medium text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-emerald-900/50 text-emerald-100">
                                                {benefitRequests.slice(0, 5).map((request, index) => (
                                                    <tr
                                                        key={index}
                                                        className="hover:bg-emerald-800/20 transition-colors duration-150"
                                                    >
                                                        <td className="px-4 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm">
                                                            {request.name}
                                                        </td>
                                                        <td className="px-4 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm text-right">
                                                            ₹{request.amount.toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>


                                <div className="mt-4">
                                    <button className="w-full text-center text-xs sm:text-sm text-green-400 hover:text-green-300">
                                        View All Requests
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Create Campaign Button (Mobile) */}
                    <div className="sm:hidden mb-6">
                        <button className="w-full flex items-center justify-center px-4 py-3 bg-emerald-500 hover:bg-green-600 text-black rounded-md transition cursor-pointer shadow-lg">
                            <Plus size={18} className="mr-2" />
                            Create Campaign
                        </button>
                    </div>

                    {/* Extra spacing at bottom for mobile scrolling */}
                    <div className="h-4 sm:h-0"></div>
                </main>
            </div>
        </div>
    );
}