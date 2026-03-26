import React from 'react';
import { ShieldCheck, RefreshCw, Database, ShoppingCart, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { AdminStatus } from '../types';
import { motion } from 'motion/react';

export default function AdminPage() {
  const [status, setStatus] = React.useState<AdminStatus | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/status');
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch status');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStatus();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/refresh', { method: 'POST' });
      const data = await response.json() as { success: boolean; count?: number; error?: string };
      if (data.success) {
        setMessage({ type: 'success', text: `Məlumatlar uğurla yeniləndi! ${data.count} qiymət təklifi əlavə edildi.` });
        fetchStatus();
      } else {
        throw new Error(data.error || 'Yenilənmə zamanı xəta baş verdi');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600">
            <ShieldCheck size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Sistem Paneli</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Paneli</h1>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-100"
        >
          <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? 'Yenilənir...' : 'Sistemi Yenilə'}
        </button>
      </header>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl flex items-center gap-3 border ${
            message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="font-medium text-sm">{message.text}</p>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Database size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Məhsullar</p>
            <p className="text-4xl font-black text-slate-900">{loading ? '...' : status?.productCount}</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Qiymət Sətirləri</p>
            <p className="text-4xl font-black text-slate-900">{loading ? '...' : status?.priceCount}</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Son Yenilənmə</p>
            <p className="text-lg font-black text-slate-900">{loading ? '...' : status?.lastUpdate}</p>
          </div>
        </div>
      </div>

      {/* Adapters Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900">Sistem Adapterləri</h2>
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Adapter Adı</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Növ</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={3} className="px-8 py-12 text-center text-slate-400">Yüklənir...</td></tr>
              ) : status?.adapters.map((adapter, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                        <Database size={16} />
                      </div>
                      <span className="font-bold text-slate-900">{adapter.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-medium text-slate-500 capitalize">{adapter.type}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm font-bold text-green-600 uppercase tracking-wider">Aktiv</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="bg-slate-900 rounded-3xl p-10 text-white space-y-4">
        <h3 className="text-xl font-bold">Sistem Qeydləri</h3>
        <p className="text-slate-400 text-sm leading-relaxed">
          Sistem avtomatik olaraq hər 6 saatdan bir (Cloudflare Cron vasitəsilə) yenilənir. 
          Yuxarıdakı düymə ilə manual yenilənmə edə bilərsiniz. Bu proses bütün marketlərdən 
          ən son qiymətləri çəkir və bazanı yeniləyir.
        </p>
      </div>
    </div>
  );
}
