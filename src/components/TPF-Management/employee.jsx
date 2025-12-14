"use client";
import { useState, useMemo } from 'react';
import EmployeeModal from "./employeemodal";
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
    Edit,
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
} from 'lucide-react';

// Sample employee data - FIXED: All employees now have consistent salary structure
const initialEmployeesData = [
    {
        id: 1,
        name: "John Doe",
        email: "john.doe@company.com",
        department: "Engineering",
        position: "Senior Developer",
        joinDate: "2023-01-15",
        status: "active",
        salary: {
            amount: 80000,
            history: [
                { month: "Nov 2024", amount: 80000 },
                { month: "Oct 2024", amount: 78000 },
                { month: "Sep 2024", amount: 77000 }
            ]
        },
        loginRecords: [
            { date: "2024-12-13", loginTime: "08:55 AM", logoutTime: "06:05 PM", duration: "9h 10m" },
            { date: "2024-12-12", loginTime: "09:10 AM", logoutTime: "06:35 PM", duration: "9h 25m" },
            { date: "2024-12-11", loginTime: "-", logoutTime: "-", duration: "0h" }
        ],
        expenses: [
            { id: 1, type: "Travel", amount: 500, description: "Client meeting in Pune", date: "2024-12-10", status: "approved", receipt: true },
            { id: 2, type: "Meals", amount: 150, description: "Team lunch", date: "2024-12-08", status: "pending", receipt: true }
        ]
    },
    {
        id: 2,
        name: "Sarah Smith",
        email: "sarah.smith@company.com",
        department: "Marketing",
        position: "Marketing Manager",
        joinDate: "2023-03-20",
        status: "active",
        salary: {
            amount: 69000,
            history: [
                { month: "Nov 2024", amount: 69000 },
                { month: "Oct 2024", amount: 67000 }
            ]
        },
        loginRecords: [
            { date: "2024-12-13", loginTime: "08:40 AM", logoutTime: "05:50 PM", duration: "9h 10m" },
            { date: "2024-12-12", loginTime: "08:55 AM", logoutTime: "06:05 PM", duration: "9h 10m" }
        ],
        expenses: [
            { id: 3, type: "Equipment", amount: 1200, description: "New laptop for campaign work", date: "2024-12-05", status: "rejected", receipt: true },
            { id: 4, type: "Software", amount: 300, description: "Adobe Creative Cloud subscription", date: "2024-12-01", status: "approved", receipt: false }
        ]
    },
    {
        id: 3,
        name: "Michael Johnson",
        email: "michael.j@company.com",
        department: "Sales",
        position: "Sales Executive",
        joinDate: "2023-06-10",
        status: "active",
        salary: {
            amount: 55000,
            history: [
                { month: "Nov 2024", amount: 55000 }
            ]
        },
        loginRecords: [
            { date: "2024-12-13", loginTime: "09:25 AM", logoutTime: "07:05 PM", duration: "9h 40m" }
        ],
        expenses: [
            { id: 5, type: "Travel", amount: 800, description: "Client visit to Delhi", date: "2024-12-09", status: "pending", receipt: true }
        ]
    },
    {
        id: 4,
        name: "Emily Davis",
        email: "emily.davis@company.com",
        department: "HR",
        position: "HR Manager",
        joinDate: "2022-11-01",
        status: "on-leave",
        salary: {
            amount: 70000,
            history: [
                { month: "Nov 2024", amount: 70000 }
            ]
        },
        loginRecords: [
            { date: "2024-12-11", loginTime: "09:00 AM", logoutTime: "06:00 PM", duration: "9h" }
        ],
        expenses: []
    },
    {
        id: 5,
        name: "Robert Brown",
        email: "robert.brown@company.com",
        department: "Engineering",
        position: "Backend Developer",
        joinDate: "2024-01-15",
        status: "active",
        salary: {
            amount: 68000,
            history: [
                { month: "Nov 2024", amount: 68000 }
            ]
        },
        loginRecords: [
            { date: "2024-12-13", loginTime: "09:55 AM", logoutTime: "07:05 PM", duration: "9h 10m" }
        ],
        expenses: [
            { id: 6, type: "Training", amount: 500, description: "AWS Certification course", date: "2024-12-07", status: "pending", receipt: true }
        ]
    }
];

