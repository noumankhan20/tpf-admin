import { apiSlice } from "../apiSlice";
export const vendorApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* -------------------------------
       GET ALL VENDORS
    -------------------------------- */
    getVendors: builder.query({
      query: () => "/vendors",
      providesTags: ["Vendors"],
    }),

    /* -------------------------------
       GET SINGLE VENDOR
    -------------------------------- */
    getVendorById: builder.query({
      query: (vendorId) => `/vendors/${vendorId}`,
      providesTags: (result, error, vendorId) => [
        { type: "Vendors", id: vendorId },
      ],
    }),

    /* -------------------------------
       CREATE VENDOR
    -------------------------------- */
    createVendor: builder.mutation({
      query: (data) => ({
        url: "/vendors",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Vendors"],
    }),

    /* -------------------------------
       UPDATE VENDOR
    -------------------------------- */
    updateVendor: builder.mutation({
      query: ({ vendorId, data }) => ({
        url: `/vendors/${vendorId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { vendorId }) => [
        "Vendors",
        { type: "Vendors", id: vendorId },
      ],
    }),

    /* -------------------------------
       DELETE (SOFT DELETE) VENDOR
    -------------------------------- */
    deleteVendor: builder.mutation({
      query: (vendorId) => ({
        url: `/vendors/${vendorId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Vendors"],
    }),
  }),
});

export const {
  useGetVendorsQuery,
  useGetVendorByIdQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
} = vendorApiSlice;
