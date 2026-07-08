/**
 * MODULES REGISTRY
 *
 * Rule: every `id` here MUST exist in ADMIN_MODULES (adminRoles.js).
 * The `id` is what gets stored in MongoDB and used for permission checks.
 * The `name` is only for display.
 */

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
  FileText,
  Scale,
  Download,
  MessageSquare,
  Heart,
  UserCheck,
  Building2,
  Briefcase,
  Trash2,
  IndianRupee,
} from "lucide-react";

export const MODULES = [

  // ═══════════════════════════════════════
  // DASHBOARD
  // ═══════════════════════════════════════
  {
    id: "Admin Dashboard",           // ← stored in DB
    name: "Overview",                // ← display only
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

  // ═══════════════════════════════════════
  // WORK
  // ═══════════════════════════════════════
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
    name: "User KYC Verification",
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

  // ═══════════════════════════════════════
  // RESOURCE MANAGEMENT
  // ═══════════════════════════════════════
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
    id: "Career & Job Opportunities",
    name: "Career & Job Opportunities",
    icon: Briefcase,
    route: "/career-opportunities",
    category: "hr",
    desc: "Manage career and job opportunities",
  },

  // ═══════════════════════════════════════
  // HUMAN RESOURCES
  // ═══════════════════════════════════════
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

  // ═══════════════════════════════════════
  // MONITORING
  // ═══════════════════════════════════════
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

  // ═══════════════════════════════════════
  // TPF MANAGEMENT
  // ═══════════════════════════════════════

  {
    id: "Donor",
    name: "Donor",
    icon: Heart,
    route: "/tpf-management/donors",
    category: "tpf-management",
    desc: "View donor profiles and donation statistics",
  },
  {
    id: "permanent-donors",
    name: "Permanent Donor",
    icon: UserCheck,
    route: "/tpf-management/permanent-donors",
    category: "tpf-management",
    desc: "Manage donor plans and track recurring donations",
  },
  {
    id: "employees",
    name: "Employee",
    icon: Briefcase,
    route: "/tpf-management/employee-management",
    category: "tpf-management",
    desc: "Attendance, salary, expenses, and login records",
  },
  {
    id: "organizations",
    name: "Organization",
    icon: Building2,
    route: "/tpf-management/organizations",
    category: "tpf-management",
    desc: "Organization details based on backend models",
  },

  // ═══════════════════════════════════════
  // ADMINISTRATION
  // ═══════════════════════════════════════
  {
    id: "deletion",
    name: "Approve Delete Request",
    icon: Trash2,
    route: "/tpf-management/approve-request",
    category: "administration",
    desc: "Approve delete requests from different modules",
  },
  {
    id: "Security & Access",
    name: "Security & Access",
    icon: Shield,
    route: "/add-admin",
    category: "administration",
    desc: "Manage roles and permissions",
  },
  {
    id: "Communication Audit",
    name: "Communication Audit",
    icon: Shield,
    route: "/tpf-management/communication-audit",
    category: "administration",
    desc: "Monitor internal admin communications",
  },
  {
    id: "Transaction Ledger",
    name: "Transaction Ledger",
    icon: IndianRupee,
    route: "/transaction-ledger",
    category: "dashboard",
    desc: "Ledger report for transactions",
  },

  // ═══════════════════════════════════════
  // LEGAL & RECORDS
  // ═══════════════════════════════════════
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
    name: "Legal and Compliance",
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

  // ═══════════════════════════════════════
  // COMMUNICATION
  // ═══════════════════════════════════════
  {
    id: "Tickets-Queries",
    name: "Tickets & Queries",
    icon: MessageSquare,
    route: "/tickets-queries",
    category: "communication",
    desc: "Respond to user tickets and support queries",
  },
  {
    id: "Internal Communication",
    name: "Internal Chat",
    icon: MessageSquare,
    route: "/admin/communication",
    category: "communication",
    desc: "Admin-to-admin communication",
  },
  {
    id: "Direct Contact",
    name: "Direct Contact",
    icon: MessageSquare,
    route: "/admin/communication/direct-contact",
    category: "communication",
    desc: "Send personalised emails to users, donors, or volunteers",
  },
];

/**
 * O(1) lookup map: id → module object.
 * Use this instead of MODULES.find() in hot render paths.
 */
export const MODULE_MAP = Object.fromEntries(MODULES.map((m) => [m.id, m]));

/**
 * Resolve a stored module ID to its human-readable display name.
 * Falls back to the raw ID so nothing ever shows as blank.
 */
export const getModuleName = (id) => MODULE_MAP[id]?.name ?? id;