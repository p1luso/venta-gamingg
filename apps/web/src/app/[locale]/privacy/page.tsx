'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-2xl font-black italic uppercase tracking-tight text-gray-900 dark:text-white mt-12 mb-4">
    {children}
  </h2>
);
const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-gray-700 dark:text-gray-400 leading-relaxed mb-4">{children}</p>
);
const UL = ({ children }: { children: React.ReactNode }) => (
  <ul className="list-disc pl-6 space-y-2 mb-4 text-gray-700 dark:text-gray-400 leading-relaxed marker:text-[#00FF88]">
    {children}
  </ul>
);

export default function PrivacyPage() {
  const t = useTranslations('Privacy');

  return (
    <div className="min-h-screen bg-[#FDFCF9] dark:bg-[#0A0A0A] text-gray-900 dark:text-white">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#00FF88] uppercase tracking-widest mb-8 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> {t('backHome')}
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#00FF88]/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#00FF88]" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Legal</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-3">
          {t('title')}
        </h1>
        <p className="text-sm text-gray-500 mb-12">{t('lastUpdate')}</p>

        <article>
          <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
            {t('intro')}
          </p>

          <H2>{t('section1')}</H2>
          <P>{t('section1Text')}</P>
          <UL>
            <li>{t('info1')}</li>
            <li>{t('info2')}</li>
            <li>{t('info3')}</li>
            <li>{t('info4')}</li>
            <li>{t('info5')}</li>
          </UL>

          <H2>{t('section2')}</H2>
          <P>{t('section2Text')}</P>
          <UL>
            <li>{t('use1')}</li>
            <li>{t('use2')}</li>
            <li>{t('use3')}</li>
            <li>{t('use4')}</li>
            <li>{t('use5')}</li>
            <li>{t('use6')}</li>
          </UL>

          <H2>{t('section3')}</H2>
          <P>{t('section3Text')}</P>

          <H2>{t('section4')}</H2>
          <P>{t('section4Text')}</P>
          <UL>
            <li>{t('share1')}</li>
            <li>{t('share2')}</li>
            <li>{t('share3')}</li>
          </UL>
          <P>{t('shareNote')}</P>

          <H2>{t('section5')}</H2>
          <P>{t('section5Text')}</P>

          <H2>{t('section6')}</H2>
          <P>{t('section6Text')}</P>
          <UL>
            <li>{t('right1')}</li>
            <li>{t('right2')}</li>
            <li>{t('right3')}</li>
            <li>{t('right4')}</li>
            <li>{t('right5')}</li>
          </UL>
          <P>{t('rightsNote')}</P>

          <H2>{t('section7')}</H2>
          <P>{t('section7Text')}</P>

          <H2>{t('section8')}</H2>
          <P>{t('section8Text')}</P>
          <UL>
            <li>{t('security1')}</li>
            <li>{t('security2')}</li>
            <li>{t('security3')}</li>
            <li>{t('security4')}</li>
            <li>{t('security5')}</li>
          </UL>
          <P>{t('securityNote')}</P>

          <H2>{t('section9')}</H2>
          <P>{t('section9Text')}</P>

          <H2>{t('section10')}</H2>
          <P>{t('section10Text')}</P>
        </article>
      </main>

      <Footer />
    </div>
  );
}
