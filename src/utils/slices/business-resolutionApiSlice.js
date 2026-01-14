import { apiSlice } from "./apiSlice";

/*
  Business Resolution API Slice
*/
export const businessResolutionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /* ============================
       CREATE RESOLUTION
    ============================ */
    createBusinessResolution: builder.mutation({
      query: (formData) => ({
        url: "business-resolutions/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["BusinessResolutions"],
    }),

    /* ============================
       GET ALL RESOLUTIONS
    ============================ */
    getAllBusinessResolutions: builder.query({
      query: () => "business-resolutions/getall",
      providesTags: ["BusinessResolutions"],
    }),

    /* ============================
       GET SINGLE RESOLUTION
    ============================ */
    getBusinessResolutionById: builder.query({
      query: (id) => `business-resolutions/${id}/get`,
      providesTags: ["BusinessResolutions"],
    }),

    /* ============================
       UPDATE RESOLUTION
    ============================ */
    updateBusinessResolution: builder.mutation({
      query: ({ id, formData }) => ({
        url: `business-resolutions/${id}/update`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["BusinessResolutions"],
    }),

    /* ============================
       DELETE RESOLUTION
    ============================ */
    deleteBusinessResolution: builder.mutation({
      query: (id) => ({
        url: `business-resolutions/${id}/delete`,
        method: "DELETE",
      }),
      invalidatesTags: ["BusinessResolutions"],
    }),

  }),
});

export const {
  useCreateBusinessResolutionMutation,
  useGetAllBusinessResolutionsQuery,
  useGetBusinessResolutionByIdQuery,
  useUpdateBusinessResolutionMutation,
  useDeleteBusinessResolutionMutation,
} = businessResolutionApiSlice;