export default function EmployeeManagement() {
    const [employees, setEmployees] = useState(initialEmployeesData);
    const [activeTab, setActiveTab] = useState("overview");
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedEmployee, setEditedEmployee] = useState(null);

    const [expenseForm, setExpenseForm] = useState({
        type: 'Travel',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        receipt: false
    });

    const [newEmployeeForm, setNewEmployeeForm] = useState({
        fullname: '',
        email: '',
        password: '',
        department: '',
        position: '',
        joinDate: new Date().toISOString().split('T')[0]
    });

    const [salaryForm, setSalaryForm] = useState({
        month: '',
        amount: '',
    });

    // Filter and search employees
    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const searchLower = searchQuery.toLowerCase();
            return (
                emp.name.toLowerCase().includes(searchLower) ||
                emp.email.toLowerCase().includes(searchLower) ||
                emp.department.toLowerCase().includes(searchLower) ||
                emp.position.toLowerCase().includes(searchLower)
            );
        });
    }, [employees, searchQuery]);


    // Pagination
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

    const openModal = (type, item = null) => {
        setModalType(type);
        setSelectedItem(item);
        setShowModal(true);
        if (type === 'add-employee') {
            setNewEmployeeForm({
                fullname: '',
                email: '',
                password: '',
                department: '',
                position: '',
                joinDate: new Date().toISOString().split('T')[0]
            });
        }

        if (type === 'expense' && item) {
            setExpenseForm({
                type: item.type,
                amount: item.amount,
                description: item.description,
                date: item.date,
                receipt: item.receipt
            });
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setModalType("");
        setSelectedItem(null);
        setExpenseForm({
            type: 'Travel',
            amount: '',
            description: '',
            date: new Date().toISOString().split('T')[0],
            receipt: false
        });
        setSalaryForm({
            month: '',
            amount: '',
        });
        setNewEmployeeForm({
            fullname: '',
            email: '',
            password: '',
            department: '',
            position: '',
            joinDate: new Date().toISOString().split('T')[0]
        });
    };

    // Statistics
    const totalEmployees = employees.length;

    const getStatusBadge = (status) => {
        const styles = {
            present: "bg-green-100 text-green-800",
            absent: "bg-red-100 text-red-800",
            leave: "bg-yellow-100 text-yellow-800",
            approved: "bg-blue-100 text-blue-800",
            pending: "bg-yellow-100 text-yellow-800",
            rejected: "bg-red-100 text-red-800",
            active: "bg-green-100 text-green-800",
            "on-leave": "bg-yellow-100 text-yellow-800",
            inactive: "bg-gray-100 text-gray-800"
        };
        return (
            <span className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </span>
        );
    };

    // Handle expense actions
    const handleExpenseAction = (action, expenseId) => {
        setIsLoading(true);
        setTimeout(() => {
            const updatedEmployees = employees.map(emp => {
                if (emp.id === selectedEmployee.id) {
                    return {
                        ...emp,
                        expenses: emp.expenses.map(exp =>
                            exp.id === expenseId ? { ...exp, status: action } : exp
                        )
                    };
                }
                return emp;
            });

            setEmployees(updatedEmployees);
            setSelectedEmployee({
                ...selectedEmployee,
                expenses: selectedEmployee.expenses.map(exp =>
                    exp.id === expenseId ? { ...exp, status: action } : exp
                )
            });
            setIsLoading(false);
            closeModal();
        }, 800);
    };

    // Handle add expense
    const handleAddExpense = () => {
        setIsLoading(true);
        setTimeout(() => {
            const newExpense = {
                id: Date.now(),
                type: expenseForm.type,
                amount: parseFloat(expenseForm.amount),
                description: expenseForm.description,
                date: expenseForm.date,
                status: 'pending',
                receipt: expenseForm.receipt
            };

            const updatedEmployees = employees.map(emp => {
                if (emp.id === selectedEmployee.id) {
                    return {
                        ...emp,
                        expenses: [newExpense, ...emp.expenses]
                    };
                }
                return emp;
            });

            setEmployees(updatedEmployees);
            setSelectedEmployee({
                ...selectedEmployee,
                expenses: [newExpense, ...selectedEmployee.expenses]
            });
            setIsLoading(false);
            closeModal();
        }, 1000);
    };

    // Handle edit employee
    const startEditEmployee = () => {
        setIsEditing(true);
        setEditedEmployee({ ...selectedEmployee });
    };

    const saveEmployeeChanges = () => {
        setIsLoading(true);
        setTimeout(() => {
            const updatedEmployees = employees.map(emp =>
                emp.id === editedEmployee.id ? editedEmployee : emp
            );
            setEmployees(updatedEmployees);
            setSelectedEmployee(editedEmployee);
            setIsEditing(false);
            setIsLoading(false);
        }, 800);
    };

    const deactivateEmployee = () => {
        if (window.confirm(`Are you sure you want to deactivate ${selectedEmployee.name}?`)) {
            setIsLoading(true);
            setTimeout(() => {
                const updatedEmployees = employees.map(emp =>
                    emp.id === selectedEmployee.id ? { ...emp, status: 'inactive' } : emp
                );
                setEmployees(updatedEmployees);
                setSelectedEmployee({ ...selectedEmployee, status: 'inactive' });
                setIsLoading(false);
            }, 800);
        }
    };

    // Handle add salary
    const handleAddSalary = () => {
        if (!salaryForm.month || !salaryForm.amount) {
            alert('Please fill all salary fields');
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            const amount = parseFloat(salaryForm.amount);

            const newSalaryRecord = {
                month: salaryForm.month,
                amount: amount,
            };

            const updatedEmployees = employees.map(emp => {
                if (emp.id === selectedEmployee.id) {
                    return {
                        ...emp,
                        salary: {
                            ...emp.salary,
                            amount: amount,
                            history: [newSalaryRecord, ...emp.salary.history]
                        }
                    };
                }
                return emp;
            });

            setEmployees(updatedEmployees);
            const updatedEmployee = updatedEmployees.find(emp => emp.id === selectedEmployee.id);
            setSelectedEmployee(updatedEmployee);
            setIsLoading(false);
            closeModal();
            alert('Salary added successfully!');
        }, 1000);
    };

    // Handle add new employee
    const handleAddEmployee = async () => {
        if (!newEmployeeForm.fullname || !newEmployeeForm.email || !newEmployeeForm.password ||
            !newEmployeeForm.department || !newEmployeeForm.position || !newEmployeeForm.joinDate) {
            alert('Please fill all fields');
            return;
        }

        setIsLoading(true);
        try {
            const newEmployee = {
                id: Date.now(),
                name: newEmployeeForm.fullname,
                email: newEmployeeForm.email,
                department: newEmployeeForm.department,
                position: newEmployeeForm.position,
                joinDate: newEmployeeForm.joinDate,
                status: "active",
                salary: { amount: 0, history: [] },
                loginRecords: [],
                expenses: []
            };

            setEmployees(prevEmployees => [...prevEmployees, newEmployee]);
            alert('Employee added successfully!');
        } finally {
            setIsLoading(false);
        }
    };


    // Employee Detail View
    if (selectedEmployee) {
        return (
            <>
                <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
                    <button onClick={handleBack} className="flex items-center cursor-pointer text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        <span className="text-sm sm:text-base">Back to Employees</span>
                    </button>

                    {/* Employee Header */}
                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    {selectedEmployee.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                value={editedEmployee.name}
                                                onChange={(e) => setEditedEmployee({ ...editedEmployee, name: e.target.value })}
                                                className="text-xl sm:text-2xl font-bold border-b-2 border-blue-500 focus:outline-none"
                                            />
                                            <input
                                                type="email"
                                                value={editedEmployee.email}
                                                onChange={(e) => setEditedEmployee({ ...editedEmployee, email: e.target.value })}
                                                className="text-sm text-gray-600 border-b border-gray-300 focus:outline-none"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <h2 className="text-xl sm:text-2xl font-bold">{selectedEmployee.name}</h2>
                                            <p className="text-sm text-gray-600">{selectedEmployee.email}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={saveEmployeeChanges}
                                            disabled={isLoading}
                                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
                                        >
                                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                                        >
                                            <XCircle className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={startEditEmployee}
                                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        {selectedEmployee.status !== 'inactive' && (
                                            <button
                                                onClick={deactivateEmployee}
                                                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                                            >
                                                <UserX className="w-4 h-4" />
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-gray-500">Department</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedEmployee.department}
                                        onChange={(e) => setEditedEmployee({ ...editedEmployee, department: e.target.value })}
                                        className="font-medium border-b border-gray-300 focus:outline-none w-full"
                                    />
                                ) : (
                                    <p className="font-medium">{selectedEmployee.department}</p>
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Position</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedEmployee.position}
                                        onChange={(e) => setEditedEmployee({ ...editedEmployee, position: e.target.value })}
                                        className="font-medium border-b border-gray-300 focus:outline-none w-full"
                                    />
                                ) : (
                                    <p className="font-medium">{selectedEmployee.position}</p>
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Join Date</p>
                                <p className="font-medium">{selectedEmployee.joinDate}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Status</p>
                                {getStatusBadge(selectedEmployee.status)}
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-lg shadow-md mb-4 sm:mb-6">
                        <div className="flex overflow-x-auto">
                            {["login", "salary", "expenses"].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium whitespace-nowrap ${activeTab === tab
                                        ? "border-b-2 border-blue-600 text-blue-600"
                                        : "text-gray-600 hover:text-gray-900"
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">

                        {activeTab === "login" && (
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Login Records</h3>
                                <div className="overflow-x-auto -mx-4 sm:mx-0">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-semibold">Date</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold">Login</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-300">
                                            {selectedEmployee.loginRecords.map((record, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-3 py-2 text-xs sm:text-sm">{record.date}</td>
                                                    <td className="px-3 py-2 text-xs sm:text-sm">{record.loginTime}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === "salary" && (
                            <div>
                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 sm:p-6 rounded-lg mb-6">
                                    <p className="text-sm text-gray-600 mb-1">Current Salary</p>
                                    <p className="text-3xl sm:text-4xl font-bold text-blue-600">
                                        ₹{selectedEmployee.salary.amount}
                                    </p>
                                </div>

                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Salary History</h3>
                                    <button
                                        onClick={() => openModal("salary")}
                                        className="px-3 sm:px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span className="hidden sm:inline">Add </span>Salary
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {selectedEmployee.salary.history.map((record, idx) => (
                                        <div key={idx} className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-semibold">{record.month}</p>
                                                    <p className="text-sm text-gray-600">Salary: ₹{record.amount.toLocaleString()}</p>
                                                </div>
                                                <button
                                                    onClick={() => openModal("payslip", record)}
                                                    className="px-3 py-1 text-sm cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "expenses" && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Expenses</h3>
                                    <button
                                        onClick={() => openModal("expense")}
                                        className="px-3 sm:px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span className="hidden sm:inline">Add </span>Expense
                                    </button>
                                </div>
                                {selectedEmployee.expenses.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <Receipt className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                        <p>No expenses recorded</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedEmployee.expenses.map(expense => (
                                            <div key={expense.id} className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="font-semibold">{expense.type}</p>
                                                        <p className="text-sm text-gray-600">{expense.description}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{expense.date}</p>
                                                    </div>
                                                    {getStatusBadge(expense.status)}
                                                </div>
                                                <div className="flex justify-between items-center mt-3">
                                                    <span className="text-lg font-bold text-green-600">₹{expense.amount}</span>
                                                    <button
                                                        onClick={() => openModal("expense", expense)}
                                                        className="text-sm cursor-pointer text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {showModal && (
                    <EmployeeModal
                        type={modalType}
                        item={selectedItem}
                        onClose={closeModal}
                        expenseForm={expenseForm}
                        setExpenseForm={setExpenseForm}
                        newEmployeeForm={newEmployeeForm}
                        setNewEmployeeForm={setNewEmployeeForm}
                        salaryForm={salaryForm}
                        setSalaryForm={setSalaryForm}
                        selectedEmployee={selectedEmployee}
                        getStatusBadge={getStatusBadge}
                        handleExpenseAction={handleExpenseAction}
                        handleAddExpense={handleAddExpense}
                        handleAddSalary={handleAddSalary}
                        handleAddEmployee={handleAddEmployee}
                        isLoading={isLoading}
                    />
                )}
            </>
        );
    }

    // Main Overview
    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <button onClick={handleBack} className="flex items-center cursor-pointer text-gray-600 hover:text-gray-900 mb-4">
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="text-sm sm:text-base">Back to TPF Management</span>
            </button>

            <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Employee Management</h1>

            {/* Statistics */}
            <div className="flex justify-center items-center space-x-4 mb-6">
                {/* First Card */}
                <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition w-1/2">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-600">Total Employees</p>
                            <p className="text-2xl font-bold">{totalEmployees}</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                {/* Second Card */}
                <button
                    onClick={() => openModal("add-employee")}
                    className="bg-emerald-500 rounded-lg shadow p-4 cursor-pointer hover:shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition transform hover:scale-105 w-1/2"
                >
                    <div className="flex items-center justify-between h-full">
                        <div className="text-left">
                            <p className="text-xs text-blue-100 font-medium">Add Employee</p>
                            <p className="text-sm text-white mt-1">Click to add new</p>
                        </div>
                        <Plus className="w-8 h-8 text-white" />
                    </div>
                </button>
            </div>


            {/* Search */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by name, email, department, or position..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                {searchQuery && (
                    <p className="text-sm text-gray-600 mt-2">
                        Found {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''}
                    </p>
                )}
            </div>

            {/* Employee List */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Employees</h2>
                    <div className="text-sm text-gray-600">
                        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredEmployees.length)} of {filteredEmployees.length}
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-center text-xs font-semibold">Employee</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold">Department</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold">Position</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-300">
                            {currentEmployees.map(employee => (
                                <tr key={employee.id} className="hover:bg-gray-50 transition">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                {employee.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{employee.name}</p>
                                                <p className="text-xs text-gray-500">{employee.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm">{employee.department}</td>
                                    <td className="px-4 py-3 text-sm">{employee.position}</td>
                                    <td className="px-4 py-3">{getStatusBadge(employee.status)}</td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => setSelectedEmployee(employee)}
                                            className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {currentEmployees.map(employee => (
                        <div key={employee.id} className="border rounded-lg p-4 hover:shadow-md transition">
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                    {employee.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">{employee.name}</h3>
                                    <p className="text-sm text-gray-600">{employee.position}</p>
                                    <p className="text-xs text-gray-500">{employee.department}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 mb-3">
                                <div className="text-xs">
                                    <span className="text-gray-500">Status: </span>
                                    {getStatusBadge(employee.status)}
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedEmployee(employee)}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                            >
                                View Details
                            </button>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
                                            className={`w-10 h-10 rounded-lg transition ${currentPage === page
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                } else if (
                                    page === currentPage - 2 ||
                                    page === currentPage + 2
                                ) {
                                    return <span key={page} className="text-gray-400">...</span>;
                                }
                                return null;
                            })}
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <span className="hidden sm:inline">Next</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {filteredEmployees.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No employees found</p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                )}
                {showModal && (
                    <EmployeeModal
                        type={modalType}
                        item={selectedItem}
                        onClose={closeModal}
                        expenseForm={expenseForm}
                        setExpenseForm={setExpenseForm}
                        newEmployeeForm={newEmployeeForm}
                        setNewEmployeeForm={setNewEmployeeForm}
                        salaryForm={salaryForm}
                        setSalaryForm={setSalaryForm}
                        selectedEmployee={selectedEmployee}
                        getStatusBadge={getStatusBadge}
                        handleExpenseAction={handleExpenseAction}
                        handleAddExpense={handleAddExpense}
                        handleAddSalary={handleAddSalary}
                        handleAddEmployee={handleAddEmployee}
                        isLoading={isLoading}
                    />
                )}
            </div>
        </div>
    );
}