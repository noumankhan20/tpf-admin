import { apiSlice } from './apiSlice';

export const financeApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getFinanceAssignments: builder.query({
            query: () => '/finance/finance-assignments',
            providesTags: ['FinanceAssignments'],
        }),
        submitFinanceProof: builder.mutation({
            query: (data) => {
                const formData = new FormData();
                formData.append('taskId', data.taskId);
                formData.append('campaignId', data.campaignId);
                if (data.transactionRef) {
                    formData.append('transactionRef', data.transactionRef);
                }
                if (data.paymentMode) {
                    formData.append('paymentMode', data.paymentMode);
                }

                // Append multiple proofs if provided
                if (data.proofs && data.proofs.length > 0) {
                    data.proofs.forEach((file) => {
                        formData.append('proofs', file);
                    });
                }

                return {
                    url: '/finance/submit-finance-proofs',
                    method: 'POST',
                    body: formData,
                };
            },
            invalidatesTags: ['FinanceAssignments', 'TaskManagement', 'Campaigns'],
        }),
        completeFinanceTask: builder.mutation({
            query: (taskId) => ({
                url: `/workflow/tasks/${taskId}/complete`,
                method: 'POST',
            }),
            invalidatesTags: ['FinanceAssignments', 'TaskManagement', 'Campaigns'],
        }),
    }),
});

export const {
    useGetFinanceAssignmentsQuery,
    useSubmitFinanceProofMutation,
    useCompleteFinanceTaskMutation,
} = financeApiSlice;
