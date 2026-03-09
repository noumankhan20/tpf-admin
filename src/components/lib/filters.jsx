"use client";

const DONATION_TYPES = ["Zakaat", "Sadaqah", "Lillah", "Imdad", "Riba"];

export default function FilterModal({ filters, setFilters, onApply, onClose }) {
  const handleClear = () => {
    setFilters({ startDate: "", endDate: "", minAmount: "", maxAmount: "", donationType: "" });
    onApply();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl"
        style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div style={{ width: 32, height: 3, borderRadius: 2, background: "#e2e8f0" }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <h2 style={{ fontSize: 17, fontWeight: 600, color: "#0f172a", letterSpacing: "-0.2px" }}>
            Filter donations
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: "50%", border: "none",
              background: "#f1f5f9", color: "#64748b", cursor: "pointer",
              fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >✕</button>
        </div>

        <div style={{ height: 1, background: "#f1f5f9", margin: "0 20px" }} />

        {/* Body */}
        <div className="px-5 py-4" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Date Range */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.8px", color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>
              Date range
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { key: "startDate", label: "From" },
                { key: "endDate", label: "To" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 4 }}>{label}</label>
                  <input
                    type="date"
                    value={filters[key]}
                    onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      border: "1.5px solid #e2e8f0", borderRadius: 10,
                      padding: "9px 11px", fontSize: 13, color: "#0f172a",
                      background: "#fff", outline: "none", fontFamily: "inherit"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#10b981"}
                    onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Amount Range */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.8px", color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>
              Amount range
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { key: "minAmount", label: "Min", placeholder: "₹ 0" },
                { key: "maxAmount", label: "Max", placeholder: "₹ 10,000" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 4 }}>{label}</label>
                  <input
                    type="number"
                    placeholder={placeholder}
                    value={filters[key]}
                    onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      border: "1.5px solid #e2e8f0", borderRadius: 10,
                      padding: "9px 11px", fontSize: 13, color: "#0f172a",
                      background: "#fff", outline: "none", fontFamily: "inherit"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#10b981"}
                    onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Donation Type */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.8px", color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>
              Donation type
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["All", ...DONATION_TYPES].map((type) => {
                const value = type === "All" ? "" : type.toUpperCase();
                const isActive = filters.donationType === value;
                return (
                  <button
                    key={type}
                    onClick={() => setFilters({ ...filters, donationType: value })}
                    style={{
                      padding: "6px 14px", borderRadius: 99, fontSize: 13, fontWeight: 500,
                      cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
                      border: isActive ? "1.5px solid #10b981" : "1.5px solid #e2e8f0",
                      background: isActive ? "#f0fdf4" : "#fff",
                      color: isActive ? "#059669" : "#475569",
                    }}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid #f1f5f9", padding: "14px 20px 20px", display: "flex", gap: 8 }}>
          <button
            onClick={handleClear}
            style={{
              flex: 1, padding: "11px", borderRadius: 10, fontSize: 14, fontWeight: 500,
              border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b",
              cursor: "pointer", fontFamily: "inherit"
            }}
          >
            Clear
          </button>
          <button
            onClick={onApply}
            style={{
              flex: 2, padding: "11px", borderRadius: 10, fontSize: 14, fontWeight: 500,
              border: "none", background: "#10b981", color: "#fff",
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 2px 12px rgba(16,185,129,0.3)"
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}