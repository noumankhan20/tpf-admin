import React from 'react';
import {
    ShoppingCart,
    Briefcase,
    Users,
    User,
    Banknote,
    FileText,
    TrendingDown,
    Building2,
    CreditCard,
} from 'lucide-react';

// ─── Expense Type Config ───────────────────────────────────────────────────────

export const EXPENSE_TYPES = [
    { value: 'ALL', label: 'All Expenses', color: 'gray' },
    { value: 'SALARY', label: 'Salary', color: 'blue' },
    { value: 'BENEFICIARY', label: 'Beneficiary', color: 'green' },
    { value: 'PURCHASE', label: 'Purchase', color: 'purple' },
    { value: 'REIMBURSEMENT', label: 'Reimbursement', color: 'orange' },
    { value: 'OPERATIONAL', label: 'Operational', color: 'teal' },
    { value: 'DOCUMENTATION_SERVICE', label: 'Documentation Service Payment', color: 'amber' },
    { value: 'OTHER', label: 'Other', color: 'gray' },
];

export const PAYMENT_METHODS = [
    { value: 'CASH', label: 'Cash' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { value: 'UPI', label: 'UPI' },
    { value: 'CHEQUE', label: 'Cheque' },
    { value: 'CARD', label: 'Card' },
    { value: 'OTHER', label: 'Other' },
];

export const ITEMS_PER_PAGE = 20;

// ─── Default Form State ────────────────────────────────────────────────────────

export const DEFAULT_FORM_DATA = {
    expenseType: 'SALARY',
    amount: '',
    description: '',
    adminId: '',
    campaignId: '',
    purchaseId: '',
    vendorId: '',
    agreementId: '',
    paymentMethod: 'CASH',
    transactionId: '',
    notes: '',
    reimbursementType: 'ADMIN',
    volunteerName: '',
    volunteerPhone: '',
    volunteerLocation: '',
    volunteerId: '',
    voucherId: '',
    proofFile: null,
    transactionDate: new Date().toISOString().split('T')[0],
    transactionTime: '',
};

export const DEFAULT_PURCHASE_FORM = {
    vendorId: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'PENDING',
    proofFile: null,
    lineItems: [],
};

export const DEFAULT_VENDOR_FORM = {
    fullName: '',
    contactNumber: '',
    vendorGST: '',
    state: '',
    city: '',
    fullAddress: '',
    status: 'ACTIVE',
    vendorType: 'NORMAL',
};

// ─── Icon Helpers ──────────────────────────────────────────────────────────────

export const getExpenseIconInfo = (type) => {
    switch (type) {
        case 'PURCHASE':
            return { icon: <ShoppingCart size={20} className="text-amber-600" />, bg: 'bg-amber-50 text-amber-600' };
        case 'OPERATIONAL':
            return { icon: <Briefcase size={20} className="text-blue-600" />, bg: 'bg-blue-50 text-blue-600' };
        case 'BENEFICIARY':
            return { icon: <Users size={20} className="text-rose-600" />, bg: 'bg-rose-50 text-rose-600' };
        case 'SALARY':
            return { icon: <User size={20} className="text-emerald-600" />, bg: 'bg-emerald-50 text-emerald-600' };
        case 'REIMBURSEMENT':
            return { icon: <Banknote size={20} className="text-purple-600" />, bg: 'bg-purple-50 text-purple-600' };
        case 'DOCUMENTATION_SERVICE_PAYMENT':
            return { icon: <FileText size={20} className="text-cyan-600" />, bg: 'bg-cyan-50 text-cyan-600' };
        default:
            return { icon: <TrendingDown size={20} className="text-gray-600" />, bg: 'bg-gray-50 text-gray-600' };
    }
};

export const getMethodIcon = (method) => {
    switch (method) {
        case 'CASH':
            return <Banknote size={12} className="text-amber-600" />;
        case 'BANK_TRANSFER':
            return <Building2 size={12} className="text-blue-600" />;
        case 'UPI':
            return <CreditCard size={12} className="text-purple-600" />;
        default:
            return <CreditCard size={12} className="text-gray-600" />;
    }
};

// ─── Description Formatter ─────────────────────────────────────────────────────

export const formatExpenseDescription = (description) => {
    if (!description) return null;

    const hasEmailsOrDomains =
        description.includes('@') ||
        description.includes('www.') ||
        /\.[a-z]{2,4}\b/i.test(description);

    if (!hasEmailsOrDomains) {
        return <h3 className="text-base font-bold text-gray-900 leading-snug">{description}</h3>;
    }

    const words = description.split(/\s+/);
    const elements = [];
    let normalTextBuffer = [];

    const flushNormalText = () => {
        if (normalTextBuffer.length > 0) {
            elements.push(
                <span key={`text-${elements.length}`} className="text-sm font-bold text-gray-800 leading-relaxed mr-1.5 align-middle">
                    {normalTextBuffer.join(' ')}
                </span>
            );
            normalTextBuffer = [];
        }
    };

    words.forEach((word, index) => {
        const cleanWord = word.trim();
        if (!cleanWord) return;

        if (cleanWord.endsWith(':')) {
            flushNormalText();
            elements.push(
                <div key={`label-${index}`} className="w-full mt-3 first:mt-0 mb-1.5">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 border border-gray-200/50 px-2.5 py-1 rounded-lg inline-block">
                        {cleanWord.slice(0, -1)}
                    </span>
                </div>
            );
            return;
        }

        if (cleanWord.includes('@')) {
            flushNormalText();
            elements.push(
                <span key={`email-${index}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/50 hover:bg-blue-50 text-blue-600 border border-blue-100/70 rounded-xl text-xs font-semibold my-1 mr-2 transition-colors cursor-default align-middle">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    {cleanWord}
                </span>
            );
            return;
        }

        const isDomain = (cleanWord.includes('.') && !cleanWord.includes('@')) || cleanWord.startsWith('www.');
        if (isDomain) {
            flushNormalText();
            elements.push(
                <span key={`domain-${index}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-600 border border-emerald-100/70 rounded-xl text-xs font-semibold my-1 mr-2 transition-colors cursor-default align-middle">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {cleanWord}
                </span>
            );
            return;
        }

        normalTextBuffer.push(cleanWord);
    });

    flushNormalText();

    return <div className="flex flex-wrap items-center mt-1">{elements}</div>;
};

// ─── Recipient Resolver ────────────────────────────────────────────────────────

export const resolveRecipient = (expense) => {
    if (expense.adminId)                          return { name: expense.adminId.fullName,                                   sub: 'Admin / Employee' };
    if (expense.reimbursementTo?.adminId)         return { name: expense.reimbursementTo.adminId.fullName,                   sub: 'Reimbursement (Admin)' };
    if (expense.reimbursementTo?.volunteerId)     return { name: expense.reimbursementTo.volunteerId.fullName,               sub: 'Reimbursement (Volunteer)' };
    if (expense.reimbursementTo?.volunteerDetails?.name) return { name: expense.reimbursementTo.volunteerDetails.name,       sub: 'Reimbursement (Volunteer)' };
    if (expense.vendorId)                         return { name: expense.vendorId.fullName,                                  sub: 'Vendor' };
    if (expense.agreementId)                      return { name: expense.agreementId.agreementTitle,                         sub: 'Agreement' };
    return { name: '—', sub: '' };
};