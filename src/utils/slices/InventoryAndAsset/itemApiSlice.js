import { apiSlice } from "../apiSlice";
export const itemApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* -------------------------------
       GET ITEMS (LIST)
    -------------------------------- */
    getItems: builder.query({
      query: (params = {}) => {
  // Remove undefined / null / empty values
  const cleanedParams = Object.fromEntries(
    Object.entries(params).filter(
      ([_, value]) =>
        value !== undefined &&
        value !== null &&
        value !== "" &&
        value !== "undefined"
    )
  );

  const queryParams = new URLSearchParams(cleanedParams).toString();

  return `/items${queryParams ? `?${queryParams}` : ""}`;
},

      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Items",
                id: _id,
              })),
              { type: "Items", id: "LIST" },
            ]
          : [{ type: "Items", id: "LIST" }],
    }),

    /* -------------------------------
       GET SINGLE ITEM
    -------------------------------- */
    getItemById: builder.query({
      query: (itemId) => `/items/${itemId}`,
      providesTags: (result, error, itemId) => [
        { type: "Items", id: itemId },
      ],
    }),

    /* -------------------------------
       CREATE ITEM
    -------------------------------- */
    createItem: builder.mutation({
      query: (data) => ({
        url: "/items",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Items", id: "LIST" }],
    }),

    /* -------------------------------
       UPDATE ITEM
    -------------------------------- */
    updateItem: builder.mutation({
      query: ({ itemId, data }) => ({
        url: `/items/${itemId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { itemId }) => [
        { type: "Items", id: itemId },
        { type: "Items", id: "LIST" },
      ],
    }),

    /* -------------------------------
       DELETE ITEM (SOFT DELETE)
    -------------------------------- */
    deleteItem: builder.mutation({
      query: (itemId) => ({
        url: `/items/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Items", id: "LIST" }],
    }),
  }),
});

export const {
  useGetItemsQuery,
  useGetItemByIdQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
} = itemApiSlice;
