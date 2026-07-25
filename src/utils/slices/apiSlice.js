import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_API,
    credentials: "include",   // needed for adminCookie
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("adminToken");
        if (token) {
          headers.set("authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: ['ADMIN', 'FinancialAidForms', 'KYCRequests', 'PhotographyAssignments', 'Campaigns', 'PhotographySubmissions', 'SocialMediaAssignments', 'TaskManagement', 'FinanceAssignments', 'Tasks', 'Assets', 'Tickets', 'Stock', 'Expenses', 'Purchases', 'InventoryDashboard', 'Documentation', 'BusinessResolutions', 'PhotoEditingAssignments', 'UnreadCounts', 'FAQ','CampaignRequest','Campaign','OfflineDonations','PendingCount', 'CalendarEvents',
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
    'Vendors',
    'Items',
    'AuditLog',
    'InternalCommunicationAdmins',
    'InternalMessages',
    'Blog',
    'Vouchers',
    'Volunteers',
    'Notices',
    'Organizations',
    'Jobs',
    'Applications',
    'DeleteRequests',
    'Transactions',
    'DirectTasks'
  ],
  endpoints: () => ({})
});
