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
    ];

    return (
        <div className="min-h-screen pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <h1
                            className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase mb-4 leading-tight"
                            dangerouslySetInnerHTML={{ __html: t.raw('title') }}
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
                            className="w-full bg-[#121212] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#00FF88]/50 transition-all"
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
                            className="p-1 rounded-[2rem] bg-gradient-to-br from-white/10 to-transparent group"
                        >
                            <div className="bg-[#0D0D0D] rounded-[1.9rem] p-8 h-full flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-[#121212] border border-white/5 flex items-center justify-center">
                                        <Trophy className="w-7 h-7 text-[#00FF88]/40" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-black text-white italic">{player.rating}</div>
                                        <div className="text-[10px] font-bold text-[#00FF88] uppercase tracking-widest leading-none mt-1">{player.version}</div>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tight mb-2">{player.name}</h3>
                                <div className="text-gray-500 text-xs font-medium mb-8 uppercase tracking-widest">{t('marketPrice')} {player.price}</div>

                                <div className="mt-auto flex gap-3">
                                    <button className="flex-1 bg-[#00FF88] text-black font-black uppercase italic tracking-wider py-4 rounded-xl text-xs hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all flex items-center justify-center gap-2">
                                        <ShoppingCart className="w-4 h-4" /> {t('buyNow')}
                                    </button>
                                    <button className="w-14 h-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors">
                                        <Info className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 p-8 md:p-12 rounded-[2.5rem] bg-[#121212] border border-white/5 flex flex-col md:flex-row items-center gap-12 justify-between">
                    <div className="max-w-md text-center md:text-left">
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">{t('notFoundTitle')}</h2>
                        <p className="text-gray-400 text-sm">{t('notFoundDesc')}</p>
                    </div>
                    <button className="w-full md:w-auto px-12 py-5 rounded-2xl bg-[#00FF88]/10 border border-[#00FF88]/20 text-[#00FF88] font-black uppercase italic tracking-widest hover:bg-[#00FF88] hover:text-black transition-all">
                        {t('consultNow')}
                    </button>
                </div>
            </div>
        </div>
    );
}
