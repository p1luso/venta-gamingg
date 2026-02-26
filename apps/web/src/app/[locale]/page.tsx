'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Calculator from '@/components/Calculator';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Headset, Trophy, Star, ExternalLink, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface TrustpilotReview {
  name: string;
  country: string;
  text: string;
  rating: number;
}

export default function Home() {
  const t = useTranslations('Home');
  const [trustpilotReviews, setTrustpilotReviews] = useState<TrustpilotReview[]>([]);
  const [tpScore, setTpScore] = useState('4.6');
  const [tpTotal, setTpTotal] = useState(46);
  const [currentReview, setCurrentReview] = useState(0);

  // Auto-rotate hero mini-reviews
  useEffect(() => {
    if (trustpilotReviews.length === 0) return;
    const interval = setInterval(() => {
      setCurrentReview(prev => (prev + 1) % Math.min(trustpilotReviews.length, 3));
    }, 4000);
    return () => clearInterval(interval);
  }, [trustpilotReviews]);

  // Fetch TrustPilot reviews dynamically
  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    fetch(`${backendUrl}/trustpilot`)
      .then(res => res.json())
      .then(data => {
        if (data.reviews?.length) setTrustpilotReviews(data.reviews);
        if (data.score) setTpScore(data.score);
        if (data.totalReviews) setTpTotal(data.totalReviews);
      })
      .catch(() => {
        // Fallback si el backend no responde
        setTrustpilotReviews([
          { name: 'Santiago Russo', country: 'AR', text: 'Excelente atención, compre monedas y con su método automatizado me llegó 1 millón de monedas en 20/25mins.', rating: 5 },
          { name: 'Gaspi Canton', country: 'AR', text: 'Unos genios, contestan siempre al toque y el servicio es super rapido, confiable al 100%!', rating: 5 },
          { name: 'Leonardo Fasciglione', country: 'AR', text: 'La mejor página sin dudas, las monedas al mejor precio del mercado y seguro.', rating: 5 },
        ]);
      });
  }, []);

  const features = [
    { icon: ShieldCheck, title: t('features.safeTitle'), desc: t('features.safeDesc') },
    { icon: Zap, title: t('features.instantTitle'), desc: t('features.instantDesc') },
    { icon: Headset, title: t('features.supportTitle'), desc: t('features.supportDesc') },
    { icon: Trophy, title: t('features.pricesTitle'), desc: t('features.pricesDesc') },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] overflow-x-hidden">

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center pt-20 pb-32 overflow-hidden">
          {/* Background Elements */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#00FF88]/5 blur-[120px] rounded-full -z-10"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#00FF88]/5 blur-[100px] rounded-full -z-10"
          />

          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20 mb-6">
                <div className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00FF88]">{t('liveMarketPrices')}</span>
              </div>

              <h1
                className="text-5xl md:text-6xl lg:text-8xl font-black text-white italic tracking-tighter leading-[0.9] mb-8 uppercase"
                dangerouslySetInnerHTML={{ __html: t.raw('dominateMarket') }}
              />

              <p className="text-xl text-gray-400 max-w-lg mb-12 font-medium leading-relaxed">
                {t('description')}
              </p>

              <div className="space-y-4">
                {/* Unified TrustPilot + Stats badge */}
                <a
                  href="https://es.trustpilot.com/review/ventagamingg.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-4 px-5 py-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[#00FF88]/30 transition-all group"
                >
                  {/* TrustPilot */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <svg viewBox="0 0 126 31" className="h-4 w-auto" fill="none">
                        <path d="M24.8 0H1.5C.7 0 0 .7 0 1.5v27c0 .8.7 1.5 1.5 1.5h23.3c.8 0 1.5-.7 1.5-1.5v-27C26.3.7 25.6 0 24.8 0z" fill="#00B67A" />
                        <path d="M13.1 10.3l1.7 5.3h5.5l-4.5 3.2 1.7 5.3-4.4-3.3-4.5 3.3 1.7-5.3-4.4-3.2h5.5l1.7-5.3z" fill="#fff" />
                        <path d="M18.3 19.6l-.4-1.2-4.8 3.5 5.2-2.3z" fill="#005128" />
                        <text x="32" y="22" fill="white" fontSize="18" fontWeight="800" fontFamily="system-ui">Trustpilot</text>
                      </svg>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[1, 2, 3, 4].map(i => (
                          <Star key={i} className="w-3 h-3 text-[#00B67A] fill-[#00B67A]" />
                        ))}
                        <Star className="w-3 h-3 text-[#00B67A] fill-[#00B67A]/60" />
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium">{tpScore}/5 · {tpTotal} opiniones</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-8 bg-white/10" />

                  {/* Stats */}
                  <div className="text-xs font-bold">
                    <div className="text-white">{t('happyCustomers')}</div>
                    <div className="text-gray-500 text-[10px] mt-0.5 uppercase tracking-wider">{t('yearsExperience')}</div>
                  </div>

                  <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#00FF88] transition-colors ml-1" />
                </a>

                {/* Mini carousel of reviews */}
                {trustpilotReviews.length > 0 && (
                  <div className="relative max-w-lg">
                    <div className="overflow-hidden rounded-xl bg-white/[0.03] border border-white/5 px-4 py-3">
                      <motion.div
                        key={currentReview}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-start gap-3"
                      >
                        <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-[#00B67A] to-emerald-800 flex items-center justify-center text-[9px] font-bold text-white mt-0.5">
                          {trustpilotReviews[currentReview]?.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-semibold text-white">{trustpilotReviews[currentReview]?.name}</span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map(i => (
                                <Star key={i} className="w-2.5 h-2.5 text-[#00B67A] fill-[#00B67A]" />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                            &ldquo;{trustpilotReviews[currentReview]?.text}&rdquo;
                          </p>
                        </div>
                      </motion.div>
                    </div>
                    {/* Dots */}
                    <div className="flex justify-center gap-1.5 mt-2">
                      {trustpilotReviews.slice(0, 3).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentReview(i)}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentReview ? 'bg-[#00B67A] w-4' : 'bg-white/20'
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right Content - Calculator */}
            <div className="flex justify-center lg:justify-end">
              <Calculator />
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-24 bg-black/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">{t('howItWorks')}</h2>
              <p className="text-gray-500 font-medium">{t('howItWorksDesc')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
              <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00FF88]/20 to-transparent -z-10" />

              {[
                { step: '01', title: t('step1Title'), desc: t('step1Desc') },
                { step: '02', title: t('step2Title'), desc: t('step2Desc') },
                { step: '03', title: t('step3Title'), desc: t('step3Desc') },
                { step: '04', title: t('step4Title'), desc: t('step4Desc') },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#00FF88] text-black flex items-center justify-center text-2xl font-black italic shadow-[0_0_20px_rgba(0,255,136,0.3)]">
                    {s.step}
                  </div>
                  <h3 className="text-xl font-bold text-white uppercase italic tracking-tight">{s.title}</h3>
                  <p className="text-sm text-gray-500 font-medium max-w-[250px]">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 border-t border-white/5 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#00FF88]/30 transition-all group"
                >
                  <f.icon className="w-10 h-10 text-[#00FF88] mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 font-medium">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footballers Section */}
        <section className="py-24 bg-black/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00FF88]/20 to-transparent" />

          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">{t('footballers.title')}</h2>
              <p className="text-gray-500 font-medium">{t('footballers.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="aspect-video bg-[#161616] rounded-2xl border border-white/5 relative group overflow-hidden cursor-pointer hover:border-[#00FF88]/30 transition-all"
                >
                  {/* Placeholder Background */}
                  <div className="absolute inset-0 bg-zinc-900" />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-16 h-16 rounded-full bg-[#00FF88]/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-[#00FF88]/30">
                      <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-[#00FF88] border-b-[10px] border-b-transparent ml-1" />
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 w-full p-6 z-20">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
                      <span className="text-[10px] font-bold text-[#00FF88] uppercase tracking-wider">Pro Player</span>
                    </div>
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Testimonio #{i}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}