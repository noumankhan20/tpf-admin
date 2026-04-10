import { apiSlice } from "../apiSlice";
export const vendorApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* -------------------------------
       GET ALL VENDORS
    -------------------------------- */
    getVendors: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", params.page);
        if (params?.limit) queryParams.append("limit", params.limit);
        if (params?.search) queryParams.append("search", params.search);
        if (params?.status) queryParams.append("status", params.status);
        return `/inventory/vendors?${queryParams.toString()}`;
      },
      providesTags: ["Vendors"],
    }),

    /* -------------------------------
       GET SINGLE VENDOR
    -------------------------------- */
    getVendorById: builder.query({
      query: (vendorId) => `/inventory/vendors/${vendorId}`,
      providesTags: (result, error, vendorId) => [
        { type: "Vendors", id: vendorId },
      ],
    }),

    /* -------------------------------
       CREATE VENDOR
    -------------------------------- */
    createVendor: builder.mutation({
      query: (data) => ({
        url: "/inventory/vendors",
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
        url: `/inventory/vendors/${vendorId}`,
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
        url: `/inventory/vendors/${vendorId}`,
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
