import React from 'react';
import { PlusIcon, Heart } from 'lucide-react';
import NotificationBell from '../../Common/NotificationBell';

export default function FundraisingHeader({ viewMode, onAddNew }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Heart className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Fundraising Campaigns
            </h1>
            <p className="text-gray-600 mt-1">
              Create and manage active fundraising campaigns
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell moduleFilter="CMS_TASK" />
        </div>
      </div>

      {viewMode === "view" && (
        <div className="flex justify-end">
          <button
            onClick={onAddNew}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md"
          >
            <PlusIcon size={20} />
            <span>Create Campaign</span>
          </button>
        </div>
      )}
    </div>
  );
}