'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Upload, ArrowLeft, Image as ImageIcon, Check, FileText, Calendar, Users, FileCheck, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
export default function AddAgreement() {
  const [currentStep, setCurrentStep] = useState(1);
  const [agreementType, setAgreementType] = useState('');
  const [parties, setParties] = useState([
    { id: 1, name: '', type: '', signatory: '', email: '', phone: '', signatureType: 'upload', signatureFile: null, signatureCanvas: null },
    { id: 2, name: '', type: '', signatory: '', email: '', phone: '', signatureType: 'upload', signatureFile: null, signatureCanvas: null }
  ]);
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState({
    signed: [],
    supporting: [],
    amendments: []
  });
  const [isDrawing, setIsDrawing] = useState({});
  const canvasRefs = useRef({});

  const steps = [
    { num: 1, title: 'Basic Info', icon: FileText },
    { num: 2, title: 'Parties', icon: Users },
    { num: 3, title: 'Dates & Terms', icon: Calendar },
    { num: 4, title: 'Documents', icon: FileCheck }
  ];

  const addParty = () => {
    setParties([...parties, { 
      id: Date.now(), 
      name: '', 
      type: '', 
      signatory: '', 
      email: '', 
      phone: '',
      signatureType: 'upload',
      signatureFile: null,
      signatureCanvas: null
    }]);
  };

  const removeParty = (id) => {
    if (parties.length > 2) {
      setParties(parties.filter(party => party.id !== id));
      delete canvasRefs.current[id];
      const newIsDrawing = { ...isDrawing };
      delete newIsDrawing[id];
      setIsDrawing(newIsDrawing);
    }
  };

  const updateParty = (id, field, value) => {
    setParties(parties.map(party => 
      party.id === id ? { ...party, [field]: value } : party
    ));
  };

  const handleSignatureTypeChange = (id, type) => {
    setParties(parties.map(party => 
      party.id === id ? { ...party, signatureType: type, signatureFile: null } : party
    ));
    
    if (type === 'draw') {
      setTimeout(() => {
        const canvas = canvasRefs.current[id];
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          canvas.width = rect.width * 2;
          canvas.height = 300;
          const ctx = canvas.getContext('2d');
          ctx.scale(2, 2);
          ctx.strokeStyle = '#1f2937';
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
        }
      }, 100);
    }
  };

  const handleSignatureFileUpload = (id, e) => {
    const file = e.target.files[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      setParties(parties.map(party => 
        party.id === id ? { ...party, signatureFile: file } : party
      ));
    } else if (file) {
      alert('File size must be less than 2MB');
    }
  };

  const getCanvasCoordinates = (canvas, e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
    
    return {
      x: (clientX - rect.left) * scaleX / 2,
      y: (clientY - rect.top) * scaleY / 2
    };
  };

  const startDrawing = (id, e) => {
    e.preventDefault();
    setIsDrawing({ ...isDrawing, [id]: true });
    const canvas = canvasRefs.current[id];
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const coords = getCanvasCoordinates(canvas, e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (id, e) => {
    e.preventDefault();
    if (!isDrawing[id]) return;
    const canvas = canvasRefs.current[id];
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const coords = getCanvasCoordinates(canvas, e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = (id) => {
    setIsDrawing({ ...isDrawing, [id]: false });
  };

  const clearSignature = (id) => {
    const canvas = canvasRefs.current[id];
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleFileUpload = (category, e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (category === 'signed') {
        return file.size <= 10 * 1024 * 1024;
      }
      return file.size <= 5 * 1024 * 1024;
    });
    
    if (validFiles.length !== files.length) {
      alert('Some files were too large and were not uploaded');
    }
    
    setUploadedFiles(prev => ({
      ...prev,
      [category]: [...prev[category], ...validFiles]
    }));
  };

  const removeFile = (category, index) => {
    setUploadedFiles(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };

  const handleBack = () => {
    router.push('/documentation-management')
    console.log('Navigate back to Documentation Management');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', { parties, uploadedFiles });
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Agreements</span>
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Create New Agreement</h1>
            <p className="text-sm text-gray-500">Fill in the details to create a new MoU or Contract</p>
          </div>
        </div>
      </header>

      {/* Minimal Progress Steps */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.num;
              const isCompleted = currentStep > step.num;
              
              return (
                <React.Fragment key={step.num}>
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-emerald-500 text-white' 
                        : isCompleted 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={`mt-2 text-xs font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 transition-all ${
                      currentStep > step.num ? 'bg-emerald-500' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-fadeIn">
              <div className="px-8 py-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-500" />
                  Basic Agreement Information
                </h2>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agreement Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    placeholder="Enter a descriptive title for the agreement"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Agreement Type <span className="text-red-500">*</span>
                    </label>
                    <select 
                      required
                      value={agreementType}
                      onChange={(e) => setAgreementType(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-white"
                    >
                      <option value="">Select type</option>
                      <option>MoU</option>
                      <option>Contract</option>
                      <option>Service Agreement</option>
                      <option>Partnership Agreement</option>
                      <option>NDA</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reference Number
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      placeholder="AUTO-GEN-001 or manual entry"
                    />
                  </div>
                </div>
                {agreementType === 'Other' && (
                  <div className="animate-fadeIn">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Please specify agreement type <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      placeholder="Enter agreement type"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Parties Involved */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-500" />
                    Parties Involved
                  </h2>
                  <button
                    type="button"
                    onClick={addParty}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Party
                  </button>
                </div>

                <div className="p-8 space-y-6">
                  {parties.map((party, index) => (
                    <div key={party.id} className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-medium text-sm">
                            {index + 1}
                          </div>
                          <h3 className="text-base font-semibold text-gray-900">
                            {index === 0 ? 'First Party' : index === 1 ? 'Second Party' : `Party ${index + 1}`}
                          </h3>
                        </div>
                        {parties.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeParty(party.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Party Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={party.name}
                            onChange={(e) => updateParty(party.id, 'name', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-white"
                            placeholder="Enter party name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Party Type <span className="text-red-500">*</span>
                          </label>
                          <select 
                            required
                            value={party.type}
                            onChange={(e) => updateParty(party.id, 'type', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-white"
                          >
                            <option value="">Select type</option>
                            <option>Foundation</option>
                            <option>Government</option>
                            <option>NGO</option>
                            <option>Private Entity</option>
                            <option>Individual</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={party.email}
                            onChange={(e) => updateParty(party.id, 'email', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-white"
                            placeholder="email@example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={party.phone}
                            onChange={(e) => updateParty(party.id, 'phone', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-white"
                            placeholder="+91 XXXXX XXXXX"
                          />
                        </div>
                      </div>

                      {/* Minimal Signature Section */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                          Signature <span className="text-red-500">*</span>
                        </label>
                        
                        <div className="flex gap-2 mb-6">
                          <button
                            type="button"
                            onClick={() => handleSignatureTypeChange(party.id, 'upload')}
                            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                              party.signatureType === 'upload'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <ImageIcon className="w-4 h-4 inline mr-2" />
                            Upload Image
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSignatureTypeChange(party.id, 'draw')}
                            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                              party.signatureType === 'draw'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            ✍️ Draw Signature
                          </button>
                        </div>

                        {party.signatureType === 'upload' && (
                          <div>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-500 hover:bg-gray-50 transition-all cursor-pointer">
                              <Upload className="mx-auto w-10 h-10 text-gray-400 mb-3" />
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                Upload signature image
                              </p>
                              <p className="text-xs text-gray-500 mb-4">
                                PNG, JPG - Max 2MB
                              </p>
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg"
                                onChange={(e) => handleSignatureFileUpload(party.id, e)}
                                className="hidden"
                                id={`signature-upload-${party.id}`}
                              />
                              <label
                                htmlFor={`signature-upload-${party.id}`}
                                className="inline-block px-5 py-2 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 cursor-pointer transition-colors font-medium"
                              >
                                Choose File
                              </label>
                            </div>
                            {party.signatureFile && (
                              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                                    <Check className="w-5 h-5 text-white" />
                                  </div>
                                  <span className="text-sm text-emerald-700 font-medium">
                                    {party.signatureFile.name}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => updateParty(party.id, 'signatureFile', null)}
                                  className="p-1.5 text-red-500 hover:bg-red-100 rounded transition-all"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {party.signatureType === 'draw' && (
                          <div>
                            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                              <canvas
                                ref={(el) => {
                                  canvasRefs.current[party.id] = el;
                                  if (el && !el.width) {
                                    const rect = el.getBoundingClientRect();
                                    el.width = rect.width * 2;
                                    el.height = 300;
                                    const ctx = el.getContext('2d');
                                    ctx.scale(2, 2);
                                    ctx.strokeStyle = '#1f2937';
                                    ctx.lineWidth = 2;
                                    ctx.lineCap = 'round';
                                    ctx.lineJoin = 'round';
                                  }
                                }}
                                style={{ width: '100%', height: '150px' }}
                                className="touch-none cursor-crosshair bg-gray-50"
                                onMouseDown={(e) => startDrawing(party.id, e)}
                                onMouseMove={(e) => draw(party.id, e)}
                                onMouseUp={() => stopDrawing(party.id)}
                                onMouseLeave={() => stopDrawing(party.id)}
                                onTouchStart={(e) => startDrawing(party.id, e)}
                                onTouchMove={(e) => draw(party.id, e)}
                                onTouchEnd={() => stopDrawing(party.id)}
                              />
                            </div>
                            <div className="mt-4 flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => clearSignature(party.id)}
                                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                              >
                                Clear Signature
                              </button>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <AlertCircle className="w-4 h-4" />
                                <span>Draw your signature above</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Dates & Terms */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Agreement Dates */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-500" />
                    Agreement Dates
                  </h2>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Creation Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Signing <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Scope & Terms */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Scope & Key Terms</h2>
                </div>
                <div className="p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Purpose / Scope <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows="4"
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
                      placeholder="Describe the purpose and scope of this agreement..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key Obligations <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows="4"
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
                      placeholder="List key obligations and deliverables..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select 
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-white"
                      >
                        <option value="">Select status</option>
                        <option>Draft</option>
                        <option>Signed</option>
                        <option>Active</option>
                        <option>Expired</option>
                        <option>Terminated</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Financial Value (INR)
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                        placeholder="Enter amount"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Documents */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-emerald-500" />
                    Document Upload
                  </h2>
                </div>
                
                <div className="p-8 space-y-8">
                  {/* Signed Agreement Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Signed Agreement <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-500 hover:bg-gray-50 transition-all cursor-pointer">
                      <Upload className="mx-auto w-10 h-10 text-gray-400 mb-3" />
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Upload Signed Agreement
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        PDF, DOCX - Max 10MB
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={(e) => handleFileUpload('signed', e)}
                        className="hidden"
                        id="signed-upload"
                      />
                      <label
                        htmlFor="signed-upload"
                        className="inline-block px-5 py-2 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 cursor-pointer transition-colors font-medium"
                      >
                        Choose File
                      </label>
                    </div>
                    {uploadedFiles.signed.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {uploadedFiles.signed.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                                <FileText className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">{file.name}</p>
                                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile('signed', index)}
                              className="p-1.5 text-red-500 hover:bg-red-100 rounded transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Supporting Documents */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Supporting Documents
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-500 hover:bg-gray-50 transition-all cursor-pointer">
                      <Upload className="mx-auto w-10 h-10 text-gray-400 mb-3" />
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Upload Supporting Documents
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        Multiple files allowed - Max 5MB each
                      </p>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleFileUpload('supporting', e)}
                        className="hidden"
                        id="supporting-upload"
                      />
                      <label
                        htmlFor="supporting-upload"
                        className="inline-block px-5 py-2 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 cursor-pointer transition-colors font-medium"
                      >
                        Choose Files
                      </label>
                    </div>
                    {uploadedFiles.supporting.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {uploadedFiles.supporting.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center">
                                <FileText className="w-4 h-4 text-gray-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">{file.name}</p>
                                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile('supporting', index)}
                              className="p-1.5 text-red-500 hover:bg-red-100 rounded transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Amendments */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Amendments & Addendums
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-500 hover:bg-gray-50 transition-all cursor-pointer">
                      <Upload className="mx-auto w-10 h-10 text-gray-400 mb-3" />
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Upload Amendments
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        Multiple files allowed - Max 5MB each
                      </p>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleFileUpload('amendments', e)}
                        className="hidden"
                        id="amendments-upload"
                      />
                      <label
                        htmlFor="amendments-upload"
                        className="inline-block px-5 py-2 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 cursor-pointer transition-colors font-medium"
                      >
                        Choose Files
                      </label>
                    </div>
                    {uploadedFiles.amendments.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {uploadedFiles.amendments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center">
                                <FileText className="w-4 h-4 text-gray-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">{file.name}</p>
                                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile('amendments', index)}
                              className="p-1.5 text-red-500 hover:bg-red-100 rounded transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Improved Navigation Buttons */}
          <div className="flex justify-between items-center gap-4 pt-8 border-t border-gray-200">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-5 py-2.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Previous
              </button>
            ) : (
              <div></div>
            )}
            
            <div className="flex gap-3 ml-auto">
              <button
                type="button"
                className="px-5 py-2.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Save as Draft
              </button>
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                >
                  Submit Agreement
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 px-4 mt-16">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs text-gray-500">
            © 2026 Documentation Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}