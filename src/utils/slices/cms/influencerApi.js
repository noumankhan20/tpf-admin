import { apiSlice } from "../apiSlice";

export const influencerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // 🔹 GET ALL INFLUENCERS
    getInfluencers: builder.query({
      query: () => "/cms/influencer/get",
      providesTags: ["Influencer"],
    }),

    // 🔹 CREATE INFLUENCER
    createInfluencer: builder.mutation({
      query: (formData) => ({
        url: "/cms/influencer/add",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Influencer"],
    }),

    // 🔹 UPDATE INFLUENCER
    updateInfluencer: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/cms/influencer/update/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Influencer"],
    }),

    // 🔹 DELETE INFLUENCER
    deleteInfluencer: builder.mutation({
      query: (id) => ({
        url: `/cms/influencer/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Influencer"],
    }),

  }),
});

export const {
  useGetInfluencersQuery,
  useCreateInfluencerMutation,
  useUpdateInfluencerMutation,
  useDeleteInfluencerMutation,
} = influencerApi;
