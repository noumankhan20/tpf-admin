// // /config/modules.js
// import {
//   TrendingUp,
//   Settings,
//   Shield,
//   CreditCard,
//   Users,
//   UserCheck,
//   MapPin,
//   UserCog,
//   Heart,
//   Calculator,
//   Package,
//   FolderKanban,
//   Bell,
//   FileText,
//   Scale,
//   Globe,
//   ShieldCheck,
//   HandHeart,
//   Book,
//   ClipboardList,
//   LayoutDashboard,
//   LayoutGrid,
//   Calendar,
//   Download,
//   Edit,
//   MessageSquare,
// } from "lucide-react";

// export const MODULES = [
//   {
//     id: "Dashboard Overview",
//     name: "Overview",
//     icon: TrendingUp,
//     route: "/admin/dashboard/overview",
//     category: "dashboard",
//     desc: "Detailed charts and analytics",
//   },
//   {
//     id: "Dashboard Summary",
//     name: "Summary Cards",
//     icon: LayoutGrid,
//     route: "/admin/dashboard/summary",
//     category: "dashboard",
//     desc: "Key metrics and recent transactions",
//   },
//   {
//     id: "Security & Access",
//     name: "Security & Access",
//     icon: Shield,
//     route: "/add-admin",
//     category: "administration",
//     desc: "Manage system security",
//   },
//   {
//     id: "task-management",
//     name: "Task Management",
//     icon: ClipboardList,
//     route: "/admin/task-management",
//     category: "administration",
//     desc: "Monitor and track all campaign tasks",
//   },
//   {
//     id: "TPF Management",
//     name: "TPF Management",
//     icon: Users,
//     route: "/tpf-management",
//     category: "people",
//     desc: "Manage TPF content",
//   },
//   {
//     id: "Donation Management",
//     name: "Donation Management",
//     icon: HandHeart,
//     route: "/donation-management",
//     category: "quick-access",
//     desc: "Track donor details & activity",
//   },
//   {
//     id: "Finance & Accounting",
//     name: "Finance & Accounting",
//     icon: Calculator,
//     route: "/finance/expenses",
//     category: "finance",
//     desc: "Budgets and expense reporting",
//   },
//   {
//     id: "Inventory",
//     name: "Inventory",
//     icon: Package,
//     route: "/inventory",
//     category: "quick-access",
//     desc: "Asset and inventory tracking",
//   },
//   {
//     id: "Financial Aid",
//     name: "Financial Aid",
//     icon: ShieldCheck,
//     route: "/verify/financial",
//     category: "operations",
//     desc: "Verify financial aid forms",
//   },
//   {
//     id: "KYC Verification",
//     name: "KYC Verification",
//     icon: Book,
//     route: "/verify/kyc",
//     category: "operations",
//     desc: "Verify user KYC documents",
//   },
//   {
//     id: "Photography",
//     name: "Photography",
//     icon: Bell,
//     route: "/photography",
//     category: "operations",
//     desc: "Manage photography content",
//   },
//   {
//     id: "Photo-Editing",
//     name: "Photo Editing",
//     icon: Edit,
//     route: "/photo-editing",
//     category: "operations",
//     desc: "Process and edit campaign photos",
//   },
//   {
//     id: "CMS-Admin",
//     name: "CMS",
//     icon: Globe,
//     route: "/cms-admin",
//     category: "operations",
//     desc: "Manage content & pages",
//   },
//   {
//     id: "Social-Media",
//     name: "Social Media",
//     icon: Bell,
//     route: "/social-media",
//     category: "operations",
//     desc: "Manage Social-Media content",
//   },
//   {
//     id: "Campaign Management",
//     name: "Campaign Management",
//     icon: Bell,
//     route: "/campaigns",
//     category: "operations",
//     desc: "Campaign tracking and execution",
//   },
//   {
//     id: "Document Management",
//     name: "Document Management",
//     icon: FileText,
//     route: "/documentation-management",
//     category: "documentation",
//     desc: "Document storage and access",
//   },
//   {
//     id: "Downloads",
//     name: "Downloads",
//     icon: Download,
//     route: "/downloads",
//     category: "quick-access",
//     desc: "Export data to CSV/PDF",
//   },
//   {
//     id: "Legal and Compliance",
//     name: "Legal & Compliance",
//     icon: Scale,
//     route: "/legal",
//     category: "documentation",
//     desc: "Legal approvals and compliance",
//   },
//   {
//     id: "Tickets-Queries",
//     name: "Tickets & Queries",
//     icon: Book,
//     route: "/tickets-queries",
//     category: "communication",
//     desc: "Respond to the Tickets and Queries of the Users",
//   },
//   {
//     id: 'Disbursement-Tasks',
//     name: 'Disbursement Tasks',
//     desc: 'Process beneficiary payments and transaction proofs',
//     icon: CreditCard,
//     category: 'operations',
//     route: '/finance/disbursement',
//   },

