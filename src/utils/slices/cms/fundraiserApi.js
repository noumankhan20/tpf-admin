import { apiSlice } from "../apiSlice";

export const fundraiserApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // 🔹 GET ALL FUNDRAISERS (with pagination)
    getFundraisers: builder.query({
      query: ({ page = 1, limit = 10 } = {}) =>
        `/cms/fundraiser/get?page=${page}&limit=${limit}`,
      providesTags: ["Fundraiser"],
    }),
    // 🔹 CREATE FUNDRAISER
    createFundraiser: builder.mutation({
      query: (formData) => ({
        url: "/cms/fundraiser/add",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Fundraiser"],
    }),

    // 🔹 UPDATE FUNDRAISER
    updateFundraiser: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/cms/fundraiser/update/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Fundraiser"],
    }),

    // 🔹 DELETE FUNDRAISER
    deleteFundraiser: builder.mutation({
      query: (id) => ({
        url: `/cms/fundraiser/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Fundraiser"],
    }),
    updateCampaignStatus: builder.mutation({
      query: ({ id, action }) => ({
        url: `/cms/fundraiser/${id}/status`,
        method: "PATCH",
        body: { action }, // "inactive" or "complete"
      }),
      invalidatesTags: ["Fundraiser"], // refetch list
    }),


  }),
});

export const {
  useGetFundraisersQuery,
  useCreateFundraiserMutation,
  useUpdateFundraiserMutation,
  useDeleteFundraiserMutation,
  useUpdateCampaignStatusMutation
} = fundraiserApi;
