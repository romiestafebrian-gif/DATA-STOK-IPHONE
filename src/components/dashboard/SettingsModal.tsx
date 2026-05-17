import React, { useState, useEffect } from 'react';
import { AppSettings } from '../../types';
import { X, Save, Settings as SettingsIcon, Phone, ShieldCheck, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: AppSettings) => Promise<void>;
  initialData: AppSettings | null;
}

export default function SettingsModal({ isOpen, onClose, onSave, initialData }: Props) {
  const [formData, setFormData] = useState<AppSettings>({
    waNumber: "",
    waToken: "",
    lowStockThreshold: 3
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        waNumber: initialData.waNumber || "",
        waToken: initialData.waToken || "",
        lowStockThreshold: Number(initialData.lowStockThreshold) || 3
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      toast.success("Pengaturan berhasil disimpan");
      onClose();
    } catch (error) {
      toast.error("Gagal menyimpan pengaturan");
    } finally {
      setIsSaving(false);
    }
  };

  const labelStyles = "text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-1.5";
  const inputStyles = "w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neon-cyan transition-all placeholder:text-slate-600 font-mono text-sm";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="bg-slate-900/50 border-b border-slate-800 p-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-neon-cyan/20 p-2 rounded-lg text-neon-cyan">
                  <SettingsIcon size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white italic uppercase tracking-tight">Pengaturan Notifikasi</h2>
                  <p className="text-[10px] text-neon-cyan font-bold tracking-widest uppercase">WhatsApp Gateway API</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className={labelStyles}>
                    <Phone size={12} /> Nomor WhatsApp Admin
                  </label>
                  <input 
                    type="text"
                    value={formData.waNumber}
                    onChange={(e) => setFormData({ ...formData, waNumber: e.target.value })}
                    placeholder="Contoh: 628123456789"
                    className={inputStyles}
                  />
                  <p className="text-[9px] text-slate-500 italic">Gunakan format internasional tanpa tanda + (misal: 628...)</p>
                </div>

                <div className="space-y-1">
                  <label className={labelStyles}>
                    <ShieldCheck size={12} /> API Token (Otomatisasi)
                  </label>
                  <input 
                    type="password"
                    value={formData.waToken}
                    onChange={(e) => setFormData({ ...formData, waToken: e.target.value })}
                    placeholder="Masukkan token API gateway Anda"
                    className={inputStyles}
                  />
                  <p className="text-[9px] text-slate-500 mt-1">Kosongkan jika hanya ingin menggunakan link manual.</p>
                </div>

                <div className="space-y-1">
                  <label className={labelStyles}>
                    <Bell size={12} /> Ambang Batas Stok Menipis
                  </label>
                  <input 
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 0 })}
                    className={inputStyles}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex gap-3">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-xl font-bold bg-slate-800 text-slate-400 hover:bg-slate-700 transition-all border border-slate-700"
                >
                  BATAL
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 rounded-xl font-black bg-neon-cyan text-slate-950 neon-glow-cyan hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save size={18} />
                      SIMPAN
                    </>
                  )}
                </button>
              </div>
            </form>
            
            <div className="bg-slate-950 p-4 border-t border-slate-800">
              <div className="flex items-start gap-2 text-[10px] text-slate-500 leading-relaxed font-mono">
                <div className="bg-neon-cyan/10 p-1 rounded mt-0.5">
                  <SettingsIcon size={10} className="text-neon-cyan" />
                </div>
                <p>Aplikasi mendukung integrasi API pihak ke-3 (Fonnte/Whacenter). Masukkan Token untuk mengaktifkan pengiriman <span className="text-neon-cyan">Notifikasi Otomatis</span>.</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
