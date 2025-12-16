import { useState } from "react";
import { X } from "lucide-react";

const AddAdminModal = ({ isOpen, onClose, onSubmit }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    contact: "",
    modules: [],  // Modules field to hold the selected modules
    isSuperAdmin: false,
  });

  if (!isOpen) return null;

  // Define the available modules based on your backend schema enum
  const availableModules = [
    "Security & Access",
    "Social-Media",
    "TPF Management",
    "Donation Management",
    "Finance & Accounting",
    "Inventory",
    "Photography",
    "Campaign Management",
    "Document Management",
    "CMS-Admin",
    "Legal and Compliance",
    "Financial Aid",
    "KYC Verification"
  ];

  // Update form validity logic
  const isFormValid =
    formData.fullname &&
    formData.email &&
    formData.password &&
    (formData.isSuperAdmin || formData.modules.length > 0);  // This makes it valid if SuperAdmin is checked

  const handleSubmit = () => {
    if (!isFormValid) return;
    console.log(formData);
    onSubmit(formData);
    setFormData({
      fullname: "",
      email: "",
      password: "",
      contact: "",
      modules: [],
      isSuperAdmin: false,
    });
  };

  // Handle module selection
  const handleModuleChange = (module) => {
    setFormData((prevFormData) => {
      const updatedModules = prevFormData.modules.includes(module)
        ? prevFormData.modules.filter((m) => m !== module) // Uncheck if already selected
        : [...prevFormData.modules, module]; // Add module if not selected
      return { ...prevFormData, modules: updatedModules };
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
            Create New Admin
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 sm:p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* Fullname Input */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.fullname}
              onChange={(e) =>
                setFormData({ ...formData, fullname: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-2 text-gray-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Contact Input */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.contact}
              onChange={(e) =>
                setFormData({ ...formData, contact: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          {/* Modules Selection */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Select Modules <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {availableModules.map((module) => (
                <div key={module} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.modules.includes(module)}
                    onChange={() => handleModuleChange(module)}
                    className="w-5 h-5 text-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-500">{module}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SuperAdmin toggle */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Make SuperAdmin <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={formData.isSuperAdmin}
                onChange={(e) =>
                  setFormData({ ...formData, isSuperAdmin: e.target.checked })
                }
                className="w-5 h-5 text-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-500">
                Grant SuperAdmin privileges to this user
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 pt-3 sm:pt-4 border-t border-gray-100 flex-shrink-0">
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="flex-1 border-2 border-gray-300 rounded-lg sm:rounded-xl py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              Cancel
            </button>
            <button
              disabled={!isFormValid}
              onClick={handleSubmit}
              className={`flex-1 rounded-lg sm:rounded-xl py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base font-medium transition-all ${
                isFormValid
                  ? "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Create Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAdminModal;
