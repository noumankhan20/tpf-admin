import { apiSlice } from "./apiSlice";

export const locationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStates: builder.query({
      query: () => ({
        url: "https://countriesnow.space/api/v0.1/countries/states",
        method: "POST",
        body: { country: "India" },
      }),
      transformResponse: (response) => {
        // Sort states alphabetically
        return response.data.states.map(s => s.name).sort();
      },
      // Cache for 24 hours (86400 seconds) since states don't change often
      keepUnusedDataFor: 86400,
    }),
    getCities: builder.query({
      query: (state) => ({
        url: "https://countriesnow.space/api/v0.1/countries/state/cities",
        method: "POST",
        body: { country: "India", state: state },
      }),
      transformResponse: (response) => {
        // Sort cities alphabetically
        return response.data.sort();
      },
      // Cache for 24 hours
      keepUnusedDataFor: 86400,
    }),
  }),
});

export const { useGetStatesQuery, useLazyGetCitiesQuery } = locationApiSlice;
