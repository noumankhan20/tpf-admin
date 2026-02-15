"use client";

import { useState } from "react";

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────

const MOCK_JOBS = [
  {
    id: 1,
    title: "Graphic Designer",
    department: "Creative",
    location: "Remote",
    type: "Full-time",
    experience: "2–4 years",
    salary: "$40,000 – $55,000",
    postedDate: "2025-01-10",
    status: "Active",
    applicants: 14,
    description:
      "We are looking for a talented Graphic Designer to join our creative team and help communicate our mission visually.",
    responsibilities:
      "Design print and digital materials\nMaintain brand consistency\nCollaborate with program teams\nCreate social media graphics",
    requirements:
      "Proficiency in Adobe Creative Suite\nStrong portfolio\nExcellent communication skills\nPassion for social impact",
  },
  {
    id: 2,
    title: "Social Media Manager",
    department: "Communications",
    location: "Hybrid – New York, NY",
    type: "Full-time",
    experience: "3–5 years",
    salary: "$50,000 – $65,000",
    postedDate: "2025-01-15",
    status: "Active",
    applicants: 22,
    description:
      "Drive our digital storytelling and engage communities across all social platforms.",
    responsibilities:
      "Manage all social media accounts\nCreate engaging content calendars\nAnalyze performance metrics\nCoordinate with design team",
    requirements:
      "Experience with social media management tools\nExcellent copywriting skills\nData-driven mindset\nNGO experience preferred",
  },
  {
    id: 3,
    title: "Program Coordinator",
    department: "Programs",
    location: "On-site – Chicago, IL",
    type: "Full-time",
    experience: "1–3 years",
    salary: "$38,000 – $48,000",
    postedDate: "2024-12-20",
    status: "Closed",
    applicants: 38,
    description:
      "Support program implementation and ensure effective delivery of community initiatives.",
    responsibilities:
      "Coordinate program activities\nMaintain participant records\nLiaise with community partners\nPrepare progress reports",
    requirements:
      "Bachelor's degree in related field\nStrong organizational skills\nExperience in community work\nBilingual (English/Spanish) preferred",
  },
  {
    id: 4,
    title: "Grant Writer",
    department: "Development",
    location: "Remote",
    type: "Part-time",
    experience: "4–6 years",
    salary: "$30/hr – $40/hr",
    postedDate: "2025-02-01",
    status: "Active",
    applicants: 9,
    description:
      "Research and write compelling grant proposals to secure funding for our programs.",
    responsibilities:
      "Identify funding opportunities\nWrite and submit grant applications\nManage grant reporting deadlines\nBuild relationships with funders",
    requirements:
      "Proven grant writing track record\nExcellent research skills\nAttention to detail\nKnowledge of nonprofit funding landscape",
  },
  {
    id: 5,
    title: "Volunteer Manager",
    department: "Operations",
    location: "On-site – Los Angeles, CA",
    type: "Full-time",
    experience: "2–4 years",
    salary: "$42,000 – $52,000",
    postedDate: "2025-01-28",
    status: "Active",
    applicants: 17,
    description:
      "Recruit, train, and coordinate our volunteer network to amplify organizational impact.",
    responsibilities:
      "Recruit and onboard volunteers\nDesign training programs\nTrack volunteer hours and impact\nOrganize appreciation events",
    requirements:
      "Experience in volunteer management\nStrong interpersonal skills\nCRM software proficiency\nEnthusiasm for community engagement",
  },
];

