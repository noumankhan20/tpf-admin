"use client";
import React from "react";
import {
  Home, Heart, DollarSign, Rss, Calendar,
  Users, Award, MessageSquare, Flag, FileText
} from "lucide-react";

const menuItems = [
  { id: 'hero', label: 'Hero Section', icon: Home },
  { id: 'stories', label: 'Impact Stories', icon: Heart },
  { id: 'fundraising', label: 'Fundraising Now', icon: DollarSign },
  { id: 'feed', label: 'Tailored Feed', icon: Rss },
  { id: 'giving', label: 'Start Giving Daily', icon: Calendar },
  { id: 'communities', label: 'Communities', icon: Users },
  { id: 'trusted', label: 'Trusted By', icon: Award },
  { id: 'influencer', label: 'Influencer Section', icon: MessageSquare },
  { id: 'footer', label: 'Before Footer', icon: Flag },
  { id: 'audit', label: 'Audit Logs', icon: FileText }
];

export default function Sidebar({ sidebarOpen, activeSection, setActiveSection }) {
  return (
    <aside className={`${sidebarOpen ? 'w-64' : 'w-0 md:w-20'} bg-[#0F172A] text-white transition-all duration-300 flex-shrink-0 overflow-hidden`}>
      <div className="p-6">
        
        {/* Logo */}
        <div className={`flex items-center gap-3 mb-8 ${!sidebarOpen && 'md:justify-center'}`}>
          <div className="w-8 h-8 bg-[#1E293B] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          {sidebarOpen && <span className="font-bold text-lg text-[#F1F5F9]">Content Studio</span>}
        </div>

        {sidebarOpen && (
          <p className="text-[#94A3B8] text-xs uppercase tracking-wider mb-4">
            Website Sections
          </p>
        )}

        {/* Menu Items */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-[#1E293B] border-l-4 border-[#3B82F6] text-[#F1F5F9] font-semibold' 
                    : 'hover:bg-[#1E293B]/60 border-l-4 border-transparent text-[#94A3B8]'
                } ${!sidebarOpen && 'md:justify-center md:px-2'}`}
              >
                <Icon size={20} className={isActive ? 'text-[#60A5FA]' : 'text-[#94A3B8]'} />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
