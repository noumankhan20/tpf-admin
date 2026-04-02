'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Send, 
  Search, 
  Filter, 
  Mail, 
  User, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Trash2,
  Paperclip,
  History,
  Sparkles,
  TrendingUp,
  Heart,
  X
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Import ReactQuill
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

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
  const [attachments, setAttachments] = useState([]);
  const [sendingEmail, setSendingEmail] = useState(false);
  
  const fileInputRef = useRef(null);

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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
    // Reset file input value to allow same file selection
    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
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
    if (!message.trim() || message === '<p><br></p>') {
      toast.error('Please enter a message');
      return;
    }

    setSendingEmail(true);
    try {
      const formData = new FormData();
      formData.append('email', selectedUser.email);
      formData.append('fullName', selectedUser.fullName || '');
      formData.append('subject', subject);
      formData.append('message', message);
      
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await axios.post(`${apiBase}/communication/send-email`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success(`Email sent to ${selectedUser.fullName || selectedUser.email}`);
        setSubject('');
        setMessage('');
        setAttachments([]);
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

  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ],
  };

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
                    <span className="text-[10px] sm:text-xs font-bold text-center leading-tight">{cat.name}</span>
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

            <div className="p-6 md:p-8 space-y-6 flex flex-col flex-1">
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

              {/* Message Input with Quill */}
              <div className="space-y-2 flex-1 flex flex-col quill-container">
                <label className="text-sm font-bold text-gray-600 ml-1">Your Message</label>
                <div className="flex-1 min-h-[300px]">
                  <ReactQuill 
                    theme="snow"
                    value={message}
                    onChange={setMessage}
                    modules={quillModules}
                    placeholder="Compose your message here..."
                    style={{ height: 'calc(100% - 42px)' }}
                    className="h-full bg-white rounded-2xl overflow-hidden border border-gray-200"
                  />
                </div>
              </div>

              {/* Attachments Display */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Attachments</p>
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 text-sm">
                        <Paperclip className="w-3 h-3" />
                        <span className="max-w-[150px] truncate">{file.name}</span>
                        <button onClick={() => removeAttachment(idx)} className="p-0.5 hover:bg-blue-100 rounded-full transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      setSubject('');
                      setMessage('');
                      setAttachments([]);
                      setSelectedUser(null);
                    }}
                    className="p-3 text-gray-400 hover:text-red-500 transition-colors"
                    title="Discard Draft"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Attach Files"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input 
                    type="file" 
                    multiple 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </div>
                
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

      <style jsx global>{`
        .quill-container .ql-toolbar {
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
          border-color: #e5e7eb;
          background-color: #f9fafb;
        }
        .quill-container .ql-container {
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 12px;
          border-color: #e5e7eb;
          font-family: inherit;
        }
        .quill-container .ql-editor {
          font-size: 1rem;
          line-height: 1.6;
        }
        .quill-container .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
      `}</style>
    </div>
  );
};

export default DirectEmail;
