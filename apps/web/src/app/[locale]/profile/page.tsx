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
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Gift,
  Settings,
  User,
  Lock,
  Save,
  CheckCircle2
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

type TabType = 'overview' | 'orders' | 'settings';

export default function ProfilePage() {
  const t = useTranslations('Dashboard');
  const locale = useLocale();
  
  // Profile Data
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Form states
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchProfile = async (silent = false) => {
    if (!silent) setLoading(true);
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
      setUsername(data.username || '');
    } catch (err) {
      console.error(err);
      if (!silent) setError('Ocurrió un error al cargar tu perfil.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setFormError(null);
    setSuccessMsg(null);

    try {
      const token = localStorage.getItem('auth_token');
      const payload: any = {};
      
      if (username !== profile?.username) payload.username = username;
      if (newPassword) {
        payload.password = newPassword;
        payload.currentPassword = currentPassword;
      }

      if (Object.keys(payload).length === 0) {
        setUpdating(false);
        return;
      }

      const response = await fetch(`${API_URL}/users/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error updating profile');
      }

      setSuccessMsg(t('settings.updateSuccess'));
      setNewPassword('');
      setCurrentPassword('');
      
      // Update local storage for navbar etc
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        localStorage.setItem('user', JSON.stringify({
          ...userData,
          name: username || (profile ? profile.email : '')
        }));
      }

      fetchProfile(true); // Silent refresh
    } catch (err: any) {
      setFormError(err.message || t('settings.updateError'));
    } finally {
      setUpdating(false);
    }
  };

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
            onClick={() => fetchProfile()}
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
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon/10 border border-neon/20">
                  <Star className="w-3 h-3 text-neon" />
                  <span className="text-[10px] font-black text-neon uppercase tracking-widest">{profile.tier} Member</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{profile.role}</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none dark:text-white">
                {t('welcome', { name: profile.username || profile.email })}
              </h1>
            </div>
            
            <div className="flex gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 flex items-center gap-4 group hover:border-neon/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-neon/10 flex items-center justify-center text-neon group-hover:bg-neon group-hover:text-black transition-all shadow-[0_0_15px_rgba(0,255,136,0.1)]">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('walletBalance')}</p>
                  <p className="text-2xl font-black text-neon tracking-tight">${Number(profile.wallet_balance).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-12 p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl w-fit">
            {[
              { id: 'overview', label: t('tabs.overview'), icon: User },
              { id: 'orders', label: t('tabs.orders'), icon: History },
              { id: 'settings', label: t('tabs.settings'), icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black italic uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white dark:bg-[#1A1A1A] text-neon shadow-lg scale-[1.02]' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              <div className="lg:col-span-8 space-y-8">
                {/* Loyalty Tier Progress */}
                <section className="p-8 rounded-[2.5rem] bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 relative overflow-hidden">
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
                        <p className="text-lg font-black italic dark:text-white">{(profile.tierProgress.cashbackPct * 100).toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total XP</p>
                        <p className="text-lg font-black italic dark:text-white">{profile.xp_points}</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Account Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="p-8 rounded-[2.5rem] bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5">
                      <h3 className="text-sm font-black italic uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Gasto Total
                      </h3>
                      <p className="text-4xl font-black italic text-[#1A1A1A] dark:text-white tracking-tighter">$---</p>
                      <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-widest">En todas tus órdenes</p>
                   </div>
                   <div className="p-8 rounded-[2.5rem] bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5">
                      <h3 className="text-sm font-black italic uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Antigüedad
                      </h3>
                      <p className="text-4xl font-black italic text-[#1A1A1A] dark:text-white tracking-tighter">{new Date(profile.created_at).getFullYear()}</p>
                      <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-widest">Miembro verificado</p>
                   </div>
                </div>
              </div>

              <div className="lg:col-span-4">
                <section className="p-8 rounded-[2.5rem] bg-black dark:bg-[#121212] text-white border border-white/5 relative overflow-hidden h-full">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-neon/10 to-transparent -z-10" />
                  <h3 className="text-lg font-black italic uppercase tracking-tight mb-6 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-neon" />
                    Beneficios Pro
                  </h3>
                  <ul className="space-y-6">
                    {[
                      { text: 'Cashback automático en cada compra', active: true },
                      { text: 'Soporte prioritario 24/7', active: true },
                      { text: 'Acceso a bonos temporales de XP', active: profile.tier !== 'BRONZE' },
                      { text: 'Descuentos exclusivos en Boosting', active: profile.tier === 'PLATINUM' }
                    ].map((item, i) => (
                      <li key={i} className={`flex items-start gap-4 ${item.active ? 'opacity-100' : 'opacity-30'}`}>
                        <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${item.active ? 'bg-neon/10 text-neon' : 'bg-white/5 text-white/20'}`}>
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-medium leading-relaxed">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="mt-12 w-full py-4 rounded-2xl bg-neon text-black font-black italic uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all transform hover:-translate-y-1">
                    Subir de Nivel
                  </button>
                </section>
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div 
              key="orders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-[2.5rem] bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-black/[0.02] dark:bg-white/[0.02] text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                      <th className="px-8 py-6">{t('orderId')}</th>
                      <th className="px-8 py-6">{t('amount')}</th>
                      <th className="px-8 py-6">{t('status')}</th>
                      <th className="px-8 py-6">{t('date')}</th>
                      <th className="px-8 py-6 text-right"></th>
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
                        <td className="px-8 py-8">
                          <p className="text-xs font-mono font-bold text-gray-500">#{order.id.split('-')[0].toUpperCase()}</p>
                        </td>
                        <td className="px-8 py-8">
                          <div className="flex items-center gap-2">
                            <Star className="w-3 h-3 text-neon" />
                            <span className="text-sm font-black italic dark:text-white">{order.amount_coins.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-8 py-8">
                          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            order.status === 'PAID' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                            order.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                            'bg-red-500/10 text-red-500 border border-red-500/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'PAID' ? 'bg-green-500' : order.status === 'PENDING' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                            {order.status}
                          </div>
                        </td>
                        <td className="px-8 py-8">
                          <p className="text-[10px] font-bold text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="px-8 py-8 text-right">
                          <button className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-gray-400 hover:text-neon hover:bg-neon/10 hover:border hover:border-neon/20 transition-all opacity-0 group-hover:opacity-100">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Form Section */}
              <div className="lg:col-span-8 space-y-8">
                <form onSubmit={handleUpdateProfile} className="space-y-8">
                  {/* General Info */}
                  <div className="p-8 rounded-[2.5rem] bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-xl bg-neon/10 flex items-center justify-center text-neon">
                        <User className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-black italic uppercase tracking-tight dark:text-white">{t('settings.profileInfo')}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">{t('settings.usernameLabel')}</label>
                        <input 
                          type="text" 
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder={t('settings.usernamePlaceholder')}
                          className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-neon/50 transition-all dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">{t('settings.emailLabel')}</label>
                        <input 
                          type="email" 
                          value={profile.email}
                          disabled
                          className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl px-6 py-4 text-sm font-bold opacity-50 cursor-not-allowed dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security */}
                  <div className="p-8 rounded-[2.5rem] bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-xl bg-neon/10 flex items-center justify-center text-neon">
                        <Lock className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-black italic uppercase tracking-tight dark:text-white">{t('settings.security')}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">{t('settings.currentPasswordLabel')}</label>
                        <input 
                          type="password" 
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder={t('settings.currentPasswordPlaceholder')}
                          className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-neon/50 transition-all dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">{t('settings.passwordLabel')}</label>
                        <input 
                          type="password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder={t('settings.passwordPlaceholder')}
                          className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-neon/50 transition-all dark:text-white"
                        />
                      </div>
                    </div>
                    <p className="mt-4 text-[10px] text-gray-500 font-medium italic">{t('settings.noPasswordSSO')}</p>
                  </div>

                  {/* Feedback Messages */}
                  {formError && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wide">{formError}</span>
                    </motion.div>
                  )}
                  {successMsg && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3 text-green-500">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wide">{successMsg}</span>
                    </motion.div>
                  )}

                  <button 
                    disabled={updating}
                    className="w-full py-5 rounded-[2rem] bg-neon text-black font-black italic uppercase tracking-[0.2em] text-sm hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {updating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {t('settings.saveChanges')}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-4">
                 <div className="p-8 rounded-[2.5rem] bg-blue-500/5 border border-blue-500/10 dark:text-white">
                    <h3 className="text-sm font-black italic uppercase tracking-widest text-blue-400 mb-6">Ayuda con la cuenta</h3>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed mb-8">
                      Si tenés problemas con tu contraseña o querés cambiar tu correo electrónico registrado, ponete en contacto con nuestro equipo de soporte.
                    </p>
                    <button className="text-xs font-black italic uppercase tracking-widest text-[#1A1A1A] dark:text-white flex items-center gap-2 group">
                      Hablar con Soporte
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
