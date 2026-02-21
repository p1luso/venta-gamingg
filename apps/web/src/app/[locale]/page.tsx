'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Calculator from '@/components/Calculator';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Headset, Trophy } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('Home');

  const features = [
    { icon: ShieldCheck, title: t('features.safeTitle'), desc: t('features.safeDesc') },
    { icon: Zap, title: t('features.instantTitle'), desc: t('features.instantDesc') },
    { icon: Headset, title: t('features.supportTitle'), desc: t('features.supportDesc') },
    { icon: Trophy, title: t('features.pricesTitle'), desc: t('features.pricesDesc') },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] overflow-x-hidden">
      <Navbar />
      
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
                className="text-6xl md:text-8xl font-black text-white italic tracking-tighter leading-[0.9] mb-8 uppercase"
                dangerouslySetInnerHTML={{ __html: t.raw('dominateMarket') }}
              />
              
              <p className="text-xl text-gray-400 max-w-lg mb-12 font-medium leading-relaxed">
                {t('description')}
              </p>

              <div className="flex flex-wrap gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0A0A0A] bg-gray-800" />
                  ))}
                </div>
                <div className="text-sm font-bold">
                  <div className="text-white">{t('happyCustomers')}</div>
                  <div className="text-[#00FF88]">{t('rating')}</div>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Calculator */}
            <div className="flex justify-center lg:justify-end">
              <Calculator />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 border-t border-white/5 bg-white/[0.01]">
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

        {/* How it Works Section */}
        <section className="py-24 bg-black">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">{t('howItWorks')}</h2>
              <p className="text-gray-500 font-medium">{t('howItWorksDesc')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00FF88]/20 to-transparent -z-10" />
              
              {[
                { step: '01', title: t('step1Title'), desc: t('step1Desc') },
                { step: '02', title: t('step2Title'), desc: t('step2Desc') },
                { step: '03', title: t('step3Title'), desc: t('step3Desc') },
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
      </main>
    </div>
  );
}