// /config/permissions.js
export const ROLE_PERMISSIONS = {
  SUPERADMIN: [
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
  ],

  "hr-admin": ["hr", "dms", "legal"],
  "volunteer-admin": ["field", "projects"],
  "finance-admin": ["donations", "finance", "inventory"],
  "cms-admin": ["cms"],
  "donor-admin": ["donor", "legal"],
  "documentation-admin": ["dms"],
  "legal-admin": ["legal"],
  "communication-admin": ["communication"],
};
