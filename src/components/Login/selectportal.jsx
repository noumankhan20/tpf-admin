'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, TrendingUp, FileText, ArrowRight } from 'lucide-react';

export default function SelectPanel() {
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handlePanelSelect = (panelType) => {
    setSelectedPanel(panelType);
  };

  const handlePanelDoubleClick = (panelType) => {
    setSelectedPanel(panelType);
    // Navigate immediately on double click
    if (panelType === 'main-admin') {
      router.push('/home?tab=dashboard');
    } else if (panelType === 'cms-admin') {
      router.push('/cmsadmin');
    }
  };

  const handleContinue = () => {
    // Navigate based on selected panel
    if (selectedPanel === 'main-admin') {
      router.push('/home?tab=dashboard');
    } else if (selectedPanel === 'cms-admin') {
      router.push('/cmsadmin');
    }
  };

  const handleLogout = () => {
    console.log('Logging out...');
    // Add your logout logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className={`relative z-10 transition-all duration-700 ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        <div className="flex items-center justify-between p-4 md:p-6">
          <div className={`flex items-center space-x-2 transition-all duration-700 delay-100 ${
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
            className={`flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-300 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-gray-700/70 border border-gray-700/50 hover:border-gray-600/50 group ${
              isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 py-8 md:py-12">
        {/* Title Section */}
        <div className={`text-center mb-12 md:mb-16 transition-all duration-700 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} style={{ transitionDelay: '300ms' }}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200">
            Select Your Dashboard
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Choose the administration panel you'd like to access
          </p>
        </div>

        {/* Panel Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-5xl mb-8">
          {/* Main Admin Panel */}
          <div
            onClick={() => handlePanelSelect('main-admin')}
            onDoubleClick={() => handlePanelDoubleClick('main-admin')}
            className={`group relative bg-gray-800/60 backdrop-blur-md border-2 rounded-2xl p-8 md:p-10 cursor-pointer transition-all duration-500 ${
              selectedPanel === 'main-admin' 
                ? 'border-emerald-500 bg-gray-800/80 shadow-xl shadow-emerald-500/20 scale-[1.02]' 
                : 'border-gray-700/50 hover:border-emerald-500/50 hover:bg-gray-800/70 hover:scale-[1.02]'
            } ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            {/* Selection Indicator */}
            {selectedPanel === 'main-admin' && (
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            <div className="text-center relative">
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 transition-all duration-300 ${
                selectedPanel === 'main-admin'
                  ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
                  : 'bg-emerald-500/90 group-hover:bg-emerald-500 group-hover:shadow-lg group-hover:shadow-emerald-500/30'
              }`}>
                <TrendingUp className={`w-10 h-10 text-white transition-transform duration-300 ${
                  selectedPanel === 'main-admin' ? 'scale-110' : 'group-hover:scale-110'
                }`} />
              </div>
              
              {/* Title */}
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-emerald-100 transition-colors duration-300">
                Main Admin Panel
              </h3>
              
              {/* Description */}
              <p className="text-gray-400 text-sm md:text-base leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                Comprehensive dashboard for managing donations, users, campaigns, and viewing detailed analytics
              </p>
            </div>
            
            {/* Glow Effect */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 transition-opacity duration-500 ${
              selectedPanel === 'main-admin' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}></div>
          </div>

          {/* CMS Admin Panel */}
          <div
            onClick={() => handlePanelSelect('cms-admin')}
            onDoubleClick={() => handlePanelDoubleClick('cms-admin')}
            className={`group relative bg-gray-800/60 backdrop-blur-md border-2 rounded-2xl p-8 md:p-10 cursor-pointer transition-all duration-500 ${
              selectedPanel === 'cms-admin' 
                ? 'border-emerald-500 bg-gray-800/80 shadow-xl shadow-emerald-500/20 scale-[1.02]' 
                : 'border-gray-700/50 hover:border-emerald-500/50 hover:bg-gray-800/70 hover:scale-[1.02]'
            } ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '500ms' }}
          >
            {/* Selection Indicator */}
            {selectedPanel === 'cms-admin' && (
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            <div className="text-center relative">
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 transition-all duration-300 ${
                selectedPanel === 'cms-admin'
                  ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
                  : 'bg-emerald-500/90 group-hover:bg-emerald-500 group-hover:shadow-lg group-hover:shadow-emerald-500/30'
              }`}>
                <FileText className={`w-10 h-10 text-white transition-transform duration-300 ${
                  selectedPanel === 'cms-admin' ? 'scale-110' : 'group-hover:scale-110'
                }`} />
              </div>
              
              {/* Title */}
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-emerald-100 transition-colors duration-300">
                CMS Admin Panel
              </h3>
              
              {/* Description */}
              <p className="text-gray-400 text-sm md:text-base leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                Content management system for editing website content, news updates, and media files
              </p>
            </div>
            
            {/* Glow Effect */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 transition-opacity duration-500 ${
              selectedPanel === 'cms-admin' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}></div>
          </div>
        </div>

        {/* Continue Button */}
        <div className={`transition-all duration-500 ${
          selectedPanel 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        }`}>
          <button
            onClick={handleContinue}
            className="group relative bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 overflow-hidden"
          >
            <span className="relative z-10 flex items-center space-x-2">
              <span className="text-lg">Continue to Dashboard</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
            
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* Helper Text */}
        {!selectedPanel && (
          <p className={`text-gray-500 text-sm mt-8 transition-all duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`} style={{ transitionDelay: '600ms' }}>
            Select a panel above to continue
          </p>
        )}
      </main>
    </div>
  );
}