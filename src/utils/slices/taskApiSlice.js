import { apiSlice } from './apiSlice';

export const taskApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get pending tasks for login modal
        getLoginPendingTasks: builder.query({
            query: () => '/workflow/tasks/pending',
            providesTags: ['Tasks']
        }),

        // Acknowledge a task from login modal
        acknowledgeTask: builder.mutation({
            query: (taskId) => ({
                url: `/workflow/tasks/${taskId}/acknowledge`,
                method: 'POST'
            }),
            invalidatesTags: ['Tasks']
        })
    })
});

export const {
    useGetLoginPendingTasksQuery,
    useAcknowledgeTaskMutation
} = taskApiSlice;
