import { apiSlice } from "../apiSlice";

export const heroApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // 🔹 GET HERO
    getHero: builder.query({
      query: () => "/cms/hero/get",
      providesTags: ["Hero"],
    }),

    // 🔹 CREATE HERO
    createHero: builder.mutation({
      query: (formData) => ({
        url: "/cms/hero/add",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Hero"],
    }),

    // 🔹 UPDATE HERO
    updateHero: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/cms/hero/update/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Hero"],
    }),

  }),
});

export const {
  useGetHeroQuery,
  useCreateHeroMutation,
  useUpdateHeroMutation,
} = heroApi;
