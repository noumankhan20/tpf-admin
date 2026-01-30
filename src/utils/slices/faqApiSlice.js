import { apiSlice } from "./apiSlice";

export const faqApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAdminFAQs: builder.query({
            query: ({ status, category, page, limit }) => ({
                url: `/faqs/admin/all`,
                params: { status, category, page, limit },
                method: 'GET',
            }),
            providesTags: ['FAQ'],
        }),
        answerFAQ: builder.mutation({
            query: (data) => ({
                url: `/faqs/admin/answer`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['FAQ'],
        }),
    }),
});

export const {
    useGetAdminFAQsQuery,
    useAnswerFAQMutation,
} = faqApiSlice;
