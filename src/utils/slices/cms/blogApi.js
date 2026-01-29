import { apiSlice } from "../apiSlice";

export const blogApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // 🔹 GET ALL BLOGS (Admin CMS)
    getBlogs: builder.query({
      query: (params) => ({
        url: "/cms/blog/get",
        params, // { status, tag, search, page, limit }
      }),
      providesTags: ["Blog"],
    }),

    // 🔹 GET SINGLE BLOG BY SLUG
    getBlogBySlug: builder.query({
      query: (slug) => `/cms/blog/get/${slug}`,
      providesTags: (result, error, slug) => [
        { type: "Blog", id: slug },
      ],
    }),

    // 🔹 CREATE BLOG
    createBlog: builder.mutation({
      query: (formData) => ({
        url: "/cms/blog/add",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Blog"],
    }),

    // 🔹 UPDATE BLOG
    updateBlog: builder.mutation({
      query: ({ slug, formData }) => ({
        url: `/cms/blog/update/${slug}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Blog"],
    }),

    // 🔹 DELETE BLOG
    deleteBlog: builder.mutation({
      query: (slug) => ({
        url: `/cms/blog/delete/${slug}`,
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
