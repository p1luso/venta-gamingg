'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, MessageCircle, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function Footer({ tpScore = '4.8', tpTotal = 500 }) {
    const t = useTranslations('Footer');

    return (
        <footer className="pt-20 md:pt-24 pb-32 md:pb-16 border-t border-black/5 dark:border-white/5 bg-[#FDFCF9] dark:bg-black/40 relative overflow-hidden">
            {/* Trustpilot Banner */}
            <div className="max-w-7xl mx-auto px-6 mb-20">
                <div className="p-8 md:p-12 rounded-[2.5rem] bg-white dark:bg-gradient-to-br dark:from-[#121212] dark:to-[#0A0A0A] border border-black/5 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group shadow-sm dark:shadow-none">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B67A]/5 blur-3xl -z-10 group-hover:bg-[#00B67A]/10 transition-colors duration-700" />

                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="flex items-center gap-3 mb-4">
                            <svg viewBox="0 0 126 31" className="h-6 w-auto" fill="none">
                                <path d="M24.8 0H1.5C.7 0 0 .7 0 1.5v27c0 .8.7 1.5 1.5 1.5h23.3c.8 0 1.5-.7 1.5-1.5v-27C26.3.7 25.6 0 24.8 0z" fill="#00B67A" />
                                <path d="M13.1 10.3l1.7 5.3h5.5l-4.5 3.2 1.7 5.3-4.4-3.3-4.5 3.3 1.7-5.3-4.4-3.2h5.5l1.7-5.3z" fill="#fff" />
                            </svg>
                            <span className="text-2xl font-black uppercase italic tracking-tight text-gray-900 dark:text-white">Trustpilot</span>
                        </div>
                        <div className="flex gap-1.5 mb-2">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-6 h-6 text-[#00B67A] fill-[#00B67A]" />)}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 font-medium">{t('reviewsText')}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full md:w-auto">
                        { [
                            { name: 'Juan M.', text: 'Increíble servicio' },
                            { name: 'Santi R.', text: 'El más rápido' },
                            { name: 'Nico F.', text: '100% confiable' },
                        ].map((rev, i) => (
                            <div key={i} className="px-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 flex flex-col gap-1">
                                <div className="text-xs font-bold text-gray-900 dark:text-white">{rev.name}</div>
                                <div className="text-[10px] text-gray-500 italic">"{rev.text}"</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-16 md:mb-20">
                    <div className="sm:col-span-2 lg:col-span-2">
                        <div className="flex items-center gap-3 mb-6 group">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-[0_0_15px_rgba(0,255,136,0.3)]">
                                <Image
                                    src="/Icon.svg"
                                    alt="Venta Gaming Logo"
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                />
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white uppercase italic">
                                Venta<span className="text-[#00FF88]">Gamingg</span>
                            </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-500 text-sm max-w-sm mb-8 leading-relaxed">
                            {t('description')}
                        </p>
                        <div className="flex flex-wrap items-center gap-6 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                            <div className="h-6 w-auto bg-black/10 dark:bg-white/20 px-3 rounded text-[10px] flex items-center font-bold text-gray-900 dark:text-white tracking-widest italic">VISA</div>
                            <div className="h-6 w-auto bg-black/10 dark:bg-white/20 px-3 rounded text-[10px] flex items-center font-bold text-gray-900 dark:text-white tracking-widest italic">MASTERCARD</div>
                            <div className="h-6 w-auto bg-black/10 dark:bg-white/20 px-3 rounded text-[10px] flex items-center font-bold text-gray-900 dark:text-white tracking-widest italic">STRIPE</div>
                            <div className="h-6 w-auto bg-black/10 dark:bg-white/20 px-3 rounded text-[10px] flex items-center font-bold text-gray-900 dark:text-white tracking-widest italic">MP</div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-gray-900 dark:text-white font-bold mb-6 text-sm uppercase tracking-widest">{t('legal')}</h4>
                        <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-500 font-medium">
                            <li><Link href="/terminos" className="hover:text-[#00FF88] transition-colors">{t('terms')}</Link></li>
                            <li><Link href="/privacy" className="hover:text-[#00FF88] transition-colors">{t('privacy')}</Link></li>
                            <li><Link href="/reembolsos" className="hover:text-[#00FF88] transition-colors">{t('refund')}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-gray-900 dark:text-white font-bold mb-6 text-sm uppercase tracking-widest">{t('support')}</h4>
                        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-[#00FF88]/10 border border-[#00FF88]/20 text-[#00FF88] font-bold text-sm cursor-pointer hover:bg-[#00FF88]/20 transition-all">
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4 md:gap-6 text-[10px] md:text-xs text-gray-500 md:text-gray-600 font-medium">
                    <p>{t('rights')}</p>
                    <div className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-[#00FF88]" />
                        <span>{t('secureSite')}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
