'use client';

import { useState } from 'react';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import {useRouter} from 'next/navigation';

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

const handleSubmit = (e) => {
  e.preventDefault();

  let userMap = {
    "superadmin@test.com": { 
      password: "admin123", 
      roles: ["superadmin"] },
    "hr@test.com": { 
      password: "hr123", 
      roles: ["hr-admin","documentation-admin","legal-admin","finance-admin"] },
    "volunteer@test.com": { 
      password: "vol123", 
      roles: ["volunteer-admin","finance-admin","hr-admin","cms-admin","legal-admin"] },
      "cms@test.com": { 
      password: "cms123",
      roles: ["cms-admin"] },
      "donor@test.com":{
        password: "donor123",
        roles: ["donor-admin","legal-admin"]
      }
  };  

  const user = userMap[formData.email];

  if (!user) {
    alert("❌ Invalid Email");
    return;
  }

  if (formData.password !== user.password) {
    alert("❌ Incorrect Password");
    return;
  }

  // Save roles for Select Portal Page
  localStorage.setItem("roles", JSON.stringify(user.roles));

  // Redirect
  router.push("/select-portal");
};


  
  const router = useRouter();
  
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-4">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/bg-video.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/85 to-emerald-900/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-8">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-2xl mb-6">
            <img
              src="/TPFAid-LogoDesign-3.svg"
              alt="Logo"
              className="w-10 h-10 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-emerald-400 text-sm">Welcome back, please enter your details.</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email or Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-emerald-400" />
              </div>
              <input
                type="text"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email or username"
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-emerald-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
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
            // onClick={() => router.push('/select-portal')}
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer"
          >
            Log In
          </button>

          {/* Forgot Password Link */}
          <div className="text-center">
            <a
              href="#"
              className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors duration-200"
            >
              Forgot Password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}