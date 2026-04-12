'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search, Globe, ChevronDown, LogIn, User,
  LayoutGrid, Coins, Users, Rocket, Menu, X, Star, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Navbar() {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [countryCode, setCountryCode] = useState<string | null>(null);

  const t = useTranslations('Navbar');
  const pathname = usePathname();
  const router = useRouter();

  const currentLocale = pathname.split('/')[1] || 'es';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    fetch('https://api.country.is/')
      .then(res => res.json())
      .then(data => {
        if (data.country) {
          const code = data.country.toLowerCase();
          setCountryCode(code);

          // Auto-language based on country (only runs once per user)
          if (!localStorage.getItem('has_auto_localized')) {
            localStorage.setItem('has_auto_localized', 'true');
            // List of Spanish-speaking country codes
            const esCountries = ['ar', 'es', 'uy', 'cl', 'co', 'mx', 'pe', 've', 'bo', 'py', 'ec', 'cr', 'pa', 'do', 'gt', 'hn', 'sv', 'ni', 'pr'];
            const targetLocale = esCountries.includes(code) ? 'es' : 'en';

            if (currentLocale !== targetLocale) {
              const currentPath = window.location.pathname.split('/').slice(2).join('/');
              router.push(`/${targetLocale}/${currentPath}`);
            }
          }
        } else {
           setCountryCode(currentLocale === 'en' ? 'us' : 'ar');
        }
      })
      .catch(() => {
        setCountryCode(currentLocale === 'en' ? 'us' : 'ar');
      });

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      localStorage.setItem('auth_token', token);
      window.history.replaceState({}, document.title, window.location.pathname);
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userData = { name: payload.name || payload.email || 'User' };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } catch (e) {
        console.error('Error decoding token', e);
      }
    } else {
      const storedUser = localStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const switchLocale = (newLocale: string) => {
    const path = pathname.split('/').slice(2).join('/');
    router.push(`/${newLocale}/${path}`);
    setIsLangOpen(false);
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false); // Close mobile menu if open
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    setIsProfileOpen(false);
    router.push(`/${currentLocale}`);
    window.location.reload();
  };

  const navLinks = [
    { name: t('fcCoins'), href: `/${currentLocale}/fc-coins`, icon: Coins },
    { name: t('fcPlayers'), href: `/${currentLocale}/fc-players`, icon: Users },
    { name: t('boosting'), href: `/${currentLocale}/boosting`, icon: Rocket },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled || isMobileMenuOpen ? 'bg-white/95 dark:bg-[#0A0A0A]/95 border-b border-black/5 dark:border-white/5 backdrop-blur-3xl' : 'bg-transparent'
      }`}>
      <div className="max-w-7xl mx-auto h-16 md:h-20 px-3 sm:px-4 md:px-6 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo */}
        <Link href={`/${currentLocale}`} className="flex items-center gap-1.5 sm:gap-2 group shrink-0" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full overflow-hidden shadow-[0_0_15px_rgba(0,255,136,0.2)] md:shadow-[0_0_15px_rgba(0,255,136,0.3)] group-hover:shadow-[0_0_25px_rgba(0,255,136,0.5)] transition-all duration-300">
            <Image
              src="/Icon.svg"
              alt="Venta Gaming Logo"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 28px, (max-width: 768px) 32px, 40px"
              priority
            />
          </div>
          <span className="hidden sm:block text-[11px] sm:text-sm md:text-xl font-black tracking-tighter text-black dark:text-white uppercase italic truncate">
            Venta<span className="text-[var(--color-neon-light)] dark:text-neon">Gamingg</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {/* Services Dropdown */}
          <div className="relative">
            <button
              onMouseEnter={() => setIsServicesOpen(true)}
              onMouseLeave={() => setIsServicesOpen(false)}
              className="flex items-center gap-1.5 text-sm font-bold uppercase italic tracking-wider text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors py-2"
            >
              <LayoutGrid className="w-4 h-4" />
              {t('catalog')}
              <ChevronDown className={`w-3 h-3 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isServicesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onMouseEnter={() => setIsServicesOpen(true)}
                  onMouseLeave={() => setIsServicesOpen(false)}
                  className="absolute top-full left-0 w-64 pt-2"
                >
                  <div className="bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-xl">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-[#00FF88]/10 hover:text-[var(--color-neon-light)] dark:hover:text-neon group transition-all text-black dark:text-white"
                      >
                        <link.icon className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-[var(--color-neon-light)] dark:group-hover:text-neon" />
                        <span className="text-sm font-bold uppercase italic tracking-tight">{link.name}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href={`/${currentLocale}/fc-coins`} className="text-sm font-bold uppercase italic tracking-wider text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">{t('fcCoins')}</Link>
          <Link href={`/${currentLocale}/boosting`} className="text-sm font-bold uppercase italic tracking-wider text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">{t('boosting')}</Link>
        </div>

        {/* Right Actions - Desktop & Mobile */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-6 shrink-0">
          {countryCode && (
            <div className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 shrink-0" title={countryCode.toUpperCase()}>
              <img src={`https://flagcdn.com/w20/${countryCode}.png`} alt={countryCode} className="rounded-[2px] object-cover w-3.5 sm:w-4 md:w-5 shadow-sm" />
            </div>
          )}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors text-[10px] sm:text-sm font-bold uppercase italic text-gray-500 dark:text-gray-400"
            >
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{currentLocale === 'en' ? 'EN' : 'ES'}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 rounded-xl overflow-hidden shadow-xl z-50 text-black dark:text-white"
                >
                  <button onClick={() => switchLocale('en')} className={`w-full text-left px-4 py-3 text-xs font-bold uppercase italic hover:bg-black/5 dark:hover:bg-white/5 ${currentLocale === 'en' ? 'text-[var(--color-neon-light)] dark:text-neon' : 'text-gray-600 dark:text-gray-400'}`}>English</button>
                  <button onClick={() => switchLocale('es')} className={`w-full text-left px-4 py-3 text-xs font-bold uppercase italic hover:bg-black/5 dark:hover:bg-white/5 ${currentLocale === 'es' ? 'text-[var(--color-neon-light)] dark:text-neon' : 'text-gray-600 dark:text-gray-400'}`}>Español</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {user ? (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center justify-center gap-1.5 md:gap-2 bg-black/5 dark:bg-white/10 text-black dark:text-white h-9 sm:h-10 md:h-11 px-3 sm:px-4 md:px-6 rounded-full font-black text-[10px] md:text-sm uppercase italic tracking-wide hover:bg-black/10 dark:hover:bg-white/20 transition-all border border-black/10 dark:border-white/10 shrink-0"
              >
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-[var(--color-neon-light)]/20 dark:bg-neon/20 flex items-center justify-center text-[var(--color-neon-light)] dark:text-neon overflow-hidden border border-[var(--color-neon-light)]/20 dark:border-neon/20">
                  <User className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </div>
                <span className="hidden sm:inline">{user.name}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    {/* Overlay to close when clicking outside */}
                    <div 
                      className="fixed inset-0 z-[-1]" 
                      onClick={() => setIsProfileOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-3 w-56 pt-2 z-50 origin-top-right"
                    >
                      <div className="bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-xl">
                        <Link
                          href={`/${currentLocale}/profile`}
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-[#00FF88]/10 hover:text-[var(--color-neon-light)] dark:hover:text-neon group transition-all text-black dark:text-white"
                        >
                          <User className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-[var(--color-neon-light)] dark:group-hover:text-neon" />
                          <span className="text-sm font-bold uppercase italic tracking-tight">{t('profile')}</span>
                        </Link>
                        
                        <div className="h-px bg-black/10 dark:bg-white/10 my-1 mx-2" />
                        
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-500 group transition-all text-black dark:text-white"
                        >
                          <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                          <span className="text-sm font-bold uppercase italic tracking-tight">{t('logout')}</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
              className="neon-button flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 w-9 h-9 sm:w-auto sm:h-auto sm:px-3 md:px-6 sm:py-1.5 md:py-2.5 rounded-full font-black text-[9px] sm:text-[10px] md:text-sm uppercase italic tracking-wide shrink-0"
            >
              <LogIn className="w-4 h-4 md:w-4 md:h-4" />
              <span className="hidden sm:inline">{t('login')}</span>
            </motion.button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-1.5 md:p-2 text-black dark:text-white bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors ml-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100vh' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden absolute top-full left-0 w-full bg-white dark:bg-[#0A0A0A] border-b border-black/5 dark:border-white/5 overflow-y-auto backdrop-blur-3xl shadow-2xl z-40 pb-24"
          >
            <div className="flex flex-col px-4 py-8 gap-4 max-w-sm mx-auto">
              {user && (
                <>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2 mb-2">{t('profile')}</div>
                  <Link
                    href={`/${currentLocale}/profile`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 px-5 py-5 rounded-2xl bg-black/5 dark:bg-[#121212] border border-black/5 dark:border-white/5 active:scale-95 transition-all text-black dark:text-white"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-neon-light)]/10 dark:bg-neon/10 flex items-center justify-center border border-[var(--color-neon-light)]/20 dark:border-neon/20 shrink-0">
                      <User className="w-5 h-5 text-[var(--color-neon-light)] dark:text-neon" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-base font-black uppercase italic tracking-tight">{user.name}</span>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{t('profile')}</span>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 px-5 py-5 rounded-2xl bg-red-500/5 border border-red-500/10 active:scale-95 transition-all text-red-500"
                  >
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
                      <LogOut className="w-5 h-5 text-red-500" />
                    </div>
                    <span className="text-base font-black uppercase italic tracking-tight">{t('logout')}</span>
                  </button>
                  <div className="h-px bg-black/10 dark:bg-white/5 my-2" />
                </>
              )}
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2 mb-2">{t('catalog')}</div>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-4 px-5 py-5 rounded-2xl bg-black/5 dark:bg-[#121212] border border-black/5 dark:border-white/5 active:scale-95 transition-all text-black dark:text-white hover:border-[var(--color-neon-light)]/30 dark:hover:border-neon/30 hover:bg-black/10 dark:hover:bg-white/5"
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-neon-light)]/10 dark:bg-neon/10 flex items-center justify-center border border-[var(--color-neon-light)]/20 dark:border-neon/20 shrink-0">
                    <link.icon className="w-5 h-5 text-[var(--color-neon-light)] dark:text-neon" />
                  </div>
                  <span className="text-base font-black uppercase italic tracking-tight">{link.name}</span>
                </Link>
              ))}

              <Link
                href={`/${currentLocale}/famosos`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-4 px-5 py-5 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 active:scale-95 transition-all text-black dark:text-white hover:border-yellow-500/40 hover:bg-yellow-500/20"
              >
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30 shrink-0">
                  <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400 fill-current" />
                </div>
                <span className="text-base font-black uppercase italic tracking-tight text-yellow-700 dark:text-yellow-400">Famosos VIP</span>
              </Link>

              <div className="h-px bg-black/10 dark:bg-white/5 my-2" />
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2 mb-2">Language / Idioma</div>
              <div className="flex gap-3 px-1">
                <button
                  onClick={() => switchLocale('en')}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border font-black italic tracking-wider transition-colors ${currentLocale === 'en' ? 'bg-[var(--color-neon-light)]/10 dark:bg-[#00FF88]/10 text-[var(--color-neon-light)] dark:text-[#00FF88] border-[var(--color-neon-light)]/30 dark:border-[#00FF88]/30' : 'bg-black/5 dark:bg-[#121212] text-gray-500 dark:text-gray-400 border-black/10 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/5'}`}
                >
                  <Globe className="w-4 h-4" /> EN
                </button>
                <button
                  onClick={() => switchLocale('es')}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border font-black italic tracking-wider transition-colors ${currentLocale === 'es' ? 'bg-[var(--color-neon-light)]/10 dark:bg-[#00FF88]/10 text-[var(--color-neon-light)] dark:text-[#00FF88] border-[var(--color-neon-light)]/30 dark:border-[#00FF88]/30' : 'bg-black/5 dark:bg-[#121212] text-gray-500 dark:text-gray-400 border-black/10 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/5'}`}
                >
                  <Globe className="w-4 h-4" /> ES
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}