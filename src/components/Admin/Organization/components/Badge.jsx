import React from 'react';

export const Badge = ({ status, size = 'normal' }) => {
    const styles = {
        verified: 'bg-green-100 text-green-700 border-green-200',
        approved: 'bg-green-100 text-green-700 border-green-200',
        active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        rejected: 'bg-red-100 text-red-700 border-red-200',
        pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };
    const style = styles[status] || 'bg-gray-100 text-gray-600 border-gray-200';

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase ${style} ${size === 'large' ? 'px-4 py-1.5 text-sm' : ''}`}>
            {status}
        </span>
    );
};
