"use client";

import React, { useState } from "react";
import { Calendar as CalendarIcon, ChevronDown, Check, X } from "lucide-react";
import { DATE_PRESETS } from "@/utils/dashboardUtils";

const PRESET_OPTIONS = [
  { key: DATE_PRESETS.LAST_MONTH, label: "Last Month" },
  { key: DATE_PRESETS.LAST_3_MONTHS, label: "Last 3 Months" },
  { key: DATE_PRESETS.LAST_6_MONTHS, label: "Last 6 Months" },
  { key: DATE_PRESETS.LAST_YEAR, label: "Last Year" },
  { key: DATE_PRESETS.CUSTOM, label: "Custom Date Range" },
];

export default function DashboardDateFilter({
  activePreset,
  onPresetChange,
  customStart,
  customEnd,
  onCustomDateChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [tempStart, setTempStart] = useState(customStart || "");
  const [tempEnd, setTempEnd] = useState(customEnd || "");
  const [errorMsg, setErrorMsg] = useState("");

  const activeOption = PRESET_OPTIONS.find((opt) => opt.key === activePreset) || PRESET_OPTIONS[1];

  const handleSelectPreset = (key) => {
    setIsOpen(false);
    if (key === DATE_PRESETS.CUSTOM) {
      setShowCustomModal(true);
    } else {
      onPresetChange(key);
    }
  };

  const handleApplyCustom = () => {
    if (!tempStart || !tempEnd) {
      setErrorMsg("Please select both start date and end date.");
      return;
    }
    const start = new Date(tempStart);
    const end = new Date(tempEnd);
    if (start > end) {
      setErrorMsg("Start date must be before or equal to end date.");
      return;
    }
    setErrorMsg("");
    setShowCustomModal(false);
    onCustomDateChange(tempStart, tempEnd);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#0F172A] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20"
      >
        <CalendarIcon size={14} className="text-[#10B981]" />
        <span>{activeOption.label}</span>
        <ChevronDown size={14} className="text-[#64748B] ml-1" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-[#E2E8F0] py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
          {PRESET_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => handleSelectPreset(opt.key)}
              className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-colors ${
                activePreset === opt.key
                  ? "bg-[#E6F4EA] text-[#137333] font-bold"
                  : "text-[#334155] hover:bg-[#F8FAFC]"
              }`}
            >
              <span>{opt.label}</span>
              {activePreset === opt.key && <Check size={14} className="text-[#10B981]" />}
            </button>
          ))}
        </div>
      )}

      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4 border-b border-[#F1F5F9] pb-3">
              <h3 className="text-sm font-bold text-[#0F172A]">Custom Date Range</h3>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-[#94A3B8] hover:text-[#0F172A] p-1 rounded-lg hover:bg-[#F1F5F9]"
              >
                <X size={16} />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-3 text-[11px] font-semibold text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                {errorMsg}
              </div>
            )}

            <div className="flex flex-col gap-3.5">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={tempStart}
                  onChange={(e) => setTempStart(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={tempEnd}
                  onChange={(e) => setTempEnd(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#10B981]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6 pt-3 border-t border-[#F1F5F9]">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9]"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCustom}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#10B981] text-white hover:bg-[#059669] shadow-sm transition-all"
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
