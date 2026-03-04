'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, ShieldCheck, Zap, Star, MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function BoostingPage() {
    const t = useTranslations('Boosting');
    return (
        <div className="min-h-screen pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-light/10 dark:bg-neon/10 border border-neon-light/20 dark:border-neon/20 mb-6 font-bold text-[10px] tracking-widest text-neon-light dark:text-neon uppercase italic">
                            {t('eliteService')}
                        </div>
                        <h1
                            className="text-5xl md:text-6xl xl:text-7xl font-black italic tracking-tighter uppercase mb-6 leading-[0.9] text-[#1A1A1A] dark:text-white"
                            dangerouslySetInnerHTML={{ __html: t.raw('title').replace('text-[#00FF88]', 'text-neon-light dark:text-neon') }}
                        />
                        <p className="text-gray-600 dark:text-gray-400 text-lg mb-12 font-medium max-w-lg">
                            {t('description')}
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <button className="px-8 py-4 neon-button font-black uppercase italic tracking-wider rounded-xl text-sm hover:shadow-[0_0_30px_rgba(0,255,136,0.6)] transition-all">
                                {t('viewPlans')}
                            </button>
                            <button className="px-8 py-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#1A1A1A] dark:text-white font-black uppercase italic tracking-wider rounded-xl text-sm hover:bg-black/10 dark:hover:bg-white/10 transition-all">
                                {t('successCases')}
                            </button>
                        </div>
                    </motion.div>

                    <div className="relative">
                        <div className="absolute -inset-10 bg-[var(--color-neon-light)]/10 dark:bg-[#00FF88]/10 blur-[120px] rounded-full -z-10 transition-colors" />
                        <div className="p-1 rounded-[3rem] bg-gradient-to-br from-black/10 dark:from-white/20 via-transparent to-transparent">
                            <div className="bg-[#FAFAFA] dark:bg-[#0A0A0A] rounded-[2.9rem] p-10 relative overflow-hidden shadow-sm dark:shadow-none">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-14 h-14 rounded-2xl bg-neon-light/10 dark:bg-neon/10 flex items-center justify-center border border-neon-light/20 dark:border-neon/20">
                                        <Rocket className="w-8 h-8 text-neon-light dark:text-neon" />
                                    </div>
                                    <div>
                                        <div className="text-xl font-black uppercase italic text-[#1A1A1A] dark:text-white tracking-tight">{t('finalsBoost')}</div>
                                        <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">{t('rankGuaranteed')}</div>
                                    </div>
                                </div>

                                <div className="space-y-6 mb-10">
                                    {[1, 2, 3, 4].map((item) => (
                                        <div key={item} className="flex items-center justify-between py-4 border-b border-black/5 dark:border-white/5 last:border-0">
                                            <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">{t('playerQuality')}</span>
                                            <span className="text-[#1A1A1A] dark:text-white text-sm font-bold uppercase italic tracking-tight">{t('proElite')}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between p-6 rounded-2xl bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 shadow-sm dark:shadow-none">
                                    <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{t('startingFrom')}</div>
                                    <div className="text-3xl font-black text-neon-light dark:text-neon italic tracking-tighter">$49.99</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: ShieldCheck, title: t('vpnSecurity'), desc: t('vpnSecurityDesc') },
                        { icon: Zap, title: t('proPlayers'), desc: t('proPlayersDesc') },
                        { icon: Star, title: t('liveTracking'), desc: t('liveTrackingDesc') },
                    ].map((item, i) => (
                        <div key={i} className="p-10 rounded-[2.5rem] bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-[#00FF88]/20 transition-all flex flex-col items-center text-center shadow-sm dark:shadow-none group">
                            <div className="w-16 h-16 rounded-3xl bg-neon-light/10 dark:bg-neon/10 flex items-center justify-center mb-8 border border-neon-light/20 dark:border-neon/20 group-hover:scale-110 transition-transform">
                                <item.icon className="w-8 h-8 text-neon-light dark:text-neon" />
                            </div>
                            <h3 className="text-xl font-black uppercase italic tracking-tight text-[#1A1A1A] dark:text-white mb-4">{item.title}</h3>
                            <p className="text-gray-600 dark:text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-32 text-center">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8 text-[#1A1A1A] dark:text-white">{t('doubtsTitle')}</h2>
                    <button className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl neon-button font-black uppercase italic tracking-widest hover:shadow-[0_0_30px_rgba(0,255,136,0.5)] transition-all">
                        <MessageCircle className="w-5 h-5 fill-current" /> {t('talkToSpecialist')}
                    </button>
                </div>
            </div>
        </div>
    );
}
