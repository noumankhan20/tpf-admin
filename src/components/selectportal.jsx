'use client';

import { useState, useEffect } from 'react';
import { LogOut, TrendingUp, FileText } from 'lucide-react';

export default function SelectPanel() {
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 80);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Update time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handlePanelSelect = (panelType) => {
    setSelectedPanel(panelType);
    // Handle navigation logic here
    console.log('Selected panel:', panelType);
  };

  const handleLogout = () => {
    // Handle logout logic here
    console.log('Logging out...');
  };

  return (
    <>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse 3s ease-in-out infinite;
        }
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-400/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 md:p-6 transition-all duration-700 ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        <div className={`flex items-center space-x-2 transition-all duration-700 delay-200 ${
          isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
        }`}>
          <div className="w-28 h-12 rounded-lg flex items-center justify-center">
            <img
              src="/TPFAid-LogoDesign-20.svg"
              alt="Logo"
              className="w-28 h-12 object-contain"
            />
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className={`flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-500 bg-gray-800/50 px-3 py-2 rounded-lg hover:bg-gray-700/50 hover:scale-105 delay-300 ${
            isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
          }`}
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Logout</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center px-4 py-8 md:py-16">
        {/* Title Section */}
        <div className={`text-center mb-12 md:mb-16 transition-all duration-800 delay-500 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Select a Panel
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto leading-relaxed">
            Choose which dashboard you want to access to continue your session.
          </p>
        </div>

        {/* Panel Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-4xl">
          {/* Main Admin Panel */}
          <div
            onClick={() => handlePanelSelect('main-admin')}
            className={`group relative bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 md:p-10 cursor-pointer transition-all duration-500 hover:bg-gray-700/60 hover:border-emerald-500/50 hover:scale-[1.05] hover:shadow-2xl hover:shadow-emerald-500/10 delay-700 ${
              selectedPanel === 'main-admin' 
                ? 'ring-2 ring-emerald-500 bg-gray-700/60 scale-[1.02] shadow-lg shadow-emerald-500/20' 
                : ''
            } ${
              isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
            }`}
          >
            <div className="text-center">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-2xl mb-6 group-hover:bg-emerald-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-emerald-500/30">
                <TrendingUp className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              
              {/* Title */}
              <h3 className="text-xl md:text-2xl font-semibold text-white mb-4 group-hover:text-emerald-100 transition-colors duration-300">
                Main Admin Panel
              </h3>
              
              {/* Description */}
              <p className="text-gray-400 text-sm md:text-base leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                Manage donations, users, campaigns, and view analytics.
              </p>
            </div>
            
            {/* Hover Effect Border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
          </div>

          {/* CMS Admin Panel */}
          <div
            onClick={() => handlePanelSelect('cms-admin')}
            className={`group relative bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 md:p-10 cursor-pointer transition-all duration-500 hover:bg-gray-700/60 hover:border-emerald-500/50 hover:scale-[1.05] hover:shadow-2xl hover:shadow-emerald-500/10 delay-900 ${
              selectedPanel === 'cms-admin' 
                ? 'ring-2 ring-emerald-500 bg-gray-700/60 scale-[1.02] shadow-lg shadow-emerald-500/20' 
                : ''
            } ${
              isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
            }`}
          >
            <div className="text-center">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-2xl mb-6 group-hover:bg-emerald-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-emerald-500/30">
                <FileText className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              
              {/* Title */}
              <h3 className="text-xl md:text-2xl font-semibold text-white mb-4 group-hover:text-emerald-100 transition-colors duration-300">
                CMS Admin Panel
              </h3>
              
              {/* Description */}
              <p className="text-gray-400 text-sm md:text-base leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                Edit website content, update news, and manage media.
              </p>
            </div>
            
            {/* Hover Effect Border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
          </div>
        </div>

        {/* Continue Button */}
        {selectedPanel && (
          <div className="mt-8 md:mt-12">
            <button
              onClick={() => handlePanelSelect(selectedPanel)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.05] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900 hover:shadow-lg hover:shadow-emerald-500/25 animate-pulse-slow"
              style={{
                animation: 'fadeInUp 0.5s ease-out forwards, pulse 2s ease-in-out infinite'
              }}
            >
              Continue to Dashboard
            </button>
          </div>
        )}
      </div>
      </div>
    </>
  );
}