'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Sparkles, Shield, Zap } from 'lucide-react';

const LoadingScreen = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simulate loading progress
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => onComplete?.(), 500);
                    return 100;
                }
                return prev + 2;
            });
        }, 30);

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-900 overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)]"
                    style={{ backgroundSize: '50px 50px' }} />
            </div>

            {/* Floating Particles */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-emerald-300/30 rounded-full"
                    initial={{
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                    }}
                    animate={{
                        y: [null, Math.random() * window.innerHeight],
                        x: [null, Math.random() * window.innerWidth],
                    }}
                    transition={{
                        duration: Math.random() * 10 + 10,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
            ))}

            {/* Main Content */}
            <div className="relative h-full flex flex-col items-center justify-center px-4">
                {/* Logo Animation */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-8"
                >
                    <div className="relative">
                        {/* Pulsing Ring */}
                        <motion.div
                            className="absolute inset-0 rounded-full bg-emerald-400/20"
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 0.2, 0.5],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            style={{ width: '120px', height: '120px', margin: '-10px' }}
                        />

                        {/* Logo Container */}
                        <div className="relative w-24 h-24 bg-white rounded-2xl shadow-2xl flex items-center justify-center">
                            <motion.img
                                src="/TPFAid-LogoDesign-20.svg"
                                alt="TPF Aid"
                                className="w-16 h-16"
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />
                        </div>

                        {/* Orbiting Icons */}
                        {[Shield, Sparkles, Zap].map((Icon, index) => (
                            <motion.div
                                key={index}
                                className="absolute"
                                style={{
                                    top: '50%',
                                    left: '50%',
                                }}
                                animate={{
                                    rotate: 360,
                                }}
                                transition={{
                                    duration: 8,
                                    repeat: Infinity,
                                    ease: "linear",
                                    delay: index * 0.3,
                                }}
                            >
                                <motion.div
                                    style={{
                                        x: Math.cos((index * 120 * Math.PI) / 180) * 60,
                                        y: Math.sin((index * 120 * Math.PI) / 180) * 60,
                                    }}
                                    className="w-8 h-8 bg-emerald-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center"
                                >
                                    <Icon className="w-4 h-4 text-emerald-300" />
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Welcome Text */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                        Welcome Back
                    </h1>
                    <motion.p
                        className="text-emerald-200 text-lg"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        Preparing your workspace...
                    </motion.p>
                </motion.div>

                {/* Progress Bar */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <div className="relative">
                        {/* Progress Background */}
                        <div className="h-2 bg-emerald-950/50 rounded-full overflow-hidden backdrop-blur-sm">
                            {/* Progress Fill */}
                            <motion.div
                                className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 rounded-full relative"
                                style={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Shimmer Effect */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                />
                            </motion.div>
                        </div>

                        {/* Progress Percentage */}
                        <motion.div
                            className="text-center mt-3 text-emerald-200 font-semibold text-sm"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            {progress}%
                        </motion.div>
                    </div>
                </motion.div>

                {/* Loading Steps */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 flex gap-2"
                >
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 bg-emerald-400 rounded-full"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 1, 0.3],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                        />
                    ))}
                </motion.div>
            </div>

            {/* Bottom Decoration */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
    );
};

export default LoadingScreen;
