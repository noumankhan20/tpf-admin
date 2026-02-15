"use client";

import { useState } from "react";
import { ApplicantDetailModal } from "./JobModals";

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────

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
      status: "Pending",
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
      status: "Pending",
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
      status: "Pending",
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
      status: "Pending",
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
      status: "Pending",
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
      status: "Pending",
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
      status: "Pending",
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
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        STATUS_BADGE[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
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
// APPLICANTS PAGE
// ─────────────────────────────────────────────

export function ApplicantsPage({ job, onBack }) {
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
                <svg className="w-4 h-4 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Styles */}
      <style>{`
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

export default ApplicantsPage;