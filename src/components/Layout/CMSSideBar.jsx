"use client";
import React from "react";
import {
  Home, Heart, IndianRupee, Rss, Calendar,
  Users, Award, MessageSquare, Flag, FileText,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
const menuItems = [
  { id: 'hero', label: 'Hero Section', icon: Home ,path:'/cms-admin/hero-section'},
  { id: 'stories', label: 'Impact Stories', icon: Heart,path:'/cms-admin/impact-stories' },
  { id: 'fundraising', label: 'Fundraising Now', icon: IndianRupee ,path:'/cms-admin/fundraiser' },
  { id: 'feed', label: 'Tailored Feed', icon: Rss ,path:'/cms-admin/tailored-feed' },
  { id: 'giving', label: 'Start Giving Daily', icon: Calendar ,path:'/cms-admin/start-giving'},
  { id: 'communities', label: 'Communities', icon: Users ,path:'/cms-admin/communities'},
  { id: 'trusted', label: 'Trusted By', icon: Award,path:'/cms-admin/trusted-by' },
  { id: 'influencer', label: 'Influencer Section', icon: MessageSquare ,path:'/cms-admin/influencer'},
  { id: 'footer', label: 'Before Footer', icon: Flag ,path:'/cms-admin/before-footer' },
  { id: 'audit', label: 'Audit Logs', icon: FileText ,path:'/cms-admin/impact-stories'}
];

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  activeSection,
  setActiveSection
}) {
  
  const router = useRouter();
  const handleMenuClick = (item) => {
    setActiveSection(item.id);
      router.push(item.path);  
    // Auto-close sidebar on mobile after selecting an item
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* MOBILE BACKDROP - Only visible on mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:relative top-0 left-0 h-full z-50 
          bg-[#0F172A] text-white transition-all duration-300 ease-in-out
          flex-shrink-0
          ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-64'}
          overflow-hidden  /* Prevent horizontal scrolling */
        `}
        aria-label="Sidebar navigation"
      >
        <div className="p-4 md:p-6 h-full flex flex-col overflow-hidden">

          {/* HEADER SECTION */}
          <div className="flex items-center justify-between mb-6 md:mb-8 flex-shrink-0">
            
            {/* Logo Area */}
            <div className={`flex items-center gap-3 transition-all duration-300 ${
              !sidebarOpen && 'md:justify-center md:w-full'
            }`}>
              <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              
              {/* Title - Hidden when collapsed on desktop, visible on mobile when open */}
              <span className={`font-bold text-lg text-[#F1F5F9] whitespace-nowrap transition-opacity duration-300 ${
                sidebarOpen ? 'opacity-100' : 'opacity-0 md:opacity-100'
              }`}>
                CMS Admin Panel 
              </span>
            </div>

            {/* Mobile Close Button - Only visible on mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Desktop Collapse/Expand Toggle - Only visible on desktop */}
          {/* Removed the toggle for simplicity as sidebar will always be expanded on desktop */}
          
          {/* Section Label - Only visible when sidebar is open */}
          {sidebarOpen && (
            <p className="text-[#94A3B8] text-xs uppercase tracking-wider mb-4 px-2 flex-shrink-0">
              Website Sections
            </p>
          )}

          {/* Navigation Menu */}
          <nav 
            className="space-y-1 flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar"
            aria-label="Main navigation"
          >
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-lg 
                    transition-all duration-200 group relative
                    ${isActive
                      ? 'bg-[#1E293B] text-[#F1F5F9] font-semibold shadow-md'
                      : 'hover:bg-[#1E293B]/60 text-[#94A3B8] hover:text-[#F1F5F9]'
                    }
                    md:justify-start
                  `}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#3B82F6] rounded-r" />
                  )}
                  
                  {/* Icon */}
                  <Icon 
                    size={20} 
                    className={`flex-shrink-0 transition-colors duration-200 ${
                      isActive 
                        ? "text-[#60A5FA]" 
                        : "text-[#94A3B8] group-hover:text-[#F1F5F9]"
                    }`} 
                  />
                  
                  {/* Label Text - Always visible on desktop */}
                  <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                    {item.label}
                  </span>

                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