//   {
//     id: "Internal Communication",
//     name: "Internal Chat",
//     icon: MessageSquare,
//     route: "/admin/communication",
//     category: "communication",
//     desc: "Admin-to-admin internal messaging system",
//   },
//   {
//     id: "Communication Audit",
//     name: "Communication Audit",
//     icon: Shield,
//     route: "/tpf-management/communication-audit",
//     category: "communication",
//     desc: "Monitor all internal admin conversations",
//   },
// ];

// /config/modules.js

import {
  TrendingUp,
  LayoutGrid,
  ClipboardCheck,
  Camera,
  Edit,
  Globe,
  Share2,
  CreditCard,
  Package,
  Calculator,
  FolderKanban,
  HandHeart,
  Users,
  Shield,
  UserCog,
  FileText,
  Scale,
  Download,
  MessageSquare,
  Heart,
  UserCheck,
  Building2,
  Briefcase,
  Trash2,
} from "lucide-react";

export const MODULES = [

  // ===============================
  // DASHBOARD (Insights Only)
  // ===============================

  {
    id: "Admin Dashboard",
    name: "Overview",
    icon: TrendingUp,
    route: "/admin/dashboard/overview",
    category: "dashboard",
    desc: "Platform performance insights",
  },
  {
    id: "Dashboard Summary",
    name: "Summary",
    icon: LayoutGrid,
    route: "/admin/dashboard/summary",
    category: "dashboard",
    desc: "Key metrics and quick stats",
  },

  // ===============================
  // WORK (Task Execution Modules)
  // ===============================

  {
    id: "Financial Aid",
    name: "Beneficiary Form Verification",
    icon: ClipboardCheck,
    route: "/verify/financial",
    category: "work",
    desc: "Review and approve financial aid requests",
  },
  {
    id: "KYC Verification",
    name: "User Kyc Verification",
    icon: ClipboardCheck,
    route: "/verify/kyc",
    category: "work",
    desc: "Verify user KYC documents",
  },
  {
    id: "Organization Verification",
    name: "Organization Approvals",
    icon: ClipboardCheck,
    route: "/verify/organization",
    category: "work",
    desc: "Manage registrations and campaign requests",
  },
  {
    id: "Photography",
    name: "Photography",
    icon: Camera,
    route: "/photography",
    category: "work",
    desc: "Upload and manage campaign photos",
  },
  {
    id: "Photo-Editing",
    name: "Photo Editing",
    icon: Edit,
    route: "/photo-editing",
    category: "work",
    desc: "Process and optimize campaign media",
  },
  {
    id: "CMS-Admin",
    name: "Client CMS",
    icon: Globe,
    route: "/cms-admin",
    category: "work",
    desc: "Create and publish campaigns",
  },
  {
    id: "Social-Media",
    name: "Social Media",
    icon: Share2,
    route: "/social-media",
    category: "work",
    desc: "Manage social campaigns and promotions",
  },
  {
    id: "Disbursement-Tasks",
    name: "Fund Disbursement",
    icon: CreditCard,
    route: "/finance/disbursement",
    category: "work",
    desc: "Process beneficiary payments",
  },

  // ===============================
  // RESOURCE MANAGEMENT (Full CRUD Systems)
  // ===============================

  {
    id: "Inventory",
    name: "Inventory",
    icon: Package,
    route: "/inventory",
    category: "resource",
    desc: "Manage assets and inventory systems",
  },
  {
    id: "Finance & Accounting",
    name: "Finance & Accounting",
    icon: Calculator,
    route: "/finance/expenses",
    category: "resource",
    desc: "Manage financial records and accounting",
  },
  {
    id: "Career & Job Opportunites",
    name: "Career & Job Opportunites",
    icon: Briefcase,
    route: "/career-opportunities",
    category: "hr",
    desc: "Manage career and job opportunities",
  },
  {
    id: "Employee Management",
    name: "Employee Management",
    icon: Briefcase,
    route: "/tpf-management/employee-management",
    category: "hr",
    desc: "Manage employee records and payroll",
  },
  {
    id: "Volunteer Management",
    name: "Volunteer Management",
    icon: Users,
    route: "/tpf-management/volunteers",
    category: "hr",
    desc: "Manage volunteer profiles and tasks",
  },

  // ===============================
  // MONITORING (Read-only / Tracking)
  // ===============================

  {
    id: "task-management",
    name: "Task Management",
    icon: FolderKanban,
    route: "/admin/task-management",
    category: "monitoring",
    desc: "Track and monitor task statuses",
  },
  {
    id: "Donation Management",
    name: "Donation Management",
    icon: HandHeart,
    route: "/donation-management",
    category: "monitoring",
    desc: "View and track donation records",
  },
  {
    id: "Campaign Management",
    name: "Campaign Management",
    icon: FolderKanban,
    route: "/campaigns",
    category: "monitoring",
    desc: "Monitor campaign performance and status",
  },

  // ===============================
  // TPF-Management
  // ===============================
  {
    id: "Donor",
    name: "Donor",
    desc: "All users are donors by default. View donor profiles and donation statistics.",
    icon: Heart,
    route: "/tpf-management/donors",
    category: 'tpf-management'
  },
  {
    id: "permanent-donors",
    name: "Permanent Donor",
    desc: "Manage donor plans and track recurring donations.",
    icon: UserCheck,
    route: "/tpf-management/permanent-donors",
    category: 'tpf-management'
  },
  
  {
    id: "employees",
    name: "Employee",
    desc: "Attendance, salary, expenses, and login records.",
    icon: Briefcase,
    route: "/tpf-management/employee-management",
    category: 'tpf-management'
  },
  {
    id: "organizations",
    name: "Organization",
    desc: "Organization details based on backend models.",
    icon: Building2,
    route: "/tpf-management/organizations",
    category: 'tpf-management'
  },
  {
    id: "deletion",
    name: "Approve Delete Requests",
    desc: "Approve the delete requests coming from different modules .",
    icon: Trash2,
    route: "/tpf-management/approve-request",
    category: 'tpf-management'
  },

  // ===============================
  // ADMINISTRATION (System Control)
  // ===============================

  {
    id: "Security & Access",
    name: "Security & Access",
    icon: Shield,
    route: "/add-admin",
    category: "administration",
    desc: "Manage roles and permissions",
  },
  {
    id: "Tickets-Queries",
    name: "Tickets & Queries",
    icon: MessageSquare,
    route: "/tickets-queries",
    category: "communication",
    desc: "Respond to user tickets and support queries",
  },
  {
    id: "Communication Audit",
    name: "Communication Audit",
    icon: Shield,
    route: "/tpf-management/communication-audit",
    category: "administration",
    desc: "Monitor internal admin communications",
  },


  // ===============================
  // LEGAL & RECORDS (Compliance / Export)
  // ===============================

  {
    id: "Document Management",
    name: "Document Management",
    icon: FileText,
    route: "/documentation-management",
    category: "legal",
    desc: "Access and manage platform documents",
  },
  {
    id: "Legal and Compliance",
    name: "Legal & Compliance",
    icon: Scale,
    route: "/legal",
    category: "legal",
    desc: "Manage compliance and approvals",
  },
  {
    id: "Downloads",
    name: "Downloads",
    icon: Download,
    route: "/downloads",
    category: "legal",
    desc: "Export system data and reports",
  },

  // ===============================
  // COMMUNICATION
  // ===============================

  {
    id: "Internal Communication",
    name: "Internal Chat",
    icon: MessageSquare,
    route: "/admin/communication",
    category: "communication",
    desc: "Admin-to-admin communication",
  },
];
