// /config/users.js
export const USER_MAP = {
  "superadmin@test.com": {
    password: "admin123",
    roles: ["superadmin"]
  },
  "hr@test.com": {
    password: "hr123",
    roles: ["hr-admin", "documentation-admin", "legal-admin", "finance-admin"]
  },
  "volunteer@test.com": {
    password: "vol123",
    roles: [
      "volunteer-admin",
      "finance-admin",
      "hr-admin",
      "cms-admin",
      "legal-admin"
    ]
  },
  "cms@test.com": {
    password: "cms123",
    roles: ["cms-admin"]
  },
  "donor@test.com": {
    password: "donor123",
    roles: ["donor-admin", "legal-admin"]
  }
};
