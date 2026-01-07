'use client';
import React, { useState, useRef } from 'react';
import { Plus, X, Upload, ArrowLeft, Image as ImageIcon, Check, FileText, Calendar, Users, FileCheck, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCreateAgreementMutation } from '@/utils/slices/documentationApiSlice';

export default function AddAgreement() {
  const router = useRouter();
  const [createAgreement, { isLoading }] = useCreateAgreementMutation();

  // Form state
  const [agreementTitle, setAgreementTitle] = useState("");
  const [agreementType, setAgreementType] = useState('');
  const [customAgreementType, setCustomAgreementType] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  
  const [dates, setDates] = useState({
    creationDate: "",
    signingDate: "",
    startDate: "",
    endDate: "",
  });

  const [scope, setScope] = useState("");
  const [keyTerms, setKeyTerms] = useState("");
  const [status, setStatus] = useState("");
  const [financialValue, setFinancialValue] = useState("");

  const [parties, setParties] = useState([
    { id: 1, name: '', type: '', email: '', phone: '', signatureType: 'upload', signatureFile: null },
    { id: 2, name: '', type: '', email: '', phone: '', signatureType: 'upload', signatureFile: null }
  ]);

  const [uploadedFiles, setUploadedFiles] = useState({
    signed: [],
    supporting: [],
    amendments: []
  });

  const [isDrawing, setIsDrawing] = useState({});
  const [error, setError] = useState('');
  const canvasRefs = useRef({});

  const steps = [
    { num: 1, title: 'Basic Info', icon: FileText },
    { num: 2, title: 'Parties', icon: Users },
    { num: 3, title: 'Dates & Terms', icon: Calendar },
    { num: 4, title: 'Documents', icon: FileCheck }
  ];

  // Party management
  const addParty = () => {
    setParties([...parties, {
      id: Date.now(),
      name: '',
      type: '',
      email: '',
      phone: '',
      signatureType: 'upload',
      signatureFile: null
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

  // Signature handling
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
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Signature file size must be less than 2MB');
      return;
    }

    setError('');
    setParties(parties.map(party =>
      party.id === id ? { ...party, signatureFile: file } : party
    ));
  };

  const getCanvasCoordinates = (canvas, e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;

    return {
      x: (clientX - rect.left) * scaleX / 2,
      y: (clientY - rect.top) * scaleY / 2
    };
  };

  const dataURLtoFile = (dataUrl, filename) => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
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
    setIsDrawing((prev) => ({ ...prev, [id]: false }));
    const canvas = canvasRefs.current[id];
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const file = dataURLtoFile(dataUrl, `signature-${id}.png`);

    setParties((prev) =>
      prev.map((p) => p.id === id ? { ...p, signatureFile: file } : p)
    );
  };

  const clearSignature = (id) => {
    const canvas = canvasRefs.current[id];
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setParties(parties.map(party =>
        party.id === id ? { ...party, signatureFile: null } : party
      ));
    }
  };

  // File upload handling
  const handleFileUpload = (category, e) => {
    const files = Array.from(e.target.files || []);
    const maxSize = category === 'signed' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    
    const validFiles = files.filter(file => file.size <= maxSize);

    if (validFiles.length !== files.length) {
      setError(`Some files were too large. Maximum size: ${category === 'signed' ? '10MB' : '5MB'}`);
    } else {
      setError('');
    }

    setUploadedFiles(prev => ({
      ...prev,
      [category]: [...prev[category], ...validFiles]
    }));

    // Reset input
    e.target.value = '';
  };

  const removeFile = (category, index) => {
    setUploadedFiles(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };

  // Validation
  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!agreementTitle.trim()) {
          setError('Agreement title is required');
          return false;
        }
        if (!agreementType) {
          setError('Agreement type is required');
          return false;
        }
        if (agreementType === 'Other' && !customAgreementType.trim()) {
          setError('Please specify the agreement type');
          return false;
        }
        break;

      case 2:
        for (let i = 0; i < parties.length; i++) {
          const party = parties[i];
          if (!party.name.trim()) {
            setError(`Party ${i + 1}: Name is required`);
            return false;
          }
          if (!party.type) {
            setError(`Party ${i + 1}: Type is required`);
            return false;
          }
          if (!party.email.trim() || !party.email.includes('@')) {
            setError(`Party ${i + 1}: Valid email is required`);
            return false;
          }
          if (!party.phone.trim()) {
            setError(`Party ${i + 1}: Phone is required`);
            return false;
          }
          if (!party.signatureFile) {
            setError(`Party ${i + 1}: Signature is required`);
            return false;
          }
        }
        break;

      case 3:
        if (!dates.creationDate || !dates.signingDate || !dates.startDate || !dates.endDate) {
          setError('All dates are required');
          return false;
        }
        if (!scope.trim()) {
          setError('Purpose/Scope is required');
          return false;
        }
        if (!keyTerms.trim()) {
          setError('Key Obligations are required');
          return false;
        }
        if (!status) {
          setError('Status is required');
          return false;
        }
        break;

      case 4:
        if (uploadedFiles.signed.length === 0) {
          setError('Signed agreement document is required');
          return false;
        }
        break;
    }

    setError('');
    return true;
  };

  // Navigation
  const nextStep = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const handleBack = () => {
    router.push('/documentation-management');
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(4)) return;

    const formData = new FormData();

    // Basic info
    formData.append("agreementTitle", agreementTitle);
    formData.append("agreementType", agreementType === 'Other' ? customAgreementType : agreementType);

    // Parties
    const cleanedParties = parties.map(({ signatureFile, ...rest }) => rest);
    formData.append("parties", JSON.stringify(cleanedParties));

    // Dates
    formData.append("dates", JSON.stringify(dates));

    // Terms
    formData.append("scope", scope);
    formData.append("keyTerms", keyTerms);
    formData.append("status", status);
    if (financialValue) formData.append("financialValue", financialValue);

    // Documents
    uploadedFiles.signed.forEach((file) => formData.append("signed", file));
    uploadedFiles.supporting.forEach((file) => formData.append("supporting", file));
    uploadedFiles.amendments.forEach((file) => formData.append("amendments", file));

    // Signatures
    parties.forEach((party) => {
      if (party.signatureFile) {
        formData.append("signatures", party.signatureFile);
      }
    });

    try {
      await createAgreement(formData).unwrap();
      router.push("/documentation-management");
    } catch (error) {
      console.error("Create agreement failed", error);
      setError(error?.data?.message || "Failed to create agreement. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={handleBack}
            disabled={isLoading}
            className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-900 mb-6 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Progress Steps */}
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
                      isActive ? 'bg-emerald-500 text-white' : isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={`mt-2 text-xs font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 transition-all ${currentStep > step.num ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Validation Error</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="ml-auto p-1 hover:bg-red-100 rounded transition-colors"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={(e) => {
          e.preventDefault();
          if (currentStep === 4) {
            handleSubmit(e);
          }
        }}>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                    value={agreementTitle}
                    onChange={(e) => setAgreementTitle(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      disabled={isLoading}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                </div>
                {agreementType === 'Other' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Please specify agreement type <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customAgreementType}
                      onChange={(e) => setCustomAgreementType(e.target.value)}
                      disabled={isLoading}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter agreement type"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Parties Involved */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-500" />
                    Parties Involved
                  </h2>
                  <button
                    type="button"
                    onClick={addParty}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                            disabled={isLoading}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                            disabled={isLoading}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                            disabled={isLoading}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                            disabled={isLoading}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                            disabled={isLoading}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="+91 XXXXX XXXXX"
                          />
                        </div>
                      </div>

                      {/* Signature Section */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                          Signature <span className="text-red-500">*</span>
                        </label>

                        <div className="flex gap-2 mb-6">
                          <button
                            type="button"
                            onClick={() => handleSignatureTypeChange(party.id, 'upload')}
                            disabled={isLoading}
                            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                              party.signatureType === 'upload' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <ImageIcon className="w-4 h-4 inline mr-2" />
                            Upload Image
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSignatureTypeChange(party.id, 'draw')}
                            disabled={isLoading}
                            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                              party.signatureType === 'draw' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            ✍️ Draw Signature
                          </button>
                        </div>

                        {party.signatureType === 'upload' && (
                          <div>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-500 hover:bg-gray-50 transition-all cursor-pointer">
                              <Upload className="mx-auto w-10 h-10 text-gray-400 mb-3" />
                              <p className="text-sm font-medium text-gray-700 mb-1">Upload signature image</p>
                              <p className="text-xs text-gray-500 mb-4">PNG, JPG - Max 2MB</p>
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg"
                                onChange={(e) => handleSignatureFileUpload(party.id, e)}
                                disabled={isLoading}
                                className="hidden"
                                id={`signature-upload-${party.id}`}
                              />
                              <label
                                htmlFor={`signature-upload-${party.id}`}
                                className={`inline-block px-5 py-2 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 cursor-pointer transition-colors font-medium ${
                                  isLoading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                                }`}
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
                                  <span className="text-sm text-emerald-700 font-medium">{party.signatureFile.name}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => updateParty(party.id, 'signatureFile', null)}
                                  disabled={isLoading}
                                  className="p-1.5 text-red-500 hover:bg-red-100 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                                disabled={isLoading}
                                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="space-y-6">
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
                        value={dates.creationDate}
                        onChange={(e) => setDates({ ...dates, creationDate: e.target.value })}
                        disabled={isLoading}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Signing <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={dates.signingDate}
                        onChange={(e) => setDates({ ...dates, signingDate: e.target.value })}
                        disabled={isLoading}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={dates.startDate}
                        onChange={(e) => setDates({ ...dates, startDate: e.target.value })}
                        disabled={isLoading}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={dates.endDate}
                        onChange={(e) => setDates({ ...dates, endDate: e.target.value })}
                        disabled={isLoading}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      rows="3"
                      required
                      value={scope}
                      onChange={(e) => setScope(e.target.value)}
                      disabled={isLoading}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      value={keyTerms}
                      onChange={(e) => setKeyTerms(e.target.value)}
                      disabled={isLoading}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        disabled={isLoading}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                        value={financialValue}
                        onChange={(e) => setFinancialValue(e.target.value)}
                        disabled={isLoading}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
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
            <div className="space-y-6">
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
                      <p className="text-sm font-medium text-gray-700 mb-1">Upload Signed Agreement</p>
                      <p className="text-xs text-gray-500 mb-4">PDF, DOCX - Max 10MB</p>
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={(e) => handleFileUpload('signed', e)}
                        disabled={isLoading}
                        className="hidden"
                        id="signed-upload"
                      />
                      <label
                        htmlFor="signed-upload"
                        className={`inline-block px-5 py-2 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 cursor-pointer transition-colors font-medium ${
                          isLoading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                        }`}
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
                              disabled={isLoading}
                              className="p-1.5 text-red-500 hover:bg-red-100 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <p className="text-sm font-medium text-gray-700 mb-1">Upload Supporting Documents</p>
                      <p className="text-xs text-gray-500 mb-4">Multiple files allowed - Max 5MB each</p>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleFileUpload('supporting', e)}
                        disabled={isLoading}
                        className="hidden"
                        id="supporting-upload"
                      />
                      <label
                        htmlFor="supporting-upload"
                        className={`inline-block px-5 py-2 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 cursor-pointer transition-colors font-medium ${
                          isLoading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                        }`}
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
                              disabled={isLoading}
                              className="p-1.5 text-red-500 hover:bg-red-100 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <p className="text-sm font-medium text-gray-700 mb-1">Upload Amendments</p>
                      <p className="text-xs text-gray-500 mb-4">Multiple files allowed - Max 5MB each</p>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleFileUpload('amendments', e)}
                        disabled={isLoading}
                        className="hidden"
                        id="amendments-upload"
                      />
                      <label
                        htmlFor="amendments-upload"
                        className={`inline-block px-5 py-2 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 cursor-pointer transition-colors font-medium ${
                          isLoading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                        }`}
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
                              disabled={isLoading}
                              className="p-1.5 text-red-500 hover:bg-red-100 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center gap-4 pt-8 border-t border-gray-200">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                disabled={isLoading}
                className="px-5 py-2.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex gap-3 ml-auto">
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    nextStep();
                  }}
                  disabled={isLoading}
                  className="px-6 py-2.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit Agreement'
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Footer */}
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