'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Zap, Star, Play,
  ArrowRight, Trophy, Users,
  ChevronRight, BadgeCheck, Smartphone
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import Modal from '@/components/Modal';

export default function Home() {
  const t = useTranslations('Home');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);

  const currentLocale = useLocale();

  const openVideo = (sources: string[]) => {
    setSelectedSources(sources);
    setCurrentSourceIndex(0);
    setIsVideoModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0A0A0A] overflow-x-hidden w-full transition-colors duration-300">
      <main className="flex-1 w-full max-w-[100vw] overflow-hidden">
        {/* Hero Section - Authority Focused */}
        <section className="relative pt-32 md:pt-48 pb-20 md:pb-32 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-neon-light/10 dark:bg-neon/10 border border-neon-light/20 dark:border-neon/20 mb-6 sm:mb-8 max-w-full overflow-hidden">
                <BadgeCheck className="w-3 h-3 sm:w-4 sm:h-4 text-neon-light dark:text-neon shrink-0" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest sm:tracking-[0.3em] text-neon-light dark:text-neon truncate">{t('hero.marketLeader')}</span>
              </div>

              <h1
                className="text-4xl sm:text-6xl md:text-8xl xl:text-9xl font-black italic tracking-tighter leading-[0.9] sm:leading-[0.85] mb-6 sm:mb-8 uppercase break-words w-full text-[#1A1A1A] dark:text-white"
                dangerouslySetInnerHTML={{ __html: t.raw('hero.title').replace('text-[#00FF88]', 'text-neon-light dark:text-neon').replace('text-white', 'text-black dark:text-white') }}
              />

              <p
                className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 md:mb-12 font-medium leading-relaxed px-2"
                dangerouslySetInnerHTML={{ __html: t.raw('hero.description').replace('text-white', 'text-black dark:text-white') }}
              />

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-xs mx-auto sm:max-w-none">
                <Link
                  href={`/${currentLocale}/fc-coins`}
                  className="w-full sm:w-auto px-6 sm:px-12 py-4 sm:py-6 neon-button font-black uppercase italic tracking-widest rounded-xl sm:rounded-2xl text-xs sm:text-sm hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] transition-all flex items-center justify-center gap-2 sm:gap-3 group"
                >
                  {t('hero.buyCoins')} <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <div className="flex items-center justify-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 rounded-xl sm:rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 w-full sm:w-auto">
                  <div className="flex shrink-0">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-[#00B67A] fill-[#00B67A]" />)}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 tracking-tight whitespace-nowrap">{t('hero.excellent')}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[150%] sm:h-full -z-10 bg-radial-gradient from-[var(--color-neon-light)]/5 dark:from-[var(--color-neon)]/5 to-transparent blur-3xl rounded-full opacity-50" />
        </section>

        {/* Categories Section */}
        <section className="py-16 md:py-24 relative w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  title: t('categories.coins'),
                  href: `/${currentLocale}/fc-coins`,
                  desc: t('categories.coinsDesc'),
                  icon: Trophy,
                },
                {
                  title: t('categories.players'),
                  href: `/${currentLocale}/fc-players`,
                  desc: t('categories.playersDesc'),
                  icon: Users,
                },
                {
                  title: t('categories.boosting'),
                  href: `/${currentLocale}/boosting`,
                  desc: t('categories.boostingDesc'),
                  icon: Zap,
                },
              ].map((category, i) => (
                <Link key={i} href={category.href} className="w-full">
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="p-6 md:p-10 rounded-[2rem] bg-white dark:bg-[#121212] shadow-sm dark:shadow-none border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-[var(--color-neon)]/30 transition-all flex flex-col h-full group"
                  >
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center mb-6 md:mb-8 group-hover:bg-neon-light/10 dark:group-hover:bg-neon/10 transition-colors">
                      <category.icon className="w-6 h-6 md:w-8 md:h-8 text-gray-500 dark:text-gray-400 group-hover:text-neon-light dark:group-hover:text-neon transition-colors" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter mb-3 md:mb-4 text-[#1A1A1A] dark:text-white">{category.title}</h3>
                    <p className="text-gray-600 dark:text-gray-500 text-xs md:text-sm font-medium leading-relaxed mb-8 md:mb-10 flex-1">{category.desc}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-neon-light dark:text-neon">{t('categories.explore')}</span>
                      <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400 dark:text-gray-600 group-hover:text-black dark:group-hover:text-white transition-colors" />
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Video Wall: The Pro Choice */}
        <section className="py-20 md:py-32 bg-black/[0.02] dark:bg-white/[0.01] w-full border-y border-black/5 dark:border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 md:mb-20">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-3 sm:mb-4 text-[#1A1A1A] dark:text-white">{t('proChoice.title')}</h2>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-500 font-medium px-4">{t('proChoice.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-5xl mx-auto">
              {[
                { sources: ['/videos/Balerdi.mp4'] },
                { sources: ['/videos/Foyth 1.mp4', '/videos/foyth 2.mp4'] },
                { sources: ['/videos/Neymar.mp4'] },
              ].map((video, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => openVideo(video.sources)}
                  className="aspect-[4/5] md:aspect-[3/4] rounded-2xl md:rounded-3xl bg-white dark:bg-[#121212] shadow-sm dark:shadow-none border border-black/5 dark:border-white/5 relative overflow-hidden group cursor-pointer"
                >
                  <video
                    src={video.sources[0]}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700 pointer-events-none"
                    preload="metadata"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

                  <div className="absolute inset-0 flex items-center justify-center z-10 w-full h-full">
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-neon-light dark:bg-neon flex items-center justify-center text-white dark:text-black shadow-[0_0_30px_rgba(0,255,136,0.3)] opacity-90 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                      <Play className="w-6 h-6 md:w-8 md:h-8 fill-current ml-1" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-20 md:py-32 relative w-full overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16 md:mb-24">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-3 sm:mb-4 text-[#1A1A1A] dark:text-white">{t('howItWorksNew.title')}</h2>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-500 font-medium px-4">{t('howItWorksNew.subtitle')}</p>
            </div>

            <div className="space-y-4 relative w-full">
              {[
                { step: t('howItWorksNew.step1'), title: t('howItWorksNew.step1Title'), desc: t('howItWorksNew.step1Desc'), icon: Smartphone },
                { step: t('howItWorksNew.step2'), title: t('howItWorksNew.step2Title'), desc: t('howItWorksNew.step2Desc'), icon: ShieldCheck },
                { step: t('howItWorksNew.step3'), title: t('howItWorksNew.step3Title'), desc: t('howItWorksNew.step3Desc'), icon: Zap },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: i * 0.15 }}
                  className="p-5 md:p-10 rounded-[1.5rem] md:rounded-[2rem] bg-white dark:bg-[#121212] shadow-sm dark:shadow-none border border-black/5 dark:border-white/5 flex flex-row items-start md:items-center gap-4 sm:gap-6 md:gap-10 group transition-all"
                >
                  <div className="w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-neon-light/10 dark:bg-neon/10 flex flex-shrink-0 items-center justify-center border border-neon-light/20 dark:border-neon/20 group-hover:bg-neon-light dark:group-hover:bg-neon group-hover:text-white dark:group-hover:text-black text-neon-light dark:text-neon transition-all duration-500">
                    <step.icon className="w-6 h-6 md:w-10 md:h-10" />
                  </div>
                  <div className="text-left flex-1 min-w-0 mt-1 md:mt-0">
                    <div className="text-[9px] md:text-[10px] font-black text-neon-light dark:text-neon uppercase tracking-[0.3em] md:tracking-[0.4em] mb-1.5 md:mb-2">{step.step}</div>
                    <h3 className="text-lg md:text-2xl font-black italic uppercase tracking-tight mb-1.5 md:mb-2 truncate text-[#1A1A1A] dark:text-white">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-500 text-xs md:text-sm font-medium leading-relaxed max-w-sm break-words">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Video Modal */}
      <Modal
        isOpen={isVideoModalOpen}
        onClose={() => {
          setIsVideoModalOpen(false);
          setCurrentSourceIndex(0);
        }}
        title={t('proChoice.videoModalTitle')}
      >
        <div className="w-full bg-black flex items-center justify-center relative group overflow-hidden">
          {selectedSources.length > 0 && (
            <video
              key={selectedSources[currentSourceIndex]}
              src={selectedSources[currentSourceIndex]}
              autoPlay
              controls
              playsInline
              className="w-full h-auto max-h-[75vh] object-contain"
              onEnded={() => {
                if (currentSourceIndex < selectedSources.length - 1) {
                  setCurrentSourceIndex(prev => prev + 1);
                }
              }}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}