'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const t = useTranslations('AIAssistant');

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none">
            {/* Chat Interface */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 w-[90vw] sm:w-[380px] h-[500px] max-h-[75vh] bg-[#121212] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto origin-bottom-right"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/5 bg-[#0A0A0A] flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#00FF88]/20 flex items-center justify-center border border-[#00FF88]/30">
                                    <Bot className="w-5 h-5 text-[#00FF88]" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black italic uppercase text-sm">{t('title')}</h3>
                                    <p className="text-[#00FF88] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse" /> {t('online')}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area - Placeholder for future Gemini integration */}
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#0D0D0D] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            <div className="flex justify-start">
                                <div className="max-w-[85%] p-3.5 rounded-2xl rounded-tl-sm bg-white/5 border border-white/5 text-sm text-gray-300 shadow-md">
                                    {t('greeting')}
                                </div>
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/5 bg-[#0A0A0A] shrink-0">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    placeholder={t('placeholder')}
                                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-full py-3 pl-4 pr-12 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00FF88]/50 transition-colors"
                                />
                                <button className="absolute right-2 p-2 rounded-full bg-[#00FF88] text-black hover:scale-105 transition-transform">
                                    <Send className="w-4 h-4 ml-0.5" />
                                </button>
                            </div>
                            <div className="text-center mt-2.5">
                                <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">{t('poweredBy')}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-[#00FF88] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,255,136,0.5)] cursor-pointer text-black transition-transform pointer-events-auto relative"
                >
                    <Bot className="w-7 h-7" />
                    {/* Unread badge indicator */}
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-[#0A0A0A] rounded-full animate-pulse" />
                </motion.button>
            )}
        </div>
    );
}
