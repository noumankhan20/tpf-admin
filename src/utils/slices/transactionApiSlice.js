import { apiSlice } from "./apiSlice";

export const transactionApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * GET /api/transaction/
         * Unified transaction ledger (credits + debits)
         *
         * Supported params:
         *   page, limit, search,
         *   startDate, endDate,
         *   minAmount, maxAmount,
         *   type          — "CREDIT" | "DEBIT"
         *   source        — "ONLINE" | "OFFLINE" | "EXPENSE"
         *   donationType  — ZAKAAT | SADAQAH | LILLAH | IMDAD | RIBA
         *   expenseType   — SALARY | BENEFICIARY | PURCHASE | REIMBURSEMENT | OPERATIONAL | DOCUMENTATION_SERVICE | OTHER
         *   paymentMethod — CASH | BANK_TRANSFER | UPI | CHEQUE | CARD | OTHER | RTGS | NEFT | IMPS
         *   status        — PENDING | SUCCESS | FAILED | APPROVED | REJECTED
         *   campaignId
         *   sortBy        — date | amount
         *   sortOrder     — asc | desc
         */
        getAllTransactions: builder.query({
            query: (params = {}) => {
                const searchParams = new URLSearchParams();
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        searchParams.append(key, value);
                    }
                });
                return `/transaction/?${searchParams.toString()}`;
            },
            providesTags: ['Transactions'],
            // Keep previous data while fetching to avoid layout jump
            keepUnusedDataFor: 30,
        }),
    }),
});

export const { useGetAllTransactionsQuery } = transactionApiSlice;