import { apiSlice } from "../apiSlice";

export const startgivingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // 🔹 GET ALL TRUSTED BY
    getStartGiving: builder.query({
      query: () => "/cms/start-giving/get",
      providesTags: ["StartGiving"],
    }),

    // 🔹 CREATE TRUSTED BY
    createStartGiving: builder.mutation({
      query: (formData) => ({
        url: "/cms/start-giving/add",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["StartGiving"],
    }),

    // 🔹 UPDATE TRUSTED BY
    updateStartGiving: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/cms/start-giving/update/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["StartGiving"],
    }),


  }),
});


export const {
    useGetStartGivingQuery,
    useCreateStartGivingMutation,
    useUpdateStartGivingMutation,
} = startgivingApi;