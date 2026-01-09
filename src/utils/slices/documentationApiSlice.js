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

    updatePartySignature: builder.mutation({
      query: ({ agreementId, partyId, file }) => {
        const formData = new FormData();
        formData.append("signatures", file); // 👈 MUST MATCH multer field

        return {
          url: `/agreements/${agreementId}/parties/${partyId}/signature`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: (result, error, { agreementId }) => [
        { type: "Documentation", id: agreementId },
      ],
    }),

    updateAgreementDocuments: builder.mutation({
      query: ({ id, files }) => {
        const formData = new FormData();

        Object.entries(files).forEach(([type, fileList]) => {
          fileList.forEach((file) => {
            formData.append(type, file);
          });
        });

        return {
          url: `/agreements/${id}/documents`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Documentation", id },
      ],
    }),



  }),
});

export const {
  useCreateAgreementMutation,
  useGetAgreementsQuery,
  useGetAgreementByIdQuery,
  useUpdateAgreementMutation,
  useDeleteAgreementMutation,
  useUpdatePartySignatureMutation,
  useUpdateAgreementDocumentsMutation,
} = agreementApiSlice