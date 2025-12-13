import { apiSlice } from "./apiSlice";
import { setAdminCredentials, logoutAdmin as logoutAdminAction } from "./adminAuthSlice";

export const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    loginAdmin: builder.mutation({
      query: (data) => ({
        url: "/adminAuth/login",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setAdminCredentials(data.admin));
        } catch (err) {
          console.error("Admin login error:", err);
        }
      },
    }),

    logoutAdminApi: builder.mutation({
      query: () => ({
        url: "/adminAuth/logout",
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          // Always clear local state, even if API fails
          dispatch(logoutAdminAction());
        }
      },
    }),
  }),
});

export const {
  useLoginAdminMutation,
  useLogoutAdminApiMutation,
} = adminApiSlice;
