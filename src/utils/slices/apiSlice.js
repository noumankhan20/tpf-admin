import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_API,
    credentials: "include",   // needed for adminCookie
  }),
  tagTypes: ['ADMIN', 'FinancialAidForms', 'KYCRequests', 'PhotographyAssignments', 'Campaigns', 'PhotographySubmissions', 'SocialMediaAssignments', 'TaskManagement','FinanceAssignments','Tasks',
    //CMS TAGS
    'Hero',
    'Fundraiser',
    'Communities',
    'Tailored',
    'Impact',
    'Influencer',
    'TrustedBy',
    'StartGiving',
    'BeforeFooter',

  ],
  endpoints: () => ({})
});
