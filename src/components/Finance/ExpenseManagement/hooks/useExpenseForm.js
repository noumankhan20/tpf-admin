import { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
    useCreateExpenseMutation,
    useUpdateExpenseMutation,
} from '@/utils/slices/InventoryAndAsset/expenseApiSlice';
import {
    useCreatePurchaseMutation,
} from '@/utils/slices/InventoryAndAsset/purchaseApiSlice';
import {
    useCreateVendorMutation,
} from '@/utils/slices/InventoryAndAsset/vendorApiSlice';
import {
    DEFAULT_FORM_DATA,
    DEFAULT_PURCHASE_FORM,
    DEFAULT_VENDOR_FORM,
    ITEMS_PER_PAGE,
} from '../utils/expenseHelpers';

// ─── Reusable paginated-dropdown hook ─────────────────────────────────────────

export function usePaginatedDropdown(items, filterFn, sortFn) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const filtered = useMemo(() => {
        const sorted = sortFn ? [...(items || [])].sort(sortFn) : (items || []);
        return search ? sorted.filter((item) => filterFn(item, search.toLowerCase())) : sorted;
    }, [items, search, sortFn, filterFn]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [filtered.length, totalPages, page]);

    const paginated = useMemo(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return filtered.slice(start, start + ITEMS_PER_PAGE);
    }, [filtered, page]);

    const reset = () => { setSearch(''); setPage(1); };

    return { open, setOpen, search, setSearch, page, setPage, paginated, totalPages, ref, reset };
}

// ─── Main expense-form hook ────────────────────────────────────────────────────

