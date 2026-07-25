import { apiSlice } from './apiSlice';

export const taskManagementApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all tasks with filters
        getAllTasks: builder.query({
            query: ({
                search = '',
                status = 'all',
                module = 'all',
                sortBy = 'createdAt',
                sortOrder = 'desc',
                page = 1,
                limit = 20,
                startDate = '',
                endDate = ''
            }) => ({
                url: '/admin/task-management/tasks',
                params: { search, status, module, sortBy, sortOrder, page, limit, startDate, endDate }
            }),
            providesTags: ['TaskManagement']
        }),

        // Get campaign progress
        getCampaignProgress: builder.query({
            query: (campaignId) => `/admin/task-management/campaign-progress/${campaignId}`,
            providesTags: (result, error, campaignId) => [{ type: 'TaskManagement', id: campaignId }]
        }),

        // Get campaigns overview
        getCampaignsOverview: builder.query({
            query: ({
                search = '',
                status = 'all',
                sortBy = 'createdAt',
                sortOrder = 'desc',
                page = 1,
                limit = 10
            }) => ({
                url: '/admin/task-management/campaigns-overview',
                params: { search, status, sortBy, sortOrder, page, limit }
            }),
            providesTags: ['TaskManagement', 'Campaigns']
        }),

        // Get task analytics
        getTaskAnalytics: builder.query({
            query: () => '/admin/task-management/analytics',
            providesTags: ['TaskManagement']
        }),

        // Get all direct tasks
        getAllDirectTasks: builder.query({
            query: ({ page = 1, limit = 20 }) => ({
                url: '/admin/task-management/direct-tasks',
                params: { page, limit }
            }),
            providesTags: ['DirectTasks']
        })
    })
});

export const {
    useGetAllTasksQuery,
    useGetCampaignProgressQuery,
    useGetCampaignsOverviewQuery,
    useGetTaskAnalyticsQuery,
    useGetAllDirectTasksQuery
} = taskManagementApiSlice;
