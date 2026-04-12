'use client';

import React, { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  Search, 
  Copy, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  EyeOff,
  Database,
  RefreshCw,
  AlertTriangle,
  Play
} from 'lucide-react';

interface OrderAdmin {
  id: string;
  user_email: string;
  amount_coins: number;
  price_paid: string;
  status: string;
  transfer_status: string;
  created_at: string;
  ea_email_decrypted?: string;
  ea_password_decrypted?: string;
  ea_backup_codes_decrypted?: string[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [showCreds, setShowCreds] = useState<Record<string, boolean>>({});

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const backendUrl = API_URL;
      const response = await fetch(`${backendUrl}/orders/admin/all`);
      if (!response.ok) throw new Error('Failed to fetch admin orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleCreds = (orderId: string) => {
    setShowCreds(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const handleUpdateOrderStatus = async (orderId: string, payload: any) => {
    setUpdating(prev => ({ ...prev, [orderId]: true }));
    try {
      const backendUrl = API_URL;
      const response = await fetch(`${backendUrl}/orders/${orderId}/admin-update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to update order');
      
      // Refresh only this order in the list if possible, or refetch all
      fetchOrders();
    } catch (error) {
      console.error(error);
      alert('Error updating order');
    } finally {
      setUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Simple toast or notification could be added here
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Admin Control Panel</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-[#1A1A1A] dark:text-white italic uppercase tracking-tighter leading-none">
              Gestión de <span className="text-neon-light dark:text-neon">Órdenes</span>
            </h1>
          </div>
          
          <button 
            onClick={fetchOrders}
            className="flex items-center gap-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <div className="h-64 flex items-center justify-center bg-white dark:bg-[#121212] rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
              <RefreshCw className="w-8 h-8 text-neon-light dark:text-neon animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center bg-white dark:bg-[#121212] rounded-3xl border border-black/5 dark:border-white/5 shadow-sm text-gray-500">
              <Database className="w-12 h-12 mb-4 opacity-20" />
              <span className="font-bold uppercase tracking-widest text-xs">No hay órdenes para mostrar</span>
            </div>
          ) : (
            orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 rounded-3xl p-8 shadow-sm dark:shadow-none flex flex-col lg:flex-row gap-8 lg:items-center"
              >
                {/* Order Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">#{order.id.split('-')[0]}</span>
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      order.status === 'PAID' ? 'bg-green-500/10 text-green-500' : 
                      order.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' : 
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {order.status}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      order.transfer_status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' : 
                      order.transfer_status === 'ERROR' ? 'bg-red-500/10 text-red-500' : 
                      order.transfer_status === 'QUEUED' ? 'bg-blue-500/10 text-blue-500' : 
                      'bg-gray-500/10 text-gray-500'
                    }`}>
                      BOT: {order.transfer_status}
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-[#1A1A1A] dark:text-white uppercase italic">{order.user_email}</h3>
                  <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(order.created_at).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-neon-light dark:text-neon">
                      {order.amount_coins.toLocaleString()} COINS
                    </div>
                  </div>
                </div>

                {/* Credentials */}
                <div className="lg:w-[400px] p-6 bg-[#FAFAFA] dark:bg-[#0D0D0D] rounded-2xl border border-black/5 dark:border-white/5 space-y-4 relative">
                  {!order.ea_email_decrypted ? (
                    <div className="text-center py-4">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Aún no tiene datos cargados</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">EA Account Details</span>
                        <button 
                          onClick={() => toggleCreds(order.id)}
                          className="text-gray-400 hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
                        >
                          {showCreds[order.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between group">
                          <code className="text-xs font-mono text-[#1A1A1A] dark:text-white">
                            {showCreds[order.id] ? order.ea_email_decrypted : '••••••••••••'}
                          </code>
                          <button onClick={() => copyToClipboard(order.ea_email_decrypted || '')} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all">
                            <Copy className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between group">
                          <code className="text-xs font-mono text-[#1A1A1A] dark:text-white">
                            {showCreds[order.id] ? order.ea_password_decrypted : '••••••••••••'}
                          </code>
                          <button onClick={() => copyToClipboard(order.ea_password_decrypted || '')} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all">
                            <Copy className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                        <div className="flex gap-2">
                          {order.ea_backup_codes_decrypted?.map((code, idx) => (
                            <div key={idx} className="bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 px-2 py-1 rounded-lg flex-1 text-center">
                              <code className="text-[10px] font-mono font-bold text-[#1A1A1A] dark:text-white">
                                {showCreds[order.id] ? code : '••••'}
                              </code>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Status Update (Manual) */}
                <div className="flex flex-row lg:flex-col gap-2 min-w-[160px]">
                  <button 
                    disabled={updating[order.id] || order.status === 'PAID'}
                    onClick={() => handleUpdateOrderStatus(order.id, { status: 'PAID' })}
                    className="flex-1 lg:flex-none px-6 py-3 bg-neon-light/10 dark:bg-neon/10 border border-neon-light/20 dark:border-neon/20 rounded-xl text-[10px] font-black text-neon-light dark:text-neon uppercase tracking-widest hover:bg-neon-light dark:hover:bg-neon hover:text-white dark:hover:text-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {updating[order.id] ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                    Aprobar Pago
                  </button>
                  <button 
                    disabled={updating[order.id] || order.transfer_status === 'ERROR'}
                    onClick={() => handleUpdateOrderStatus(order.id, { transfer_status: 'ERROR' })}
                    className="flex-1 lg:flex-none px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {updating[order.id] ? <RefreshCw className="w-3 h-3 animate-spin" /> : <AlertTriangle className="w-3 h-3" />}
                    Marcar Error
                  </button>
                  <button 
                    disabled={updating[order.id] || order.status !== 'PAID'}
                    onClick={() => handleUpdateOrderStatus(order.id, { transfer_status: 'QUEUED' })}
                    className="flex-1 lg:flex-none px-6 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[10px] font-black text-blue-500 uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {updating[order.id] ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                    Reintentar Bot
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
