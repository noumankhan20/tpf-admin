import { apiSlice } from "../apiSlice";

export const beforeFooterApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBeforeFooter: builder.query({
      query: () => "/cms/before-footer/get",
      providesTags: ["BeforeFooter"],
    }),

    createBeforeFooter: builder.mutation({
      query: (formData) => ({
        url: "/cms/before-footer/add",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["BeforeFooter"],
    }),

    updateBeforeFooter: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/cms/before-footer/update/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["BeforeFooter"],
    }),
  }),
});


export const {
    useGetBeforeFooterQuery,
    useCreateBeforeFooterMutation,
    useUpdateBeforeFooterMutation,
} = beforeFooterApi;