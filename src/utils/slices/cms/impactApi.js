import { apiSlice } from "../apiSlice";

export const impactApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // 🔹 GET ALL IMPACT STORIES
    getImpactStories: builder.query({
      query: () => "/cms/impact-stories/get",
      providesTags: ["Impact"],
    }),

    // 🔹 CREATE IMPACT STORY
    createImpactStory: builder.mutation({
      query: (formData) => ({
        url: "/cms/impact-stories/add",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Impact"],
    }),

    // 🔹 UPDATE IMPACT STORY
    updateImpactStory: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/cms/impact-stories/update/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Impact"],
    }),

    // 🔹 DELETE IMPACT STORY
    deleteImpactStory: builder.mutation({
      query: (id) => ({
        url: `/cms/impact-stories/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Impact"],
    }),

  }),
});

export const {
  useGetImpactStoriesQuery,
  useGetImpactStoryByIdQuery,
  useCreateImpactStoryMutation,
  useUpdateImpactStoryMutation,
  useDeleteImpactStoryMutation,
} = impactApi;
