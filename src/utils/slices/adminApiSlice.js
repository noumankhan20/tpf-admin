import { apiSlice } from "./apiSlice";
import { setAdminCredentials, logoutAdmin } from "./adminAuthSlice";

export const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    loginAdmin: builder.mutation({
      query: (data) => ({
        url: "/adminAuth/login",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setAdminCredentials(data.admin));  // save admin info
        } catch (err) {
          console.log("Admin login error =>", err);
        }
      },
    }),

    logoutAdmin: builder.mutation({
      query: () => ({
        url: "/adminAuth/logout",
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch }) {
        dispatch(logoutAdmin()); // clear local storage
      },
    }),
  }),
});

export const { useLoginAdminMutation, useLogoutAdminMutation } = adminApiSlice;
