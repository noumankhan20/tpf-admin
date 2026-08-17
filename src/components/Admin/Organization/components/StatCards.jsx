import React from 'react';

export const StatCards = React.memo(({ totalCount, stats, isOrganization, labels }) => {
    const defaultLabels = isOrganization ? {
        total: "Total records",
        pending: "Pending review",
        verified: "Verified active",
        rejected: "Action required"
    } : {
        total: "Total requests",
        pending: "Pending review",
        verified: "Approved active",
        rejected: "Action required"
    };

    const displayLabels = labels || defaultLabels;
    const verifiedValue = stats?.verified || stats?.approved || 0;
    const pendingValue = stats?.pending || 0;
    const rejectedValue = stats?.rejected || 0;

    return (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs mb-6 overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y divide-x-0 md:divide-y-0 md:divide-x divide-slate-100">
                
                {/* Total */}
                <div className="p-4 flex flex-col justify-between">
                    <span className="text-xs font-medium text-slate-500">
                        {displayLabels.total}
                    </span>
                    <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-xl font-semibold text-slate-900 tracking-tight">
                            {totalCount.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400 font-normal">All items</span>
                    </div>
                </div>

                {/* Pending */}
                <div className="p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">
                            {displayLabels.pending}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-xl font-semibold text-amber-700 tracking-tight">
                            {pendingValue.toLocaleString()}
                        </span>
                        {pendingValue > 0 && (
                            <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                                Needs review
                            </span>
                        )}
                    </div>
                </div>

                {/* Verified */}
                <div className="p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">
                            {displayLabels.verified}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-xl font-semibold text-emerald-700 tracking-tight">
                            {verifiedValue.toLocaleString()}
                        </span>
                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                            Active
                        </span>
                    </div>
                </div>

                {/* Rejected */}
                <div className="p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">
                            {displayLabels.rejected}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-xl font-semibold text-rose-700 tracking-tight">
                            {rejectedValue.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400 font-normal">Archived</span>
                    </div>
                </div>

            </div>
        </div>
    );
});

StatCards.displayName = 'StatCards';
