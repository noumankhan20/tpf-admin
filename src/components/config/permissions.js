// /config/permissions.js
export const ROLE_PERMISSIONS = {
  superadmin: [
    "dashboard",
    "admin",
    "security",
    "donor",
    "finance",
    "inventory",
    "projects",
    "campaigns",
    "field",
    "dms",
    "legal",
    "cms",
    "communication",
    "photography",
     "financial-aid-verify"
  ],

  "hr-admin": ["hr", "dms", "legal"],
  "volunteer-admin": ["field", "projects"],
  "finance-admin": ["donations", "finance", "inventory"],
  "cms-admin": ["cms"],
  "donor-admin": ["donor", "legal"],
  "documentation-admin": ["dms"],
  "legal-admin": ["legal"],
  "communication-admin": ["communication"]
   
};
