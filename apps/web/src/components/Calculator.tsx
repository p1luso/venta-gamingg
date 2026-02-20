'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ArrowRightLeft, Info, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

const COIN_PRICE_PER_MILLION = 15.50;

export default function Calculator() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';
  const t = useTranslations('Calculator');
  const [coins, setCoins] = useState(500000);
  const [totalPrice, setTotalPrice] = useState((500000 / 1000000) * COIN_PRICE_PER_MILLION);
  const [type, setType] = useState<'buy' | 'sell'>('buy');

  const MAX_COINS = 2000000;
  const MIN_COINS = 100000;
  const BONUS_THRESHOLD = 1000000; // Bonus starts at 1M

  useEffect(() => {
    setTotalPrice((coins / 1000000) * COIN_PRICE_PER_MILLION);
  }, [coins]);

  const handleBuyNow = () => {
    router.push(`/${locale}/checkout?coins=${coins}&price=${totalPrice.toFixed(2)}`);
  };

  const getProgress = () => ((coins - MIN_COINS) / (MAX_COINS - MIN_COINS)) * 100;
  const getBonusProgress = () => Math.min((coins / BONUS_THRESHOLD) * 100, 100);
  const coinsNeededForBonus = Math.max(0, BONUS_THRESHOLD - coins);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-[#111111] rounded-[0.75rem] border border-white/5 p-8 shadow-2xl relative overflow-hidden group/card"
    >
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00FF88]/10 blur-[100px] group-hover/card:bg-[#00FF88]/20 transition-colors duration-700" />
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00FF88]">{t('stockAvailable')}</span>
        </div>
        <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400 uppercase">
          FC 26
        </div>
      </div>

      {/* Bonus Progress Bar (Venta Gamingg Feature) */}
      <div className="mb-8 p-3 rounded-lg bg-white/5 border border-white/10 relative overflow-hidden">
        <div className="flex justify-between items-center mb-2 relative z-10">
          <span className="text-[10px] font-bold text-gray-400 uppercase">
            {coinsNeededForBonus > 0 
              ? t('addForBonus', { amount: (coinsNeededForBonus / 1000).toFixed(0) }) 
              : t('bonusUnlocked')}
          </span>
          <span className="text-[10px] font-bold text-[#00FF88]">{getBonusProgress().toFixed(0)}%</span>
        </div>
        <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden relative z-10">
          <motion.div 
            className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300"
            initial={{ width: 0 }}
            animate={{ width: `${getBonusProgress()}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        {/* Confetti effect on background if bonus unlocked */}
        {coinsNeededForBonus === 0 && (
          <div className="absolute inset-0 bg-yellow-500/10 animate-pulse" />
        )}
      </div>
      
      {/* Toggle */}
      <div className="flex p-1 bg-white/5 rounded-full mb-8 relative border border-white/5">
        <div 
          className="absolute h-[calc(100%-8px)] transition-all duration-300 ease-out bg-[#00FF88] rounded-full shadow-[0_0_15px_rgba(0,255,136,0.3)]"
          style={{ 
            width: '50%', 
            left: type === 'buy' ? '4px' : 'calc(50% - 4px)' 
          }}
        />
        <button 
          onClick={() => setType('buy')}
          className={`flex-1 py-2.5 text-xs font-black rounded-full relative z-10 transition-all duration-300 uppercase italic ${type === 'buy' ? 'text-black' : 'text-gray-500 hover:text-gray-300'}`}
        >
          {t('buyCoins')}
        </button>
        <button 
          onClick={() => setType('sell')}
          className={`flex-1 py-2.5 text-xs font-black rounded-full relative z-10 transition-all duration-300 uppercase italic ${type === 'sell' ? 'text-black' : 'text-gray-500 hover:text-gray-300'}`}
        >
          {t('sellCoins')}
        </button>
      </div>

      <div className="space-y-8">
        {/* Input Header */}
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] block">{t('selectAmount')}</label>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-white italic tracking-tighter">
                {coins >= 1000000 ? `${(coins / 1000000).toFixed(1)}M` : `${(coins / 1000).toFixed(0)}K`}
              </span>
              <span className="text-[#00FF88] font-black text-xs uppercase italic tracking-tighter">FC 26</span>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#00FF88]/10 text-[#00FF88] text-[10px] font-black mb-2 uppercase italic border border-[#00FF88]/20">
              <TrendingUp className="w-3 h-3" />
              <span>{t('bestRate')}</span>
            </div>
            <div className="text-3xl font-black text-white italic tracking-tighter">
              ${totalPrice.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Custom Slider */}
        <div className="relative h-4 flex items-center">
          <div className="absolute w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-[#00FF88]/50 to-[#00FF88] shadow-[0_0_20px_rgba(0,255,136,0.4)]" 
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

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <Info className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('deliveryTime')}</span>
            </div>
            <span className="text-sm font-black text-white italic">{t('deliveryTimeValue')}</span>
          </div>
          <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-[#00FF88]/10 text-[#00FF88]">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('platform')}</span>
            </div>
            <span className="text-sm font-black text-white italic">{t('platformValue')}</span>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBuyNow}
            className="w-full bg-[#00FF88] hover:shadow-[0_20px_40px_rgba(0,255,136,0.2)] text-black py-5 rounded-[0.75rem] font-black uppercase tracking-tighter flex items-center justify-center gap-3 transition-all relative overflow-hidden group/btn"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 skew-x-12" />
            <ShoppingCart className="w-5 h-5 fill-black" />
            <span className="relative z-10 italic text-lg">{t('checkoutNow')}</span>
          </motion.button>

          <div className="flex items-center justify-center gap-6 opacity-40 hover:opacity-100 transition-opacity duration-500">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="Paypal" className="h-4 grayscale hover:grayscale-0 transition-all" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3 grayscale hover:grayscale-0 transition-all" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4 grayscale hover:grayscale-0 transition-all" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
