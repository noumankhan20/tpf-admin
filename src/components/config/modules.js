// /config/modules.js
import {
  TrendingUp,
  Settings,
  Shield,
  Users,
  UserCheck,
  MapPin,
  UserCog,
  Heart,
  Calculator,
  Package,
  FolderKanban,
  Bell,
  FileText,
  Scale,
  Globe,
  ShieldCheck
} from "lucide-react";

export const MODULES = [
  { id: "dashboard", name: "Dashboard", icon: TrendingUp, route: "/dashboard", category: "administration", desc: "Overview of key metrics" },
  { id: "admin", name: "Admin Settings", icon: Settings, route: "/admin-settings", category: "administration", desc: "System preferences and configuration" },
  { id: "security", name: "Security & Access", icon: Shield, route: "/add-admin", category: "administration", desc: "Manage system security" },
  { id: "donor", name: "Donor Management", icon: Users, route: "/donor", category: "people", desc: "Track donor details & activity" },
  { id: "beneficiary", name: "Beneficiary Management", icon: UserCheck, route: "/beneficiary", category: "people", desc: "Manage beneficiaries" },
  { id: "field", name: "Volunteer Management", icon: MapPin, route: "/field-operations", category: "people", desc: "Manage volunteer operations" },
  { id: "hr", name: "HR Management", icon: UserCog, route: "/hr", category: "people", desc: "HR functions & employee records" },
  { id: "donations", name: "Transactions", icon: Heart, route: "/donations", category: "finance", desc: "Donation records & payments" },
  { id: "finance", name: "Finance & Accounting", icon: Calculator, route: "/finance", category: "finance", desc: "Budgets and expense reporting" },
  { id: "inventory", name: "Inventory", icon: Package, route: "/inventory", category: "finance", desc: "Asset and inventory tracking" },
  { id: "projects", name: "Project Management", icon: FolderKanban, route: "/projects", category: "operations", desc: "Manage all projects" },
  { id: "campaigns", name: "Campaign Management", icon: Bell, route: "/campaigns", category: "operations", desc: "Campaign tracking and execution" },
  { id: "dms", name: "Document Management", icon: FileText, route: "/documents", category: "documentation", desc: "Document storage and access" },
  { id: "legal", name: "Legal & Compliance", icon: Scale, route: "/legal", category: "documentation", desc: "Legal approvals and compliance" },
  { id: "cms", name: "CMS", icon: Globe, route: "/cms-admin", category: "documentation", desc: "Manage content & pages" },
  { id: "communication", name: "Communication", icon: Bell, route: "/communication", category: "operations", desc: "Notices, messages & alerts" },
  { id: "photography", name: "Photography", icon: Bell, route: "/photography", category: "operations", desc: "Manage photography content" },
  { id: "social-media", name: "Social Media", icon: Bell, route: "/social-media", category: "people", desc: "Manage Social-Media content" },
   { 
    id: "financial-aid-verify", 
    name: "Financial Aid", 
    icon: ShieldCheck, 
    route: "/verify", 
    category: "verify-forms",
    desc: "Verify financial aid forms" 
  },
];
