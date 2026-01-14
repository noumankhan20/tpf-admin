import { apiSlice } from "./apiSlice";

const PHOTO_EDITING_URL = '/photo-editing';

export const photoEditingApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getEditingAssignments: builder.query({
            query: () => `${PHOTO_EDITING_URL}/assignments`,
            keepUnusedDataFor: 5,
            providesTags: ["PhotoEditingAssignments"],
        }),
        getCompletedEditingAssignments: builder.query({
            query: () => `${PHOTO_EDITING_URL}/completed-assignments`,
            keepUnusedDataFor: 5,
            providesTags: ["PhotoEditingAssignments"],
        }),
        uploadEditedPhoto: builder.mutation({
            query: ({ formData }) => ({
                url: `${PHOTO_EDITING_URL}/upload`,
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ["PhotoEditingAssignments"],
        }),
        completeTask: builder.mutation({
            query: ({ taskId }) => ({
                url: `/workflow/tasks/${taskId}/complete`,
                method: 'POST',
            }),
            invalidatesTags: ["PhotoEditingAssignments"],
        }),
    }),
});

export const {
    useGetEditingAssignmentsQuery,
    useGetCompletedEditingAssignmentsQuery,
    useUploadEditedPhotoMutation,
    useCompleteTaskMutation,
} = photoEditingApiSlice;
