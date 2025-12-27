import { apiSlice } from "../apiSlice";

export const communitiesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // 🔹 GET COMMUNITIES
    getCommunities: builder.query({
      query: () => "/cms/communities/get",
      providesTags: ["Communities"],
    }),

    // 🔹 CREATE COMMUNITY
    createCommunity: builder.mutation({
      query: (formData) => ({
        url: "/cms/communities/add",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Communities"],
    }),

    // 🔹 UPDATE COMMUNITY
    updateCommunity: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/cms/communities/update/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Communities"],
    }),

    // 🔹 DELETE COMMUNITY
    deleteCommunity: builder.mutation({
      query: (id) => ({
        url: `/cms/communities/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Communities"],
    }),

  }),
});

export const {
  useGetCommunitiesQuery,
  useCreateCommunityMutation,
  useUpdateCommunityMutation,
  useDeleteCommunityMutation,
} = communitiesApi;
