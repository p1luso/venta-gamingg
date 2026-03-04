'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Lock, 
  Rocket, 
  Loader2, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function OrderSetupPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const t = useTranslations('Checkout');
  
  const [eaEmail, setEaEmail] = useState('');
  const [eaPassword, setEaPassword] = useState('');
  const [backupCodes, setBackupCodes] = useState(['', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const response = await fetch(`${backendUrl}/orders/${orderId}/credentials`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: eaEmail,
          password: eaPassword,
          backupCodes: backupCodes
        })
      });

      if (!response.ok) throw new Error('Failed to update credentials');
      
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
      alert('Error al guardar los datos. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white dark:bg-[#0A0A0A]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg"
        >
          <div className="w-24 h-24 bg-neon-light/10 dark:bg-neon/10 border border-neon-light/20 dark:border-neon/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm dark:shadow-[0_0_40px_rgba(0,255,136,0.2)]">
            <Rocket className="w-12 h-12 text-neon-light dark:text-neon" />
          </div>
          <h2 className="text-4xl font-black text-[#1A1A1A] dark:text-white italic uppercase mb-4 tracking-tighter">¡Todo Listo!</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-10 leading-relaxed">
            Tus datos han sido recibidos de forma segura. Nuestro sistema automatizado está iniciando el proceso de transferencia. Recibirás una notificación cuando se complete.
          </p>
          <button 
            onClick={() => router.push('/')}
            className="neon-button px-12 py-4 rounded-xl font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] transition-all"
          >
            Volver al Inicio
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-white dark:bg-[#0A0A0A]">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-light/10 dark:bg-neon/10 border border-neon-light/20 dark:border-neon/20 mb-6">
            <ShieldCheck className="w-4 h-4 text-neon-light dark:text-neon" />
            <span className="text-[10px] font-black text-neon-light dark:text-neon uppercase tracking-widest">Pago Confirmado</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#1A1A1A] dark:text-white italic uppercase tracking-tighter leading-none mb-4">
            Configuración de tu <br /> <span className="text-neon-light dark:text-neon">Transferencia</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Necesitamos tus credenciales de EA para que nuestro sistema pueda transferir las monedas de forma segura.
          </p>
        </div>

        <div className="bg-white dark:bg-[#161616] border border-black/5 dark:border-white/5 rounded-3xl p-8 shadow-xl dark:shadow-none relative overflow-hidden">
          {/* Security Banner */}
          <div className="mb-8 p-4 bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 dark:border-blue-500/20 rounded-2xl flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Cifrado de Extremo a Extremo</h4>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70 font-medium leading-relaxed">
                Tus datos son encriptados mediante AES-256 antes de guardarse. Solo nuestro sistema de transferencia automatizado podrá acceder a ellos.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">EA Email</label>
                <input
                  type="email"
                  required
                  value={eaEmail}
                  onChange={(e) => setEaEmail(e.target.value)}
                  placeholder="tu-email@ejemplo.com"
                  className="w-full bg-[#FAFAFA] dark:bg-[#0D0D0D] border border-black/5 dark:border-white/5 rounded-2xl py-4 px-6 text-[#1A1A1A] dark:text-white placeholder:text-gray-500 focus:outline-none focus:border-neon-light dark:focus:border-neon transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">EA Password</label>
                <input
                  type="password"
                  required
                  value={eaPassword}
                  onChange={(e) => setEaPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#FAFAFA] dark:bg-[#0D0D0D] border border-black/5 dark:border-white/5 rounded-2xl py-4 px-6 text-[#1A1A1A] dark:text-white placeholder:text-gray-500 focus:outline-none focus:border-neon-light dark:focus:border-neon transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end px-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Backup Codes (3 necesarios)</label>
                <a 
                  href="https://myaccount.ea.com/cp-ui/security/index" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[9px] font-bold text-neon-light dark:text-neon uppercase tracking-widest flex items-center gap-1 hover:underline"
                >
                  ¿Cómo obtenerlos? <ExternalLink className="w-2 h-2" />
                </a>
              </div>
              <div className="grid grid-cols-3 gap-4">
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
                    placeholder={`Code ${idx + 1}`}
                    className="w-full bg-[#FAFAFA] dark:bg-[#0D0D0D] border border-black/5 dark:border-white/5 rounded-2xl py-4 text-center font-mono text-lg text-[#1A1A1A] dark:text-white focus:outline-none focus:border-neon-light dark:focus:border-neon transition-all uppercase"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full neon-button py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isSubmitting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Confirmar y Comenzar Transferencia
                  <Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">
          Al enviar este formulario, confirmas que los datos ingresados son correctos. <br />
          El proceso de transferencia suele demorar de 15 a 60 minutos.
        </p>
      </div>
    </div>
  );
}