export function useExpenseForm({ vendors, items, purchases, onSuccess }) {
    const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
    const [purchaseFormData, setPurchaseFormData] = useState(DEFAULT_PURCHASE_FORM);
    const [vendorFormData, setVendorFormData] = useState(DEFAULT_VENDOR_FORM);
    const [vendorIdType, setVendorIdType] = useState('GST');
    const [showAddPurchaseModal, setShowAddPurchaseModal] = useState(false);
    const [showAddVendorModal, setShowAddVendorModal] = useState(false);
    // For edit expense modal — use a ref so handleSubmit always reads the latest
    // value regardless of which render cycle the closure was created in.
    const [editingExpense, setEditingExpenseState] = useState(null);
    const editingExpenseRef = useRef(null);
    const setEditingExpense = (val) => {
        editingExpenseRef.current = val;
        setEditingExpenseState(val);
    };

    const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
    const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();
    const [createPurchase, { isLoading: isCreatingPurchase }] = useCreatePurchaseMutation();
    const [createVendor, { isLoading: isCreatingVendor }] = useCreateVendorMutation();

    // ── form field helpers ──────────────────────────────────────────────────────
    const setField = (key, value) => setFormData((p) => ({ ...p, [key]: value }));

    const resetForm = () => {
        setFormData(DEFAULT_FORM_DATA);
        setEditingExpense(null); // clears both ref and state
    };

    // ── open edit expense ───────────────────────────────────────────────────────
    const openEditExpense = (expense) => {
        setEditingExpense(expense);
        setFormData({
            expenseType: expense.expenseType || 'SALARY',
            amount: expense.amount?.toString() || '',
            amountType: expense.amountType || '',
            description: expense.description || '',
            adminId: expense.adminId?._id || expense.adminId || '',
            campaignId: expense.campaignId?._id || expense.campaignId || '',
            purchaseId: expense.purchaseId?._id || expense.purchaseId || '',
            vendorId: expense.vendorId?._id || expense.vendorId || '',
            agreementId: expense.agreementId?._id || expense.agreementId || '',
            paymentMethod: expense.paymentMethod || 'CASH',
            transactionId: expense.transactionId || '',
            notes: expense.notes || '',
            reimbursementType: expense.reimbursementTo?.adminId ? 'ADMIN' : 'VOLUNTEER',
            volunteerName: expense.reimbursementTo?.volunteerDetails?.name || '',
            volunteerPhone: expense.reimbursementTo?.volunteerDetails?.phone || '',
            volunteerLocation: expense.reimbursementTo?.volunteerDetails?.location || '',
            volunteerId: expense.volunteerId?._id || expense.volunteerId || '',
            voucherId: expense.voucherId?._id || expense.voucherId || '',
            proofFile: null,
            transactionDate: expense.date
                ? new Date(expense.date).toISOString().split('T')[0]
                : expense.transactionDate || new Date().toISOString().split('T')[0],
            transactionTime: expense.transactionTime || '',
        });
    };

    // ── Auto-fill expense fields from a linked purchase ────────────────────────
    // Called whenever purchaseId changes in formData
    useEffect(() => {
        if (!formData.purchaseId || !purchases?.length) return;
        const linked = purchases.find((p) => p._id === formData.purchaseId);
        if (!linked) return;

        setFormData((prev) => ({
            ...prev,
            // Only fill if the fields are still empty (don't overwrite manual edits)
            amount: prev.amount || linked.totalAmount?.toString() || '',
            transactionDate: prev.transactionDate !== new Date().toISOString().split('T')[0]
                ? prev.transactionDate
                : linked.purchaseDate
                    ? new Date(linked.purchaseDate).toISOString().split('T')[0]
                    : prev.transactionDate,
            vendorId: prev.vendorId || linked.vendorId?._id || linked.vendorId || '',
            description: prev.description ||
                `Purchase from ${linked.vendorId?.fullName || 'vendor'} — ${linked.items?.length || 0} item(s)`,
        }));
    }, [formData.purchaseId]);

    // ── submit expense (create or update) ──────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const fd = new FormData();
            fd.append('amount', formData.amount);
            fd.append('description', formData.description);
            fd.append('expenseType', formData.expenseType);
            fd.append('paymentMethod', formData.paymentMethod);
            fd.append('transactionDate', formData.transactionDate);

            if (formData.amountType) {
                fd.append('amountType', formData.amountType);
            }
            if (formData.transactionId) fd.append('transactionId', formData.transactionId);
            if (formData.notes) fd.append('notes', formData.notes);
            if (formData.transactionTime) fd.append('transactionTime', formData.transactionTime);
            if (formData.campaignId) fd.append('campaignId', formData.campaignId);
            if (formData.vendorId) fd.append('vendorId', formData.vendorId);

            if (formData.expenseType === 'SALARY' && formData.adminId)
                fd.append('adminId', formData.adminId);

            if (formData.expenseType === 'PURCHASE' && formData.purchaseId)
                fd.append('purchaseId', formData.purchaseId);

            if (formData.expenseType === 'DOCUMENTATION_SERVICE' && formData.agreementId)
                fd.append('agreementId', formData.agreementId);

            if (formData.expenseType === 'REIMBURSEMENT') {
                if (formData.reimbursementType === 'ADMIN' && formData.adminId) {
                    fd.append('reimbursementTo[adminId]', formData.adminId);
                } else if (formData.reimbursementType === 'VOLUNTEER' && formData.volunteerId) {
                    fd.append('reimbursementTo[volunteerDetails][name]', formData.volunteerName);
                    fd.append('reimbursementTo[volunteerDetails][phone]', formData.volunteerPhone);
                    fd.append('reimbursementTo[volunteerDetails][location]', formData.volunteerLocation);
                    fd.append('reimbursementTo[volunteerId]', formData.volunteerId);
                    if (formData.voucherId) fd.append('voucherId', formData.voucherId);
                }
            }

            if (formData.proofFile) fd.append('proof', formData.proofFile);

            // Read from ref — always the latest value, never stale
            const currentEditing = editingExpenseRef.current;
            if (currentEditing) {
                const expenseId = currentEditing._id;
                if (!expenseId) {
                    toast.error('Cannot update: expense ID is missing.');
                    return;
                }
                await updateExpense({ expenseId, data: fd }).unwrap();
                toast.success('Expense updated successfully');
            } else {
                await createExpense(fd).unwrap();
                toast.success('Expense recorded successfully');
            }

            resetForm();
            onSuccess?.();
        } catch (error) {
            console.error('Failed to save expense:', error);
            toast.error(error?.data?.message || 'Failed to save expense');
        }
    };

    // ── purchase line items ─────────────────────────────────────────────────────
    const addLineItem = () =>
        setPurchaseFormData((p) => ({
            ...p,
            lineItems: [...p.lineItems, { itemId: '', itemName: '', qty: '', price: '', unit: '' }],
        }));

    const removeLineItem = (index) =>
        setPurchaseFormData((p) => ({
            ...p,
            lineItems: p.lineItems.filter((_, i) => i !== index),
        }));

    const updateLineItem = (index, field, value) =>
        setPurchaseFormData((p) => {
            const updated = [...p.lineItems];
            if (field === 'itemId') {
                const selectedItem = (items || []).find((item) => item._id === value);
                updated[index] = { ...updated[index], itemId: value, unit: selectedItem?.unit || '' };
            } else {
                updated[index] = { ...updated[index], [field]: value };
            }
            return { ...p, lineItems: updated };
        });

    // ── submit purchase ─────────────────────────────────────────────────────────
    const handleCreatePurchaseSubmit = async (e) => {
        e.preventDefault();
        if (purchaseFormData.lineItems.length === 0) {
            toast.warning('Please add at least one item.');
            return;
        }

        const selectedVendor = vendors.find((v) => v._id === purchaseFormData.vendorId);
        const isIndividualVendor = selectedVendor?.vendorType === 'INDIVIDUAL';

        // Validate line items per vendor type
        for (const item of purchaseFormData.lineItems) {
            if (!isIndividualVendor && !item.itemId) {
                toast.warning('Please select an item for all line items.');
                return;
            }
            if (isIndividualVendor && !item.itemName?.trim()) {
                toast.warning('Please enter a description for all line items.');
                return;
            }
            if (!item.qty || Number(item.qty) <= 0) {
                toast.warning('Please enter a valid quantity for all items.');
                return;
            }
            if (item.price === '' || Number(item.price) < 0) {
                toast.warning('Please enter a valid price for all items.');
                return;
            }
        }

        try {
            const fd = new FormData();
            fd.append('vendorId', purchaseFormData.vendorId);
            fd.append('purchaseDate', purchaseFormData.purchaseDate);
            fd.append('paymentStatus', purchaseFormData.paymentStatus);

            const itemsPayload = purchaseFormData.lineItems.map((item) => {
                if (isIndividualVendor) {
                    return {
                        itemName: item.itemName,
                        quantity: Number(item.qty),
                        price: Number(item.price),
                    };
                }
                return {
                    itemId: item.itemId,
                    quantity: Number(item.qty),
                    price: Number(item.price),
                };
            });
            fd.append('items', JSON.stringify(itemsPayload));

            if (purchaseFormData.proofFile) fd.append('proof', purchaseFormData.proofFile);

            const result = await createPurchase(fd).unwrap();
            toast.success('Purchase recorded successfully');
            setShowAddPurchaseModal(false);

            // Link the new purchase and auto-fill the expense form
            const newPurchase = result.data;
            const total = purchaseFormData.lineItems.reduce(
                (sum, item) => sum + Number(item.qty || 0) * Number(item.price || 0),
                0
            );
            setFormData((prev) => ({
                ...prev,
                purchaseId: newPurchase._id,
                amount: prev.amount || total.toString(),
                transactionDate: prev.transactionDate !== new Date().toISOString().split('T')[0]
                    ? prev.transactionDate
                    : purchaseFormData.purchaseDate || prev.transactionDate,
                vendorId: prev.vendorId || purchaseFormData.vendorId || '',
                description: prev.description ||
                    `Purchase from ${selectedVendor?.fullName || 'vendor'} — ${purchaseFormData.lineItems.length} item(s)`,
            }));
        } catch (err) {
            console.error('Failed to save purchase:', err);
            toast.error(err?.data?.message || 'Failed to save purchase');
        }
    };

    // ── submit vendor ───────────────────────────────────────────────────────────
    const handleCreateVendorSubmit = async (e) => {
        if (e?.preventDefault) e.preventDefault();
        try {
            if (!/^[0-9]{10}$/.test(vendorFormData.contactNumber)) {
                toast.warning('Contact number must be a valid 10-digit number');
                return;
            }

            const idVal = vendorFormData.vendorGST.trim().toUpperCase();
            if (!idVal) { toast.warning('Identification document value is required'); return; }
            if (vendorIdType === 'GST' && !/^[0-9A-Z]{15}$/.test(idVal)) { toast.warning('GST number must be exactly 15 alphanumeric characters'); return; }
            if (vendorIdType === 'PAN' && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(idVal)) { toast.warning('PAN must be 10 chars (ABCDE1234F)'); return; }
            if (vendorIdType === 'AADHAAR' && !/^[0-9]{12}$/.test(idVal)) { toast.warning('Aadhaar must be exactly 12 digits'); return; }

            const result = await createVendor({
                ...vendorFormData,
                vendorGST: `${vendorIdType}: ${idVal}`,
            }).unwrap();

            toast.success('Vendor created successfully');
            setShowAddVendorModal(false);
            setVendorFormData(DEFAULT_VENDOR_FORM);
            setVendorIdType('GST');

            // Auto-select the newly created vendor in whichever context opened the modal
            const newVendorId = result.data._id;
            setField('vendorId', newVendorId);
            // Also set it in purchaseFormData in case the modal was opened from AddPurchaseModal
            setPurchaseFormData((p) => ({ ...p, vendorId: newVendorId }));
        } catch (err) {
            alert(err?.data?.message || 'Failed to save vendor');
            console.error('Failed to save vendor:', err);
        }
    };

    return {
        // Form state
        formData, setFormData, setField, resetForm,
        editingExpense, openEditExpense,
        purchaseFormData, setPurchaseFormData,
        vendorFormData, setVendorFormData,
        vendorIdType, setVendorIdType,

        // Sub-modal visibility
        showAddPurchaseModal, setShowAddPurchaseModal,
        showAddVendorModal, setShowAddVendorModal,

        // Submission handlers
        handleSubmit, isCreating, isUpdating,
        handleCreatePurchaseSubmit, isCreatingPurchase,
        handleCreateVendorSubmit, isCreatingVendor,

        // Line-item helpers
        addLineItem, removeLineItem, updateLineItem,
    };
}