const MOCK_APPLICANTS = {
  1: [
    {
      id: 101,
      name: "Amara Osei",
      email: "amara.osei@email.com",
      phone: "+1 (312) 555-0192",
      appliedDate: "2025-01-18",
      resumeUrl: "#",
      coverLetter:
        "I am deeply passionate about using design as a tool for social change. With five years of experience working with nonprofits, I have honed my ability to communicate complex missions through compelling visuals. I would love to bring my skills to your team and help amplify your impact.",
      portfolio: "amara-osei.design",
      status: "Under Review",
    },
    {
      id: 102,
      name: "Jordan Mwangi",
      email: "jordan.mwangi@gmail.com",
      phone: "+1 (718) 555-0347",
      appliedDate: "2025-01-20",
      resumeUrl: "#",
      coverLetter:
        "Design has always been my language for advocacy. I believe your organization's work resonates with my personal values, and I am eager to contribute. I bring strong Adobe Suite skills and a clean, modern aesthetic that speaks to diverse audiences.",
      portfolio: "jordanmwangi.co",
      status: "Shortlisted",
    },
    {
      id: 103,
      name: "Priya Subramaniam",
      email: "p.subramaniam@designmail.com",
      phone: "+1 (415) 555-0581",
      appliedDate: "2025-01-22",
      resumeUrl: "#",
      coverLetter:
        "Your mission to create equitable communities speaks directly to my own background. I have extensive experience in print and digital design for mission-driven organizations, and I am confident I can elevate your visual communications.",
      portfolio: "priyasubramaniam.net",
      status: "New",
    },
    {
      id: 104,
      name: "Carlos Reyes",
      email: "creyes.design@email.com",
      phone: "+1 (213) 555-0734",
      appliedDate: "2025-01-25",
      resumeUrl: "#",
      coverLetter:
        "I am a bilingual designer with a passion for community-driven storytelling. I have worked with three nonprofits over the past four years and understand the unique constraints and opportunities of design in the social sector.",
      portfolio: "carlosreyes.design",
      status: "Under Review",
    },
  ],
  2: [
    {
      id: 201,
      name: "Fiona Chukwu",
      email: "fiona.chukwu@social.com",
      phone: "+1 (646) 555-0123",
      appliedDate: "2025-01-19",
      resumeUrl: "#",
      coverLetter:
        "Social media is where communities gather, and I have dedicated my career to building meaningful digital spaces. With seven years of experience managing platforms for impact organizations, I am confident I can grow your online presence authentically.",
      portfolio: "fionachukwu.com",
      status: "Shortlisted",
    },
    {
      id: 202,
      name: "Liam O'Sullivan",
      email: "liam.osullivan@media.co",
      phone: "+1 (917) 555-0456",
      appliedDate: "2025-01-21",
      resumeUrl: "#",
      coverLetter:
        "I specialize in content strategy for purpose-driven brands. My campaigns have consistently doubled engagement rates for the organizations I have served, and I am ready to bring that energy to your mission.",
      portfolio: "liamonline.co",
      status: "New",
    },
  ],
  3: [
    {
      id: 301,
      name: "Zara Ahmed",
      email: "zara.ahmed@protonmail.com",
      phone: "+1 (773) 555-0891",
      appliedDate: "2024-12-28",
      resumeUrl: "#",
      coverLetter:
        "Community coordination is my calling. I have spent three years working at the intersection of program delivery and community engagement, and I am fluent in both English and Spanish, which I believe will be a significant asset.",
      portfolio: null,
      status: "Hired",
    },
  ],
  4: [
    {
      id: 401,
      name: "Marcus Thompson",
      email: "marcus.t@grantwriters.org",
      phone: "+1 (512) 555-0234",
      appliedDate: "2025-02-05",
      resumeUrl: "#",
      coverLetter:
        "Grant writing is both an art and a science, and I have mastered both. Over the past six years I have secured over $2M in funding for nonprofit organizations across the education and health sectors.",
      portfolio: null,
      status: "Under Review",
    },
    {
      id: 402,
      name: "Naledi Dlamini",
      email: "naledi.dlamini@funddev.com",
      phone: "+1 (404) 555-0678",
      appliedDate: "2025-02-07",
      resumeUrl: "#",
      coverLetter:
        "I am a strategic grant writer with deep experience in the international development funding landscape. I thrive on building compelling narratives that connect funders to mission.",
      portfolio: null,
      status: "New",
    },
  ],
  5: [
    {
      id: 501,
      name: "Elena Vasquez",
      email: "elena.v@volunteers.org",
      phone: "+1 (323) 555-0345",
      appliedDate: "2025-02-02",
      resumeUrl: "#",
      coverLetter:
        "Managing volunteers is about creating belonging. I have built volunteer programs from the ground up at two organizations, growing active volunteer bases from under 50 to over 400 each time.",
      portfolio: null,
      status: "Shortlisted",
    },
  ],
};

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
  Active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Closed: "bg-gray-100 text-gray-500 ring-1 ring-gray-200",
  New: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  "Under Review": "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Shortlisted: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
  Hired: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Rejected: "bg-red-50 text-red-500 ring-1 ring-red-200",
};

