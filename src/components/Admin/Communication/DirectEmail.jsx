'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Send, 
  Search, 
  Filter, 
  Mail, 
  User, 
  Heart,
  ChevronRight, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Trash2,
  Paperclip,
  History,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const CATEGORIES = [
  { id: 'all', name: 'Normal Users', icon: Users, color: 'blue' },
  { id: 'permanent', name: 'Permanent Members', icon: CheckCircle, color: 'emerald' },
  { id: 'volunteer', name: 'Volunteers', icon: User, color: 'purple' },
  { id: 'donor', name: 'All Donors', icon: Sparkles, color: 'amber' },
  { id: 'kyc-pending', name: 'KYC Pending', icon: AlertCircle, color: 'red' },
  { id: 'major-donors', name: 'Major Donors (>₹3000)', icon: TrendingUp, color: 'rose' },
  { id: 'loyal-donors', name: 'Loyal Donors (>5 times)', icon: Heart, color: 'pink' },
  { id: 'dormant', name: 'Dormant (30+ days)', icon: History, color: 'slate' },
];

const DirectEmail = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:7000/api';

  useEffect(() => {
    fetchUsers(selectedCategory);
    setSelectedUser(null);
  }, [selectedCategory]);

  const fetchUsers = async (category) => {
    setLoadingUsers(true);
    try {
      const response = await axios.get(`${apiBase}/communication/users/${category}`, {
        withCredentials: true
      });
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedUser) {
      toast.error('Please select a recipient');
      return;
    }
    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSendingEmail(true);
    try {
      const response = await axios.post(`${apiBase}/communication/send-email`, {
        email: selectedUser.email,
        fullName: selectedUser.fullName,
        subject,
        message
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success(`Email sent to ${selectedUser.fullName || selectedUser.email}`);
        setSubject('');
        setMessage('');
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.mobileNo?.includes(searchQuery)
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar: Categories & User List */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          
          {/* Categories */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-2">
            <h3 className="px-4 py-3 text-sm font-bold text-gray-400 uppercase tracking-wider">User Groups</h3>
            <div className="grid grid-cols-2 gap-1 px-2 pb-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all ${
                      isSelected 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 ring-4 ring-blue-50' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                    <span className="text-xs font-bold text-center leading-tight">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User List */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-gray-50">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500" />
                <input
                  type="text"
                  placeholder="Search by name, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none text-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {loadingUsers ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <p className="text-sm font-medium">Crunching user data...</p>
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="space-y-1">
                  {filteredUsers.map((u) => (
                    <button
                      key={u._id}
                      onClick={() => setSelectedUser(u)}
                      className={`w-full flex items-center p-3 rounded-2xl transition-all border-2 ${
                        selectedUser?._id === u._id 
                        ? 'border-blue-600 bg-blue-50/50' 
                        : 'border-transparent hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md ${
                        selectedUser?._id === u._id ? 'bg-blue-600' : 'bg-gray-300'
                      }`}>
                        {u.fullName?.charAt(0) || <User className="w-5 h-5" />}
                      </div>
                      <div className="ml-3 text-left overflow-hidden">
                        <p className={`text-sm font-bold truncate ${selectedUser?._id === u._id ? 'text-blue-900' : 'text-gray-900'}`}>
                          {u.fullName || 'Anonymous User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2 opacity-60">
                  <Users className="w-12 h-12" />
                  <p className="text-sm font-medium">No members found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Message Composer */}
        <div className="flex-1">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden flex flex-col h-full min-h-[600px]">
            {/* Composer Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8 text-white relative">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Mail className="w-32 h-32 rotate-12" />
               </div>
               <div className="relative z-10">
                 <h2 className="text-2xl font-bold flex items-center gap-3">
                   <Mail className="w-6 h-6" />
                   Draft Correspondence
                 </h2>
                 <p className="text-blue-100 text-sm mt-1 opacity-80">Personalized communication for TPF community</p>
               </div>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {/* Recipient Display */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-200 shadow-sm">
                   {selectedUser ? (
                     <div className="text-blue-600 font-bold text-lg">
                       {selectedUser.fullName?.charAt(0) || 'U'}
                     </div>
                   ) : (
                     <User className="text-gray-400 w-6 h-6" />
                   )}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recipient</p>
                  <p className={`text-lg font-bold ${selectedUser ? 'text-gray-900' : 'text-gray-300 italic'}`}>
                    {selectedUser ? `${selectedUser.fullName || 'User'} <${selectedUser.email}>` : 'Select a user from the list...'}
                  </p>
                </div>
              </div>

              {/* Subject Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600 ml-1">Subject Line</label>
                <input
                  type="text"
                  placeholder="Enter a descriptive subject for this email..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none shadow-sm"
                />
              </div>

              {/* Message Input */}
              <div className="space-y-2 flex-1 flex flex-col">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-bold text-gray-600">Your Message</label>
                </div>
                <textarea
                  placeholder="Compose your message here..."
                  rows={8}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full flex-1 px-6 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none shadow-sm resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button 
                  onClick={() => {
                    setSubject('');
                    setMessage('');
                    setSelectedUser(null);
                  }}
                  className="px-6 py-3 text-gray-400 hover:text-red-500 font-bold text-sm flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Discard Draft
                </button>
                
                <button
                  onClick={handleSendEmail}
                  disabled={sendingEmail || !selectedUser}
                  className={`px-10 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all ${
                    sendingEmail || !selectedUser 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 text-white shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 active:scale-95'
                  }`}
                >
                  {sendingEmail ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Dispatching...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Deliver Message
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectEmail;
