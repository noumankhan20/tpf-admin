"use client";
import { useRouter } from "next/navigation";
import {
    Users,
    UserCheck,
    Heart,
    Briefcase,
    Building2,
    ArrowRight,
    ArrowLeft,
} from "lucide-react";
const ENTITIES = [
    {
        id: "donors",
        title: "Donor",
        desc: "All users are donors by default. View donor profiles and donation statistics.",
        icon: Heart,
        route: "/tpf-management/donors",
    },
    {
        id: "permanent-donors",
        title: "Permanent Donor",
        desc: "Manage donor plans and track recurring donations.",
        icon: UserCheck,
        route: "/tpf-management/permanent-donors",
    },
    {
        id: "volunteers",
        title: "Volunteer",
        desc: "Volunteer profiles, status, and reimbursement workflows.",
        icon: Users,
        route: "/tpf-management/volunteers",
    },
    {
        id: "employees",
        title: "Employee",
        desc: "Attendance, salary, expenses, and login records.",
        icon: Briefcase,
        route: "/tpf-management/employees",
    },
    {
        id: "organizations",
        title: "Organization",
        desc: "Organization details based on backend models.",
        icon: Building2,
        route: "/tpf-management/organizations",
    },
];

export default function TPFManagement() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        TPF Management
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Manage core entities of the platform
                    </p>
                    <button
                        onClick={() => router.push("/select-portal")}
                        className="flex items-center gap-2 px-4 py-3 w-full sm:w-auto cursor-pointer rounded-xl text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors border border-gray-300"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                </div>

                {/* Entity Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ENTITIES.map((entity) => {
                        const Icon = entity.icon;
                        return (
                            <div
                                key={entity.id}
                                onClick={() => router.push(entity.route)}
                                className="group cursor-pointer bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                                        <Icon className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition" />
                                </div>

                                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                                    {entity.title}
                                </h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    {entity.desc}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
