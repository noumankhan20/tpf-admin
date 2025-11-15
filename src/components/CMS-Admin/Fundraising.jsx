"use client";
import React, { useState } from "react";
import {
  Upload,
  Save,
  XCircle,
  Image,
  Home,
  DollarSign,
  Edit2,
  Trash2,
  Search,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle,
  Shield,
  Play,
  Clock,
  Menu,
  X,
  Heart,
  Rss,
  Award,
  MessageSquare,
  Flag,
  FileText,
  PlusIcon,
} from "lucide-react";

export default function FundraisingCMS() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("fundraising");
  const [viewMode, setViewMode] = useState("view");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCard, setEditingCard] = useState(null);

  const [formData, setFormData] = useState({
    category: "Emergency Aid",
    isUrgent: false,
    taxBenefits: false,
    zakatVerified: false,
    title: "",
    organization: "",
    requiredAmount: "",
    deadline: "",
    image: null,
    imagePreview: null,
    video: null,
    videoPreview: null,
    currentAmount: 0,
    totalDonors: 0,
  });

  const categories = [
    "Emergency Aid",
    "Medical Aid",
    "Orphans",
    "Education",
    "Clean Water",
  ];

  const categoryColors = {
    "Emergency Aid": "bg-red-100 text-red-800",
    "Medical Aid": "bg-blue-100 text-blue-800",
    Orphans: "bg-purple-100 text-purple-800",
    Education: "bg-amber-100 text-amber-800",
    "Clean Water": "bg-cyan-100 text-cyan-800",
  };

  const [fundraisingCards, setFundraisingCards] = useState([
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400",
      video: null,
      title: "Emergency Relief for Earthquake Victims",
      organization: "Global Relief Foundation",
      category: "Emergency Aid",
      isUrgent: true,
      taxBenefits: true,
      zakatVerified: true,
      requiredAmount: 500000,
      currentAmount: 342000,
      totalDonors: 1240,
      deadline: "2025-12-31",
      daysLeft: 46,
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400",
      video: null,
      title: "Medical Treatment for Children",
      organization: "Children's Health Fund",
      category: "Medical Aid",
      isUrgent: false,
      taxBenefits: true,
      zakatVerified: false,
      requiredAmount: 250000,
      currentAmount: 180000,
      totalDonors: 850,
      deadline: "2025-11-30",
      daysLeft: 15,
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400",
      video: null,
      title: "Build Schools in Rural Areas",
      organization: "Education for All",
      category: "Education",
      isUrgent: false,
      taxBenefits: true,
      zakatVerified: true,
      requiredAmount: 750000,
      currentAmount: 425000,
      totalDonors: 2100,
      deadline: "2026-03-15",
      daysLeft: 120,
    },
  ]);

  const menuItems = [
    { id: "hero", label: "Hero Section", icon: Home },
    { id: "stories", label: "Impact Stories", icon: Heart },
    { id: "fundraising", label: "Fundraising Now", icon: DollarSign },
    { id: "feed", label: "Tailored Feed", icon: Rss },
    { id: "giving", label: "Start Giving Daily", icon: Calendar },
    { id: "communities", label: "Communities", icon: Users },
    { id: "trusted", label: "Trusted By", icon: Award },
    { id: "influencer", label: "Influencer Section", icon: MessageSquare },
    { id: "footer", label: "Before Footer", icon: Flag },
    { id: "audit", label: "Audit Logs", icon: FileText },
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (formData.videoPreview) {
      const confirmSwitch = confirm(
        "Uploading an image will remove the current video. Continue?"
      );
      if (!confirmSwitch) return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: reader.result,
        video: null,
        videoPreview: null,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (formData.imagePreview) {
      const confirmSwitch = confirm(
        "Uploading a video will remove the current image. Continue?"
      );
      if (!confirmSwitch) return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        video: file,
        videoPreview: reader.result,
        image: null,
        imagePreview: null,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
      imagePreview: null,
    }));
  };

  const handleRemoveVideo = () => {
    setFormData((prev) => ({
      ...prev,
      video: null,
      videoPreview: null,
    }));
  };

  const handleEdit = (card) => {
    setEditingCard(card);
    setFormData({
      category: card.category,
      isUrgent: card.isUrgent,
      taxBenefits: card.taxBenefits,
      zakatVerified: card.zakatVerified,
      title: card.title,
      organization: card.organization,
      requiredAmount: card.requiredAmount,
      deadline: card.deadline,
      image: null,
      imagePreview: card.image,
      video: null,
      videoPreview: card.video,
      currentAmount: card.currentAmount,
      totalDonors: card.totalDonors,
    });
    setViewMode("edit");
  };

  const handleSave = () => {
    alert("Fundraising card saved successfully!");
    setViewMode("view");
  };

  const handleCancel = () => {
    setViewMode("view");
    setEditingCard(null);
    setFormData({
      category: "Emergency Aid",
      isUrgent: false,
      taxBenefits: false,
      zakatVerified: false,
      title: "",
      organization: "",
      requiredAmount: "",
      deadline: "",
      image: null,
      imagePreview: null,
      video: null,
      videoPreview: null,
      currentAmount: 0,
      totalDonors: 0,
    });
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this fundraising card?")) {
      setFundraisingCards((prev) => prev.filter((card) => card.id !== id));
    }
  };

  const calculatePercentage = (current, required) => {
    const req = Number(required) || 0;
    const cur = Number(current) || 0;
    if (req <= 0) return 0;
    return Math.min(Math.round((cur / req) * 100), 100);
  };

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const closeSidebarOnMobile = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-[#0D1B1E] text-white
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        overflow-y-auto md:overflow-visible
      `}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="font-bold text-lg">Content Studio</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 hover:bg-white/10 rounded"
            >
              <X size={20} />
            </button>
          </div>

          <p className="text-[#94A3B8] text-xs uppercase tracking-wider mb-4">
            Website Sections
          </p>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    closeSidebarOnMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-[#1E293B] border-l-4 border-[#3B82F6] font-semibold"
                      : "hover:bg-[#1E293B]/50 border-l-4 border-transparent"
                  }`}
                >
                  <Icon
                    size={20}
                    className={isActive ? "text-[#3B82F6]" : "text-[#94A3B8]"}
                  />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden w-full md:w-auto">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#0D1B1E] text-white rounded-lg shadow-lg"
        >
          <Menu size={22} />
        </button>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-[#64748B] mb-2">
                <Home size={16} />
                <span>Home</span>
                <span>/</span>
                <span className="font-semibold text-[#0F172A]">
                  Fundraising Now
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-2">
                    Fundraising Now
                  </h1>
                  <p className="text-sm sm:text-base text-[#475569]">
                    Manage active fundraising campaigns and donation cards.
                  </p>
                </div>
                {viewMode === "view" && (
                  <button
                    onClick={() => setViewMode("edit")}
                    className="bg-[#2D6A4F] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1E3D36] transition-colors flex items-center gap-2 justify-center sm:justify-start"
                  >
                    <PlusIcon size={20} />
                    Add New Campaign
                  </button>
                )}
              </div>
            </div>

            {viewMode === "view" && (
              <div>
                <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-xl p-4 mb-4 sm:mb-6">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                      size={20}
                    />
                    <input
                      className="w-full pl-10 pr-4 py-2 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent text-sm sm:text-base"
                      placeholder="Search fundraising campaigns..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* DESKTOP TABLE - FIXED */}
                <div className="hidden lg:block bg-white shadow-sm rounded-xl border border-[#E2E8F0] overflow-hidden">
                  <table className="w-full table-fixed">
                    <thead className="bg-[#1E293B] text-white">
                      <tr>
                        <th className="px-4 py-4 text-left text-sm font-semibold w-[35%]">
                          Campaign
                        </th>
                        <th className="px-4 py-4 text-left text-sm font-semibold w-[15%]">
                          Category
                        </th>
                        <th className="px-4 py-4 text-left text-sm font-semibold w-[25%]">
                          Badges
                        </th>
                        <th className="px-4 py-4 text-left text-sm font-semibold w-[12%]">
                          Deadline
                        </th>
                        <th className="px-4 py-4 text-left text-sm font-semibold w-[13%]">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {fundraisingCards.map((card) => {
                        const percentage = calculatePercentage(
                          card.currentAmount,
                          card.requiredAmount
                        );
                        return (
                          <tr
                            key={card.id}
                            className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
                          >
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                  <img
                                    src={card.image}
                                    className="w-full h-full object-cover"
                                    alt={card.title}
                                  />
                                  {card.video && (
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                      <Play size={20} className="text-white" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-semibold text-[#0F172A] text-sm mb-1 truncate">
                                    {card.title}
                                  </h3>
                                  <p className="text-xs text-[#64748B] truncate">
                                    {card.organization}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <span
                                className={`px-3 py-1 text-xs rounded-full font-semibold ${categoryColors[card.category]} inline-block`}
                              >
                                {card.category}
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex flex-col gap-1.5">
                                {card.isUrgent && (
                                  <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium w-fit whitespace-nowrap">
                                    <AlertCircle size={12} />
                                    Urgent
                                  </span>
                                )}

                                {card.taxBenefits && (
                                  <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium w-fit whitespace-nowrap">
                                    <CheckCircle size={12} />
                                    Tax
                                  </span>
                                )}

                                {card.zakatVerified && (
                                  <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium w-fit whitespace-nowrap">
                                    <Shield size={12} />
                                    Zakat
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2 text-xs">
                                <Clock size={14} className="text-[#64748B]" />
                                <span className="text-[#0F172A] font-medium whitespace-nowrap">
                                  {card.daysLeft} days
                                </span>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(card)}
                                  className="p-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#1E3D36] transition-colors"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDelete(card.id)}
                                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE/TABLET CARD VIEW */}
                <div className="lg:hidden space-y-4">
                  {fundraisingCards.map((card) => {
                    const percentage = calculatePercentage(
                      card.currentAmount,
                      card.requiredAmount
                    );
                    return (
                      <div
                        key={card.id}
                        className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden"
                      >
                        <div className="relative h-48">
                          <img
                            src={card.image}
                            alt={card.title}
                            className="w-full h-full object-cover"
                          />
                          {card.video && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <Play size={32} className="text-white" />
                            </div>
                          )}
                          {card.isUrgent && (
                            <div className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-xs rounded-full font-semibold shadow-lg">
                              <AlertCircle size={14} />
                              Urgent
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span
                              className={`px-3 py-1 text-xs rounded-full font-semibold ${categoryColors[card.category]}`}
                            >
                              {card.category}
                            </span>
                            {card.taxBenefits && (
                              <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                Tax Benefits
                              </span>
                            )}
                            {card.zakatVerified && (
                              <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                                <Shield size={12} />
                                Zakat
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-[#0F172A] text-lg mb-1">
                            {card.title}
                          </h3>
                          <p className="text-sm text-[#64748B] mb-4">
                            {card.organization}
                          </p>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-xs text-[#64748B]">
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {card.daysLeft} days left
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(card)}
                              className="flex-1 py-2.5 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#1E3D36] transition-colors flex items-center justify-center gap-2 text-sm font-semibold"
                            >
                              <Edit2 size={16} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(card.id)}
                              className="flex-1 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 text-sm font-semibold"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* EDIT MODE */}
            {viewMode === "edit" && (
              <div>
                <div className="mb-6">
                  <button
                    onClick={handleCancel}
                    className="text-[#2D6A4F] hover:text-[#1E3D36] font-medium flex items-center gap-2 text-sm"
                  >
                    ← Back to list
                  </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* LEFT - FORM */}
                  <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-6">
                      {editingCard
                        ? "Edit Fundraising Card"
                        : "Add New Fundraising Card"}
                    </h2>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                          Category
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({ ...formData, category: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent text-sm sm:text-base"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#0F172A] mb-3">
                          Badges
                        </label>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.isUrgent}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  isUrgent: e.target.checked,
                                })
                              }
                              className="w-5 h-5 rounded border-[#CBD5E1] text-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]"
                            />
                            <span className="text-sm text-[#0F172A]">
                              Mark as Urgent
                            </span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.taxBenefits}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  taxBenefits: e.target.checked,
                                })
                              }
                              className="w-5 h-5 rounded border-[#CBD5E1] text-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]"
                            />
                            <span className="text-sm text-[#0F172A]">
                              Tax Benefits Available
                            </span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.zakatVerified}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  zakatVerified: e.target.checked,
                                })
                              }
                              className="w-5 h-5 rounded border-[#CBD5E1] text-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]"
                            />
                            <span className="text-sm text-[#0F172A]">
                              Zakat Verified
                            </span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                          Campaign Title
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          placeholder="Enter campaign title..."
                          className="w-full px-4 py-3 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent text-sm sm:text-base"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                          Organization Name
                        </label>
                        <input
                          type="text"
                          value={formData.organization}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              organization: e.target.value,
                            })
                          }
                          placeholder="Enter organization name..."
                          className="w-full px-4 py-3 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent text-sm sm:text-base"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                          Required Amount ($)
                        </label>
                        <input
                          type="number"
                          value={formData.requiredAmount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              requiredAmount: e.target.value,
                            })
                          }
                          placeholder="50000"
                          className="w-full px-4 py-3 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent text-sm sm:text-base"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                          Campaign Deadline
                        </label>
                        <input
                          type="date"
                          value={formData.deadline}
                          onChange={(e) =>
                            setFormData({ ...formData, deadline: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent text-sm sm:text-base"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                          Campaign Image
                        </label>

                        <div className="border-2 border-dashed border-[#CBD5E1] rounded-xl p-4 sm:p-6">
                          {formData.imagePreview ? (
                            <>
                              <div className="relative max-h-40 mx-auto rounded-lg overflow-hidden">
                                <img
                                  src={formData.imagePreview}
                                  className="w-full h-full object-cover"
                                  alt="Preview"
                                />
                                <button
                                  type="button"
                                  onClick={handleRemoveImage}
                                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                                >
                                  <X size={16} />
                                </button>
                              </div>

                              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                                <label className="px-4 py-2 bg-[#2D6A4F] text-white text-sm rounded-lg font-medium cursor-pointer hover:bg-[#1E3D36]">
                                  Replace Image
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={handleRemoveImage}
                                  className="px-4 py-2 border border-red-200 text-red-600 text-sm rounded-lg font-medium hover:bg-red-50"
                                >
                                  Remove Image
                                </button>
                              </div>
                            </>
                          ) : (
                            <label className="block text-center cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                              />
                              <Upload
                                size={40}
                                className="mx-auto text-[#94A3B8] mb-3"
                              />
                              <p className="text-sm sm:text-base text-[#1E293B] font-medium">
                                Click or drag to upload image
                              </p>
                              <p className="text-xs sm:text-sm text-[#94A3B8]">
                                Recommended 800x600, JPG/PNG
                              </p>
                            </label>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                          Campaign Video (Optional)
                        </label>

                        <div className="border-2 border-dashed border-[#CBD5E1] rounded-xl p-4 sm:p-6">
                          {formData.videoPreview ? (
                            <>
                              <div className="relative max-h-40 mx-auto rounded-lg overflow-hidden bg-black flex items-center justify-center">
                                <Play size={48} className="text-white" />
                                <button
                                  type="button"
                                  onClick={handleRemoveVideo}
                                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                                >
                                  <X size={16} />
                                </button>
                              </div>

                              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                                <label className="px-4 py-2 bg-[#2D6A4F] text-white text-sm rounded-lg font-medium cursor-pointer hover:bg-[#1E3D36]">
                                  Replace Video
                                  <input
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={handleVideoUpload}
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={handleRemoveVideo}
                                  className="px-4 py-2 border border-red-200 text-red-600 text-sm rounded-lg font-medium hover:bg-red-50"
                                >
                                  Remove Video
                                </button>
                              </div>
                            </>
                          ) : (
                            <label className="block text-center cursor-pointer">
                              <input
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={handleVideoUpload}
                              />
                              <Play
                                size={40}
                                className="mx-auto text-[#94A3B8] mb-3"
                              />
                              <p className="text-sm sm:text-base text-[#1E293B] font-medium">
                                Click or drag to upload video
                              </p>
                              <p className="text-xs sm:text-sm text-[#94A3B8]">
                                MP4 format recommended
                              </p>
                            </label>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                          onClick={handleSave}
                          className="flex-1 bg-[#2D6A4F] text-white py-3 rounded-lg font-semibold hover:bg-[#1E3D36] transition-colors flex items-center justify-center gap-2"
                        >
                          <Save size={20} />
                          Save Campaign
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-6 py-3 border-2 border-[#CBD5E1] text-[#0F172A] rounded-lg font-semibold hover:bg-[#E2E8F0] transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircle size={20} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT - LIVE PREVIEW */}
                  <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-6">
                      Live Preview
                    </h2>

                    <div className="bg-white rounded-2xl shadow-lg border border-[#E2E8F0] overflow-hidden">
                      <div className="relative h-56">
                        {formData.videoPreview ? (
                          <video
                            src={formData.videoPreview}
                            className="w-full h-full object-cover"
                            controls
                          />
                        ) : formData.imagePreview ? (
                          <img
                            src={formData.imagePreview}
                            alt="Campaign"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#E2E8F0] to-[#CBD5E1] flex items-center justify-center">
                            <Image size={64} className="text-[#94A3B8]" />
                          </div>
                        )}

                        {formData.isUrgent && (
                          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white text-xs rounded-full font-bold shadow-lg">
                            <AlertCircle size={16} />
                            URGENT
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <span
                            className={`px-3 py-1.5 text-xs rounded-full font-semibold ${categoryColors[formData.category]}`}
                          >
                            {formData.category}
                          </span>
                          {formData.taxBenefits && (
                            <span className="flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                              <CheckCircle size={14} />
                              Tax Benefits
                            </span>
                          )}
                          {formData.zakatVerified && (
                            <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-semibold">
                              <Shield size={14} />
                              Zakat Verified
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-[#0F172A] mb-2 leading-tight">
                          {formData.title || "Your Campaign Title Here"}
                        </h3>

                        <p className="text-sm text-[#64748B] mb-5">
                          {formData.organization || "Organization Name"}
                        </p>

                        <div className="space-y-3 mb-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-[#2D6A4F]">
                                {formatCurrency(formData.currentAmount || 0)}
                              </p>
                              <p className="text-xs text-[#64748B]">
                                raised of{" "}
                                {formatCurrency(formData.requiredAmount || 0)}
                              </p>
                            </div>
                          </div>

                          <div className="w-full h-3 bg-[#E2E8F0] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#2D6A4F] to-[#1E3D36] rounded-full transition-all duration-500"
                              style={{
                                width: `${calculatePercentage(
                                  formData.currentAmount || 0,
                                  formData.requiredAmount || 0
                                )}%`,
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            {formData.deadline && (
                              <div className="flex items-center gap-1.5 text-[#64748B]">
                                <Clock size={16} />
                                <span className="font-medium">
                                  {Math.max(
                                    0,
                                    Math.ceil(
                                      (new Date(formData.deadline) -
                                        new Date()) /
                                      (1000 * 60 * 60 * 24)
                                    )
                                  )}{" "}
                                  days left
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <button className="w-full bg-[#2D6A4F] text-white py-3.5 rounded-xl font-bold hover:bg-[#1E3D36] transition-all transform hover:scale-[1.02] shadow-lg">
                          Donate Now
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-[#E2E8F0] rounded-xl">
                      <p className="text-sm text-[#475569]">
                        <strong className="text-[#0F172A]">Preview Tip:</strong>{" "}
                        This is how your campaign card will appear on the
                        website. Make sure all information is accurate and
                        compelling.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}