'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Upload, 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2,
  Wallet,
  Building2,
  X
} from 'lucide-react';
import { useTranslations } from 'next-intl';

type PaymentMethod = 'STRIPE' | 'MERCADOPAGO' | 'TRANSFER';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';
  const t = useTranslations('Checkout');
  const [method, setMethod] = useState<PaymentMethod>('STRIPE');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const coins = searchParams.get('coins') || '0';
  const price = searchParams.get('price') || '0';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handlePayNow = async () => {
    if (!email) return;
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coin_amount: parseInt(coins),
          price_paid: parseFloat(price),
          user_email: email,
          paymentMethod: method,
        }),
      });

      const order = await response.json();

      if (method === 'TRANSFER' && file) {
        const formData = new FormData();
        formData.append('file', file);
        await fetch(`http://localhost:3001/api/v1/payments/transfer/${order.id}/proof`, {
          method: 'POST',
          body: formData,
        });
      }

      setIsSuccess(true);
      setTimeout(() => router.push(`/${locale}`), 3000);
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex flex-col items-center justify-center text-center p-6"
      >
        <div className="w-20 h-20 bg-[#00FF88]/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-[#00FF88]" />
        </div>
        <h2 className="text-3xl font-black text-white italic uppercase mb-2">{t('orderReceived')}</h2>
        <p className="text-gray-400 max-w-sm mb-8">
          {t('thankYou')}
        </p>
        <button onClick={() => router.push(`/${locale}`)} className="text-[#00FF88] font-bold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> {t('backToHome')}
        </button>
      </motion.div>
    );
  }

  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
      <div className="flex items-center gap-4 mb-12">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">{t('secureCheckout')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Payment & Info */}
        <div className="lg:col-span-8 space-y-12">
          {/* Contact */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#00FF88]/10 flex items-center justify-center text-[#00FF88] font-bold text-sm">1</div>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">{t('contactInfo')}</h2>
            </div>
            <div className="bg-[#111111] border border-white/5 rounded-[0.75rem] p-6">
              <input
                type="email"
                placeholder={t('enterEmail')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00FF88]/50 transition-all"
              />
              <p className="mt-4 text-xs text-gray-500 flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" /> {t('privacy')}
              </p>
            </div>
          </section>

          {/* Payment Methods */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#00FF88]/10 flex items-center justify-center text-[#00FF88] font-bold text-sm">2</div>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">{t('paymentMethod')}</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <PaymentOption 
                active={method === 'STRIPE'} 
                onClick={() => setMethod('STRIPE')}
                icon={<CreditCard className="w-6 h-6" />}
                title={t('creditCard')}
                subtitle="Powered by Stripe"
              />
              <PaymentOption 
                active={method === 'MERCADOPAGO'} 
                onClick={() => setMethod('MERCADOPAGO')}
                icon={<Wallet className="w-6 h-6" />}
                title={t('mercadoPago')}
                subtitle="Local Payments (ARS)"
              />
              <PaymentOption 
                active={method === 'TRANSFER'} 
                onClick={() => setMethod('TRANSFER')}
                icon={<Building2 className="w-6 h-6" />}
                title={t('bankTransfer')}
                subtitle="Manual Approval (Instant)"
                highlight
              />

              <AnimatePresence>
                {method === 'TRANSFER' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-[#111111] border border-white/5 rounded-[0.75rem] p-8 mt-4 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('bankDetails')}</h3>
                          <div className="space-y-2 font-mono text-sm bg-black/40 p-4 rounded-xl border border-white/5">
                            <p className="text-white flex justify-between"><span className="text-gray-500">Alias:</span> VENTA.GAMING.OK</p>
                            <p className="text-white flex justify-between"><span className="text-gray-500">Holder:</span> Santiago G.</p>
                            <p className="text-white flex justify-between"><span className="text-gray-500">CBU:</span> 00000031000...</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('uploadReceipt')}</h3>
                          <div className="relative group">
                            {preview ? (
                              <div className="relative aspect-video rounded-xl overflow-hidden border border-[#00FF88]/30 group-hover:border-[#00FF88] transition-colors shadow-2xl">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={preview} alt="Proof" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button 
                                    onClick={() => { setFile(null); setPreview(null); }}
                                    className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-transform hover:scale-110 shadow-lg"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-[#00FF88] hover:bg-[#00FF88]/5 transition-all group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#00FF88]/0 via-[#00FF88]/0 to-[#00FF88]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <Upload className="w-10 h-10 text-gray-600 mb-4 group-hover:text-[#00FF88] group-hover:scale-110 transition-all duration-300" />
                                <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">{t('dragDrop')}</span>
                                <span className="text-[10px] text-gray-600 mt-1 uppercase font-black tracking-widest group-hover:text-[#00FF88]/70 transition-colors">PNG, JPG or PDF</span>
                                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-4">
          <div className="bg-[#111111] border border-white/5 rounded-[0.75rem] p-8 sticky top-32 space-y-8">
            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">{t('orderSummary')}</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">{t('quantity')}</span>
                <span className="text-white font-bold italic">{parseInt(coins).toLocaleString()} FC 25 Coins</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">{t('subtotal')}</span>
                <span className="text-white font-bold">${price}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">{t('serviceFee')}</span>
                <span className="text-[#00FF88] font-bold">{t('free')}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex justify-between items-end">
              <div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">{t('totalToPay')}</span>
                <span className="text-4xl font-black text-white italic tracking-tighter">${price}</span>
              </div>
              <ShieldCheck className="w-10 h-10 text-[#00FF88]/20" />
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <ShieldCheck className="w-5 h-5 text-[#00FF88]" />
                <span className="text-[9px] font-black text-gray-500 uppercase text-center">{t('sslSecure')}</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-[#00FF88]" />
                <span className="text-[9px] font-black text-gray-500 uppercase text-center">{t('verifiedStock')}</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePayNow}
              disabled={loading || !email}
              className={`w-full py-5 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                loading || !email 
                  ? 'bg-white/5 text-gray-600 cursor-not-allowed' 
                  : 'bg-[#00FF88] text-black shadow-[0_0_30px_rgba(0,255,136,0.3)]'
              }`}
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  {t('payNow')} <ArrowLeft className="w-5 h-5 rotate-180" />
                </>
              )}
            </motion.button>

            <p className="text-[10px] text-center text-gray-500 font-medium">
              {t('terms')}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function PaymentOption({ 
  active, 
  onClick, 
  icon, 
  title, 
  subtitle, 
  highlight 
}: { 
  active: boolean, 
  onClick: () => void, 
  icon: React.ReactNode, 
  title: string, 
  subtitle: string,
  highlight?: boolean
}) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-6 p-6 rounded-xl border-2 transition-all text-left relative overflow-hidden group ${
        active 
          ? 'bg-[#00FF88]/5 border-[#00FF88] shadow-[0_0_20px_rgba(0,255,136,0.1)]' 
          : 'bg-[#111111] border-white/5 hover:border-white/10'
      }`}
    >
      {highlight && !active && (
        <div className="absolute top-0 right-0 bg-[#00FF88] text-black text-[10px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-widest">
          Recommended
        </div>
      )}
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
        active ? 'bg-[#00FF88] text-black' : 'bg-white/5 text-gray-400 group-hover:text-white'
      }`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-black text-white uppercase tracking-tight italic">{title}</h3>
        <p className="text-xs text-gray-500 font-bold">{subtitle}</p>
      </div>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
        active ? 'border-[#00FF88] bg-[#00FF88]' : 'border-white/10'
      }`}>
        {active && <CheckCircle2 className="w-4 h-4 text-black" />}
      </div>
    </button>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] selection:bg-[#00FF88] selection:text-black">
      <Navbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="w-10 h-10 text-[#00FF88] animate-spin" /></div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}