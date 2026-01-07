import { apiSlice } from "./apiSlice";

export const agreementApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /* =========================================
       CREATE AGREEMENT (FormData)
    ========================================= */
    createAgreement: builder.mutation({
      query: (formData) => ({
        url: "/agreements/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Documentation"],
    }),

    /* =========================================
       GET ALL AGREEMENTS
    ========================================= */
    getAgreements: builder.query({
      query: () => ({
        url: "/agreements/getall",
        method: "GET",
      }),
      providesTags: ["Documentation"],
      keepUnusedDataFor: 60,
    }),

    /* =========================================
       GET AGREEMENT BY ID
    ========================================= */
    getAgreementById: builder.query({
      query: (id) => ({
        url: `/agreements/${id}/get`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Documentation", id }],
    }),

    /* =========================================
       UPDATE AGREEMENT
    ========================================= */
    updateAgreement: builder.mutation({
      query: ({ id, data }) => ({
        url: `/agreements/${id}/update`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Documentation", id },
        "Documentation",
      ],
    }),

    /* =========================================
       DELETE AGREEMENT
    ========================================= */
    deleteAgreement: builder.mutation({
      query: (id) => ({
        url: `/agreements/${id}/delete`,
        method: "DELETE",
      }),
      invalidatesTags: ["Documentation"],
    }),

  }),
});

export const{
    useCreateAgreementMutation,
    useGetAgreementsQuery,
    useGetAgreementByIdQuery,
    useUpdateAgreementMutation,
    useDeleteAgreementMutation,
} = agreementApiSlice