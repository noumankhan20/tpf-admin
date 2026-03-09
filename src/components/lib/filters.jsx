"use client";

export default function FilterModal({
  filters,
  setFilters,
  onApply,
  onClose,
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-lg p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Filters</h2>

        <div className="space-y-4">
          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          {/* Amount Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">Min Amount</label>
              <input
                type="number"
                placeholder="₹0"
                value={filters.minAmount}
                onChange={(e) =>
                  setFilters({ ...filters, minAmount: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Max Amount</label>
              <input
                type="number"
                placeholder="₹10000"
                value={filters.maxAmount}
                onChange={(e) =>
                  setFilters({ ...filters, maxAmount: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Donation Type
          </label>

          <select
            value={filters.donationType}
            onChange={(e) =>
              setFilters({ ...filters, donationType: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">All Types</option>
            <option value="ZAKAT">Zakat</option>
            <option value="SADAQAH">Sadaqah</option>
            <option value="LILLAH">LILLAH</option>
            <option value="IMDAD">IMDAD</option>
            <option value="RIBA">RIBA</option>
          </select>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={() => {
              const cleared = {
                startDate: "",
                endDate: "",
                minAmount: "",
                maxAmount: "",
                donationType: "",
              };

              setFilters(cleared);
              onApply();   // instantly refresh
            }}
            className="px-4 py-2 border rounded-lg text-gray-700"
          >
            Clear
          </button>

          <button
            onClick={onApply}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
