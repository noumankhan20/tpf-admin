// components/EmployeeModal.jsx
"use client";

import React from 'react';
import {
    XCircle,
    Plus,
    Save,
    Download,
    CheckCircle,
    XCircle as XCircleIcon,
    Loader2
} from 'lucide-react';

const EmployeeModal = ({ 
    type, 
    item, 
    onClose,
    expenseForm,
    setExpenseForm,
    newEmployeeForm,
    setNewEmployeeForm,
    salaryForm,
    setSalaryForm,
    selectedEmployee,
    getStatusBadge,
    handleExpenseAction,
    handleAddExpense,
    handleAddSalary,
    handleAddEmployee,
    isLoading
}) => {
    const handleFormChange = (formType, field, value) => {
        if (formType === 'expense') {
            setExpenseForm(prev => ({ ...prev, [field]: value }));
        } else if (formType === 'employee') {
            setNewEmployeeForm(prev => ({ ...prev, [field]: value }));
        } else if (formType === 'salary') {
            setSalaryForm(prev => ({ ...prev, [field]: value }));
        }
    };

    const getModalTitle = () => {
        switch (type) {
            case "payslip": return "Payslip Details";
            case "expense": return item ? "Expense Details" : "Add New Expense";
            case "salary": return "Add Salary";
            case "edit-expense": return "Edit Expense";
            case "add-employee": return "Add New Employee";
            default: return "";
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg sm:text-xl font-semibold">{getModalTitle()}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                {/* Add Employee Form */}
                {type === "add-employee" && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Full Name *</label>
                            <input
                                type="text"
                                value={newEmployeeForm.fullname}
                                onChange={(e) => handleFormChange('employee', 'fullname', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter full name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Email *</label>
                            <input
                                type="email"
                                value={newEmployeeForm.email}
                                onChange={(e) => handleFormChange('employee', 'email', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="employee@company.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Password *</label>
                            <input
                                type="password"
                                value={newEmployeeForm.password}
                                onChange={(e) => handleFormChange('employee', 'password', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Department *</label>
                            <input
                                type="text"
                                value={newEmployeeForm.department}
                                onChange={(e) => handleFormChange('employee', 'department', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Engineering, Marketing"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Position *</label>
                            <input
                                type="text"
                                value={newEmployeeForm.position}
                                onChange={(e) => handleFormChange('employee', 'position', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Senior Developer"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Joining Date *</label>
                            <input
                                type="date"
                                value={newEmployeeForm.joinDate}
                                onChange={(e) => handleFormChange('employee', 'joinDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            onClick={handleAddEmployee}
                            disabled={isLoading}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition font-medium"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Adding Employee...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-5 h-5" />
                                    Add Employee
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Add Salary Form */}
                {type === "salary" && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Month *</label>
                            <input
                                type="text"
                                value={salaryForm.month}
                                onChange={(e) => handleFormChange('salary', 'month', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Dec 2024"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Salary (₹) *</label>
                            <input
                                type="number"
                                value={salaryForm.amount}
                                onChange={(e) => handleFormChange('salary', 'amount', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter salary amount"
                            />
                        </div>
                        <button
                            onClick={handleAddSalary}
                            disabled={isLoading}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition font-medium"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Adding Salary...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Add Salary
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Payslip Details */}
                {type === "payslip" && item && selectedEmployee && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">Employee: {selectedEmployee.name}</h4>
                            <p className="text-sm text-gray-600">Period: {item.month}</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between py-3 bg-blue-50 px-4 rounded-lg mt-2">
                                <span className="font-semibold">Salary</span>
                                <span className="font-bold text-lg">₹{item.amount.toLocaleString()}</span>
                            </div>
                        </div>
                        <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                            Viewed
                        </button>
                    </div>
                )}

                {/* Expense Details */}
                {type === "expense" && item && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Type</p>
                                <p className="font-semibold">{item.type}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Amount</p>
                                <p className="font-semibold text-green-600">₹{item.amount}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Date</p>
                                <p className="font-semibold">{item.date}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                {getStatusBadge(item.status)}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Description</p>
                            <p className="font-medium">{item.description}</p>
                        </div>
                        {item.status === "pending" && (
                            <div className="flex gap-3 pt-4">
                                <button 
                                    onClick={() => handleExpenseAction('approved', item.id)}
                                    disabled={isLoading}
                                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                    Approve
                                </button>
                                <button 
                                    onClick={() => handleExpenseAction('rejected', item.id)}
                                    disabled={isLoading}
                                    className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircleIcon className="w-4 h-4" />}
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Add Expense Form */}
                {type === "expense" && !item && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Expense Type</label>
                            <select
                                value={expenseForm.type}
                                onChange={(e) => handleFormChange('expense', 'type', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                            >
                                <option value="Travel">Travel</option>
                                <option value="Meals">Meals</option>
                                <option value="Equipment">Equipment</option>
                                <option value="Software">Software</option>
                                <option value="Training">Training</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Amount (₹)</label>
                            <input
                                type="number"
                                value={expenseForm.amount}
                                onChange={(e) => handleFormChange('expense', 'amount', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                                placeholder="Enter amount"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                value={expenseForm.description}
                                onChange={(e) => handleFormChange('expense', 'description', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                                rows="3"
                                placeholder="Enter expense description"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Date</label>
                            <input
                                type="date"
                                value={expenseForm.date}
                                onChange={(e) => handleFormChange('expense', 'date', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <button 
                            onClick={handleAddExpense}
                            disabled={isLoading || !expenseForm.amount || !expenseForm.description}
                            className="w-full py-2 bg-blue-600 cursor-pointer text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Add Expense
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(EmployeeModal);