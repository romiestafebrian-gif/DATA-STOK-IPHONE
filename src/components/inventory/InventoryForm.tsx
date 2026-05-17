import React, { useState, useEffect } from 'react';
import { iPhoneName, iPhoneSeries, iPhoneStorage, iPhoneCategory, InventoryItem, TransactionType } from '../../types';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { X, Save, AlertCircle, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<InventoryItem>) => Promise<void>;
  initialData?: InventoryItem | null;
  type: TransactionType;
}

const NAME_OPTIONS: iPhoneName[] = ["Iphone 11", "Iphone 12", "Iphone 13", "Iphone 14", "Iphone 15", "Iphone 16", "Iphone 17", "Iphone 18"];
const SERIES_OPTIONS: iPhoneSeries[] = ["Reguler", "Pro", "Pro Max"];
const STORAGE_OPTIONS: iPhoneStorage[] = ["128 GB", "256 GB", "512 GB"];
const CATEGORY_OPTIONS: iPhoneCategory[] = ["Inter", "Ibox", "Blibli"];

const getLocalISOString = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
};

export default function InventoryForm({ isOpen, onClose, onSave, initialData, type }: Props) {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: "Iphone 11",
    series: "Reguler",
    storage: "128 GB",
    category: "Inter",
    quantity: 1,
    buyPrice: 0,
    sellPrice: 0,
    supplier: "",
    date: getLocalISOString(),
  });

  useEffect(() => {
    if (initialData) {
      const d = new Date(initialData.date);
      const offset = d.getTimezoneOffset() * 60000;
      setFormData({
        ...initialData,
        quantity: Number(initialData.quantity) || 1,
        buyPrice: Number(initialData.buyPrice) || 0,
        sellPrice: Number(initialData.sellPrice) || 0,
        date: new Date(d.getTime() - offset).toISOString().slice(0, 16)
      });
    } else {
      setFormData({
        name: "Iphone 11",
        series: "Reguler",
        storage: "128 GB",
        category: "Inter",
        quantity: 1,
        buyPrice: 0,
        sellPrice: 0,
        supplier: "",
        date: getLocalISOString(),
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const requiredFields = ['name', 'series', 'storage', 'category', 'quantity', 'supplier', 'date'];
    if (type === 'IN') requiredFields.push('buyPrice', 'sellPrice');
    
    const isMissing = requiredFields.some(field => {
      const val = (formData as any)[field];
      return val === undefined || val === null || val === "" || val === 0;
    });

    if (isMissing) {
      toast.error("Form wajib diisi semua!");
      return;
    }

    if (formData.quantity! <= 0) {
      toast.error("Format tidak sesuai! Quantity harus lebih dari 0");
      return;
    }

    try {
      await onSave({ ...formData, type });
      toast.success("Data tersimpan");
      onClose();
    } catch (error) {
      toast.error("Format tidak sesuai!");
    }
  };

  if (!isOpen) return null;

  const inputStyles = "w-full p-3 bg-slate-950/80 rounded-xl border border-white/10 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/30 outline-none text-slate-100 placeholder:text-slate-700 transition-all text-sm";
  const labelStyles = "text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5 block";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="bg-slate-900 w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        >
          <div className="bg-slate-950 p-6 flex justify-between items-center border-b border-white/5">
            <h2 className="text-xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
              <div className={cn(
                "w-12 h-1 rounded-full",
                type === 'IN' ? 'bg-neon-lime neon-glow-lime' : 'bg-neon-rose neon-glow-rose'
              )}></div>
              {initialData ? 'Perbarui Data' : `Inisialisasi ${type === 'IN' ? 'Masuk' : 'Keluar'}`}
            </h2>
            <button onClick={onClose} className="text-slate-500 hover:text-neon-rose transition-colors">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[75vh] overflow-y-auto">
            <div className="space-y-1">
              <label className={labelStyles}>Model Dasar</label>
              <select 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value as iPhoneName})}
                className={inputStyles}
              >
                {NAME_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-slate-900">{opt}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className={labelStyles}>Varian Seri</label>
              <select 
                value={formData.series}
                onChange={e => setFormData({...formData, series: e.target.value as iPhoneSeries})}
                className={inputStyles}
              >
                {SERIES_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-slate-900">{opt}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className={labelStyles}>Kapasitas</label>
              <select 
                value={formData.storage}
                onChange={e => setFormData({...formData, storage: e.target.value as iPhoneStorage})}
                className={inputStyles}
              >
                {STORAGE_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-slate-900">{opt}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className={labelStyles}>Kelas Regional</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as iPhoneCategory})}
                className={inputStyles}
              >
                {CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-slate-900">{opt}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className={labelStyles}>
                <div className="flex items-center justify-between gap-1.5 w-full">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-white" />
                    <span>Indeks Waktu</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, date: getLocalISOString() }))}
                    className="text-[9px] text-neon-cyan hover:text-white transition-colors bg-white/5 px-1.5 py-0.5 rounded border border-white/10"
                  >
                    Set Sekarang
                  </button>
                </div>
              </label>
              <input 
                type="datetime-local"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className={inputStyles}
              />
            </div>

            <div className="space-y-1">
              <label className={labelStyles}>Jumlah Unit</label>
              <input 
                type="number"
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})}
                className={inputStyles}
              />
            </div>

            {type === 'IN' && (
              <>
                <div className="space-y-1">
                  <label className={labelStyles}>Harga Beli (IDR)</label>
                  <input 
                    type="number"
                    value={formData.buyPrice}
                    onChange={e => setFormData({...formData, buyPrice: parseFloat(e.target.value)})}
                    className={inputStyles}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelStyles}>Harga Jual Target (IDR)</label>
                  <input 
                    type="number"
                    value={formData.sellPrice}
                    onChange={e => setFormData({...formData, sellPrice: parseFloat(e.target.value)})}
                    className={inputStyles}
                  />
                </div>
              </>
            )}

            <div className={type === 'OUT' ? 'col-span-1' : 'col-span-1 md:col-span-2'}>
              <label className={labelStyles}>Supplier</label>
              <input 
                type="text"
                value={formData.supplier}
                onChange={e => setFormData({...formData, supplier: e.target.value})}
                placeholder="Nama Entitas"
                className={inputStyles}
              />
            </div>

            <div className="col-span-1 md:col-span-2 pt-6">
              <button 
                type="submit"
                className={cn(
                  "w-full font-black p-4 rounded-xl flex items-center justify-center gap-3 transition-all uppercase tracking-widest italic shadow-lg",
                  type === 'IN' 
                    ? "bg-slate-950 text-neon-lime border border-neon-lime/30 hover:border-neon-lime hover:neon-glow-lime" 
                    : "bg-slate-950 text-neon-rose border border-neon-rose/30 hover:border-neon-rose hover:neon-glow-rose"
                )}
              >
                <Save size={20} />
                <span>Kirim ke Database</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
