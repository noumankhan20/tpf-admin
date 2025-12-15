import { apiSlice } from "./apiSlice";
export const financialAidApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllForms: builder.query({
      query: ({
        status,
        formType,  // Changed from 'type' to 'formType'
        search,
        sortBy,
        sortOrder,
        page,
        limit,
        dateFilter
      } = {}) => {
        const params = new URLSearchParams();
        if (status) params.append("status", status);
        if (formType) params.append("formType", formType);
        if (search) params.append("search", search);
        if (sortBy) params.append("sortBy", sortBy);
        if (sortOrder) params.append("sortOrder", sortOrder);
        if (page) params.append("page", page);
        if (limit) params.append("limit", limit);
        if (dateFilter) params.append("dateFilter", dateFilter);
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