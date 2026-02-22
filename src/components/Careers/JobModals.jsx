"use client";

import { useState } from "react";
import { useUpdateApplicationStatusMutation } from "@/utils/slices/jobApiSlice";
// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const DEPARTMENTS = [
    "Creative",
    "Communications",
    "Programs",
    "Development",
    "Operations",
    "Finance",
    "Human Resources",
    "Technology",
];

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Volunteer"];

const STATUS_BADGE = {
    New: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    "Under Review": "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    Shortlisted: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
};

// ─────────────────────────────────────────────
// UTILITY COMPONENTS
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// CONFIRM DELETE MODAL
// ─────────────────────────────────────────────

export function ConfirmDeleteModal({ job, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fadeIn">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                            />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Delete Job Posting</h3>
                        <p className="text-sm text-gray-500 mt-0.5">This action cannot be undone.</p>
                    </div>
                </div>
                <p className="text-sm text-gray-600 mb-6 pl-14">
                    Are you sure you want to delete <span className="font-medium text-gray-900">"{job?.title}"</span>?
                    All associated applicant data will also be removed.
                </p>
                <div className="flex gap-3 justify-end">
                    <button onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Delete Job
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// ADD / EDIT JOB MODAL
// ─────────────────────────────────────────────
function Field({
    label,
    name,
    type = "text",
    required,
    value,
    onChange,
    children
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {label} {required && <span className="text-red-400">*</span>}
            </label>

            {children || (
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all placeholder-gray-300"
                    placeholder={`Enter ${label.toLowerCase()}`}
                />
            )}
        </div>
    );
}
export function JobFormModal({ job, onClose, onSave }) {
    const isEdit = !!job;
    const [form, setForm] = useState(() => {
        if (job) {
            return {
                title: job.title || "",
                department: job.department || "",
                location: job.location || "",
                employmentType: job.employmentType || "Full-time",
                experience: job.experience || "",
                salary: job.salary || "",
                description: job.description || "",
                responsibilities: Array.isArray(job.responsibilities)
                    ? job.responsibilities.join("\n")
                    : job.responsibilities || "",
                requirements: Array.isArray(job.requirements)
                    ? job.requirements.join("\n")
                    : job.requirements || "",
            };
        }
        return {
            title: "",
            department: "",
            location: "",
            employmentType: "Full-time",
            experience: "",
            salary: "",
            description: "",
            responsibilities: "",
            requirements: "",
        };
    });

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {
        if (!form.title || !form.department || !form.location) return;
        onSave(form);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto animate-fadeIn">
                {/* Header */}
                <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {isEdit ? "Edit Job Posting" : "Add New Job Posting"}
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {isEdit ? "Update the details below" : "Fill in the details to create a new opportunity"}
                        </p>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Section: Basic Info */}
                    <div>
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4">
                            Basic Information
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <Field
                                    label="Job Title"
                                    name="title"
                                    required
                                    value={form.title}
                                    onChange={handleChange}
                                />
                            </div>
                            <Field label="Department" name="department" required>
                                <select name="department" value={form.department} onChange={handleChange}
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all bg-white"
                                >
                                    <option value="">Select department</option>
                                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </Field>
                            <Field label="Location"
                                name="location"
                                required
                                value={form.location}
                                onChange={handleChange}

                            />
                            <Field label="Employment Type" name="employmentType">
                                <select name="employmentType" value={form.employmentType} onChange={handleChange}
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all bg-white"
                                >
                                    {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </Field>
                            <Field label="Experience Required" name="experience"
                                value={form.experience}
                                onChange={handleChange}
                            />
                            <Field label="Salary Range" name="salary"
                                value={form.salary}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100" />

                    {/* Section: Details */}
                    <div>
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4">
                            Job Details
                        </p>
                        <div className="space-y-4">
                            <Field label="Job Description" name="description">
                                <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                                    placeholder="Provide an overview of the role and its purpose..."
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all resize-none"
                                />
                            </Field>
                            <Field label="Responsibilities" name="responsibilities">
                                <textarea name="responsibilities" value={form.responsibilities} onChange={handleChange} rows={4}
                                    placeholder="List key responsibilities, one per line..."
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all resize-none"
                                />
                            </Field>
                            <Field label="Requirements" name="requirements">
                                <textarea name="requirements" value={form.requirements} onChange={handleChange} rows={4}
                                    placeholder="List qualifications and requirements, one per line..."
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all resize-none"
                                />
                            </Field>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between gap-3">
                    <p className="text-xs text-gray-400">
                        <span className="text-red-400">*</span> Required fields
                    </p>
                    <div className="flex gap-3">
                        <button onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button onClick={handleSubmit}
                            className="px-5 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 active:scale-95 transition-all shadow-sm shadow-emerald-200"
                        >
                            {isEdit ? "Save Changes" : "Post Job"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// APPLICANT DETAIL MODAL
// ─────────────────────────────────────────────


export function ApplicantDetailModal({ applicant, onClose, onUpdated }) {
    const [updateStatus, { isLoading }] = useUpdateApplicationStatusMutation();
    const handleShortlist = async () => {
        try {
            await updateStatus({
                id: applicant._id,
                status: "Shortlisted",
            }).unwrap();
            if (onUpdated) onUpdated();
            // Optional: close modal or refresh
            onClose();
        } catch (err) {
            console.error(err);
        }
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[88vh] overflow-y-auto animate-fadeIn">
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                            {(applicant.fullName || applicant.name || "A").charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">{applicant.fullName || applicant.name}</h2>
                            <p className="text-sm text-gray-400">Applied {new Date(applicant.createdAt || applicant.appliedDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge status={applicant.status} />
                        <button onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Contact Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", label: "Email", value: applicant.email },
                            { icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z", label: "Phone", value: applicant.phone },
                        ].map(({ icon, label, value }) => (
                            <div key={label} className="bg-gray-50 rounded-xl p-3.5">
                                <div className="flex items-center gap-2 mb-1">
                                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                                    </svg>
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
                                </div>
                                <p className="text-sm font-medium text-gray-800 break-all">{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Cover Letter */}
                    <div>
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">Cover Letter</p>
                        <div className="bg-gray-50 rounded-xl p-4 border-l-2 border-emerald-400">
                            <p className="text-sm text-gray-700 leading-relaxed">{applicant.coverLetter}</p>
                        </div>
                    </div>

                    {/* Resume */}
                    <div>
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">Resume</p>
                        <div className="flex items-center gap-3 p-4 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800">
                                    {applicant.resumeKey
                                        ? applicant.resumeKey.split("/").pop()
                                        : `${(applicant.fullName || applicant.name || "Applicant").replace(/ /g, "_")}_Resume.pdf`}
                                </p>
                                <p className="text-xs text-gray-400">PDF Document</p>
                            </div>
                            <button
                                onClick={() => {
                                    if (applicant.resumeUrl) {
                                        window.open(applicant.resumeUrl, '_blank');
                                    }
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                View Resume
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap gap-2 justify-end">
                    <button
                        onClick={handleShortlist}
                        disabled={isLoading || applicant.status === "Shortlisted"}
                        className={`
      relative inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold
      transition-all duration-200 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
      ${applicant.status === "Shortlisted"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed"
                                : isLoading
                                    ? "bg-emerald-500 text-white cursor-wait opacity-80"
                                    : "bg-emerald-500 text-white border border-emerald-500 hover:bg-emerald-600 hover:border-emerald-600 active:scale-[0.97] shadow-sm hover:shadow-md"
                            }
    `}
                    >
                        {applicant.status === "Shortlisted" ? (
                            <>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 14 3.293 8.879a1 1 0 011.414-1.414L8.414 11.172l6.879-6.879a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Shortlisted
                            </>
                        ) : isLoading ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                </svg>
                                Updating...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                Shortlist
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}