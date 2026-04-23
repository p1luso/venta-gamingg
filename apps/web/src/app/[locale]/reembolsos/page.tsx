'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { RefreshCcw, ArrowLeft, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-2xl font-black italic uppercase tracking-tight text-gray-900 dark:text-white mt-12 mb-4">{children}</h2>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-gray-700 dark:text-gray-400 leading-relaxed mb-4">{children}</p>
);

const UL = ({ children }: { children: React.ReactNode }) => (
  <ul className="list-disc pl-6 space-y-2 mb-4 text-gray-700 dark:text-gray-400 leading-relaxed marker:text-[#00FF88]">{children}</ul>
);

const OL = ({ children }: { children: React.ReactNode }) => (
  <ol className="list-decimal pl-6 space-y-2 mb-4 text-gray-700 dark:text-gray-400 leading-relaxed marker:text-[#00FF88] marker:font-bold">{children}</ol>
);

export default function ReembolsosPage() {
  const t = useTranslations('Refund');

  return (
    <div className="min-h-screen bg-[#FDFCF9] dark:bg-[#0A0A0A]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#00FF88] uppercase tracking-widest mb-8 transition-colors">
          <ArrowLeft className="w-3 h-3" /> {t('backHome')}
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#00FF88]/10 flex items-center justify-center"><RefreshCcw className="w-5 h-5 text-[#00FF88]" /></div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Legal</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-3">{t('title')}</h1>
        <p className="text-sm text-gray-500 mb-12">{t('lastUpdate')}</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          <div className="p-5 rounded-2xl bg-[#00FF88]/5 border border-[#00FF88]/20">
            <CheckCircle2 className="w-5 h-5 text-[#00FF88] mb-2" />
            <h3 className="text-sm font-black uppercase italic tracking-tight mb-1 text-gray-900 dark:text-white">{t('totalRefund')}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{t('totalRefundDesc')}</p>
          </div>
          <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20">
            <XCircle className="w-5 h-5 text-red-400 mb-2" />
            <h3 className="text-sm font-black uppercase italic tracking-tight mb-1 text-gray-900 dark:text-white">{t('noRefund')}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{t('noRefundDesc')}</p>
          </div>
        </div>

        <article>
          <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8">{t('intro')}</p>
          <H2>{t('section1')}</H2>
          <P>{t('section1Text')}</P>
          <H2>{t('section2')}</H2>
          <P>{t('section2Intro')}</P>
          <UL><li>{t('section2Item1')}</li><li>{t('section2Item2')}</li><li>{t('section2Item3')}</li><li>{t('section2Item4')}</li></UL>
          <H2>{t('section3')}</H2>
          <P>{t('section3Text')}</P>
          <H2>{t('section4')}</H2>
          <P>{t('section4Intro')}</P>
          <UL><li>{t('section4Item1')}</li><li>{t('section4Item2')}</li><li>{t('section4Item3')}</li><li>{t('section4Item4')}</li><li>{t('section4Item5')}</li></UL>
          <H2>{t('section5')}</H2>
          <P>{t('section5Intro')}</P>
          <OL><li>{t('section5Item1')}</li><li>{t('section5Item2')}</li><li>{t('section5Item3')}</li></OL>
          <P>{t('section5Note')}</P>
          <H2>{t('section6')}</H2>
          <P>{t('section6Text')}</P>
          <div className="mt-10 p-5 rounded-2xl bg-yellow-500/5 border border-yellow-500/20 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-black uppercase italic tracking-tight text-yellow-500 mb-1">{t('important')}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{t('importantText')}</p>
            </div>
          </div>
          <H2>{t('section7')}</H2>
          <P>{t('section7Text')}</P>
        </article>
      </main>
    </div>
  );
}
