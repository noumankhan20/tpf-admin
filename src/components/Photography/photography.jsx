"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, MapPin, Calendar, CheckCircle, XCircle, Bell, ArrowLeft, Eye, Download, AlertCircle, Clock, UserCheck, FileText, ImageIcon, Trash2, MessageSquare, ChevronRight, Home, Grid, Settings, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

// Utility Functions
const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.anatech.fun';
    // Ensure clean concatenation
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBase}${cleanPath}`;
};

import { useGetAssignmentsQuery, useGetCompletedAssignmentsQuery, useUploadPhotographyMutation, useCompleteTaskMutation } from '@/utils/slices/photographyApiSlice';

// Photography Dashboard Component
const PhotographyDashboard = ({ activeView, setActiveView, userRole, assignments = [], completedAssignments = [], onSelectTask }) => {
    // We can assume assignments passed here are the ones we need
    // For now, let's treat "assignments" as the pending notifications/tasks

    // Derived state for dashboard filters
    // Note: The original code had separate mock lists for assignments (pending visits) and uploads (reviews).
    // The user request currently only focuses on "Fetch pending tasks" (/assignments).
    // We will use the fetched assignments as the "Pending Assignments".
    // For "Pending Review", "Approved", "Rejected", we don't have an API endpoint mentioned yet, 
    // so we might have to leave them empty or use the mock uploads if we want to preserve UI structure, 
    // but the instruction says "Fetch pending tasks".
    // Let's assume the API returns a list of items that could be in different states, 
    // OR we just focus on the "pending" ones for now.
    // However, to keep the dashboard working, let's filter the passed assignments.

    const [activeFilter, setActiveFilter] = useState('notifications');

    // In a real app, you might fetch uploads separately. For this task, we focus on the pending assignments.
    const pendingAssignments = assignments;
    // completedAssignments is now passed as a prop
    // We'll keep mock data for other tabs to avoid breaking the UI completely, 
    // or just show empty if not provided. 
    // The user didn't provide an endpoint for "my uploads", so we'll leave those static or empty.
    const uploads = [];
    const completedUploads = [];
    const pendingUploads = [];
    const rejectedUploads = [];

    return (
        <div className="space-y-6 md:space-y-8">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-xl md:rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center">
                            <Camera className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-3xl font-bold">Photography Dashboard</h1>
                            <p className="text-emerald-100 text-sm md:text-lg">Documenting impact, building trust</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4 md:gap-6 text-xs md:text-sm">
                        <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 md:w-4 md:h-4" />
                            <span>{pendingAssignments.length} pending visits</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats - Mobile Optimized */}
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 md:gap-6">
                <div
                    onClick={() => setActiveFilter('notifications')}
                    className={`bg-white rounded-xl p-4 md:p-6 shadow-sm border-2 transition-all cursor-pointer ${activeFilter === 'notifications'
                        ? 'border-orange-300 bg-orange-50'
                        : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                        }`}
                >
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-4 h-4 md:w-6 md:h-6 text-orange-600" />
                        </div>
                        <span className="text-lg md:text-2xl font-bold text-orange-600">{pendingAssignments.length}</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 text-xs md:text-base">Pending Assignments</h3>
                    <p className="text-xs text-gray-600 mt-1">Awaiting field visits</p>
                </div>



                <div
                    onClick={() => setActiveFilter('completed')}
                    className={`bg-white rounded-xl p-4 md:p-6 shadow-sm border-2 transition-all cursor-pointer ${activeFilter === 'completed'
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                        }`}
                >
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 md:w-6 md:h-6 text-green-600" />
                        </div>
                        <span className="text-lg md:text-2xl font-bold text-green-600">{completedAssignments.length}</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 text-xs md:text-base">Completed</h3>
                    <p className="text-xs text-gray-600 mt-1">Successfully finished</p>
                </div>

            </div>

            {/* Filtered Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 md:px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800 capitalize">
                        {activeFilter.replace('-', ' ')}
                    </h2>
                </div>

                <div className="p-4 md:p-6 space-y-4">
                    {/* Notifications (Pending Assignments) */}
                    {activeFilter === 'notifications' && assignments.map((notification, index) => (
                        <div key={index} className="flex flex-col md:flex-row md:items-start gap-4 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <UserCheck className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-800 mb-1 text-sm md:text-base flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white ${notification.taskType === 'UPLOAD_POST_CAMPAIGN_PHOTOS' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                                        {notification.taskType === 'UPLOAD_POST_CAMPAIGN_PHOTOS' ? 'Post-Campaign' : 'Pre-Campaign'}
                                    </span>
                                    {notification.campaignName}
                                </h3>
                                <p className="text-xs md:text-sm text-gray-600 mb-2 font-sans italic">
                                    <span className="font-bold underline">Beneficiary:</span> {notification.beneficiaryName}
                                </p>
                                <p className="text-xs md:text-sm text-gray-600 mb-2 break-words">
                                    <MapPin className="w-3 h-3 md:w-4 md:h-4 inline mr-1" />
                                    {notification.address}
                                </p>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Deadline: {formatDate(notification.deadline)}
                                    </span>
                                    <span>Assigned {formatDate(notification.createdAt)}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    onSelectTask(notification);
                                    setActiveView('upload');
                                }}
                                className="w-full md:w-auto bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-emerald-700 transition-colors flex-shrink-0"
                            >
                                Start Upload
                            </button>
                        </div>
                    ))}

                    {/* Pending Review */}
                    {activeFilter === 'pending-review' && pendingUploads.map(upload => (
                        <div key={upload.id} className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                                <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
                                    <img
                                        src={getImageUrl(upload.images[0])}
                                        alt="Upload preview"
                                        className="w-full h-full rounded-lg object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-800 text-sm md:text-base">{upload.campaignName}</h3>
                                    <p className="text-xs md:text-sm text-gray-600 mb-1">Beneficiary: {upload.beneficiaryName}</p>
                                    <p className="text-xs md:text-sm text-gray-600 mb-2">{upload.notes}</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span>{formatDate(upload.uploadDate)}</span>
                                        <span>{upload.images.length} images</span>
                                        <span className="text-yellow-600 font-medium">Under Review</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Completed */}
                    {activeFilter === 'completed' && completedAssignments.map(upload => (
                        <div key={upload.id} className="p-4 border rounded-lg bg-green-50 border-green-200">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                                <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
                                    <img
                                        src={getImageUrl(upload.images[0])}
                                        alt="Upload preview"
                                        className="w-full h-full rounded-lg object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-800 text-sm md:text-base">{upload.campaignName}</h3>
                                    <p className="text-xs md:text-sm text-gray-600 mb-1">Beneficiary: {upload.beneficiaryName}</p>
                                    <p className="text-xs md:text-sm text-gray-600 mb-2">{upload.notes}</p>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-500">
                                        <span>{formatDate(upload.uploadDate)}</span>
                                        <span>{upload.images.length} images</span>
                                        <span className="text-green-600 font-medium flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            Completed
                                        </span>
                                    </div>
                                    {upload.adminFeedback && (
                                        <p className="text-xs text-green-700 mt-2 p-2 bg-green-100 rounded">
                                            <span className="font-medium">Admin:</span> {upload.adminFeedback}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}



                    {/* Empty States */}
                    {activeFilter === 'notifications' && assignments.length === 0 && (
                        <div className="text-center py-8">
                            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No new assignments at the moment</p>
                        </div>
                    )}

                    {activeFilter === 'pending-review' && pendingUploads.length === 0 && (
                        <div className="text-center py-8">
                            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No uploads pending review</p>
                        </div>
                    )}

                    {activeFilter === 'completed' && completedUploads.length === 0 && (
                        <div className="text-center py-8">
                            <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No completed assignments yet</p>
                        </div>
                    )}


                </div>
            </div>
        </div>
    );
};

// Upload Component
const UploadPage = ({ setActiveView, selectedTask, assignments, onTaskSelect }) => {
    // We derive state from selectedTask to keep everything in sync
    const [beneficiaryName, setBeneficiaryName] = useState(selectedTask?.beneficiaryName || '');
    const [notes, setNotes] = useState('');
    // Use 'address' from assignment data, or fallback
    const [location, setLocation] = useState(selectedTask?.address || '');
    const [images, setImages] = useState([]);
    const [dragOver, setDragOver] = useState(false);

    const fileInputRef = useRef(null);
    const [uploadPhotography, { isLoading: uploading }] = useUploadPhotographyMutation();
    const [completeTask, { isLoading: completing }] = useCompleteTaskMutation();

    // When selectedTask changes, update the form fields
    useEffect(() => {
        if (selectedTask) {
            setBeneficiaryName(selectedTask.beneficiaryName || '');
            setLocation(selectedTask.address || '');
            // You can also reset notes/images here if desired when switching tasks
        }
    }, [selectedTask]);

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        handleFiles(files);
    };

    const handleFiles = (files) => {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        const newImages = imageFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            id: Date.now() + Math.random()
        }));
        setImages(prev => [...prev, ...newImages]);
    };

    const removeImage = (imageId) => {
        setImages(prev => prev.filter(img => img.id !== imageId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!images.length) {
            alert('Please upload at least one image.');
            return;
        }

        const taskId = selectedTask?.id || selectedTask?._id;
        if (!taskId || !selectedTask?.campaignId) {
            alert('Missing Task ID or Campaign ID.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('taskId', taskId);
            formData.append('campaignId', selectedTask.campaignId);
            formData.append('notes', notes);
            if (location) formData.append('location', location);

            images.forEach((img) => {
                formData.append('images', img.file);
            });

            await uploadPhotography({
                formData,
                campaignId: selectedTask.campaignId
            }).unwrap();

            await completeTask({ taskId }).unwrap();

            alert('Images uploaded and task completed successfully!');
            setActiveView('dashboard');
        } catch (error) {
            console.error('Submission failed:', error);
            alert(error?.data?.message || 'Failed to submit. Please try again.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-xl md:rounded-2xl p-6 md:p-8 text-white">
                <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <Upload className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold font-serif">Upload Documentation</h1>
                        <p className="text-emerald-100 text-sm md:text-lg">Share the impact of our work</p>
                    </div>
                </div>
            </div>

            {/* Upload Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 md:px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800">Upload Details</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
                    {/* Beneficiary Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Beneficiary Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={beneficiaryName}
                            onChange={(e) => setBeneficiaryName(e.target.value)}
                            className="w-full p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Enter beneficiary name"
                            required
                            readOnly // Optional: make readOnly if you don't want them editing API data
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location Details
                        </label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Specific address or landmark (optional)"
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Images <span className="text-red-500">*</span>
                        </label>
                        <div
                            className={`border-2 border-dashed rounded-lg p-6 md:p-8 text-center transition-colors ${dragOver
                                ? 'border-blue-400 bg-emerald-50'
                                : 'border-gray-300 hover:border-gray-400'
                                }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div className="flex flex-col items-center gap-3 md:gap-4">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <ImageIcon className="w-6 h-6 md:w-8 md:h-8 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-base md:text-lg font-medium text-gray-800 mb-1">
                                        Drop images here or click to browse
                                    </p>
                                    <p className="text-xs md:text-sm text-gray-600">
                                        Support for JPG, PNG, WEBP up to 10MB each
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-emerald-600 text-white px-4 md:px-6 py-2 rounded-lg text-sm md:text-base font-medium hover:bg-emerald-700 transition-colors"
                                >
                                    Choose Files
                                </button>
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>

                    {/* Image Preview */}
                    {images.length > 0 && (
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                            {images.map(image => (
                                <div key={image.id} className="relative group">
                                    <img
                                        src={image.preview}
                                        alt="Preview"
                                        className="w-full h-24 md:h-32 object-cover rounded-lg border border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(image.id)}
                                        className="absolute top-1 md:top-2 right-1 md:right-2 w-5 h-5 md:w-6 md:h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-2 h-2 md:w-3 md:h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes & Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            className="w-full p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                            placeholder="Describe the impact, activities, or situation documented in these images..."
                            required
                        />
                    </div>

                    {/* Upload Progress (Simplified as RTK Query manages loading state) */}
                    {/* If we wanted real progress, we'd need axios or similar with onUploadProgress, 
                        but RTK Query doesn't provide progress percentage out of the box easily. 
                        We'll stick to a loading spinner for now. */}

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => setActiveView('dashboard')}
                            className="w-full sm:w-auto px-4 md:px-6 py-3 border border-gray-300 text-gray-700 rounded-lg text-sm md:text-base font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading || completing}
                            className="w-full sm:flex-1 bg-emerald-600 text-white py-3 rounded-lg text-sm md:text-base font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {uploading || completing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    {uploading ? 'Processing...' : <><CheckCircle className="w-4 h-4 md:w-5 md:h-5" /> Submit</>}
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                                    Submit
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Main Photography Module Component
const PhotographyModule = () => {
    const [activeView, setActiveView] = useState('dashboard');
    const [userRole, setUserRole] = useState('photographer');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const socket = useRef(null);

    // Fetch assignments from API
    const {
        data: assignmentsData,
        isLoading: assignmentsLoading,
        refetch: refetchAssignments
    } = useGetAssignmentsQuery();

    const {
        data: completedData,
        isLoading: completedLoading,
        refetch: refetchCompleted
    } = useGetCompletedAssignmentsQuery();

    // Use fetched data or empty array
    const assignments = assignmentsData?.data || [];
    const completedAssignments = completedData?.data || [];
    const isLoading = assignmentsLoading || completedLoading;

    // WebSocket for real-time notifications
    useEffect(() => {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
        socket.current = io(backendUrl, {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        socket.current.on('connect', () => {
            console.log('Connected to WebSocket server');
        });

        socket.current.on('taskAssigned', (data) => {
            console.log('Task assignment notification:', data);

            // If it's a photography task, refresh the lists
            if (data.module === 'PHOTO_TASK') {
                refetchAssignments();
                toast.success(`New Task Assigned: ${data.taskType.replace(/_/g, ' ')}`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        });

        return () => {
            if (socket.current) {
                socket.current.disconnect();
                console.log('Disconnected from WebSocket server');
            }
        };
    }, [refetchAssignments]);

    // Notifications count based on assignments
    const count = assignments.length; // Assuming all returned are pending or we filter

    const router = useRouter();
    const navigation = [
        // { id: 'dashboard', name: 'Dashboard', icon: Home, roles: ['photographer', 'admin'] },
        // { id: 'upload', name: 'Upload', icon: Upload, roles: ['photographer'] },
    ];

    const visibleNavigation = navigation.filter(item => item.roles.includes(userRole));

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Minimalistic Navigation Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0 shadow-sm sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/select-portal')}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">Photography</h1>
                </div>

                {/* Navigation Pills */}
                <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
                    {visibleNavigation.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeView === item.id
                                ? 'bg-white text-gray-800 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.name}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition relative">
                        <Bell className="w-5 h-5 text-gray-600" />
                        {count > 0 ? (
                            <span className="absolute top-2 right-2 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                        ) : null}
                    </button>

                    {/* <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                    </div> */}

                    {/* Mobile Menu Toggle (Simplified) */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-gray-600 hover:text-gray-800"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </header>

            {/* Mobile Navigation Dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden px-4 py-3 border-b border-gray-200 bg-white sticky top-[73px] z-30 shadow-sm">
                    <div className="flex flex-col space-y-1">
                        {visibleNavigation.map(item => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveView(item.id);
                                    setMobileMenuOpen(false);
                                }}
                                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${activeView === item.id
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                    }`}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content */}
            < main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8" >
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    </div>
                ) : activeView === 'dashboard' ? (
                    <PhotographyDashboard
                        activeView={activeView}
                        setActiveView={setActiveView}
                        userRole={userRole}
                        assignments={assignments}
                        completedAssignments={completedAssignments}
                        onSelectTask={(task) => {
                            setSelectedTask(task);
                            setActiveView('upload');
                        }}
                    />
                ) : activeView === 'upload' ? (
                    <UploadPage
                        setActiveView={setActiveView}
                        selectedTask={selectedTask}
                        assignments={assignments}
                        onTaskSelect={setSelectedTask}
                    />
                ) : null}
            </main >
        </div >
    );
};

export default PhotographyModule;