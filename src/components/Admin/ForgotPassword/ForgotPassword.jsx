"use client";

import { useState } from "react";
import { useForgotPasswordAdminMutation, useResetPasswordAdminMutation } from "@/utils/slices/adminApiSlice";

export default function ForgotPassword() {
    const [currentStep, setCurrentStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [forgotPasswordAdmin, { isLoading: sendingOtp }] =
        useForgotPasswordAdminMutation();

    const [resetPasswordAdmin, { isLoading: resettingPassword }] =
        useResetPasswordAdminMutation();

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // API functions
    const handleSendOtp = async () => {
        try {
            setError("");
            setSuccess("");

            const res = await forgotPasswordAdmin({ email }).unwrap();

            setSuccess(res.message || "OTP sent successfully!");

            setTimeout(() => {
                setSuccess("");
                setCurrentStep(2);
            }, 1000);
        } catch (err) {
            setError(err?.data?.message || "Failed to send OTP");
        }
    };

    const handleResetPassword = async () => {
        try {
            setError("");
            setSuccess("");

            if (newPassword !== confirmPassword) {
                setError("Passwords do not match!");
                return;
            }

            if (newPassword.length < 8) {
                setError("Password must be at least 8 characters long!");
                return;
            }

            const otpString = otp.join("");

            const res = await resetPasswordAdmin({
                email,
                otp: otpString,
                password: newPassword,
            }).unwrap();

            setSuccess(res.message || "Password reset successful!");

            setTimeout(() => {
                window.location.href = "/";
            }, 1500);

        } catch (err) {
            setError(err?.data?.message || "Failed to reset password");
        }
    };

    // Handle OTP input change
    const handleOtpChange = (index, value) => {
        // Only allow numbers
        if (!/^\d*$/.test(value)) return;
        if (value.length > 1) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    // Handle OTP backspace
    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    // Handle OTP paste
    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
        setOtp(newOtp.slice(0, 6));

        // Focus last filled input or next empty
        const nextIndex = Math.min(pastedData.length, 5);
        document.getElementById(`otp-${nextIndex}`)?.focus();
    };

    // Handle form submissions
    const handleStep1Submit = (e) => {
        e.preventDefault();
        if (!email) {
            setError("Please enter your email address");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            return;
        }
        handleSendOtp();
    };

    const handleStep2Submit = (e) => {
        e.preventDefault();
        const otpString = otp.join("");

        if (otpString.length !== 6) {
            setError("Please enter the complete 6-digit OTP");
            return;
        }

        setError("");
        setCurrentStep(3);
    };

    const handleStep3Submit = (e) => {
        e.preventDefault();
        handleResetPassword();
    };

    // Password strength checker
    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: "", color: "" };
        
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

        const levels = [
            { strength: 1, label: "Weak", color: "bg-red-500" },
            { strength: 2, label: "Fair", color: "bg-yellow-500" },
            { strength: 3, label: "Good", color: "bg-blue-500" },
            { strength: 4, label: "Strong", color: "bg-emerald-500" },
        ];

        return levels.find(l => l.strength === strength) || levels[0];
    };

    const passwordStrength = getPasswordStrength(newPassword);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Enhanced Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-emerald-200/40 to-emerald-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-emerald-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-emerald-100/40 to-blue-100/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
                
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Enhanced Progress Indicator */}
                <div className="mb-8 bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 shadow-emerald-100/20">
                    <div className="flex items-center justify-between mb-4">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="flex items-center flex-1">
                                <div className="flex items-center justify-center relative">
                                    <div
                                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                                            currentStep >= step
                                                ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-300/50 scale-110 ring-4 ring-emerald-100"
                                                : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 shadow-sm"
                                        }`}
                                    >
                                        {currentStep > step ? (
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            step
                                        )}
                                    </div>
                                    {step < 3 && (
                                        <div className="relative mx-2 sm:mx-3 flex-1">
                                            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                                                        currentStep > step 
                                                            ? "w-full bg-gradient-to-r from-emerald-500 to-emerald-600" 
                                                            : "w-0"
                                                    }`}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs font-semibold px-1">
                        <span className={`transition-all duration-300 ${currentStep === 1 ? "text-emerald-600 scale-105" : "text-gray-400"}`}>
                            Email
                        </span>
                        <span className={`transition-all duration-300 ${currentStep === 2 ? "text-emerald-600 scale-105" : "text-gray-400"}`}>
                            Verify OTP
                        </span>
                        <span className={`transition-all duration-300 ${currentStep === 3 ? "text-emerald-600 scale-105" : "text-gray-400"}`}>
                            New Password
                        </span>
                    </div>
                </div>

                {/* Enhanced Main Card */}
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden transition-all duration-500 hover:shadow-emerald-200/30">
                    {/* Enhanced Header */}
                    <div className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 opacity-95"></div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
                        
                        <div className="relative px-8 py-10 text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 shadow-xl shadow-emerald-900/20 border border-white/30 transform hover:scale-105 transition-all duration-300">
                                <svg
                                    className="w-11 h-11 text-white drop-shadow-lg"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-sm">
                                Reset Password
                            </h1>
                            <p className="text-emerald-50 text-sm leading-relaxed max-w-xs mx-auto">
                                {currentStep === 1 && "Enter your registered email address"}
                                {currentStep === 2 && "Verify the code sent to your inbox"}
                                {currentStep === 3 && "Create a strong new password"}
                            </p>
                        </div>
                    </div>

                    <div className="p-8">
                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-50/50 border-l-4 border-red-500 rounded-xl text-red-700 text-sm flex items-start animate-shake shadow-sm">
                                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                                    <svg
                                        className="w-5 h-5 text-red-600"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="flex-1 pt-1">
                                    <p className="font-semibold mb-1">Error</p>
                                    <p className="text-xs">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-emerald-50/50 border-l-4 border-emerald-500 rounded-xl text-emerald-700 text-sm flex items-start animate-slideIn shadow-sm">
                                <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                                    <svg
                                        className="w-5 h-5 text-emerald-600"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="flex-1 pt-1">
                                    <p className="font-semibold mb-1">Success</p>
                                    <p className="text-xs">{success}</p>
                                </div>
                            </div>
                        )}

                        {/* Step 1: Enter Email */}
                        {currentStep === 1 && (
                            <form onSubmit={handleStep1Submit} className="space-y-6 animate-fadeIn">
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-bold text-gray-700 mb-3"
                                    >
                                        Email Address
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg flex items-center justify-center group-focus-within:from-emerald-200 group-focus-within:to-emerald-100 transition-all duration-300">
                                                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                                </svg>
                                            </div>
                                        </div>
                                        <input
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-16 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all duration-300 text-gray-800 font-medium placeholder:text-gray-400 placeholder:font-normal bg-white hover:border-gray-300"
                                            placeholder="admin@tpfaid.org"
                                            disabled={sendingOtp}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={sendingOtp}
                                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-600/40 hover:-translate-y-0.5 active:translate-y-0 transform group"
                                >
                                    {sendingOtp ? (
                                        <>
                                            <svg
                                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            <span>Sending verification code...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Send Verification Code</span>
                                            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Step 2: Enter OTP */}
                        {currentStep === 2 && (
                            <form onSubmit={handleStep2Submit} className="space-y-6 animate-fadeIn">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-5 text-center">
                                        Enter 6-Digit Verification Code
                                    </label>
                                    <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                id={`otp-${index}`}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                className="w-12 h-16 sm:w-14 sm:h-18 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all duration-300 bg-gradient-to-br from-white to-gray-50 hover:border-emerald-300 shadow-sm hover:shadow-md"
                                            />
                                        ))}
                                    </div>
                                    <div className="mt-4 text-center space-y-2">
                                        <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            Code sent to <span className="font-semibold text-gray-700">{email}</span>
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-600/40 hover:-translate-y-0.5 active:translate-y-0 transform group"
                                >
                                    <span>Verify Code</span>
                                    <svg className="w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setCurrentStep(1);
                                        setOtp(["", "", "", "", "", ""]);
                                        setError("");
                                    }}
                                    className="w-full text-emerald-600 hover:text-emerald-700 font-semibold text-sm transition-all duration-200 py-3 hover:bg-emerald-50 rounded-xl flex items-center justify-center gap-2 group"
                                >
                                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Change Email Address
                                </button>
                            </form>
                        )}

                        {/* Step 3: Reset Password */}
                        {currentStep === 3 && (
                            <form onSubmit={handleStep3Submit} className="space-y-6 animate-fadeIn">
                                <div>
                                    <label
                                        htmlFor="newPassword"
                                        className="block text-sm font-bold text-gray-700 mb-3"
                                    >
                                        New Password
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            id="newPassword"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all duration-300 pr-12 font-medium bg-white hover:border-gray-300"
                                            placeholder="Enter your new password"
                                            disabled={resettingPassword}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg"
                                        >
                                            {showNewPassword ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {/* Password Strength Indicator */}
                                    {newPassword && (
                                        <div className="mt-4 space-y-3 animate-fadeIn">
                                            <div className="flex gap-1.5">
                                                {[1, 2, 3, 4].map((level) => (
                                                    <div
                                                        key={level}
                                                        className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                                                            level <= passwordStrength.strength
                                                                ? passwordStrength.color
                                                                : "bg-gray-200"
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <p className={`text-sm font-bold ${
                                                passwordStrength.strength <= 2 ? "text-yellow-600" : "text-emerald-600"
                                            }`}>
                                                Strength: {passwordStrength.label}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block text-sm font-bold text-gray-700 mb-3"
                                    >
                                        Confirm Password
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all duration-300 pr-12 font-medium bg-white hover:border-gray-300"
                                            placeholder="Confirm your new password"
                                            disabled={resettingPassword}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg"
                                        >
                                            {showConfirmPassword ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {confirmPassword && (
                                        <div className="mt-3 flex items-center gap-2 text-sm animate-fadeIn">
                                            {newPassword === confirmPassword ? (
                                                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="font-bold">Passwords match</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="font-bold">Passwords don't match</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Password Requirements */}
                                <div className="bg-gradient-to-br from-slate-50 to-emerald-50/30 border-2 border-emerald-100 rounded-xl p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <p className="font-bold text-sm text-gray-700">
                                            Password Requirements
                                        </p>
                                    </div>
                                    <ul className="space-y-2 text-sm">
                                        <li className={`flex items-center gap-3 transition-colors duration-300 ${newPassword.length >= 8 ? "text-emerald-700" : "text-gray-600"}`}>
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${newPassword.length >= 8 ? "bg-emerald-500" : "bg-gray-300"}`}>
                                                {newPassword.length >= 8 ? (
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                ) : (
                                                    <span className="w-2 h-2 bg-white rounded-full"></span>
                                                )}
                                            </div>
                                            <span className={newPassword.length >= 8 ? "font-semibold" : ""}>At least 8 characters</span>
                                        </li>
                                        <li className={`flex items-center gap-3 transition-colors duration-300 ${(/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) ? "text-emerald-700" : "text-gray-600"}`}>
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${(/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) ? "bg-emerald-500" : "bg-gray-300"}`}>
                                                {(/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) ? (
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                ) : (
                                                    <span className="w-2 h-2 bg-white rounded-full"></span>
                                                )}
                                            </div>
                                            <span className={(/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) ? "font-semibold" : ""}>Uppercase & lowercase letters</span>
                                        </li>
                                        <li className={`flex items-center gap-3 transition-colors duration-300 ${(/\d/.test(newPassword) && /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) ? "text-emerald-700" : "text-gray-600"}`}>
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${(/\d/.test(newPassword) && /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) ? "bg-emerald-500" : "bg-gray-300"}`}>
                                                {(/\d/.test(newPassword) && /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) ? (
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                ) : (
                                                    <span className="w-2 h-2 bg-white rounded-full"></span>
                                                )}
                                            </div>
                                            <span className={(/\d/.test(newPassword) && /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) ? "font-semibold" : ""}>Numbers & special characters</span>
                                        </li>
                                    </ul>
                                </div>

                                <button
                                    type="submit"
                                    disabled={resettingPassword}
                                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-600/40 hover:-translate-y-0.5 active:translate-y-0 transform group"
                                >
                                    {resettingPassword ? (
                                        <>
                                            <svg
                                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            <span>Updating your password...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Reset Password</span>
                                            <svg className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Back to Login */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                                <a
                                href="/"
                                className="text-sm text-gray-600 hover:text-emerald-600 font-semibold transition-all duration-300 flex items-center justify-center gap-2 px-4 py-3 rounded-xl hover:bg-emerald-50 group"
                            >
                                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span>Back to Login</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Enhanced Footer */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500 mb-2">Need assistance?</p>
                    <a href="mailto:support@tpfaid.org" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-200 inline-flex items-center gap-2 hover:gap-3">
                        Contact Support Team
                        <svg className="w-4 h-4 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </a>
                </div>
            </div>

            <style jsx>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(20px, -50px) scale(1.1); }
                    50% { transform: translate(-20px, 20px) scale(0.9); }
                    75% { transform: translate(50px, 50px) scale(1.05); }
                }
                
                .animate-blob {
                    animation: blob 25s infinite;
                }
                
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                
                .animation-delay-4000 {
                    animation-delay: 4s;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(-10px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }

                .animate-slideIn {
                    animation: slideIn 0.4s ease-out;
                }

                .animate-shake {
                    animation: shake 0.5s ease-out;
                }
            `}</style>
        </div>
    );
}