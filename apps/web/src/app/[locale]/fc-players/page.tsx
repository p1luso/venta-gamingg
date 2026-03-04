'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Trophy, ShoppingCart, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function FCPlayersPage() {
    const t = useTranslations('FCPlayers');
    const players = [
        { name: 'Kylian Mbappé', version: 'Gold Rare', rating: 91, price: 'Consultar' },
        { name: 'Erling Haaland', version: 'Gold Rare', rating: 91, price: 'Consultar' },
        { name: 'Aitana Bonmatí', version: 'Gold Rare', rating: 91, price: 'Consultar' },
        { name: 'Vini Jr.', version: 'Gold Rare', rating: 90, price: 'Consultar' },
        { name: 'Jude Bellingham', version: 'Gold Rare', rating: 90, price: 'Consultar' },
        { name: 'Alexia Putellas', version: 'Gold Rare', rating: 90, price: 'Consultar' },
        { name: 'Zinedine Zidane', version: 'Icon', rating: 94, price: 'Consultar' },
        { name: 'Ronaldo Nazário', version: 'Icon', rating: 94, price: 'Consultar' },
        { name: 'Ronaldinho', version: 'Icon', rating: 93, price: 'Consultar' },
    ];

    return (
        <div className="min-h-screen pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <h1
                            className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase mb-4 leading-tight text-[#1A1A1A] dark:text-white"
                            dangerouslySetInnerHTML={{ __html: t.raw('title').replace('text-[#00FF88]', 'text-neon-light dark:text-neon') }}
                        />
                        <p className="text-gray-400 text-lg font-medium max-w-lg">
                            {t('description')}
                        </p>
                    </div>

                    <div className="w-full md:w-96 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            className="w-full bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[var(--color-neon-light)]/50 dark:focus:border-[#00FF88]/50 transition-all text-black dark:text-white shadow-sm dark:shadow-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {players.map((player, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -5 }}
                            className="rounded-[2rem] border border-black/5 dark:border-white/5 bg-white dark:bg-[#0D0D0D] p-8 h-full flex flex-col shadow-sm hover:shadow-xl hover:border-neon-light/20 dark:hover:border-neon/20 transition-all group"
                        >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 flex items-center justify-center shadow-sm dark:shadow-none">
                                        <Trophy className="w-7 h-7 text-neon-light/60 dark:text-neon/40" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-black text-[#1A1A1A] dark:text-white italic">{player.rating}</div>
                                        <div className="text-[10px] font-bold text-neon-light dark:text-neon uppercase tracking-widest leading-none mt-1">{player.version}</div>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-[#1A1A1A] dark:text-white uppercase italic tracking-tight mb-2">{player.name}</h3>
                                <div className="text-gray-500 text-xs font-medium mb-8 uppercase tracking-widest">{t('marketPrice')} {player.price}</div>

                                <div className="mt-auto flex gap-3">
                                    <button className="flex-1 neon-button font-black uppercase italic tracking-wider py-4 rounded-xl text-xs hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all flex items-center justify-center gap-2">
                                        <ShoppingCart className="w-4 h-4" /> {t('buyNow')}
                                    </button>
                                    <button className="w-14 h-14 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                        <Info className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 p-8 md:p-12 rounded-[2.5rem] bg-white dark:bg-[#121212] border border-black/10 dark:border-white/5 flex flex-col md:flex-row items-center gap-12 justify-between shadow-sm dark:shadow-none">
                    <div className="max-w-md text-center md:text-left">
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4 text-[#1A1A1A] dark:text-white">{t('notFoundTitle')}</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{t('notFoundDesc')}</p>
                    </div>
                    <button className="w-full md:w-auto px-12 py-5 rounded-2xl bg-neon-light/10 dark:bg-neon/10 border border-neon-light/20 dark:border-neon/20 text-neon-light dark:text-neon font-black uppercase italic tracking-widest hover:bg-neon-light dark:hover:bg-neon hover:text-white dark:hover:text-black transition-all shadow-sm dark:shadow-none">
                        {t('consultNow')}
                    </button>
                </div>
            </div>
        </div>
    );
}
