import { apiSlice } from "./apiSlice";

export const ticketsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllTickets: builder.query({
      query: () => ({
        url: "/ticket/getall",
        method: "GET",
      }),
      providesTags: ["Tickets"],
    }),
  }),
});

export const { useGetAllTicketsQuery } = ticketsApiSlice;
