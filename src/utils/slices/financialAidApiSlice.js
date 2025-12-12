import { apiSlice } from "./apiSlice";
export const financialAidApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllForms: builder.query({
      query: ({ status, type } = {}) => {
        const params = new URLSearchParams();
        if (status) params.append("status", status);
        if (type) params.append("type", type);
        return `/admin/verify/forms?${params.toString()}`;
      },
      providesTags: ["FinancialAidForms"],
    }),
    getFormById: builder.query({
      query: (id) => `/admin/verify/form/${id}`,
      providesTags: (result, error, id) => [{ type: "FinancialAidForms", id }],
    }),
    updateFormStatus: builder.mutation({
      query: ({ id, status, remarks }) => ({
        url: `/admin/verify/form/${id}/status`,
        method: "PUT",
        body: { status, remarks },
      }),
      invalidatesTags: ["FinancialAidForms"],
    }),
  }),
});
export const {
  useGetAllFormsQuery,
  useGetFormByIdQuery,
  useUpdateFormStatusMutation,
} = financialAidApiSlice;