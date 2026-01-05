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

    markTicketAsResolved: builder.mutation({
      query: (ticketId) => ({
        url: `/ticket/${ticketId}/resolved`,
        method: "PUT",
      }),
      invalidatesTags: ["Tickets"],
    }),

  }),
});

export const { useGetAllTicketsQuery,useMarkTicketAsResolvedMutation } = ticketsApiSlice;
