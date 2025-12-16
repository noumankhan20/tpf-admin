'use client';

import { Check } from "lucide-react";

const RoleSelector = ({ roles, selectedRoles, setSelectedRoles }) => {
  const toggleRole = (role) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mt-2">
      {roles.map((role) => {
        const isActive = selectedRoles.includes(role);

        return (
          <button
            key={role}
            type="button"
            onClick={() => toggleRole(role)}
            className={`relative flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-xs sm:text-sm font-medium transition-all
              ${
                isActive
                  ? "bg-emerald-500 text-white border-emerald-600 shadow-sm"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
              }
            `}
          >
            {isActive && (
              <Check className="w-4 h-4 absolute left-2" />
            )}
            <span className={`${isActive ? "pl-3" : ""}`}>
              {role}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default RoleSelector;
