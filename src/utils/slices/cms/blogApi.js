import { apiSlice } from "../apiSlice";

export const blogApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getBlogs: builder.query({
      query: (params) => ({
        url: "/blogs",
        params,
      }),
      providesTags: ["Blog"],
    }),

    getBlogBySlug: builder.query({
      query: (slug) => `/blogs/${slug}`,
    }),

    createBlog: builder.mutation({
      query: (formData) => ({
        url: "/blogs",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Blog"],
    }),

    updateBlog: builder.mutation({
      query: ({ id, data }) => ({
        url: `/blogs/${id}`,
        method: "PUT",
        body: data,
        headers:
          data instanceof FormData
            ? undefined
            : { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["Blog"], // ✅ ADD THIS
    }),

    deleteBlog: builder.mutation({
      query: (id) => ({
        url: `/blogs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Blog"],
    }),

  }),
});

export const {
  useGetBlogsQuery,
  useGetBlogBySlugQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = blogApi;
