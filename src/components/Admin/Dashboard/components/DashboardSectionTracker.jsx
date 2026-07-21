"use client";

import React, { useState, useEffect } from "react";

const SECTIONS = [
  { id: "section-attention", label: "Attention Required" },
  { id: "section-platform", label: "Platform Overview" },
  { id: "section-donations", label: "Donation Analytics" },
  { id: "section-campaigns", label: "Campaign Overview" },
  { id: "section-people", label: "People & Directory" },
  { id: "section-referrals", label: "Referral Intelligence" },
  { id: "section-operations", label: "Operational Status" },
  { id: "section-activity", label: "Recent Activity" },
  { id: "section-heatmap", label: "Activity Heatmap" },
];

export default function DashboardSectionTracker() {
  const [activeSectionId, setActiveSectionId] = useState(SECTIONS[0].id);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 250;

      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const sectionEl = document.getElementById(SECTIONS[i].id);
        if (sectionEl) {
          const top = sectionEl.offsetTop;
          if (scrollPosition >= top) {
            setActiveSectionId(SECTIONS[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -20;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2.5 bg-white/80 backdrop-blur-md p-2 rounded-full border border-[#E2E8F0] shadow-md transition-all font-sans">
      {SECTIONS.map((sec, idx) => {
        const isActive = sec.id === activeSectionId;

        return (
          <div key={sec.id} className="relative group flex items-center">
            {/* Tooltip on Hover */}
            <div className="absolute right-full mr-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-[#0F172A] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap flex items-center gap-1.5 z-50">
              <span className="text-[#10B981]">{idx + 1}/{SECTIONS.length}</span>
              <span>{sec.label}</span>
            </div>

            {/* Minimal Circle Dot */}
            <button
              onClick={() => scrollToSection(sec.id)}
              className={`rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center ${
                isActive
                  ? "w-4 h-4 bg-[#0F172A] ring-2 ring-[#10B981] ring-offset-1 scale-110 shadow-xs"
                  : "w-2.5 h-2.5 bg-[#CBD5E1] hover:bg-[#64748B] hover:scale-125"
              }`}
              title={`${idx + 1}/${SECTIONS.length}: ${sec.label}`}
            >
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />}
            </button>
          </div>
        );
      })}
    </div>
  );
}
