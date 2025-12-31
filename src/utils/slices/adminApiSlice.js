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
        const { data } = await queryFulfilled;

        // ✅ Saves to Redux + localStorage
        dispatch(setAdminCredentials(data.admin));
      },
    }),


    getAdminMe: builder.query({
      query: () => ({
        url: "/adminAuth/me",
        method: "GET",
      }),
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
          dispatch(logoutAdminAction());
          dispatch(adminApiSlice.util.resetApiState()); // 🔥 REQUIRED
        }
      },
    }),


    getAllAdmins: builder.query({
      query: () => ({
        url: "/adminAuth/getall", // The GET request for /getall
        method: "GET",
      }),
    }),

    addAdmin: builder.mutation({
      query: (data) => ({
        url: "/adminAuth/add", // The POST request for /add
        method: "POST",
        body: data,
      }),
    }),

    disableAdmin: builder.mutation({
      query: ({ id }) => ({
        url: `/adminAuth/disable/${id}`, // Dynamic URL path with the id parameter
        method: "PUT",
      }),
    }),

    enableAdmin: builder.mutation({
      query: ({ id }) => ({
        url: `/adminAuth/enable/${id}`, // Dynamic URL path with the id parameter
        method: "PUT",
      }),
    }),

    editAdmin: builder.mutation({
      query: ({ id, data }) => ({
        url: `/adminAuth/edit/${id}`, // Dynamic URL path with the id parameter
        method: "PUT",
        body: data,
      }),
    }),

    getPermanentDonors: builder.query({
      query: ({ planType, status } = {}) => {
        const params = new URLSearchParams();

        if (planType) params.append("planType", planType);
        if (status) params.append("status", status);

        return {
          url: `/adminAuth/permanent-donors?${params.toString()}`,
          method: "GET",
        };
      },
    }),



    getAdminList: builder.query({
      query: () => ({
        url: "/admin/list",
        method: "GET",
      }),
    }),

    getEmployees: builder.query({
      query: () => ({
        url: "/adminAuth/getemployees", // The GET request for /getall
        method: "GET",
      }),
    }),

    getSalary: builder.query({
      query: (id) => ({
        url: `/inventory/expenses/${id}/salary`, // The GET request for /getall
        method: "GET",
      }),
    }),

    getExpenses: builder.query({
      query: (id) => ({
        url: `/inventory/expenses/${id}/expense`, // The GET request for /getall
        method: "GET",
      }),
    }),

  }),
});

export const {
  useLoginAdminMutation,
  useLogoutAdminApiMutation,
  useGetAdminMeQuery,
  useLazyGetAdminMeQuery,
  useAddAdminMutation,
  useGetAllAdminsQuery,
  useDisableAdminMutation,
  useEnableAdminMutation,
  useEditAdminMutation,
  useGetPermanentDonorsQuery,
  useGetAdminListQuery,
  useGetEmployeesQuery,
  useGetSalaryQuery,
  useGetExpensesQuery
} = adminApiSlice;
