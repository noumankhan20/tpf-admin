'use client';

import { useEffect, useState } from 'react';
import { Eye, EyeOff, User, Lock, AlertCircle } from 'lucide-react';
import { useLazyGetAdminMeQuery, useLoginAdminMutation } from '@/utils/slices/adminApiSlice';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import { useDispatch } from 'react-redux';


export default function AdminLogin() {
  const router = useRouter();
  const [loginAdmin, { isLoading }] = useLoginAdminMutation();

  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

   const [getAdminMe] = useLazyGetAdminMeQuery();

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const res = await getAdminMe().unwrap();
        // ✅ Cookie valid → hydrate + redirect
        dispatch(setAdminCredentials(res.admin));
        router.replace("/select-portal");
      } catch (err) {
        // ❌ 401 → stay on login (do nothing)
      }
    };

    checkExistingSession();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setError('');
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {

      const res = await loginAdmin({
        email: formData.email,
        password: formData.password
      }).unwrap();


      if (res?.admin) {
        toast.success("Salam from TPF!");
        router.push("/select-portal");
      }


    } catch (err) {
      console.log("Login failed:", err);
      const errorMessage = err?.data?.message || 'Invalid username or password';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };



  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 relative overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-100 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-200 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-50 rounded-full filter blur-3xl"></div>
      </div>

      {/* Islamic Geometric Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamic-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M50 0 L75 25 L50 50 L25 25 Z M50 50 L75 75 L50 100 L25 75 Z M0 50 L25 75 L0 100 M100 50 L75 75 L100 100 M0 0 L25 25 L0 50 M100 0 L75 25 L100 50"
                stroke="#10b981"
                strokeWidth="1"
                fill="none" />
              <circle cx="50" cy="50" r="15" stroke="#10b981" strokeWidth="1" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
        </svg>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[420px]">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-6 sm:p-8 backdrop-blur-sm">
          {/* Logo and Header */}
          <div className="text-center mb-6">
            {/* Assalamu Alaikum Greeting */}

            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl mb-4 shadow-lg shadow-emerald-500/30">
              <img
                src="/TPFAid-LogoDesign-3.svg"
                alt="Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>


            {/* Islamic Quote */}
            <div className="max-w-sm mx-auto mb-2">
              <p className="text-xs text-gray-500 italic leading-relaxed">
                "Indeed, with hardship comes ease"
              </p>
            </div>

            <p className="text-gray-600 text-sm">Please sign in to continue</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="admin@example.com"
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-sm"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  className="w-full pl-10 pr-11 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-emerald-500 transition-colors disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-md hover:shadow-lg mt-6"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Forgot Password Link */}
            <div className="text-center pt-2">
              <a
                href="#"
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors inline-flex items-center group"
              >
                Forgot your password?
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 space-y-2">
          <p className="text-xs text-gray-500 mt-2">
            © {new Date().getFullYear()} TPFAid. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}