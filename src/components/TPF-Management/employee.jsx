"use client";
import { useState, useMemo, useEffect } from 'react';
import {
    ArrowLeft,
    Users,
    Clock,
    DollarSign,
    Receipt,
    Calendar,
    Search,
    Filter,
    Download,
    Plus,
    CheckCircle,
    XCircle,
    Eye,
    FileText,
    TrendingUp,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Upload,
    Save,
    Trash2,
    UserX,
    Loader2,
    Mail,
    Briefcase,
    Building2,
    MoreVertical,
} from 'lucide-react';
import { useGetEmployeesQuery, useGetAdminSalaryQuery, useGetAdminExpensesQuery, useGetEmployeeLoginLogoutTimeQuery } from '@/utils/slices/adminApiSlice';
import DetailsModal from "./popupModal"

export default function EmployeeManagement() {
    const [employees, setEmployees] = useState([]);
    const [activeTab, setActiveTab] = useState("overview");
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [modalType, setModalType] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedSalary, setSelectedSalary] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedEmployee, setEditedEmployee] = useState(null);
    const [selectedExpense, setSelectedExpense] = useState(null);

    const { data, error, isLoading } = useGetEmployeesQuery();
    const { data: salaryData, isLoading: isSalaryLoading, error: salaryError } = useGetAdminSalaryQuery(
        selectedEmployee ? selectedEmployee._id : null
    );
    const { data: expensesData } = useGetAdminExpensesQuery(selectedEmployee ? selectedEmployee._id : null);
    const { data: loginLogoutData, error: loginLogoutError, isLoading: loginLogoutLoading } = useGetEmployeeLoginLogoutTimeQuery(
        selectedEmployee && selectedEmployee._id ? selectedEmployee._id : undefined
    );

    useEffect(() => {
        if (expensesData?.data && selectedEmployee && !selectedEmployee.expenses) {
            setSelectedEmployee(prev => ({ ...prev, expenses: expensesData.data }));
        }
    }, [expensesData, selectedEmployee]);

    useEffect(() => {
        if (data) {
            setEmployees(data.admins);
            console.log("data is this", data.admins);
        }
    }, [data]);

    useEffect(() => {
        if (selectedEmployee) {
            console.log("Fetching login/logout data for:", selectedEmployee._id);
        }
    }, [selectedEmployee]);

    useEffect(() => {
        if (selectedEmployee) {
            console.log("Login/Logout Data:", loginLogoutData);
        }
    }, [loginLogoutData, selectedEmployee]);

    const handleViewSalaryDetails = (salary) => {
        setSelectedSalary(salary);
        setModalOpen(true);
    };

    const handleViewExpenseDetails = (expense) => {
        setSelectedExpense(expense);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedSalary(null);
        setSelectedExpense(null);
    };

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const searchLower = searchQuery.toLowerCase();
            return (
                (emp.name && emp.name.toLowerCase().includes(searchLower)) ||
                (emp.email && emp.email.toLowerCase().includes(searchLower)) ||
                (emp.department && emp.department.toLowerCase().includes(searchLower)) ||
                (emp.position && emp.position.toLowerCase().includes(searchLower))
            );
        });
    }, [employees, searchQuery]);

    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo(0, 0);
    };

    const handleBack = () => {
        if (selectedEmployee) {
            setSelectedEmployee(null);
            setIsEditing(false);
            setEditedEmployee(null);
        } else {
            window.location.href = '/tpf-management';
        }
    };

    if (loginLogoutLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <Loader2 className="animate-spin" />
                <p>Loading login/logout data...</p>
            </div>
        );
    }

    // Error state for login/logout data
    if (loginLogoutError) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <p>Error loading login/logout data: {loginLogoutError.message}</p>
            </div>
        );
    }

    const totalEmployees = employees.length;

    const getStatusBadge = (status) => {
        if (!status) return null;
        const styles = {
            disabled: "bg-red-50 text-red-700 border border-red-200",
            active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        };
        return (
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </span>
        );
    };

    const salaryHistory = salaryData?.data || [];
    const totalSalary = salaryData?.totalSalary || 0;

    if (selectedEmployee) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-4 sm:p-8">
                {modalOpen && (selectedSalary || selectedExpense) && (
                    <DetailsModal
                        data={selectedSalary || selectedExpense}
                        type={selectedSalary ? "salary" : "expense"}
                        onClose={handleCloseModal}
                    />
                )}

                <button
                    onClick={handleBack}
                    className="group flex cursor-pointer items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-all duration-200"
                >
                    <div className="p-2 rounded-lg bg-white shadow-sm group-hover:shadow-md group-hover:bg-slate-50 transition-all duration-200">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Back to Employees</span>
                </button>

                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
                        <div className="relative">
                            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-800 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                {selectedEmployee.fullName.charAt(0)}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white"></div>
                        </div>
                        <div className="flex-1">
                            {isEditing ? (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={editedEmployee.fullName}
                                        onChange={(e) => setEditedEmployee({ ...editedEmployee, name: e.target.value })}
                                        className="text-2xl font-bold border-b-2 border-blue-500 focus:outline-none bg-transparent"
                                    />
                                    <input
                                        type="email"
                                        value={editedEmployee.email}
                                        onChange={(e) => setEditedEmployee({ ...editedEmployee, email: e.target.value })}
                                        className="text-slate-600 border-b border-slate-300 focus:outline-none bg-transparent"
                                    />
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{selectedEmployee.fullName}</h2>
                                    <p className="text-slate-600 flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        {selectedEmployee.email}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
                            <div className="flex items-center gap-2 text-blue-600 mb-2">
                                <Building2 className="w-4 h-4" />
                                <p className="text-xs font-semibold uppercase tracking-wide">Department</p>
                            </div>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedEmployee.department}
                                    onChange={(e) => setEditedEmployee({ ...editedEmployee, department: e.target.value })}
                                    className="font-semibold text-slate-900 border-b border-blue-300 focus:outline-none w-full bg-transparent"
                                />
                            ) : (
                                <p className="font-semibold text-slate-900">{selectedEmployee.department}</p>
                            )}
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200">
                            <div className="flex items-center gap-2 text-purple-600 mb-2">
                                <Briefcase className="w-4 h-4" />
                                <p className="text-xs font-semibold uppercase tracking-wide">Position</p>
                            </div>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedEmployee.position}
                                    onChange={(e) => setEditedEmployee({ ...editedEmployee, position: e.target.value })}
                                    className="font-semibold text-slate-900 border-b border-purple-300 focus:outline-none w-full bg-transparent"
                                />
                            ) : (
                                <p className="font-semibold text-slate-900">{selectedEmployee.position}</p>
                            )}
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-4 border border-amber-200">
                            <div className="flex items-center gap-2 text-amber-600 mb-2">
                                <Calendar className="w-4 h-4" />
                                <p className="text-xs font-semibold uppercase tracking-wide">Join Date</p>
                            </div>
                            <p className="font-semibold text-slate-900">
                                {selectedEmployee.createdAt
                                    ? new Date(selectedEmployee.createdAt).toLocaleDateString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    })
                                    : "Not Available"}
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 border border-emerald-200">
                            <div className="flex items-center gap-2 text-emerald-600 mb-2">
                                <CheckCircle className="w-4 h-4" />
                                <p className="text-xs font-semibold uppercase tracking-wide">Status</p>
                            </div>
                            {getStatusBadge(selectedEmployee.status)}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-6">
                    <div className="flex border-b border-slate-200">
                        {["login", "salary", "expenses"].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-200 relative ${activeTab === tab
                                    ? "text-blue-600 bg-blue-50"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                    }`}
                            >
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>
                                )}
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
                    {activeTab === "login" && selectedEmployee && (
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Login Records</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Login Time</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Logout Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {loginLogoutData?.sessions?.map((session, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-4 text-sm text-slate-900">{new Date(session.loginTime).toLocaleString()}</td>
                                                <td className="px-4 py-4 text-sm text-slate-600">{session.logoutTime === "Not logged out yet" ? "Still Logged In" : new Date(session.logoutTime).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === "salary" && (
                        <div>
                            <div className="bg-gradient-to-br from-emerald-500 to-emerald-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <DollarSign className="w-5 h-5 text-white" />
                                    </div>
                                    <p className="text-sm font-medium text-blue-100 uppercase tracking-wide">Total Salary </p>
                                </div>
                                <p className="text-4xl sm:text-5xl font-bold text-white">
                                    {isSalaryLoading
                                        ? "Loading..."
                                        : totalSalary > 0
                                            ? `₹${totalSalary.toLocaleString()}`
                                            : "Not available"
                                    }
                                </p>
                            </div>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-emerald-100 rounded-xl">
                                    <FileText className="w-5 h-5 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Salary History</h3>
                            </div>

                            <div className="space-y-4">
                                {salaryHistory.length > 0 ? (
                                    salaryHistory.map((record, idx) => (
                                        <div key={idx} className="group border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition-all duration-200">
                                            <div className="flex justify-between items-center">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <DollarSign className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">
                                                                {new Date(record.createdAt).toLocaleDateString("en-IN", {
                                                                    day: "numeric",
                                                                    month: "long",
                                                                    year: "numeric"
                                                                })}
                                                            </p>
                                                            <p className="text-sm text-slate-600">Payment processed</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-2xl font-bold text-emerald-600">₹{record.amount.toLocaleString()}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleViewSalaryDetails(record)}
                                                    className="px-5 py-2.5 cursor-pointer bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all duration-200 hover:shadow-lg hover:scale-105"
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Receipt className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <p className="text-slate-500 font-medium">No salary history available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "expenses" && (
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-amber-100 rounded-xl">
                                    <Receipt className="w-5 h-5 text-amber-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Expense Records</h3>
                            </div>

                            {selectedEmployee && selectedEmployee.expenses && selectedEmployee.expenses.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Receipt className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <p className="text-slate-500 font-medium">No expenses recorded</p>
                                </div>
                            ) : (
                                selectedEmployee && selectedEmployee.expenses && selectedEmployee.expenses.length > 0 ? (
                                    <div className="space-y-4">
                                        {selectedEmployee.expenses.map((expense) => (
                                            <div key={expense._id} className="group border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-amber-300 transition-all duration-200">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                                                <Receipt className="w-5 h-5 text-amber-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-slate-900">{expense.reimbursementTo.adminId.fullName}</p>
                                                                <p className="text-sm text-slate-600">{expense.description}</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-slate-500 ml-13">
                                                            {new Date(expense.createdAt).toLocaleDateString("en-IN", {
                                                                day: "numeric",
                                                                month: "long",
                                                                year: "numeric"
                                                            })}
                                                        </p>
                                                    </div>
                                                    {getStatusBadge(expense.status)}
                                                </div>
                                                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                                    <span className="text-2xl font-bold text-emerald-600">₹{expense.amount.toLocaleString()}</span>
                                                    <button
                                                        onClick={() => handleViewExpenseDetails(expense)}
                                                        className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-800 rounded-lg transition-all duration-200 font-medium"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Receipt className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <p className="text-slate-500 font-medium">No expenses recorded</p>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Loading employees...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Error Loading Data</h3>
                    <p className="text-slate-600 text-center">{error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-4 sm:p-8">
            <button
                onClick={handleBack}
                className="group flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-all duration-200"
            >
                <div className="p-2 rounded-lg bg-white shadow-sm group-hover:shadow-md group-hover:bg-slate-50 transition-all duration-200">
                    <ArrowLeft className="w-4 h-4" />
                </div>
                <span className="font-medium">Back to TPF Management</span>
            </button>

            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Employee Management</h1>
                <p className="text-slate-600">Manage and monitor your team members</p>
            </div>

            <div className="max-w-sm mx-auto mb-8">
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600 mb-1 font-medium">Total Employees</p>
                            <p className="text-4xl font-bold text-slate-900">{totalEmployees}</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by name, email, department, or position..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-12 pr-4 py-3.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>
                {searchQuery && (
                    <p className="text-sm text-slate-600 mt-3 font-medium">
                        Found {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''}
                    </p>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">All Employees</h2>
                    <div className="text-sm text-slate-600 font-medium">
                        {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredEmployees.length)} of {filteredEmployees.length}
                    </div>
                </div>

                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Employee</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Department</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Position</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {currentEmployees.map(employee => (
                                <tr key={employee._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md">
                                                {employee.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{employee.fullName}</p>
                                                <p className="text-xs text-slate-500">{employee.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-slate-700">{employee.department}</td>
                                    <td className="px-4 py-4 text-sm text-slate-700">{employee.position}</td>
                                    <td className="px-4 py-4">{getStatusBadge(employee.status)}</td>
                                    <td className="px-4 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedEmployee(employee)}
                                            className="px-4 py-2 cursor-pointer bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-all duration-200 hover:shadow-lg hover:scale-105"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="md:hidden space-y-4">
                    {currentEmployees.map(employee => (
                        <div key={employee._id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition-all duration-200">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                                    {employee.fullName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-slate-900 mb-1">{employee.fullName}</h3>
                                    <p className="text-sm text-slate-600 mb-1">{employee.position}</p>
                                    <p className="text-xs text-slate-500">{employee.department}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs text-slate-500 font-medium">Status:</span>
                                {getStatusBadge(employee.status)}
                            </div>
                            <button
                                onClick={() => setSelectedEmployee(employee)}
                                className="w-full px-4 py-3 cursor-pointer bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all duration-200 hover:shadow-lg"
                            >
                                View Details
                            </button>
                        </div>
                    ))}
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-slate-700 hover:shadow-md"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Previous</span>
                        </button>

                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                                if (
                                    page === 1 ||
                                    page === totalPages ||
                                    (page >= currentPage - 1 && page <= currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`w-10 h-10 rounded-xl transition-all duration-200 font-semibold ${currentPage === page
                                                ? 'bg-blue-600 text-white shadow-lg'
                                                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:shadow-md'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                } else if (
                                    page === currentPage - 2 ||
                                    page === currentPage + 2
                                ) {
                                    return <span key={page} className="text-slate-400 px-2">...</span>;
                                }
                                return null;
                            })}
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-slate-700 hover:shadow-md"
                        >
                            <span className="hidden sm:inline">Next</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {filteredEmployees.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-10 h-10 text-slate-400" />
                        </div>
                        <p className="text-slate-600 font-medium mb-2">No employees found</p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="text-blue-600 hover:text-blue-700 text-sm font-semibold hover:underline"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}