// ─────────────────────────────────────────────
// SHARED MICRO-COMPONENTS
// ─────────────────────────────────────────────

function Badge({ status }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        STATUS_BADGE[status] || "bg-gray-100 text-gray-600"
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
// CONFIRM DELETE MODAL
// ─────────────────────────────────────────────

function ConfirmDeleteModal({ job, onConfirm, onCancel }) {
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

function JobFormModal({ job, onClose, onSave }) {
  const isEdit = !!job;
  const [form, setForm] = useState(
    job || {
      title: "",
      department: "",
      location: "",
      type: "Full-time",
      experience: "",
      salary: "",
      description: "",
      responsibilities: "",
      requirements: "",
      status: "Active",
    }
  );

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    if (!form.title || !form.department || !form.location) return;
    onSave(form);
  };

  const Field = ({ label, name, type = "text", required, children }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children || (
        <input
          type={type}
          name={name}
          value={form[name]}
          onChange={handleChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all placeholder-gray-300"
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      )}
    </div>
  );

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
                <Field label="Job Title" name="title" required />
              </div>
              <Field label="Department" name="department" required>
                <select name="department" value={form.department} onChange={handleChange}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Location" name="location" required />
              <Field label="Employment Type" name="type">
                <select name="type" value={form.type} onChange={handleChange}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all bg-white"
                >
                  {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Experience Required" name="experience" />
              <Field label="Salary Range" name="salary" />
              <Field label="Status" name="status">
                <select name="status" value={form.status} onChange={handleChange}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Closed">Closed</option>
                </select>
              </Field>
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

function ApplicantDetailModal({ applicant, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[88vh] overflow-y-auto animate-fadeIn">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
              {applicant.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{applicant.name}</h2>
              <p className="text-sm text-gray-400">Applied {new Date(applicant.appliedDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
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
              { icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", label: "Portfolio", value: applicant.portfolio || "Not provided" },
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
                <p className="text-sm font-medium text-gray-800">{applicant.name.replace(" ", "_")}_Resume.pdf</p>
                <p className="text-xs text-gray-400">PDF Document</p>
              </div>
              <a href={applicant.resumeUrl}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                View Resume
              </a>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap gap-2 justify-end">
          <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            Mark as Rejected
          </button>
          <button className="px-4 py-2 text-sm font-medium text-violet-700 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors">
            Shortlist
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors">
            Mark as Hired
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// APPLICANTS PAGE
// ─────────────────────────────────────────────

function ApplicantsPage({ job, onBack }) {
  const applicants = MOCK_APPLICANTS[job.id] || [];
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const statuses = ["All", ...new Set(applicants.map((a) => a.status))];
  const filtered = applicants.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="animate-fadeIn">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <button onClick={onBack} className="hover:text-emerald-600 transition-colors font-medium">
          Careers Management
        </button>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-600 font-medium truncate">{job.title}</span>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 font-semibold">Applicants</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <button onClick={onBack}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">{job.title}</h1>
              <Badge status={job.status} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400 pl-9">
              <span>{job.department}</span>
              <span>·</span>
              <span>{job.location}</span>
              <span>·</span>
              <span>{job.type}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{applicants.length}</p>
              <p className="text-xs text-gray-400 font-medium">Total Applicants</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applicants..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                filterStatus === s
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-emerald-300 hover:text-emerald-600"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Applicant Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <EmptyState message="No applicants match your search." />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((applicant) => (
            <div key={applicant.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all duration-200 p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Avatar + Name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {applicant.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{applicant.name}</p>
                    <p className="text-xs text-gray-400 truncate">{applicant.email}</p>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {applicant.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(applicant.appliedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <Badge status={applicant.status} />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <a href={applicant.resumeUrl}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Resume
                  </a>
                  <button onClick={() => setSelected(applicant)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    View Details
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Cover Letter Preview */}
              {applicant.coverLetter && (
                <div className="mt-3 pl-13">
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    <span className="font-semibold text-gray-500">Cover Letter: </span>
                    {applicant.coverLetter}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selected && (
        <ApplicantDetailModal applicant={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// CAREERS DASHBOARD (MAIN PAGE)
// ─────────────────────────────────────────────

export function CareersDashboard() {
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [view, setView] = useState("dashboard"); // "dashboard" | "applicants"
  const [activeJob, setActiveJob] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [deletingJob, setDeletingJob] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDept, setFilterDept] = useState("All");

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
    active: jobs.filter((j) => j.status === "Active").length,
    closed: jobs.filter((j) => j.status === "Closed").length,
    totalApplicants: jobs.reduce((sum, j) => sum + j.applicants, 0),
  };

  const handleSaveJob = (formData) => {
    if (editingJob) {
      setJobs((prev) =>
        prev.map((j) => (j.id === editingJob.id ? { ...j, ...formData } : j))
      );
      setEditingJob(null);
    } else {
      const newJob = {
        ...formData,
        id: Date.now(),
        postedDate: new Date().toISOString().split("T")[0],
        applicants: 0,
      };
      setJobs((prev) => [newJob, ...prev]);
      setShowAddModal(false);
    }
  };

  const handleDelete = () => {
    setJobs((prev) => prev.filter((j) => j.id !== deletingJob.id));
    setDeletingJob(null);
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

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Careers Management</h1>
            <p className="text-sm text-gray-400 mt-1">Manage job postings and review applicant submissions</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 active:scale-95 transition-all shadow-sm shadow-emerald-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add New Job
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Postings", value: stats.total, icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", color: "text-gray-700", bg: "bg-gray-100" },
            { label: "Active Jobs", value: stats.active, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-emerald-700", bg: "bg-emerald-50" },
            { label: "Closed Jobs", value: stats.closed, icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-gray-500", bg: "bg-gray-100" },
            { label: "Total Applicants", value: stats.totalApplicants, icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", color: "text-violet-700", bg: "bg-violet-50" },
          ].map(({ label, value, icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
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
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
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
            <div className="col-span-1">Status</div>
            <div className="col-span-1 text-center">Apps</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Table Body */}
          {filteredJobs.length === 0 ? (
            <EmptyState message="No jobs match your current filters." />
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredJobs.map((job) => (
                <div key={job.id}
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
                      {job.type.split("-")[0]}
                    </span>
                  </div>

                  {/* Posted */}
                  <div className="lg:col-span-1 flex items-center">
                    <span className="text-xs text-gray-400">
                      {new Date(job.postedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="lg:col-span-1 flex items-center">
                    <Badge status={job.status} />
                  </div>

                  {/* Applicants */}
                  <div className="lg:col-span-1 flex items-center lg:justify-center">
                    <button onClick={() => { setActiveJob(job); setView("applicants"); }}
                      className="flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                    >
                      {job.applicants}
                      <span className="text-xs font-normal text-gray-400 lg:hidden ml-1">applicants</span>
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
          onSave={(data) => { handleSaveJob(data); setShowAddModal(false); }}
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
        <ConfirmDeleteModal
          job={deletingJob}
          onConfirm={handleDelete}
          onCancel={() => setDeletingJob(null)}
        />
      )}

      {/* Animation styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.18s ease-out both; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────
// DEFAULT EXPORT (for page.jsx import convenience)
// ─────────────────────────────────────────────

export default CareersDashboard;