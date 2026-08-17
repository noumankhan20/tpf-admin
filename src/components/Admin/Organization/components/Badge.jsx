import React from 'react';
import { toTitleCase } from '@/utils/formatters';

export const Badge = ({ status }) => {
    const statusKey = String(status || 'pending').toLowerCase();
    
    const styles = {
        verified: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60',
        approved: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60',
        active: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60',
        rejected: 'bg-rose-50/80 text-rose-700 border-rose-200/60',
        pending: 'bg-amber-50/80 text-amber-700 border-amber-200/60',
        clarification: 'bg-amber-50/80 text-amber-700 border-amber-200/60',
        clarification_requested: 'bg-amber-50/80 text-amber-700 border-amber-200/60',
    };

    const dotColors = {
        verified: 'bg-emerald-500',
        approved: 'bg-emerald-500',
        active: 'bg-emerald-500',
        rejected: 'bg-rose-500',
        pending: 'bg-amber-500',
        clarification: 'bg-amber-500',
        clarification_requested: 'bg-amber-500',
    };

    const style = styles[statusKey] || 'bg-slate-100 text-slate-600 border-slate-200';
    const dotColor = dotColors[statusKey] || 'bg-slate-400';
    const formattedLabel = toTitleCase(statusKey.replace(/_/g, ' '));

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
            <span>{formattedLabel}</span>
        </span>
    );
};
