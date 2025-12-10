'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Bell, 
  Search, 
  CheckCircle, 
  XCircle, 
  User,
  Building,
  FileText,
  MapPin,
  Briefcase,
  CreditCard,
  Globe,
  Phone,
  Mail,
  Calendar,
  Users
} from 'lucide-react';
import { useGetAllFormsQuery, useUpdateFormStatusMutation } from '@/utils/slices/financialAidApiSlice';

export default function FinancialAidVerifyPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('myself'); // 'myself' or 'organization'
  const [selectedForm, setSelectedForm] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Fetch logic with type filtering
  const { data: formsData, isLoading, isError } = useGetAllFormsQuery({ 
    type: activeTab === 'organization' ? 'organization' : 'myself' 
  });
  
  const [updateStatus, { isLoading: isUpdating }] = useUpdateFormStatusMutation();

  const handleApprove = async (id) => {
    try {
      await updateStatus({ id, status: 'approved' }).unwrap();
      setSelectedForm(null); 
    } catch (err) {
      console.error("Failed to approve:", err);
      alert("Failed to approve form");
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) return alert("Please provide a rejection reason.");
    try {
      await updateStatus({ id, status: 'rejected', remarks: rejectReason }).unwrap();
      setIsRejecting(false);
      setRejectReason('');
      setSelectedForm(null);
    } catch (err) {
      console.error("Failed to reject:", err);
      alert("Failed to reject form");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700 shrink-0">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => router.push('/select-portal')} 
            className="p-2 hover:bg-gray-700 rounded-full transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </button>
          <h1 className="text-xl font-bold text-emerald-400">Verify Financial Aid Forms</h1>
        </div>
        <button className="p-2 hover:bg-gray-700 rounded-full transition relative">
          <Bell className="w-5 h-5 text-gray-300" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full overflow-hidden flex flex-col">
        
        {/* Tabs */}
        <div className="flex space-x-6 border-b border-gray-700 mb-6 shrink-0">
          <button
            onClick={() => { setActiveTab('myself'); setSelectedForm(null); }}
            className={`pb-3 px-2 text-sm font-medium transition-colors relative ${
              activeTab === 'myself' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Myself or Other
          </button>
          <button
            onClick={() => { setActiveTab('organization'); setSelectedForm(null); }}
            className={`pb-3 px-2 text-sm font-medium transition-colors relative ${
              activeTab === 'organization' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Organization
          </button>
        </div>

        {/* Content Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          
          {/* LEFT: List Column */}
          <div className="lg:col-span-4 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col shadow-xl">
            <div className="p-4 border-b border-gray-700 bg-gray-800/50">
              <h2 className="text-lg font-semibold mb-3">Submitted Forms</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search by name..." 
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>
            
            <div className="overflow-y-auto flex-1 p-3 space-y-2 custom-scrollbar">
              {isLoading && <p className="text-center text-gray-400 p-8">Loading applications...</p>}
              
              {!isLoading && formsData?.data?.map((form) => (
                <div 
                  key={form._id}
                  onClick={() => { setSelectedForm(form); setIsRejecting(false); }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all group ${
                    selectedForm?._id === form._id 
                      ? 'bg-emerald-900/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                      : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`font-semibold text-lg truncate ${selectedForm?._id === form._id ? 'text-emerald-400' : 'text-white'}`}>
                      {form.fullName || form.organizationName}
                    </span>
                    <Badge status={form.status} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                    <Mail size={12}/> {form.email}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar size={12}/> {new Date(form.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              
              {!isLoading && formsData?.data?.length === 0 && (
                <div className="text-center text-gray-500 p-8 flex flex-col items-center">
                  <FileText className="w-12 h-12 mb-2 opacity-20" />
                  <p>No forms found.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Details Column */}
          <div className="lg:col-span-8 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col relative shadow-xl">
            {selectedForm ? (
              <div className="flex flex-col h-full">
                {/* Detail Header */}
                <div className="p-6 border-b border-gray-700 bg-gray-800/80 backdrop-blur-sm z-10 sticky top-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">{selectedForm.fullName || selectedForm.organizationName}</h2>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="px-3 py-1 bg-gray-700 rounded-full flex items-center gap-1.5 text-gray-300">
                           {selectedForm.isOrganization ? <Building size={14} className="text-blue-400"/> : <User size={14} className="text-emerald-400"/>}
                           {selectedForm.isOrganization ? 'Organization' : 'Individual'}
                        </span>
                        <span className="text-gray-400">ID: {selectedForm._id}</span>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm text-gray-500 uppercase tracking-widest mb-1 font-semibold">Current Status</p>
                       <Badge status={selectedForm.status} size="large" />
                    </div>
                  </div>
                </div>

                {/* SCROLLABLE FORM DATA */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar pb-32">
                  
                  {/* SECTION 1: Personal / Basic Info */}
                  <DetailSection title="Basic Information" icon={<User className="text-emerald-400"/>}>
                    <Grid>
                      <Field label="Full Name" value={selectedForm.fullName} />
                      <Field label="Contact Number" value={selectedForm.contactNumber} icon={<Phone size={14}/>} />
                      <Field label="Email Address" value={selectedForm.email} icon={<Mail size={14}/>} />
                      {!selectedForm.isOrganization && (
                        <>
                          <Field label="Date of Birth" value={selectedForm.dateOfBirth} />
                          <Field label="Gender" value={selectedForm.gender} />
                          <Field label="Marital Status" value={selectedForm.maritalStatus} />
                          <Field label="Relation" value={selectedForm.relation} />
                          <Field label="Relation Name" value={selectedForm.relationName} />
                        </>
                      )}
                    </Grid>
                  </DetailSection>

                  {/* SECTION 2: Address */}
                  <DetailSection title="Address Details" icon={<MapPin className="text-emerald-400"/>}>
                     <Grid cols={1}>
                        <Field label="Current Address" value={selectedForm.currentAddress} />
                        <Field label="Permanent Address" value={selectedForm.permanentAddress} />
                        <Field label="Address Same?" value={selectedForm.sameAddress ? 'Yes' : 'No'} />
                     </Grid>
                  </DetailSection>

                  {/* SECTION 3: Organization Specifics */}
                  {selectedForm.isOrganization && (
                    <DetailSection title="Organization Details" icon={<Building className="text-blue-400"/>}>
                      <Grid>
                        <Field label="Organization Name" value={selectedForm.organizationName} />
                        <Field label="Non-Profit Type" value={selectedForm.nonProfit} />
                        <Field label="Registration Number" value={selectedForm.registrationNumber} />
                        <Field label="Website" value={selectedForm.ngoWebsite} isLink />
                        <Field label="Founder Name" value={selectedForm.founderName} />
                        <Field label="Founder Email" value={selectedForm.founderEmail} />
                        <Field label="Founder Mobile" value={selectedForm.founderMobile} />
                        <Field label="Contact Person" value={selectedForm.contactName} />
                        <Field label="Contact Email" value={selectedForm.contactEmail} />
                        <Field label="Designation" value={selectedForm.designation} />
                        <Field label="Budget" value={selectedForm.budget} />
                        <Field label="Employee Strength" value={selectedForm.employeeStrength} />
                        <Field label="Volunteer Strength" value={selectedForm.volunteerStrength} />
                        <Field label="Crowdfunded Before?" value={selectedForm.crowdfundedBefore} />
                        <div className="col-span-full">
                           <Field label="Causes Supported" value={selectedForm.causeSupported?.join(', ')} />
                        </div>
                        <div className="col-span-full">
                           <Field label="About NGO" value={selectedForm.aboutNGO} />
                        </div>
                      </Grid>
                    </DetailSection>
                  )}

                  {/* SECTION 4: Professional & Financial (Individual) */}
                  {!selectedForm.isOrganization && (
                    <DetailSection title="Professional & Financial" icon={<Briefcase className="text-emerald-400"/>}>
                       <Grid>
                          <Field label="Occupation" value={selectedForm.occupation} />
                          <Field label="Monthly Income" value={selectedForm.monthlyIncome ? `₹${selectedForm.monthlyIncome}` : 'N/A'} />
                          <Field label="Number of Dependents" value={selectedForm.numberOfDependents} />
                       </Grid>
                    </DetailSection>
                  )}

                  {/* SECTION 5: Banking Details */}
                  <DetailSection title="Banking Information" icon={<CreditCard className="text-emerald-400"/>}>
                    <Grid>
                       <Field label="Bank Name & Branch" value={selectedForm.bankNameBranch} />
                       <Field label="Account Number" value={selectedForm.accountNumber} copyable />
                       <Field label="IFSC Code" value={selectedForm.ifscCode} copyable />
                    </Grid>
                  </DetailSection>

                  {/* SECTION 6: Identity & Certifications */}
                  <DetailSection title="Identity & Certifications" icon={<FileText className="text-emerald-400"/>}>
                    <Grid>
                       {!selectedForm.isOrganization ? (
                          <>
                             <Field label="ID Type" value={selectedForm.idType} />
                             <Field label="Government ID Number" value={selectedForm.govIdNumber} />
                          </>
                       ) : (
                          <>
                             <Field label="Has 80G?" value={selectedForm.has80G} />
                             <Field label="80G Expiry" value={selectedForm.expiryDate} />
                             <Field label="Has FCRA?" value={selectedForm.hasFCRA} />
                             <Field label="PAN Card No" value={selectedForm.panCard} />
                          </>
                       )}
                    </Grid>
                  </DetailSection>

                  {/* SECTION 7: Request Details (Hardship) */}
                  <DetailSection title="Aid Request Details" icon={<Users className="text-emerald-400"/>}>
                     <Grid cols={1}>
                        <Field label="Aid Type Requested" value={selectedForm.aidType} />
                        <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-700">
                           <p className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-2">Hardship Description</p>
                           <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedForm.hardshipDescription || 'No description provided.'}</p>
                        </div>
                     </Grid>
                  </DetailSection>

                  {/* SECTION 8: Documents (Links) */}
                  <DetailSection title="Uploaded Documents" icon={<FileText className="text-emerald-400"/>}>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <DocLink label="Government ID" url={selectedForm.govIdDocumentPath} />
                        <DocLink label="Bank Statement" url={selectedForm.bankStatementPath} />
                        
                        {selectedForm.isOrganization && (
                           <>
                              <DocLink label="80G Certificate" url={selectedForm.certification80GPath} />
                              <DocLink label="PAN Card Image" url={selectedForm.panCardImagePath} />
                           </>
                        )}
                        
                        {selectedForm.supportingDocumentsPaths?.map((path, idx) => (
                           <DocLink key={idx} label={`Supporting Doc ${idx + 1}`} url={path} />
                        ))}
                     </div>
                  </DetailSection>

                </div>

                {/* Footer / Action Bar */}
                {selectedForm.status === 'pending' && (
                  <div className="border-t border-gray-700 p-6 bg-gray-800 absolute bottom-0 w-full backdrop-blur-md z-20">
                     {isRejecting ? (
                       <div className="animate-in slide-in-from-bottom-2 fade-in duration-300 bg-gray-900 border border-red-500/30 rounded-xl p-4 shadow-2xl">
                          <h4 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                             <XCircle size={16}/> Reject Application
                          </h4>
                          <textarea 
                             className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-red-500 focus:outline-none mb-3 resize-none"
                             rows="3"
                             placeholder="Enter detailed reason for rejection..."
                             value={rejectReason}
                             onChange={(e) => setRejectReason(e.target.value)}
                             autoFocus
                          />
                          <div className="flex justify-end gap-3">
                             <button 
                                onClick={() => setIsRejecting(false)}
                                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition"
                             >
                                Cancel
                             </button>
                             <button 
                                onClick={() => handleReject(selectedForm._id)}
                                disabled={isUpdating}
                                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-lg shadow-red-900/20 transition"
                             >
                                Confirm Rejection
                             </button>
                          </div>
                       </div>
                     ) : (
                       <div className="flex justify-end gap-4">
                          <button 
                             onClick={() => setIsRejecting(true)}
                             className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all font-semibold"
                          >
                             <XCircle size={18} />
                             Reject
                          </button>
                          <button 
                             onClick={() => handleApprove(selectedForm._id)}
                             disabled={isUpdating}
                             className="flex items-center gap-2 px-8 py-3 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl shadow-lg shadow-emerald-500/20 transition-all font-bold text-lg hover:-translate-y-1"
                          >
                             <CheckCircle size={20} />
                             Approve
                          </button>
                       </div>
                     )}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8 text-center bg-gray-800/30">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
                   <FileText className="w-10 h-10 text-emerald-500/30" />
                </div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No Application Selected</h3>
                <p className="max-w-xs mx-auto">Select a form from the list on the left to view full details and perform actions.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* --- HELPER COMPONENTS --- */

function DetailSection({ title, icon, children }) {
   return (
      <div className="bg-gray-900/40 rounded-xl p-5 border border-gray-700/50">
         <div className="flex items-center gap-3 mb-6 border-b border-gray-700/50 pb-3">
            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
               {icon}
            </div>
            <h3 className="text-lg font-semibold text-emerald-50">{title}</h3>
         </div>
         {children}
      </div>
   );
}

function Grid({ children, cols = 2 }) {
   return (
      <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-x-8 gap-y-6`}>
         {children}
      </div>
   );
}

function Field({ label, value, icon, isLink, copyable }) {
   if (!value) return null;

   return (
      <div className="group">
         <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1.5 flex items-center gap-2">
            {icon && <span className="text-emerald-500">{icon}</span>}
            {label}
         </p>
         {isLink ? (
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline hover:text-emerald-300 truncate block">
               {value}
            </a>
         ) : (
            <p className="text-gray-200 font-medium text-[15px] break-words flex items-center gap-2">
               {value}
               {copyable && (
                  <button 
                     onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(value);
                     }}
                     className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded text-gray-400 transition"
                     title="Copy"
                  >
                     <FileText size={12}/>
                  </button>
               )}
            </p>
         )}
      </div>
   );
}

function DocLink({ label, url }) {
   if (!url) return null;
   return (
      <a 
         href={url} 
         target="_blank" 
         rel="noopener noreferrer"
         className="flex items-center gap-3 p-4 bg-gray-800 border border-gray-700 hover:border-emerald-500 rounded-lg transition-all group"
      >
         <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
            <FileText className="text-emerald-500 w-5 h-5" />
         </div>
         <div className="overflow-hidden">
            <p className="text-sm font-medium text-gray-200 group-hover:text-emerald-400 transition-colors truncate">{label}</p>
            <p className="text-xs text-gray-500 truncate">Click to view document</p>
         </div>
      </a>
   );
}

function Badge({ status, size = 'normal' }) {
   const config = {
      approved: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
      rejected: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
      pending:  { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' }
   }[status] || { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' };

   const classes = `
      ${config.bg} ${config.text} border ${config.border} 
      ${size === 'large' ? 'px-4 py-1.5 text-base' : 'px-2.5 py-0.5 text-xs'} 
      rounded-full font-semibold uppercase tracking-wide
   `;

   return <span className={classes}>{status}</span>;
}