"use client";

import { useState } from "react";
import { JobFormModal } from "./JobModals";
import ConfirmModal from "../Common/ConfirmModal";
import { ApplicantsPage } from "./ApplicantsPage";
import { useGetAllJobsQuery, useCreateJobMutation, useUpdateJobMutation, useDeleteJobMutation } from "@/utils/slices/jobApiSlice";

const STATUS_BADGE = {
    New: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    "Under Review": "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    Shortlisted: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
};

function Badge({ status }) {
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[status] || "bg-gray-100 text-gray-600"
                }`}
        >
            {status}
        </span>
    );
}

function IconBtn({ onClick, title, children, variant = "default" }) {
    const variants = {
        default: "text-gray-400 hover:text-gray-600 hover:bg-gray-100",
        danger: "text-gray-400 hover:text-red-500 hover:bg-red-50",
        primary: "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50",
    };
    return (
        <button
            onClick={onClick}
            title={title}
            className={`p-1.5 rounded-lg transition-all duration-150 ${variants[variant]}`}
        >
            {children}
        </button>
    );
}

function EmptyState({ message }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg className="w-12 h-12 mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
            </svg>
            <p className="text-sm">{message}</p>
        </div>
    );
}

// ─────────────────────────────────────────────
// CAREERS DASHBOARD (MAIN PAGE)
// ─────────────────────────────────────────────

export function CareersDashboard() {
    const { data, isLoading, isError } = useGetAllJobsQuery();
    const [createJob] = useCreateJobMutation();
    const [updateJob] = useUpdateJobMutation();
    const [deleteJob] = useDeleteJobMutation();
    const [view, setView] = useState("dashboard"); // "dashboard" | "applicants"
    const [activeJob, setActiveJob] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [deletingJob, setDeletingJob] = useState(null);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [filterDept, setFilterDept] = useState("All");
    const jobs = data?.data || [];
    const departments = ["All", ...new Set(jobs.map((j) => j.department))];

    const filteredJobs = jobs.filter((j) => {
        const matchSearch =
            j.title.toLowerCase().includes(search.toLowerCase()) ||
            j.department.toLowerCase().includes(search.toLowerCase()) ||
            j.location.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === "All" || j.status === filterStatus;
        const matchDept = filterDept === "All" || j.department === filterDept;
        return matchSearch && matchStatus && matchDept;
    });

    const stats = {
        total: jobs.length,
        totalApplicants: jobs.reduce((sum, j) => sum + j.applicants, 0),
    };

    const handleSaveJob = async (formData) => {
        const processedData = {
            ...formData,
            responsibilities:
                typeof formData.responsibilities === "string"
                    ? formData.responsibilities.split("\n").filter((l) => l.trim())
                    : formData.responsibilities,
            requirements:
                typeof formData.requirements === "string"
                    ? formData.requirements.split("\n").filter((l) => l.trim())
                    : formData.requirements,
        };

        try {
            if (editingJob) {
                await updateJob({
                    id: editingJob._id,
                    data: processedData,
                }).unwrap();
                setEditingJob(null);
            } else {
                await createJob(processedData).unwrap();
                setShowAddModal(false);
            }
        } catch (err) {
            console.error(err);
        }
    };
    const handleDelete = async () => {
        try {
            await deleteJob(deletingJob._id).unwrap();
            setDeletingJob(null);
        } catch (err) {
            console.error(err);
        }
    };

    if (view === "applicants" && activeJob) {
        return (
            <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
                <div className="max-w-5xl mx-auto">
                    <ApplicantsPage job={activeJob} onBack={() => { setView("dashboard"); setActiveJob(null); }} />
                </div>
            </div>
        );
    }

    if (isLoading) return <p className="p-6">Loading jobs...</p>;
    if (isError) return <p className="p-6 text-red-500">Failed to load jobs</p>;

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Page Header */}
                <div className="flex flex-col items-center justify-center gap-4 mb-8 relative">
                    <button
                        onClick={() => window.history.back()}
                        className="absolute left-0 top-0 inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-150"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Careers Management</h1>
                        <p className="text-sm text-gray-400 mt-1">Manage job postings and review applicant submissions</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 active:scale-95 transition-all shadow-sm shadow-emerald-200"
                    >
                        <svg className="w-4 cursor-pointer h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Job
                    </button>
                </div>

                {/* Stats Row */}
                <div className="flex justify-center gap-4 mb-6">
                    {[
                        { label: "Total Postings", value: stats.total, icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", color: "text-gray-700", bg: "bg-gray-100" },
                        { label: "Total Applicants", value: stats.totalApplicants, icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", color: "text-violet-700", bg: "bg-violet-50" },
                    ].map(({ label, value, icon, color, bg }) => (
                        <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 w-52">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
                                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                                    <svg className={`w-4 h-4 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{value}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input value={search} onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search job title, department or location..."
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                            />
                        </div>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white min-w-[130px]"
                        >
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Shortlisted">Shortlisted</option>
                        </select>
                        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white min-w-[160px]"
                        >
                            {departments.map((d) => (
                                <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Jobs Table/Cards */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Table Header */}
                    <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <div className="col-span-3">Job Title</div>
                        <div className="col-span-2">Department</div>
                        <div className="col-span-2">Location</div>
                        <div className="col-span-1">Type</div>
                        <div className="col-span-1">Posted</div>
                        <div className="col-span-1 text-center">Apps</div>
                        <div className="col-span-1 text-right">Actions</div>
                    </div>

                    {/* Table Body */}
                    {filteredJobs.length === 0 ? (
                        <EmptyState message="No jobs match your current filters." />
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {filteredJobs.map((job) => (
                                <div key={job._id}
                                    className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 px-5 lg:px-6 py-4 hover:bg-gray-50/60 transition-colors group"
                                >
                                    {/* Job Title */}
                                    <div className="lg:col-span-3 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <span className="font-semibold text-gray-900 text-sm leading-tight">{job.title}</span>
                                    </div>

                                    {/* Department */}
                                    <div className="lg:col-span-2 flex items-center">
                                        <span className="text-sm text-gray-500">
                                            <span className="lg:hidden text-xs font-semibold text-gray-400 mr-1">Dept:</span>
                                            {job.department}
                                        </span>
                                    </div>

                                    {/* Location */}
                                    <div className="lg:col-span-2 flex items-center">
                                        <span className="text-sm text-gray-500 flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {job.location}
                                        </span>
                                    </div>

                                    {/* Type */}
                                    <div className="lg:col-span-1 flex items-center">
                                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                                            {job.employmentType}
                                        </span>
                                    </div>

                                    {/* Posted */}
                                    <div className="lg:col-span-1 flex items-center">
                                        <span className="text-xs text-gray-400">
                                            {new Date(job.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                        </span>
                                    </div>

                                    {/* Applicants */}
                                    <div className="lg:col-span-1 flex items-center lg:justify-center">
                                        <button
                                            onClick={() => { setActiveJob(job); setView("applicants"); }}
                                            className="flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                                        >
                                            {job.applicants}
                                            <span className="text-xs font-normal text-gray-400 lg:hidden ml-1">
                                                applicants
                                            </span>
                                        </button>
                                    </div>

                                    {/* Actions */}
                                    <div className="lg:col-span-1 flex items-center justify-start lg:justify-end gap-1">
                                        <IconBtn
                                            onClick={() => { setActiveJob(job); setView("applicants"); }}
                                            title="View Applicants"
                                            variant="primary"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </IconBtn>
                                        <IconBtn onClick={() => setEditingJob(job)} title="Edit Job">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </IconBtn>
                                        <IconBtn onClick={() => setDeletingJob(job)} title="Delete Job" variant="danger">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </IconBtn>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Table Footer */}
                    {filteredJobs.length > 0 && (
                        <div className="px-6 py-3 border-t border-gray-50 text-xs text-gray-400">
                            Showing {filteredJobs.length} of {jobs.length} job postings
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showAddModal && (
                <JobFormModal
                    onClose={() => setShowAddModal(false)}
                    onSave={handleSaveJob}
                />
            )}
            {editingJob && (
                <JobFormModal
                    job={editingJob}
                    onClose={() => setEditingJob(null)}
                    onSave={handleSaveJob}
                />
            )}
            {deletingJob && (
                <ConfirmModal
                    isOpen={!!deletingJob}
                    onClose={() => setDeletingJob(null)}
                    onConfirm={handleDelete}
                    title="Delete Job Posting"
                    message={`Are you sure you want to delete "${deletingJob?.title}"? All associated applicant data will also be removed. This action cannot be undone.`}
                />
            )}

            {/* Animation styles */}
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.18s ease-out both; }
      `}</style>
        </div>
    );
}

// ─────────────────────────────────────────────
// DEFAULT EXPORT
// ─────────────────────────────────────────────

export default CareersDashboard;