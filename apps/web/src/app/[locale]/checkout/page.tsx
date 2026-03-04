'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  CreditCard,
  Upload,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Wallet,
  Building2,
  X,
  Lock,
  Rocket
} from 'lucide-react';
import { useTranslations } from 'next-intl';

// Custom Icons
const StripeIcon = () => (
  <svg viewBox="0 0 40 40" className="w-6 h-6" fill="currentColor">
    <path d="M13.9 19.5h12.2c0-3.3-2.5-4.5-5.6-4.5-2.6 0-5 1-6.5 2.1l-2.5-4.2C14.1 11.1 18 9.5 22 9.5c8.3 0 12.8 4.2 12.8 11.8v10h-6.8v-2.3c-1.9 2-4.6 3.1-7.7 3.1-5.7 0-9.7-3.2-9.7-8.2 0-5.4 4.8-8 13.1-8.2V15c0-1.7-1.3-2.7-3.8-2.7-2.1 0-4 .7-5.3 1.6l-1.5 3.3.8 2.3zM28 23v-1c-4.4.2-6.5 1.5-6.5 3.7 0 1.8 1.4 2.8 3.5 2.8 3 0 3 .2 3-5.5z" />
  </svg>
);

const MercadoPagoIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M14.6 12.4c0 .8-.5 1.4-1.1 1.6l4.3 8h-3l-3.3-6.5Ñh-1.3v6.5h-2.5v-16h4.5c2.1 0 3.7 1.1 3.7 3.2 0 1.5-.9 2.7-2.3 3.2zM12.7 8h-2v2.5h2c.8 0 1.4-.5 1.4-1.2 0-.8-.6-1.3-1.4-1.3z" />
    <path d="M5.5 18h2.8l2.5-12h-3L5.5 18z" opacity=".5" />
  </svg>
);

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
  const [eaEmail, setEaEmail] = useState('');
  const [eaPassword, setEaPassword] = useState('');
  const [backupCodes, setBackupCodes] = useState(['', '', '']);
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [isSubmittingData, setIsSubmittingData] = useState(false);
  const [userCountry, setUserCountry] = useState<string | null>(null);

  const isArgentina = userCountry === 'AR';

  // Detect user country for payment method filtering
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        setUserCountry(data.country_code || null);
        // Auto-select the best payment method for the region
        if (data.country_code === 'AR') {
          setMethod('MERCADOPAGO');
        } else {
          setMethod('STRIPE');
        }
      })
      .catch(() => setUserCountry(null)); // Fallback: show all methods
  }, []);

  const coins = searchParams.get('coins') || '0';
  const price = searchParams.get('price') || '0';

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'application/pdf': [] },
    multiple: false,
  });

  const handlePayNow = async () => {
    if (!email) return;
    setLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const token = localStorage.getItem('auth_token') || '';
      const authHeaders: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

      // Step 1: Create the order
      const orderRes = await fetch(`${backendUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          user_email: email,
          coin_amount: parseInt(coins),
          paymentMethod: method,
        }),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create order');
      }

      const orderData = await orderRes.json();
      const orderId = orderData.order.id;

      // Step 2: Handle payment based on method
      if (method === 'MERCADOPAGO') {
        // Create MercadoPago preference and redirect
        const mpRes = await fetch(`${backendUrl}/payments/mercadopago`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
          body: JSON.stringify({
            orderId,
            title: `FC 26 Coins - ${parseInt(coins).toLocaleString()} coins`,
            quantity: 1,
            unitPrice: parseFloat(price),
            buyerEmail: email,
          }),
        });

        if (!mpRes.ok) throw new Error('Failed to create MercadoPago preference');

        const mpData = await mpRes.json();
        // Redirect to MercadoPago checkout (sandbox for testing)
        window.location.href = mpData.sandboxInitPoint || mpData.initPoint;
        return;
      }

      if (method === 'TRANSFER' && file) {
        // Upload receipt
        const formData = new FormData();
        formData.append('file', file);

        await fetch(`${backendUrl}/payments/transfer/${orderId}/proof`, {
          method: 'POST',
          headers: authHeaders,
          body: formData,
        });
      }

      // For STRIPE (placeholder) and TRANSFER (after upload), show success
      setIsSuccess(true);
      setTimeout(() => router.push(`/${locale}`), 3000);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Hubo un error al procesar tu orden. ' + (error instanceof Error ? error.message : ''));
    } finally {
      setLoading(false);
    }
  };

  const handleFUTSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingData(true);
    // simulated API call to submit EA Data
    setTimeout(() => {
      setIsSubmittingData(false);
      setIsDataSubmitted(true);
    }, 1500);
  };

  if (isSuccess) {
    if (!isDataSubmitted) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-2xl mx-auto py-12"
        >
          <div className="w-full bg-white dark:bg-[#161616] border border-black/10 dark:border-white/10 rounded-2xl p-8 shadow-sm dark:shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-neon-light/10 dark:bg-neon/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-neon-light/20 dark:border-neon/20">
                <CheckCircle2 className="w-8 h-8 text-neon-light dark:text-neon" />
              </div>
              <h2 className="text-3xl font-black text-[#1A1A1A] dark:text-white italic uppercase mb-2 tracking-tight">{t('orderReceived')}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                {t('thankYou')} {t('completeFutData') || "Por favor, completa tus datos de EA para comenzar el envío."}
              </p>
            </div>

            <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
              <Lock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">{t('endToEndEncryption') || "Tus datos están encriptados"}</h4>
                <p className="text-xs text-blue-600/80 dark:text-blue-400/80 font-medium leading-relaxed">
                  {t('encryptionDesc') || "Nadie, excepto el sistema automatizado, tiene acceso a tu información. Tu cuenta está segura al 100% mediante cifrado end-to-end."}
                </p>
              </div>
            </div>

            <form onSubmit={handleFUTSubmit} className="space-y-6 text-left">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">EA Email</label>
                  <input
                    type="email"
                    required
                    value={eaEmail}
                    onChange={(e) => setEaEmail(e.target.value)}
                    placeholder="tu-email@ejemplo.com"
                    className="w-full bg-[#FAFAFA] dark:bg-[#0D0D0D] border border-black/10 dark:border-white/5 rounded-xl py-3 px-4 text-[#1A1A1A] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-[var(--color-neon-light)] dark:focus:border-[var(--color-neon)] transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">EA Password</label>
                  <input
                    type="password"
                    required
                    value={eaPassword}
                    onChange={(e) => setEaPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#FAFAFA] dark:bg-[#0D0D0D] border border-black/10 dark:border-white/5 rounded-xl py-3 px-4 text-[#1A1A1A] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-[var(--color-neon-light)] dark:focus:border-[var(--color-neon)] transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Backup Codes (x3)</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[0, 1, 2].map((idx) => (
                      <input
                        key={idx}
                        type="text"
                        required
                        maxLength={8}
                        value={backupCodes[idx]}
                        onChange={(e) => {
                          const newCodes = [...backupCodes];
                          newCodes[idx] = e.target.value;
                          setBackupCodes(newCodes);
                        }}
                        placeholder="12345678"
                        className="w-full bg-[#FAFAFA] dark:bg-[#0D0D0D] border border-black/10 dark:border-white/5 rounded-xl py-3 px-3 text-center font-mono text-sm text-[#1A1A1A] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-[var(--color-neon-light)] dark:focus:border-[var(--color-neon)] transition-all uppercase"
                      />
                    ))}
                  </div>
                  <a href="https://myaccount.ea.com/cp-ui/security/index" target="_blank" rel="noreferrer" className="text-[10px] text-[var(--color-neon-light)] dark:text-[var(--color-neon)] hover:underline mt-2 inline-block font-bold">
                    {t('howToGetBackupCodes') || "¿Cómo obtengo mis Backup Codes?"}
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingData}
                className="w-full neon-button py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] mt-6"
              >
                {isSubmittingData ? <Loader2 className="w-5 h-5 animate-spin" /> : (t('startBoost') || 'Comenzar')}
              </button>
            </form>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex flex-col items-center justify-center text-center p-6 w-full max-w-lg mx-auto"
      >
        <div className="w-24 h-24 bg-neon-light/10 dark:bg-neon/10 border border-neon-light/20 dark:border-neon/20 rounded-[2rem] flex items-center justify-center mb-8 shadow-sm dark:shadow-[0_0_40px_rgba(0,255,136,0.2)]">
          <Rocket className="w-12 h-12 text-neon-light dark:text-neon" />
        </div>
        <h2 className="text-4xl font-black text-[#1A1A1A] dark:text-white italic uppercase mb-4 tracking-tighter">{t('processingOrder') || "¡Todo Listo!"}</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium max-w-sm mb-10 leading-relaxed">
          {t('processingDesc') || "Tus datos han sido recibidos. Nuestro sistema automatizado está iniciando sesión de forma segura para transferir tus monedas."}
        </p>
        <div className="flex justify-center gap-4">
          <button onClick={() => router.push(`/${locale}`)} className="text-[#1A1A1A] dark:text-white bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
            {t('backToHome')}
          </button>
          <button onClick={() => router.push(`/${locale}`)} className="neon-button px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all">
            {t('trackOrder') || "Seguir Pedido"}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
      <div className="flex items-center gap-4 mb-12">
        <button onClick={() => router.back()} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-[#1A1A1A] dark:text-white" />
        </button>
        <h1 className="text-4xl font-black text-[#1A1A1A] dark:text-white italic uppercase tracking-tighter">{t('secureCheckout')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Payment & Info */}
        <div className="lg:col-span-8 space-y-12">
          {/* Contact */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neon-light/10 dark:bg-neon/10 flex items-center justify-center text-neon-light dark:text-neon font-bold text-sm">1</div>
              <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white uppercase tracking-tight">{t('contactInfo')}</h2>
            </div>
            <div className="bg-white dark:bg-[#161616] border border-black/10 dark:border-white/10 shadow-sm dark:shadow-none rounded-[0.75rem] p-6">
              <input
                type="email"
                placeholder={t('enterEmail')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAFAFA] dark:bg-[#0D0D0D] border border-black/5 dark:border-white/5 rounded-xl py-4 px-6 text-[#1A1A1A] dark:text-white placeholder:text-gray-500 focus:outline-none focus:border-neon-light dark:focus:border-neon transition-all"
              />
              <p className="mt-4 text-xs text-gray-500 flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" /> {t('privacy')}
              </p>
            </div>
          </section>

          {/* Payment Methods */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neon-light/10 dark:bg-neon/10 flex items-center justify-center text-neon-light dark:text-neon font-bold text-sm">2</div>
              <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white uppercase tracking-tight">{t('paymentMethod')}</h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Stripe: visible for non-AR countries */}
              {!isArgentina && (
                <PaymentOption
                  active={method === 'STRIPE'}
                  onClick={() => setMethod('STRIPE')}
                  icon={<StripeIcon />}
                  title={t('creditCard')}
                  subtitle="Powered by Stripe"
                />
              )}
              {/* MercadoPago: visible for Argentina */}
              {(isArgentina || userCountry === null) && (
                <PaymentOption
                  active={method === 'MERCADOPAGO'}
                  onClick={() => setMethod('MERCADOPAGO')}
                  icon={<MercadoPagoIcon />}
                  title={t('mercadoPago')}
                  subtitle="Pagos Locales (ARS)"
                />
              )}
              {/* Bank Transfer: visible for Argentina */}
              {(isArgentina || userCountry === null) && (
                <PaymentOption
                  active={method === 'TRANSFER'}
                  onClick={() => setMethod('TRANSFER')}
                  icon={<Building2 className="w-6 h-6" />}
                  title={t('bankTransfer')}
                  subtitle="Aprobación Manual (Instantáneo)"
                  highlight
                />
              )}

              <AnimatePresence>
                {method === 'TRANSFER' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white dark:bg-[#161616] border border-black/10 dark:border-white/10 shadow-sm dark:shadow-none rounded-[0.75rem] p-8 mt-4 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('bankDetails')}</h3>
                          <div className="space-y-2 font-mono text-sm bg-[#FAFAFA] dark:bg-[#0D0D0D] p-4 rounded-xl border border-black/5 dark:border-white/5">
                            <p className="text-[#1A1A1A] dark:text-white flex justify-between"><span className="text-gray-500">Alias:</span> VENTA.GAMING.OK</p>
                            <p className="text-[#1A1A1A] dark:text-white flex justify-between"><span className="text-gray-500">Holder:</span> Santiago G.</p>
                            <p className="text-[#1A1A1A] dark:text-white flex justify-between"><span className="text-gray-500">CBU:</span> 00000031000...</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('uploadReceipt')}</h3>
                          <div className="relative group">
                            {preview ? (
                              <div className="relative aspect-video rounded-xl overflow-hidden border border-[var(--color-neon-light)]/30 dark:border-[#00FF88]/30 group-hover:border-[var(--color-neon-light)] dark:group-hover:border-[#00FF88] transition-colors shadow-2xl">
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
                              <div
                                {...getRootProps()}
                                className={`flex flex-col items-center justify-center aspect-video border-2 border-dashed rounded-xl cursor-pointer transition-all group relative overflow-hidden ${isDragActive
                                  ? 'border-neon-light dark:border-neon bg-neon-light/10 dark:bg-neon/10'
                                  : 'border-black/10 dark:border-white/10 hover:border-neon-light dark:hover:border-neon hover:bg-neon-light/5 dark:hover:bg-neon/5'
                                  }`}
                              >
                                <input {...getInputProps()} />
                                <div className="absolute inset-0 bg-gradient-to-tr from-neon-light/0 dark:from-neon/0 via-transparent to-neon-light/5 dark:to-neon/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <Upload className={`w-10 h-10 mb-4 transition-all duration-300 ${isDragActive ? 'text-neon-light dark:text-neon scale-110' : 'text-gray-500 group-hover:text-neon-light dark:group-hover:text-neon group-hover:scale-110'}`} />
                                <span className={`text-sm font-bold transition-colors ${isDragActive ? 'text-neon-light dark:text-neon' : 'text-gray-500 dark:text-gray-400 group-hover:text-[#1A1A1A] dark:group-hover:text-white'}`}>
                                  {isDragActive ? 'Drop it here!' : t('dragDrop')}
                                </span>
                                <span className="text-[10px] text-gray-500 mt-1 uppercase font-black tracking-widest group-hover:text-neon-light/70 dark:group-hover:text-neon/70 transition-colors">PNG, JPG or PDF</span>
                              </div>
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
          <div className="bg-white dark:bg-[#161616] border border-black/10 dark:border-white/10 shadow-sm dark:shadow-none rounded-[0.75rem] p-8 sticky top-32 space-y-8">
            <h2 className="text-xl font-black text-[#1A1A1A] dark:text-white italic uppercase tracking-tighter">{t('orderSummary')}</h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-500 font-medium">{t('quantity')}</span>
                <span className="text-[#1A1A1A] dark:text-white font-bold italic">{parseInt(coins).toLocaleString()} FC 26 Coins</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-500 font-medium">{t('subtotal')}</span>
                <span className="text-[#1A1A1A] dark:text-white font-bold">${price}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-500 font-medium">{t('serviceFee')}</span>
                <span className="text-neon-light dark:text-neon font-bold">{t('free')}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-black/5 dark:border-white/5 flex justify-between items-end">
              <div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">{t('totalToPay')}</span>
                <span className="text-4xl font-black text-[#1A1A1A] dark:text-white italic tracking-tighter">${price}</span>
              </div>
              <ShieldCheck className="w-10 h-10 text-neon-light/20 dark:text-neon/20" />
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                <ShieldCheck className="w-5 h-5 text-neon-light dark:text-neon" />
                <span className="text-[9px] font-black text-gray-500 uppercase text-center">{t('sslSecure')}</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                <CheckCircle2 className="w-5 h-5 text-neon-light dark:text-neon" />
                <span className="text-[9px] font-black text-gray-500 uppercase text-center">{t('verifiedStock')}</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePayNow}
              disabled={loading || !email}
              className={`w-full py-5 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${loading || !email
                ? 'bg-black/5 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'neon-button shadow-[0_0_20px_rgba(0,255,136,0.3)]'
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
      className={`flex items-center gap-6 p-6 rounded-xl border-2 transition-all text-left relative overflow-hidden group ${active
        ? 'bg-neon-light/5 dark:bg-neon/5 border-neon-light dark:border-neon shadow-[0_0_20px_rgba(0,255,136,0.1)]'
        : 'bg-white dark:bg-[#161616] border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20'
        }`}
    >
      {highlight && !active && (
        <div className="absolute top-0 right-0 bg-neon-light dark:bg-neon text-white dark:text-black text-[10px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-widest">
          Recommended
        </div>
      )}
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${active ? 'bg-neon-light dark:bg-neon text-white dark:text-black' : 'bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-400 group-hover:text-[#1A1A1A] dark:group-hover:text-white'
        }`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-black text-[#1A1A1A] dark:text-white uppercase tracking-tight italic">{title}</h3>
        <p className="text-xs text-gray-500 font-bold">{subtitle}</p>
      </div>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${active ? 'border-neon-light dark:border-neon bg-neon-light dark:bg-neon' : 'border-black/10 dark:border-white/10'
        }`}>
        {active && <CheckCircle2 className="w-4 h-4 text-white dark:text-black" />}
      </div>
    </button>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0A0A0A] selection:bg-[var(--color-neon-light)] dark:selection:bg-[var(--color-neon)] selection:text-white dark:selection:text-black transition-colors duration-300">
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="w-10 h-10 text-neon-light dark:text-neon animate-spin" /></div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}