import { useState } from "react";
import { X, Eye, EyeOff, User, Mail, Lock, Phone, Shield, CheckCircle2 } from "lucide-react";

const AddAdminModal = ({ isOpen, onClose, onSubmit }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    contact: "",
    modules: [],
    isSuperAdmin: false,
  });

  if (!isOpen) return null;

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

  const isFormValid =
    formData.fullname.trim() &&
    formData.email.trim() &&
    formData.password.trim() &&
    formData.contact.trim() &&
    (formData.isSuperAdmin || formData.modules.length > 0);

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

  const handleModuleChange = (module) => {
    setFormData((prevFormData) => {
      const updatedModules = prevFormData.modules.includes(module)
        ? prevFormData.modules.filter((m) => m !== module)
        : [...prevFormData.modules, module];
      return { ...prevFormData, modules: updatedModules };
    });
  };

  const toggleAllModules = () => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.length === availableModules.length ? [] : [...availableModules]
    }));
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Create New Admin
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Set up a new administrator account
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className={`relative transition-all duration-200 ${focusedField === 'fullname' ? 'scale-[1.01]' : ''}`}>
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.fullname}
                    onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                    onFocus={() => setFocusedField('fullname')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className={`relative transition-all duration-200 ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className={`relative transition-all duration-200 ${focusedField === 'password' ? 'scale-[1.01]' : ''}`}>
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <div className={`relative transition-all duration-200 ${focusedField === 'contact' ? 'scale-[1.01]' : ''}`}>
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    onFocus={() => setFocusedField('contact')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SuperAdmin Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Administrator Level
            </h3>
            <div className={`p-4 border-2 rounded-xl transition-all duration-200 ${
              formData.isSuperAdmin 
                ? 'border-purple-300 bg-purple-50' 
                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
            }`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={formData.isSuperAdmin}
                    onChange={(e) => setFormData({ ...formData, isSuperAdmin: e.target.checked })}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-gray-900">SuperAdmin Access</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Grant full system access with all privileges and module permissions
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Modules Section */}
          {!formData.isSuperAdmin && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Module Access <span className="text-red-500">*</span>
                </h3>
                <button
                  type="button"
                  onClick={toggleAllModules}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  {formData.modules.length === availableModules.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto p-1">
                {availableModules.map((module) => {
                  const isSelected = formData.modules.includes(module);
                  return (
                    <label
                      key={module}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleModuleChange(module)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                        {isSelected && (
                          <CheckCircle2 className="absolute w-4 h-4 text-blue-600 pointer-events-none" />
                        )}
                      </div>
                      <span className={`text-sm flex-1 transition-colors ${
                        isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'
                      }`}>
                        {module}
                      </span>
                    </label>
                  );
                })}
              </div>
              
              {formData.modules.length > 0 && (
                <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <span className="font-medium text-blue-700">{formData.modules.length}</span> module{formData.modules.length !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-gray-200 flex-shrink-0 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 border-2 border-gray-300 rounded-xl py-3 px-4 text-base text-gray-700 font-medium hover:bg-white hover:border-gray-400 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              disabled={!isFormValid}
              onClick={handleSubmit}
              className={`flex-1 rounded-xl py-3 px-4 text-base font-medium transition-all duration-200 ${
                isFormValid
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.98]"
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