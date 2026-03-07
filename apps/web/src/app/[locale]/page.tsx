'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Zap, Star, Play,
  ArrowRight, Trophy, Users, User,
  ChevronRight, BadgeCheck, Smartphone
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import Modal from '@/components/Modal';
import Calculator from '@/components/Calculator';

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

              <div className="flex flex-col items-center justify-center gap-6 w-full max-w-4xl mx-auto mt-8">
                {/* Services Selector instead of text-heavy hero */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                  {[
                    { title: t('categories.coins'), desc: t('categories.coinsDesc'), icon: Trophy, id: 'coins' },
                    { title: t('categories.players'), desc: t('categories.playersDesc'), icon: Users, id: 'players' },
                    { title: t('categories.boosting'), desc: t('categories.boostingDesc'), icon: Zap, id: 'boosting' }
                  ].map((service, idx) => (
                    <button 
                      key={idx}
                      onClick={() => {
                        if (service.id === 'coins') {
                          document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          window.location.href = `/${currentLocale}/${service.id === 'players' ? 'fc-players' : 'boosting'}`;
                        }
                      }}
                      className="w-full text-left p-6 rounded-2xl bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 hover:border-[var(--color-neon-light)]/50 dark:hover:border-[var(--color-neon)]/50 hover:shadow-[0_0_30px_rgba(0,255,136,0.15)] transition-all flex flex-col items-center justify-center gap-3 group"
                    >
                      <div className="w-14 h-14 rounded-full bg-black/5 dark:bg-white/5 group-hover:bg-neon-light/10 dark:group-hover:bg-neon/10 flex items-center justify-center transition-colors">
                        <service.icon className="w-6 h-6 text-gray-400 group-hover:text-neon-light dark:group-hover:text-neon transition-colors" />
                      </div>
                      <h3 className="text-xl font-black italic uppercase text-[#1A1A1A] dark:text-white tracking-tight">{service.title}</h3>
                      <p className="text-xs text-center text-gray-500 font-medium">{service.desc}</p>
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center justify-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 mt-6">
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

        {/* Dynamic Service Section (Calculator) */}
        <section id="calculator-section" className="py-12 md:py-20 relative w-full border-t border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black italic uppercase tracking-tighter mb-3 text-[#1A1A1A] dark:text-white">
                Comprar <span className="text-neon-light dark:text-neon">FC Coins</span>
              </h2>
              <p className="text-sm text-gray-500 font-medium max-w-lg mx-auto">Seleccioná tu plataforma, la cantidad que necesitás y recibí tus monedas en minutos de forma 100% segura.</p>
            </div>
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 justify-center items-start w-full">
              <div className="w-full lg:flex-1 max-w-xl mx-auto lg:mx-0">
                <Calculator />
              </div>
              
              {/* "How to buy" Video CTA */}
              <div className="w-full lg:w-[350px] shrink-0 mx-auto lg:mx-0">
                <div 
                  onClick={() => openVideo(['https://www.w3schools.com/html/mov_bbb.mp4'])} // Sample video url for now
                  className="bg-[#FAFAFA] dark:bg-[#121212] rounded-2xl p-6 md:p-8 border border-black/5 dark:border-white/5 hover:border-[var(--color-neon-light)]/30 dark:hover:border-[var(--color-neon)]/30 hover:shadow-[0_0_30px_rgba(0,255,136,0.1)] transition-all cursor-pointer group flex flex-col items-center text-center h-full justify-center"
                >
                  <div className="w-16 h-16 rounded-full bg-neon-light/10 dark:bg-neon/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative">
                    <div className="absolute inset-0 rounded-full border border-neon-light/30 dark:border-neon/30 animate-ping opacity-75" />
                    <Play className="w-8 h-8 text-neon-light dark:text-neon ml-1" />
                  </div>
                  <h3 className="text-lg font-black italic uppercase text-[#1A1A1A] dark:text-white mb-2">¿Cómo Comprar?</h3>
                  <p className="text-sm text-gray-500 font-medium">Mirá este video corto de 1 minuto y aprendé lo fácil, rápido y seguro que es el proceso.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Video Wall: Confianza de Cracks (Story/Reel Style) */}
        <section className="py-20 md:py-32 bg-black/[0.02] dark:bg-white/[0.01] w-full border-y border-black/5 dark:border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 md:mb-20">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-3 sm:mb-4 text-[#1A1A1A] dark:text-white text-transparent bg-clip-text bg-gradient-to-r hover:from-neon-light hover:to-blue-500 transition-all cursor-default">Confianza de Cracks</h2>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-500 font-medium px-4">Jugadores profesionales y streamers que eligen y confían en Venta Gaming todos los días.</p>
            </div>

            <div className="flex justify-center gap-4 md:gap-8 max-w-5xl mx-auto overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar px-4">
              {[
                { name: "Leo Balerdi", role: "Pro Player", src: '/videos/Balerdi.mp4' },
                { name: "Juan Foyth", role: "Pro Player", src: '/videos/Foyth 1.mp4', src2: '/videos/foyth 2.mp4' },
                { name: "Neymar Jr", role: "Pro Player", src: '/videos/Neymar.mp4' },
              ].map((video, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => openVideo(video.src2 ? [video.src, video.src2] : [video.src])}
                  className="w-[260px] md:w-[320px] shrink-0 snap-center aspect-[9/16] rounded-3xl md:rounded-[2rem] bg-black shadow-2xl relative overflow-hidden group cursor-pointer border border-white/10"
                >
                  {/* Story Progress Bars Placeholder */}
                  <div className="absolute top-3 left-3 right-3 flex gap-1 z-20">
                    <div className="h-1 bg-white/40 flex-1 rounded-full overflow-hidden"><div className="w-1/3 h-full bg-white rounded-full"></div></div>
                    {video.src2 && <div className="h-1 bg-white/40 flex-1 rounded-full"></div>}
                  </div>

                  <video
                    src={video.src}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                    preload="metadata"
                    muted
                    playsInline
                    loop
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 opacity-80" />

                  {/* Play Icon overlay */}
                  <div className="absolute inset-0 flex items-center justify-center z-10 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                      <Play className="w-6 h-6 fill-current ml-1" />
                    </div>
                  </div>

                  {/* Reel/Story Footer Info */}
                  <div className="absolute bottom-6 left-6 right-6 z-20 flex items-end gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neon-light to-blue-500 p-[2px] shrink-0">
                      <div className="w-full h-full bg-black rounded-full overflow-hidden flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <h4 className="text-white font-bold text-sm truncate">{video.name}</h4>
                        <BadgeCheck className="w-3 h-3 text-blue-400 shrink-0" />
                      </div>
                      <p className="text-white/70 text-xs font-medium truncate">{video.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic Trustpilot UI Replica */}
        <section className="py-20 md:py-32 bg-[#0A0A0A] w-full border-t border-white/5 relative overflow-hidden">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#00B67A]/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#00B67A]/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 text-white">
            
            {/* Header: Logo and Text */}
            <div className="flex justify-between items-center mb-10 md:mb-12 w-full max-w-sm mx-auto px-2">
              <div className="bg-[#00B67A] p-1.5 rounded-sm">
                <Star className="w-6 h-6 md:w-8 md:h-8 text-white fill-white" strokeWidth={1.5} />
              </div>
              <div className="text-4xl md:text-5xl font-black italic tracking-tighter">
                TRUSTPILOT
              </div>
            </div>

            {/* Stars and Rating */}
            <div className="flex flex-col items-center text-center mb-12 md:mb-16">
              <div className="flex gap-2.5 sm:gap-3 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-10 h-10 md:w-12 md:h-12 text-[#00B67A] fill-[#00B67A]" strokeWidth={1} />
                ))}
              </div>
              <p className="text-gray-400 text-xl md:text-2xl font-medium px-4 leading-relaxed max-w-sm">
                Calificación 4.8/5 basada en 500 reseñas
              </p>
            </div>

            {/* Reviews Column */}
            <div className="flex flex-col gap-5 max-w-sm md:max-w-md mx-auto">
              {[
                { name: "Juan M.", text: '"Increíble servicio"' },
                { name: "Santi R.", text: '"El más rápido"' },
                { name: "Nico F.", text: '"100% confiable"' },
              ].map((review, i) => (
                <div key={i} className="bg-[#141414] border border-[#262626] rounded-3xl py-7 px-8 flex flex-col items-start shadow-xl hover:border-[#00B67A]/30 transition-colors">
                   <h4 className="text-white font-bold text-xl mb-2">{review.name}</h4>
                   <p className="text-gray-500 italic text-lg">{review.text}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* How it Works Section */}



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

      {/* Custom Video Modal for "How it works" and Testimonials */}
      <Modal
        isOpen={isVideoModalOpen}
        onClose={() => {
          setIsVideoModalOpen(false);
          setCurrentSourceIndex(0);
        }}
        title="Reproductor"
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