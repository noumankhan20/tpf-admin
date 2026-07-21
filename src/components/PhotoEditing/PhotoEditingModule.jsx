"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, MapPin, Calendar, CheckCircle, XCircle, Bell, ArrowLeft, Eye, Download, AlertCircle, Clock, UserCheck, FileText, ImageIcon, Trash2, MessageSquare, ChevronRight, Home, Grid, Settings, Menu, X, Edit, Image as LucideImage } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import NotificationBell from '../Common/NotificationBell';
import { useSocket } from '@/utils/context/SocketContext';
import { getMediaUrl } from '@/utils/media';


// Import API hooks
import { useGetEditingAssignmentsQuery, useGetCompletedEditingAssignmentsQuery, useUploadEditedPhotoMutation, useCompleteTaskMutation } from '@/utils/slices/photoEditingApiSlice';

const getImageUrl = (path) => getMediaUrl(path);

const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return 'N/A';
        return d.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    } catch (e) {
        return 'N/A';
    }
};

/* -------------------------------------------------------------------------- */
/*                            DASHBOARD COMPONENT                             */
/* -------------------------------------------------------------------------- */
const EditingDashboard = ({ activeView, setActiveView, assignments = [], completedAssignments = [], onSelectTask }) => {
    const [activeFilter, setActiveFilter] = useState('notifications');
    const pendingAssignments = assignments;

    return (
        <div className="space-y-6 md:space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-xl md:rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center">
                            <Edit className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-3xl font-bold">Photo Editing Dashboard</h1>
                            <p className="text-emerald-100 text-sm md:text-lg">Refining visual stories for impact</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats - Matched with Photography Theme (Pending: Orange, Completed: Green) */}
            <div className="grid grid-cols-2 gap-3 md:gap-6">
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
                    <h3 className="font-semibold text-gray-800 text-xs md:text-base">Pending Edits</h3>
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
                </div>
            </div>

            {/* Content List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 md:px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800 capitalize">
                        {activeFilter === 'notifications' ? 'Assignments' : 'Completed Work'}
                    </h2>
                </div>

                <div className="p-4 md:p-6 space-y-4">
                    {/* Pending Assignments */}
                    {activeFilter === 'notifications' && assignments.map((notification, index) => (
                        <div key={index} className="flex flex-col md:flex-row md:items-start gap-4 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <LucideImage className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-800 mb-1 text-sm md:text-base flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white ${notification.taskType === 'EDIT_POST_CAMPAIGN_PHOTOS' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                                        {notification.taskType === 'EDIT_POST_CAMPAIGN_PHOTOS' ? 'Post-Campaign' : 'Pre-Campaign'}
                                    </span>
                                    {notification.campaignName}
                                </h3>
                                <p className="text-xs md:text-sm text-gray-600 mb-2 font-sans italic">
                                    <span className="font-bold underline">Beneficiary:</span> {notification.beneficiaryName}
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
                                Start Editing
                            </button>
                        </div>
                    ))}

                    {/* Completed Assignments */}
                    {activeFilter === 'completed' && completedAssignments.map(upload => (
                        <div key={upload.id} className="p-4 border rounded-lg bg-green-50 border-green-200">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                                <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
                                    {upload.images?.[0] ? (
                                        <img
                                            src={getImageUrl(upload.images[0])}
                                            alt="Preview"
                                            className="w-full h-full rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center">
                                            <ImageIcon className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-800 text-sm md:text-base">{upload.campaignName}</h3>
                                    <p className="text-xs md:text-sm text-gray-600 mb-1">Beneficiary: {upload.beneficiaryName}</p>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-500 mt-2">
                                        <span>{formatDate(upload.uploadDate)}</span>
                                        <span>{upload.images?.length || 0} edited images</span>
                                        <span className="text-green-600 font-medium flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            Completed
                                        </span>
                                    </div>
                                    {upload.driveLink && (
                                        <div className="mt-3">
                                            <a
                                                href={upload.driveLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200 transition-colors"
                                            >
                                                <Download className="w-3 h-3" />
                                                Access Drive Files
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Empty States */}
                    {activeFilter === 'notifications' && assignments.length === 0 && (
                        <div className="text-center py-8">
                            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No pending edits assigned</p>
                        </div>
                    )}
                    {activeFilter === 'completed' && completedAssignments.length === 0 && (
                        <div className="text-center py-8">
                            <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No completed edits yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* -------------------------------------------------------------------------- */
/*                              UPLOAD PAGE                                   */
/* -------------------------------------------------------------------------- */
const UploadPage = ({ setActiveView, selectedTask }) => {
    const [notes, setNotes] = useState('');
    const [images, setImages] = useState([]);
    const [driveLink, setDriveLink] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const [uploadEditedPhoto, { isLoading: uploading }] = useUploadEditedPhotoMutation();
    const [completeTask] = useCompleteTaskMutation();

    const handleFiles = (files) => {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        const newImages = imageFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            id: Date.now() + Math.random()
        }));
        setImages(prev => [...prev, ...newImages]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!images.length && !driveLink) {
            toast.error('Please upload images or provide a drive link');
            return;
        }

        const taskId = selectedTask?.id || selectedTask?._id;
        if (!taskId || !selectedTask?.campaignId) {
            toast.error('Missing Task ID details');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('taskId', taskId);
            formData.append('campaignId', selectedTask.campaignId);
            formData.append('notes', notes);
            if (driveLink) formData.append('driveLink', driveLink);

            images.forEach((img) => {
                formData.append('images', img.file);
            });

            await uploadEditedPhoto({ formData }).unwrap();

            // Call the universal task complete route
            await completeTask({ taskId }).unwrap();

            toast.success('Edited work submitted successfully');
            setActiveView('dashboard');
        } catch (error) {
            console.error('Submission failed:', error);
            toast.error(error?.data?.message || 'Failed to submit. Please try again.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-xl md:rounded-2xl p-6 md:p-8 text-white">
                <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <Upload className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold font-serif">Submit Edited Work</h1>
                        <p className="text-emerald-100 text-sm md:text-lg">Upload final edited photos for {selectedTask?.campaignName}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <LucideImage className="w-5 h-5 text-emerald-600" />
                        Source Media from Photography
                    </h2>
                </div>
                <div className="p-6 space-y-6">
                    {/* Raw Drive Link from Photographer */}
                    {selectedTask?.sourceDriveLink && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-blue-900">Photographer's Drive Link</p>
                                    <p className="text-xs text-blue-700">Contains bulk raw files for editing</p>
                                </div>
                            </div>
                            <a
                                href={selectedTask.sourceDriveLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Access Raw Files
                            </a>
                        </div>
                    )}

                    {/* Raw Images from Photographer */}
                    {selectedTask?.sourceMedia?.length > 0 ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-700">Raw Uploads ({selectedTask.sourceMedia.length})</p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                {selectedTask.sourceMedia.map((file, idx) => (
                                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                                        <img
                                            src={getImageUrl(file.url)}
                                            alt={file.originalName || `Raw ${idx}`}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <a
                                                href={getImageUrl(file.url)}
                                                download={file.originalName}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-white text-gray-800 rounded-full hover:bg-emerald-600 hover:text-white transition-colors"
                                                title="View / Download"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        !selectedTask?.sourceDriveLink && (
                            <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
                                <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500 text-sm">No direct uploads from photographer</p>
                            </div>
                        )
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-emerald-600" />
                        Upload Edited Work
                    </h2>
                </div>
                <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
                    {/* Drive Link */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Google Drive Link <span className="text-gray-400 font-normal">(Required if no images uploaded)</span>
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="url"
                                value={driveLink}
                                onChange={(e) => setDriveLink(e.target.value)}
                                className="w-full pl-10 p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                placeholder="Paste Google Drive link for bulk edited photos"
                            />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Direct Upload (Optional)
                        </label>
                        <div
                            className={`border-2 border-dashed rounded-lg p-6 md:p-8 text-center transition-colors ${dragOver
                                ? 'border-emerald-400 bg-emerald-50'
                                : 'border-gray-300 hover:border-gray-400'
                                }`}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragOver(false);
                                handleFiles(Array.from(e.dataTransfer.files));
                            }}
                        >
                            <div className="flex flex-col items-center gap-3 md:gap-4">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <ImageIcon className="w-6 h-6 md:w-8 md:h-8 text-emerald-600" />
                                </div>
                                <p className="text-base md:text-lg font-medium text-gray-800 mb-1">
                                    Drop edited images here or click to browse
                                </p>
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
                            onChange={(e) => handleFiles(Array.from(e.target.files))}
                            className="hidden"
                        />
                    </div>

                    {/* Previews */}
                    {images.length > 0 && (
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                            {images.map(image => (
                                <div key={image.id} className="relative group">
                                    <img src={image.preview} alt="Preview" className="w-full h-24 md:h-32 object-cover rounded-lg border border-gray-200" />
                                    <button
                                        type="button"
                                        onClick={() => setImages(prev => prev.filter(img => img.id !== image.id))}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 resize-none"
                            placeholder="Any context about edits..."
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => setActiveView('dashboard')}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 flex items-center justify-center gap-2"
                        >
                            {uploading ? 'Submitting...' : 'Submit Work'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* -------------------------------------------------------------------------- */
/*                            MAIN MODULE CONTAINER                           */
/* -------------------------------------------------------------------------- */
const PhotoEditingModule = () => {
    const [activeView, setActiveView] = useState('dashboard');
    const [selectedTask, setSelectedTask] = useState(null);
    const router= useRouter();
    const { socket } = useSocket();

    const {
        data: assignmentsData,
        isLoading: assignmentsLoading,
        refetch: refetchAssignments
    } = useGetEditingAssignmentsQuery();

    const {
        data: completedData,
        isLoading: completedLoading,
        refetch: refetchCompleted
    } = useGetCompletedEditingAssignmentsQuery();

    const assignments = assignmentsData?.data || [];
    const completedAssignments = completedData?.data || [];
    const isLoading = assignmentsLoading || completedLoading;

    // Real-time updates
    useEffect(() => {
        if (!socket) return;
        const handleTaskAssigned = (data) => {
            if (data.module === 'PHOTO_EDITING_TASK') {
                refetchAssignments();
            }
        };
        socket.on('taskAssigned', handleTaskAssigned);
        return () => socket.off('taskAssigned', handleTaskAssigned);
    }, [socket, refetchAssignments]);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="flex items-center gap-4">
                      <button
                                                onClick={() => router.back()}
                                                className="p-2 hover:bg-gray-100 rounded-full transition"
                                            >
                                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                                            </button>
                    <h1 className="text-xl font-bold text-gray-800">Photo Editing</h1>
                </div>
                <div className="flex items-center gap-4 relative">
                    <NotificationBell moduleFilter="PHOTO_EDITING_TASK" />
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    </div>
                ) : activeView === 'dashboard' ? (
                    <EditingDashboard
                        activeView={activeView}
                        setActiveView={setActiveView}
                        assignments={assignments}
                        completedAssignments={completedAssignments}
                        onSelectTask={(task) => {
                            setSelectedTask(task);
                            setActiveView('upload');
                        }}
                    />
                ) : (
                    <UploadPage
                        setActiveView={setActiveView}
                        selectedTask={selectedTask}
                    />
                )}
            </main>
        </div>
    );
};

export default PhotoEditingModule;
