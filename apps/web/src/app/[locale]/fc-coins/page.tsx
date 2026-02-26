'use client';

import React from 'react';
import Calculator from '@/components/Calculator';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, CreditCard, HelpCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function FCCoinsPage() {
    const t = useTranslations('FCCoins');

    return (
        <div className="min-h-screen pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1
                            className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase mb-6 leading-tight"
                            dangerouslySetInnerHTML={{ __html: t.raw('title') }}
                        />
                        <p className="text-gray-400 text-lg mb-12 font-medium max-w-lg">
                            {t('description')}
                        </p>

                        <div className="space-y-8">
                            {[
                                {
                                    icon: Zap,
                                    title: t('instantDelivery'),
                                    desc: t('instantDeliveryDesc')
                                },
                                {
                                    icon: ShieldCheck,
                                    title: t('secureTransactions'),
                                    desc: t('secureTransactionsDesc')
                                },
                                {
                                    icon: CreditCard,
                                    title: t('support'),
                                    desc: t('supportDesc')
                                },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-6 items-start">
                                    <div className="w-12 h-12 rounded-2xl bg-[#00FF88]/10 flex items-center justify-center shrink-0 border border-[#00FF88]/20">
                                        <item.icon className="w-6 h-6 text-[#00FF88]" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1 uppercase italic tracking-tight">{item.title}</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 p-6 rounded-2xl bg-[#121212] border border-white/5 flex items-center gap-4">
                            <HelpCircle className="w-10 h-10 text-[#00FF88]/40" />
                            <div>
                                <h4 className="font-bold text-sm">{t('support')}</h4>
                                <p className="text-xs text-gray-500">{t('supportDesc')}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Content - Calculator */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="sticky top-32"
                    >
                        <div className="absolute -inset-4 bg-[#00FF88]/5 blur-3xl rounded-3xl -z-10" />
                        <Calculator />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
