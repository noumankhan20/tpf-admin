import { apiSlice } from "./apiSlice";

export const internalCommunicationApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCommunicationAdmins: builder.query({
            query: () => ({
                url: "/admin/internal-communication/admins",
                method: "GET",
            }),
            providesTags: ["InternalCommunicationAdmins"],
        }),
        getInternalMessages: builder.query({
            query: (params) => ({
                url: "/admin/internal-communication/messages",
                method: "GET",
                params,
            }),
            providesTags: ["InternalMessages"],
        }),
        sendInternalMessage: builder.mutation({
            query: (data) => ({
                url: "/admin/internal-communication/send",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["InternalMessages"],
        }),
        markMessagesAsRead: builder.mutation({
            query: (data) => ({
                url: "/admin/internal-communication/mark-read",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["InternalMessages"],
        }),
        getConversations: builder.query({
            query: () => ({
                url: "/admin/internal-communication/conversations",
                method: "GET",
            }),
            providesTags: ["InternalMessages"],
        }),
        getUnreadCounts: builder.query({
            query: () => ({
                url: "/admin/internal-communication/unread-counts",
                method: "GET",
            }),
            providesTags: ["UnreadCounts"],
        }),
    }),
});

export const {
    useGetCommunicationAdminsQuery,
    useGetInternalMessagesQuery,
    useSendInternalMessageMutation,
    useMarkMessagesAsReadMutation,
    useGetConversationsQuery,
    useGetUnreadCountsQuery,
} = internalCommunicationApiSlice;
