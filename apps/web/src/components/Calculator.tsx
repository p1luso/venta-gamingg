'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ArrowRightLeft, Info, TrendingUp, Loader2, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';

const COIN_PRICE_PER_MILLION_PC = 13.50; // Example lower price for PC
const COIN_PRICE_PER_MILLION_CONSOLE = 15.50; // PS/Xbox

export default function Calculator() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';
  const t = useTranslations('Calculator');

  const [coins, setCoins] = useState(500000);
  const [platform, setPlatform] = useState<'ps' | 'xbox' | 'pc'>('ps');
  const [totalPrice, setTotalPrice] = useState(0);
  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [isLoading, setIsLoading] = useState(false);
  const [isArgentina, setIsArgentina] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  const MAX_COINS = 4000000;
  const MIN_COINS = 100000;
  const BONUS_THRESHOLD = 1000000;

  useEffect(() => {
    const pricePerMillion = platform === 'pc' ? COIN_PRICE_PER_MILLION_PC : COIN_PRICE_PER_MILLION_CONSOLE;
    setTotalPrice((coins / 1000000) * pricePerMillion);
  }, [coins, platform, type]);

  useEffect(() => {
    // Detect country
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data.country_code === 'AR') {
          setIsArgentina(true);
        }
      })
      .catch(() => {});

    // Fetch exchange rate
    fetch('https://dolarapi.com/v1/dolares/blue')
      .then(res => res.json())
      .then(data => {
        if (data && data.venta) {
          setExchangeRate(data.venta);
        }
      })
      .catch(() => {});
  }, []);

  const getDeliveryTime = () => {
    if (coins < 500000) return '15-30 MINS';
    if (coins < 2000000) return '30-60 MINS';
    return '1-2 HOURS';
  };

  const handleBuyNow = () => {
    setIsLoading(true);
    // Simulate a small delay for the animation
    setTimeout(() => {
      router.push(`/${locale}/checkout?coins=${coins}&price=${totalPrice.toFixed(2)}&platform=${platform}`);
    }, 800);
  };

  const getProgress = () => ((coins - MIN_COINS) / (MAX_COINS - MIN_COINS)) * 100;
  const getBonusProgress = () => Math.min((coins / BONUS_THRESHOLD) * 100, 100);
  const coinsNeededForBonus = Math.max(0, BONUS_THRESHOLD - coins);
  const bonusAmount = (coins * 0.05 / 1000).toFixed(0);

  return (
    <AnimatePresence mode="wait">
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-xl bg-white dark:bg-[#161616] rounded-[0.75rem] border border-black/10 dark:border-white/10 p-5 md:p-8 shadow-2xl relative overflow-hidden group/card mx-auto"
        >
          {/* Background Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-neon-light/10 dark:bg-neon/10 blur-[100px] group-hover/card:bg-neon-light/20 dark:group-hover/card:bg-neon/20 transition-colors duration-700" />

          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neon-light dark:bg-neon animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-neon-light dark:text-neon">{t('stockAvailable')}</span>
            </div>
            <div className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">
              FC 26
            </div>
          </div>

          {/* Bonus Progress Bar */}
          <div className="mb-8 p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 relative overflow-hidden">
            <div className="flex justify-between items-center mb-2 relative z-10">
              <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase">
                {coinsNeededForBonus > 0
                  ? t('addForBonus', { amount: (coinsNeededForBonus / 1000).toFixed(0) })
                  : t('bonusUnlocked', { bonus: bonusAmount })}
              </span>
              <span className="text-[10px] font-bold text-neon-light dark:text-neon">
                {coinsNeededForBonus > 0 ? '5%' : `+${bonusAmount}K`}
              </span>
            </div>
            <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden relative z-10">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300"
                initial={{ width: 0 }}
                animate={{ width: `${getBonusProgress()}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            {coinsNeededForBonus === 0 && (
              <div className="absolute inset-0 bg-yellow-500/10 animate-pulse" />
            )}
          </div>

          {/* Toggle */}
          <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-full mb-8 relative border border-black/5 dark:border-white/5">
            <div
              className="absolute h-[calc(100%-8px)] transition-all duration-300 ease-out bg-neon-light dark:bg-neon rounded-full shadow-[0_0_15px_rgba(0,204,106,0.3)] dark:shadow-[0_0_15px_rgba(0,255,136,0.3)]"
              style={{
                width: '50%',
                left: type === 'buy' ? '4px' : 'calc(50% - 4px)'
              }}
            />
            <button
              onClick={() => setType('buy')}
              className={`flex-1 py-2.5 text-xs font-black rounded-full relative z-10 transition-all duration-300 uppercase italic ${type === 'buy' ? 'text-white dark:text-black' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              {t('buyCoins')}
            </button>
            <button
              onClick={() => setType('sell')}
              className={`flex-1 py-2.5 text-xs font-black rounded-full relative z-10 transition-all duration-300 uppercase italic ${type === 'sell' ? 'text-white dark:text-black' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              {t('sellCoins')}
            </button>
          </div>

          <div className="space-y-8">
            {/* Input Header */}
            <div className="flex flex-wrap justify-between items-start gap-4 w-full">
              {/* Left Side: Amount Input */}
              <div className="space-y-1 min-w-[200px] flex-grow">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] block">{t('selectAmount')}</label>
                <div className="flex items-baseline gap-1">
                  <input
                    type="text"
                    value={coins.toLocaleString('de-DE')}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\./g, '');
                      const val = parseInt(rawValue);
                      if (!isNaN(val)) {
                        if (val > MAX_COINS) setCoins(MAX_COINS);
                        else setCoins(val);
                      } else if (rawValue === '') {
                        setCoins(0);
                      }
                    }}
                    className="text-4xl sm:text-5xl font-black text-[#1A1A1A] dark:text-white italic tracking-tighter bg-transparent border-none focus:outline-none w-full max-w-[220px] p-0 m-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-1"
                  />
                  <span className="text-neon-light dark:text-neon font-black text-xs uppercase italic tracking-tighter shrink-0">FC 26</span>
                </div>
              </div>
              
              {/* Right Side: Price Display */}
              <div className="flex flex-row sm:flex-col justify-between sm:justify-end items-center sm:items-end gap-3 sm:gap-1 w-full sm:w-auto pt-2 sm:pt-0 shrink-0">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-neon-light/10 dark:bg-neon/10 text-neon-light dark:text-neon text-[10px] sm:text-[10px] font-black uppercase italic border border-neon-light/20 dark:border-neon/20 whitespace-nowrap">
                  <TrendingUp className="w-3 h-3" />
                  <span>{t('bestRate')}</span>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-3xl sm:text-4xl font-black text-[#1A1A1A] dark:text-white italic tracking-tighter whitespace-nowrap leading-none mb-1">
                    {isArgentina && exchangeRate 
                      ? `$${Math.round(totalPrice * exchangeRate).toLocaleString('es-AR')} ARS` 
                      : `$${totalPrice.toFixed(2)} USD`}
                  </div>
                  {isArgentina && exchangeRate && (
                    <div className="text-[10px] sm:text-xs text-gray-500 font-bold mix-blend-luminosity whitespace-nowrap leading-none">
                      (${totalPrice.toFixed(2)} USD)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Slider */}
            <div className="relative h-4 flex items-center">
              <div className="absolute w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden border border-black/10 dark:border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-[var(--color-neon-light)]/50 to-[var(--color-neon-light)] dark:from-[var(--color-neon)]/50 dark:to-[var(--color-neon)] shadow-[0_0_20px_rgba(0,255,136,0.4)]"
                  style={{ width: `${getProgress()}%` }}
                />
              </div>
              <input
                type="range"
                min={MIN_COINS}
                max={MAX_COINS}
                step="100000"
                value={coins}
                onChange={(e) => setCoins(parseInt(e.target.value))}
                className="absolute w-full h-full opacity-0 cursor-pointer z-20"
              />
              <div
                className="absolute w-6 h-6 bg-white rounded-full border-[6px] border-black shadow-[0_0_20px_rgba(0,0,0,0.5)] z-10 pointer-events-none transition-all duration-200"
                style={{
                  left: `calc(${getProgress()}% - 12px)`,
                  boxShadow: '0 0 15px rgba(0,255,136,0.3)'
                }}
              />
            </div>

            {/* Info Grid - Responsive Stack */}
            <div className="space-y-3">
              {/* Platform Selector */}
              <div className="bg-[#FAFAFA] dark:bg-[#0D0D0D] p-4 rounded-xl border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 transition-colors relative group">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-neon-light/10 dark:bg-neon/10 text-neon-light dark:text-neon">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('platform')}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(['ps', 'xbox', 'pc'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`py-3 sm:py-2 px-1 rounded-lg text-xs sm:text-[10px] md:text-xs font-black uppercase italic transition-all border ${platform === p
                        ? 'bg-neon-light dark:bg-neon text-white dark:text-black border-neon-light dark:border-neon shadow-sm dark:shadow-[0_0_15px_rgba(0,255,136,0.3)]'
                        : 'bg-black/5 dark:bg-black/20 text-gray-500 border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 hover:text-black dark:hover:text-gray-300'
                        }`}
                    >
                      {p === 'ps' ? 'PlayStation' : p === 'xbox' ? 'Xbox' : 'PC'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prominent Delivery Time */}
              <div className="bg-blue-500/10 dark:bg-blue-500/5 p-4 rounded-xl border border-blue-500/20 dark:border-blue-500/10 flex items-center justify-between relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-500/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-30" />
                    <div className="relative p-2 rounded-xl bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                      <Zap className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                  <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{t('deliveryTime')}</span>
                </div>
                <div className="flex flex-col items-end relative z-10">
                  <span className="text-lg font-black text-blue-700 dark:text-blue-300 italic tracking-tighter leading-none">{getDeliveryTime()}</span>
                  <span className="text-[9px] text-blue-500/70 font-bold uppercase mt-1">Estimado</span>
                </div>
              </div>
            </div>



            {/* CTA */}
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                disabled={isLoading}
                className="w-full neon-button hover:shadow-[0_0_20px_rgba(0,204,106,0.3)] dark:hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] py-5 rounded-[0.75rem] font-black uppercase tracking-tighter flex items-center justify-center gap-3 transition-all relative overflow-hidden group/btn disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 fill-current" />
                    <span className="relative z-10 italic text-lg text-white dark:text-black">{t('checkoutNow')}</span>
                  </>
                )}
              </motion.button>

              <div className="flex items-center justify-center gap-6 opacity-40 hover:opacity-100 transition-opacity duration-500">
                {/* Removed PayPal */}
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3 grayscale hover:grayscale-0 transition-all" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4 grayscale hover:grayscale-0 transition-all" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="w-full max-w-md h-[600px] bg-white dark:bg-[#161616] rounded-[0.75rem] border border-black/10 dark:border-white/10 p-8 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-12 h-12 text-neon-light dark:text-neon" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-[#1A1A1A] dark:text-white font-black italic uppercase tracking-widest"
          >
            {t('processing') || 'Processing...'}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}