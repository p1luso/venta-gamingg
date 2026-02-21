'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Globe, ChevronDown, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const t = useTranslations('Navbar');
  const pathname = usePathname();
  const router = useRouter();

  // Get current locale from pathname
  const currentLocale = pathname.split('/')[1] || 'es';

  const switchLocale = (newLocale: string) => {
    const path = pathname.split('/').slice(2).join('/');
    router.push(`/${newLocale}/${path}`);
    setIsLangOpen(false);
  };

  return (
    <nav className="h-20 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link href={`/${currentLocale}`} className="flex items-center gap-2 group">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 bg-[#00FF88] rounded-xl rotate-0 group-hover:rotate-6 transition-transform duration-300" />
            <div className="absolute inset-0 bg-[#00FF88]/20 rounded-xl rotate-0 group-hover:-rotate-6 transition-transform duration-300 backdrop-blur-sm" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-black font-black text-xl italic relative z-10">V</span>
            </div>
          </div>
          <span className="text-xl font-black tracking-tighter text-white uppercase italic">
            Venta<span className="text-[#00FF88] drop-shadow-[0_0_10px_rgba(0,255,136,0.5)]">Gaming</span>
          </span>
        </Link>

        {/* Search Bar - Diffused edges */}
        <div className="flex-1 max-w-xl relative group hidden md:block">
          <div className={`absolute inset-0 bg-[#00FF88]/5 blur-xl transition-opacity duration-300 ${isSearchFocused ? 'opacity-100' : 'opacity-0'}`} />
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-gray-500 group-focus-within:text-[#00FF88] transition-colors" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00FF88]/50 focus:bg-white/10 transition-all"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="hidden md:flex items-center gap-1.5 hover:text-white transition-colors text-sm font-medium text-gray-400"
            >
              <Globe className="w-4 h-4" />
              {currentLocale === 'en' ? 'EN / USD' : 'ES / USD'}
              <ChevronDown className={`w-3 h-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-32 bg-[#111111] border border-white/10 rounded-xl overflow-hidden shadow-xl z-50"
                >
                  <button 
                    onClick={() => switchLocale('en')}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors ${currentLocale === 'en' ? 'text-[#00FF88] font-bold' : 'text-gray-400'}`}
                  >
                    English (EN)
                  </button>
                  <button 
                    onClick={() => switchLocale('es')}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors ${currentLocale === 'es' ? 'text-[#00FF88] font-bold' : 'text-gray-400'}`}
                  >
                    Español (ES)
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = 'http://localhost:3001/api/v1/auth/google'}
            className="flex items-center gap-2 bg-[#00FF88] text-black px-6 py-2.5 rounded-full font-black text-sm uppercase italic tracking-wide hover:shadow-[0_0_30px_rgba(0,255,136,0.6)] transition-all relative overflow-hidden group/btn"
          >
            <div className="absolute inset-0 bg-white/40 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500 skew-x-12" />
            <LogIn className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{t('login')}</span>
          </motion.button>
        </div>
      </div>
    </nav>
  );
}