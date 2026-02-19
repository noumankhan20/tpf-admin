import React from 'react';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

export const StatCards = React.memo(({ totalCount, stats, isOrganization, labels, colors }) => {
    const defaultLabels = isOrganization ? {
        total: "Total Registrations",
        pending: "Pending Verification",
        verified: "Verified Organizations",
        rejected: "Rejected Applications"
    } : {
        total: "Total Campaign Requests",
        pending: "Pending Approval",
        verified: "Approved Campaigns",
        rejected: "Rejected/Clarification"
    };

    const displayLabels = labels || defaultLabels;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <span className="text-2xl font-bold text-gray-800">{totalCount}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-600">{displayLabels.total}</h3>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <Clock className="w-8 h-8 text-orange-600" />
                    <span className="text-2xl font-bold text-orange-600">{stats?.pending || 0}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-600">{displayLabels.pending}</h3>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">{stats?.verified || stats?.approved || 0}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-600">{displayLabels.verified}</h3>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <XCircle className="w-8 h-8 text-red-600" />
                    <span className="text-2xl font-bold text-red-600">{stats?.rejected || 0}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-600">{displayLabels.rejected}</h3>
            </div>
        </div>
    );
});

StatCards.displayName = 'StatCards';
