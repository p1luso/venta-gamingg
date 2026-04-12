'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Wallet, 
  History, 
  Star, 
  ShieldCheck, 
  TrendingUp,
  Clock,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Gift
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { API_URL } from '@/lib/api';

interface TierProgress {
  tier: string;
  cashbackPct: number;
  currentXp: number;
  tierMinXp: number;
  tierMaxXp: number | null;
  progressPct: number;
  nextTier: string | null;
  xpToNextTier: number | null;
}

interface Order {
  id: string;
  amount_coins: number;
  price_paid: string;
  status: string;
  platform: string;
  transfer_status: string;
  cashback_earned: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  role: string;
  tier: string;
  wallet_balance: string;
  xp_points: number;
  created_at: string;
  tierProgress: TierProgress;
  orders: Order[];
}

export default function ProfilePage() {
  const t = useTranslations('Dashboard');
  const locale = useLocale();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        window.location.href = `/${locale}`;
        return;
      }

      const response = await fetch(`${API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          window.location.href = `/${locale}`;
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al cargar tu perfil.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-neon animate-spin" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs animate-pulse">Cargando tu panel...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-red-500/5 border border-red-500/20 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-black italic uppercase text-red-500 mb-2">Error</h2>
          <p className="text-gray-500 mb-6">{error || 'No se pudo cargar la información.'}</p>
          <button 
            onClick={fetchProfile}
            className="w-full py-3 rounded-xl bg-red-500 text-white font-bold uppercase tracking-widest hover:bg-red-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 md:pt-36 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon/10 border border-neon/20 mb-4">
                <Star className="w-3 h-3 text-neon" />
                <span className="text-[10px] font-black text-neon uppercase tracking-widest">{profile.tier} Member</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none dark:text-white">
                {t('welcome', { name: profile.username || profile.email.split('@')[0] })}
              </h1>
            </div>
            
            <div className="flex gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 flex items-center gap-4 group hover:border-neon/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-neon/10 flex items-center justify-center text-neon group-hover:bg-neon group-hover:text-black transition-all">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('walletBalance')}</p>
                  <p className="text-2xl font-black text-neon tracking-tight">${Number(profile.wallet_balance).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Dashboard Column */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Loyalty Tier Progress */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-[2.5rem] bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-neon/5 blur-[100px] -z-10" />
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neon/10 flex items-center justify-center text-neon">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-black italic uppercase tracking-tight dark:text-white">{t('tierProgress')}</h2>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{t('currentTier')}</span>
                  <span className="text-sm font-black italic uppercase text-neon">{profile.tier}</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    {profile.tierProgress.nextTier 
                      ? t('xpToNext', { amount: profile.tierProgress.xpToNextTier ?? 0, tier: profile.tierProgress.nextTier })
                      : t('maxTierReached')
                    }
                  </p>
                  <p className="text-sm font-black italic text-neon">{profile.xp_points} XP</p>
                </div>

                {/* Progress Bar */}
                <div className="h-4 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden p-1">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${profile.tierProgress.progressPct}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-neon-light to-neon rounded-full shadow-[0_0_15px_rgba(0,255,136,0.3)]"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-black/5 dark:border-white/5">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('cashback')}</p>
                    <p className="text-lg font-black italic text-white">{(profile.tierProgress.cashbackPct * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total XP</p>
                    <p className="text-lg font-black italic text-white">{profile.xp_points}</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Recent Orders */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-[2.5rem] bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 overflow-hidden"
            >
              <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neon/10 flex items-center justify-center text-neon">
                    <History className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-black italic uppercase tracking-tight dark:text-white">{t('recentOrders')}</h2>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-black/[0.02] dark:bg-white/[0.02] text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                      <th className="px-8 py-4">{t('orderId')}</th>
                      <th className="px-8 py-4">{t('amount')}</th>
                      <th className="px-8 py-4">{t('status')}</th>
                      <th className="px-8 py-4">{t('date')}</th>
                      <th className="px-8 py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {profile.orders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-12 text-center">
                          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs italic">{t('noOrders')}</p>
                        </td>
                      </tr>
                    ) : profile.orders.map((order) => (
                      <tr key={order.id} className="group hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                        <td className="px-8 py-6">
                          <p className="text-xs font-mono font-bold text-gray-500">#{order.id.split('-')[0].toUpperCase()}</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <Star className="w-3 h-3 text-neon" />
                            <span className="text-sm font-black italic text-[#1A1A1A] dark:text-white">{order.amount_coins.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            order.status === 'PAID' ? 'bg-green-500/10 text-green-500' : 
                            order.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' : 
                            'bg-red-500/10 text-red-500'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              order.status === 'PAID' ? 'bg-green-500' : 
                              order.status === 'PENDING' ? 'bg-yellow-500' : 
                              'bg-red-500'
                            }`} />
                            {order.status}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-[10px] font-bold text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button className="p-2 rounded-lg bg-black/5 dark:bg-white/5 text-gray-400 hover:text-neon hover:bg-neon/10 transition-all opacity-0 group-hover:opacity-100">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.section>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Quick Actions / Info */}
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="p-8 rounded-[2.5rem] bg-black dark:bg-[#121212] text-white border border-white/5 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-neon/10 to-transparent -z-10" />
              
              <h3 className="text-lg font-black italic uppercase tracking-tight mb-6 flex items-center gap-2">
                <Gift className="w-5 h-5 text-neon" />
                Beneficios Pro
              </h3>
              
              <ul className="space-y-4 mb-8">
                {[
                  { text: 'Cashback automático en cada compra', active: true },
                  { text: 'Soporte prioritario 24/7', active: true },
                  { text: 'Acceso a bonos temporales de XP', active: profile.tier !== 'BRONZE' },
                  { text: 'Descuentos exclusivos en Boosting', active: profile.tier === 'PLATINUM' }
                ].map((item, i) => (
                  <li key={i} className={`flex items-start gap-3 text-xs ${item.active ? 'text-white' : 'text-gray-600'}`}>
                    <ShieldCheck className={`w-4 h-4 shrink-0 ${item.active ? 'text-neon' : 'text-gray-800'}`} />
                    <span className="font-medium">{item.text}</span>
                  </li>
                ))}
              </ul>

              <button className="w-full py-4 rounded-2xl bg-neon text-black font-black italic uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all">
                Subir de Nivel
              </button>
            </motion.section>

            {/* Trading Stats */}
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="p-8 rounded-[2.5rem] bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5"
            >
              <h3 className="text-sm font-black italic uppercase tracking-widest text-gray-400 mb-6">Resumen de Cuenta</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Gasto Total</span>
                  </div>
                  <span className="text-sm font-black italic text-white">$---</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Miembro desde</span>
                  </div>
                  <span className="text-sm font-black italic text-white">{new Date(profile.created_at).getFullYear()}</span>
                </div>
              </div>
            </motion.section>

          </div>
        </div>

      </div>
    </div>
  );
}
