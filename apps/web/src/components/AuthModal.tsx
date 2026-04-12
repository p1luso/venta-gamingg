'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Modal from './Modal';
import { API_URL } from '@/lib/api';
import Image from 'next/image';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }: AuthModalProps) {
  const t = useTranslations('Auth');
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');

  const resetForms = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setUsername('');
    setError(null);
    setSuccess(false);
  };

  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    resetForms();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (activeTab === 'register' && password !== confirmPassword) {
      setError(t('errorPasswordsMatch'));
      setLoading(false);
      return;
    }

    try {
      const endpoint = activeTab === 'login' ? 'login' : 'register';
      const body = activeTab === 'login' 
        ? { email, password }
        : { email, password, username };

      const response = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t('errorGeneric'));
      }

      if (activeTab === 'login') {
        // Handle Login Success
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('user', JSON.stringify({ 
          name: data.user.username || data.user.email,
          role: data.user.role,
          id: data.user.id
        }));
        window.location.reload();
      } else {
        // Handle Register Success
        setSuccess(true);
        setTimeout(() => handleTabChange('login'), 2000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={activeTab === 'login' ? t('welcomeTitle') : t('joinTitle')}>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        
        {/* Left Side: Illustration / Info */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-black to-[#0A0A0A] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon/10 blur-[100px] -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon/5 blur-[100px] -z-10" />
          
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-neon/10 flex items-center justify-center border border-neon/20">
                <Image src="/Icon.svg" alt="Icon" width={24} height={24} />
              </div>
              <span className="text-xl font-black italic uppercase tracking-tighter text-white">Venta<span className="text-neon">Gamingg</span></span>
            </div>
            
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none mb-6">
              {activeTab === 'login' 
                ? "ACCEDE A LA <br/> PLATAFORMA ELITE" 
                : "FORMA PARTE DE <br/> LOS PRO PLAYERS"
              }
            </h2>
            <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-xs">
              Únete a miles de jugadores que ya dominan el mercado de FC 26 con la mejor seguridad y velocidad.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 p-3 rounded-xl border border-white/5">
              <CheckCircle2 className="w-4 h-4 text-neon" />
              Transferencias 100% Seguras
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 p-3 rounded-xl border border-white/5">
              <CheckCircle2 className="w-4 h-4 text-neon" />
              Soporte VIP 24/7
            </div>
          </div>
        </div>

        {/* Right Side: Forms */}
        <div className="p-8 md:p-12 bg-[#121212]">
          {/* Tabs */}
          <div className="flex gap-2 mb-10 p-1.5 bg-black/50 rounded-2xl border border-white/5">
            <button
              onClick={() => handleTabChange('login')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black italic uppercase tracking-widest transition-all ${
                activeTab === 'login' 
                  ? 'bg-neon text-black shadow-[0_0_20px_rgba(0,255,136,0.3)]' 
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              {t('login')}
            </button>
            <button
              onClick={() => handleTabChange('register')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black italic uppercase tracking-widest transition-all ${
                activeTab === 'register' 
                  ? 'bg-neon text-black shadow-[0_0_20px_rgba(0,255,136,0.3)]' 
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              {t('register')}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black italic uppercase text-white mb-2">{t('successRegister')}</h3>
                <p className="text-gray-500 text-sm italic">{t('loginNow')}</p>
              </motion.div>
            ) : (
              <motion.form
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {activeTab === 'register' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">{t('username')}</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={t('usernamePlaceholder')}
                        className="w-full bg-black/50 border border-white/5 rounded-2xl px-12 py-4 text-sm font-bold text-white focus:outline-none focus:border-neon transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">{t('email')}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('emailPlaceholder')}
                      className="w-full bg-black/50 border border-white/5 rounded-2xl px-12 py-4 text-sm font-bold text-white focus:outline-none focus:border-neon transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">{t('password')}</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('passwordPlaceholder')}
                      className="w-full bg-black/50 border border-white/5 rounded-2xl px-12 py-4 text-sm font-bold text-white focus:outline-none focus:border-neon transition-all"
                    />
                  </div>
                </div>

                {activeTab === 'register' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">{t('confirmPassword')}</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t('confirmPasswordPlaceholder')}
                        className="w-full bg-black/50 border border-white/5 rounded-2xl px-12 py-4 text-sm font-bold text-white focus:outline-none focus:border-neon transition-all"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-wide">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 rounded-2xl bg-neon text-black font-black italic uppercase tracking-[0.2em] text-xs hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4 shadow-[0_4px_20px_rgba(0,255,136,0.1)]"
                >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : activeTab === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  {activeTab === 'login' ? t('submitLogin') : t('submitRegister')}
                </button>

                <div className="relative py-4 flex items-center justify-center">
                  <div className="absolute left-0 right-0 h-px bg-white/5" />
                  <span className="relative px-4 bg-[#121212] text-[10px] font-black text-gray-600 uppercase tracking-widest">
                    {t('orContinueWith')}
                  </span>
                </div>

                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
                  className="w-full py-4 rounded-2xl bg-white text-black font-black italic uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-gray-200 transition-all border border-white/10"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  {t('googleAuth')}
                </a>

                <div className="text-center pt-6">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {activeTab === 'login' ? t('dontHaveAccount') : t('alreadyHaveAccount')}{' '}
                    <button
                      type="button"
                      onClick={() => handleTabChange(activeTab === 'login' ? 'register' : 'login')}
                      className="text-neon hover:text-neon-light transition-colors underline ml-1"
                    >
                      {activeTab === 'login' ? t('registerNow') : t('loginNow')}
                    </button>
                  </p>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
}
