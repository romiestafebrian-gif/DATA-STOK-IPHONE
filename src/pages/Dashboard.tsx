import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, Timestamp, orderBy, setDoc, getDoc } from 'firebase/firestore';
import { db, logout } from '../lib/firebase';
import { InventoryItem, OperationType, AppSettings } from '../types';
import { handleFirestoreError } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import InventoryTable from '../components/inventory/InventoryTable';
import InventoryForm from '../components/inventory/InventoryForm';
import SettingsModal from '../components/dashboard/SettingsModal';
import SummaryCharts from '../components/dashboard/Charts';
import { PlusCircle, LogOut, LayoutDashboard, Database, User as UserIcon, MessageSquare, AlertTriangle, TrendingUp, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const { profile, user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [formType, setFormType] = useState<'IN' | 'OUT'>('IN');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'inventory'>('stats');
  const lastAlerts = useRef<Record<string, number>>({});

  const handleDelete = async (id: string) => {
    toast("Konfirmasi Hapus", {
      description: "Data akan dihapus secara permanen dari basis data. Lanjutkan?",
      action: {
        label: "HAPUS",
        onClick: async () => {
          try {
            console.log("Confirmed via toast, executing delete for:", id);
            await deleteDoc(doc(db, 'inventory', id));
            toast.success("Data berhasil dihapus");
          } catch (error: any) {
            console.error("Delete failed:", error);
            toast.error("Gagal menghapus: Izin ditolak atau masalah koneksi.");
            try {
              handleFirestoreError(error, OperationType.DELETE, `inventory/${id}`);
            } catch (e) {}
          }
        }
      },
      cancel: {
        label: "BATAL",
        onClick: () => console.log("Delete cancelled")
      }
    });
  };

  const handleSaveSettings = async (newSettings: AppSettings) => {
    try {
      await setDoc(doc(db, 'settings', 'global'), newSettings);
      setSettings(newSettings);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/global');
    }
  };

  const autoSendWhatsAppNotification = async (product: string, qty: number) => {
    if (!settings?.waToken || !settings?.waNumber) return;

    try {
      const message = `[OTOMATIS] Stok Menipis: ${product} tersisa ${qty}. Mohon segera restock!`;
      
      const response = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': settings.waToken
        },
        body: new URLSearchParams({
          'target': settings.waNumber,
          'message': message,
          'countryCode': '62'
        })
      });

      const result = await response.json();
      if (result.status) {
        console.log("Auto WA Sent successfully");
      } else {
        console.warn("Auto WA Failed:", result.reason);
      }
    } catch (error) {
      console.error("Error sending auto WA:", error);
    }
  };

  const sendWhastAppNotification = (product: string, qty: number) => {
    const waNum = settings?.waNumber || "6281234567890";
    const message = `Halo Admin, Stok ${product} menipis! Sisa stok saat ini adalah ${qty}. Mohon segera restock!`;
    const url = `https://wa.me/${waNum}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const isAdmin = profile?.role === 'Admin' || user?.email === 'romiestafebrian@gmail.com';

  useEffect(() => {
    // Fetch Settings
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as AppSettings);
      }
    });

    // Fetch Inventory
    const q = query(collection(db, 'inventory'), orderBy('date', 'desc'));
    const unsubscribeInventory = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
      setItems(docs);

      // Check for low stock logic
      const currentStock: Record<string, number> = {};
      docs.forEach(item => {
        const key = `${item.name}-${item.series}-${item.storage}`;
        const qty = Number(item.quantity) || 0;
        if (!currentStock[key]) currentStock[key] = 0;
        if (item.type === 'IN') currentStock[key] += qty;
        else currentStock[key] -= qty;
      });

      const threshold = settings?.lowStockThreshold || 3;

      Object.entries(currentStock).forEach(([key, qty]) => {
        if (qty < threshold && qty > 0) {
          // Avoid spamming notifications for the same stock level if already processed
          if (lastAlerts.current[key] !== qty) {
            lastAlerts.current[key] = qty;
            
            toast.warning(`Stok Menipis: ${key} tersisa ${qty}!`, {
              description: settings?.waToken ? "Notifikasi otomatis telah dikirim." : "Klik untuk kirim notifikasi WhatsApp",
              action: {
                label: "Kirim WA",
                onClick: () => sendWhastAppNotification(key, qty)
              }
            });

            // If API Token is present, send automatically
            if (settings?.waToken && settings?.waNumber) {
              autoSendWhatsAppNotification(key, qty);
            }
          }
        }
        if (qty <= 0 && docs.some(item => `${item.name}-${item.series}-${item.storage}` === key)) {
          if (lastAlerts.current[key] !== -1) {
            lastAlerts.current[key] = -1;
            toast.error(`Stok Habis: ${key}!`, { duration: 5000 });
          }
        }
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'inventory');
    });

    return () => {
      unsubscribeSettings();
      unsubscribeInventory();
    };
  }, [settings?.lowStockThreshold, settings?.waToken, settings?.waNumber]);

  const handleSave = async (data: Partial<InventoryItem>) => {
    try {
      if (editingItem) {
        await updateDoc(doc(db, 'inventory', editingItem.id), data);
      } else {
        await addDoc(collection(db, 'inventory'), data);
      }
    } catch (error) {
      handleFirestoreError(error, editingItem ? OperationType.UPDATE : OperationType.CREATE, 'inventory');
    }
  };

  const currentTabStyles = (tab: string) => 
    `flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
      activeTab === tab 
      ? 'bg-neon-cyan text-slate-950 shadow-[0_0_15px_rgba(0,255,255,0.5)]' 
      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
    }`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-neon-cyan selection:text-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-neon-cyan p-2 rounded-xl text-slate-950 neon-glow-cyan">
              <TrendingUp size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">Isecond Store</h1>
              <p className="text-[10px] text-neon-cyan font-bold tracking-widest uppercase">Protokol Manajemen Stok</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <div className="text-sm font-bold text-white">{user?.displayName || profile?.email}</div>
              <div className="text-[9px] uppercase tracking-widest font-black text-neon-purple border border-neon-purple/30 px-2 py-0.5 rounded-sm">
                ID: {profile?.role.toUpperCase()}
              </div>
            </div>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 text-slate-400 hover:text-neon-cyan hover:bg-neon-cyan/10 rounded-xl transition-all border border-transparent hover:border-neon-cyan/30"
              title="Pengaturan Notifikasi"
            >
              <Settings size={22} />
            </button>
            <button 
              onClick={logout}
              className="p-2.5 text-slate-400 hover:text-neon-rose hover:bg-neon-rose/10 rounded-xl transition-all border border-transparent hover:border-neon-rose/30"
              title="Logout"
            >
              <LogOut size={22} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Tab Controls & Actions */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 w-full md:w-auto">
            <button 
              onClick={() => setActiveTab('stats')}
              className={currentTabStyles('stats')}
            >
              <LayoutDashboard size={20} />
              <span>DASHBOARD</span>
            </button>
            <button 
              onClick={() => setActiveTab('inventory')}
              className={currentTabStyles('inventory')}
            >
              <Database size={20} />
              <span>DATABASE</span>
            </button>
          </div>

          {isAdmin && (
            <div className="flex gap-3 w-full md:w-auto">
              <button 
                onClick={() => { setFormType('IN'); setEditingItem(null); setIsFormOpen(true); }}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-neon-lime px-6 py-3 rounded-xl font-black border border-neon-lime/30 hover:border-neon-lime neon-glow-lime transition-all overflow-hidden"
              >
                <PlusCircle size={20} />
                <span className="uppercase tracking-tighter italic">Barang Masuk</span>
              </button>
              <button 
                onClick={() => { setFormType('OUT'); setEditingItem(null); setIsFormOpen(true); }}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-neon-rose px-6 py-3 rounded-xl font-black border border-neon-rose/30 hover:border-neon-rose neon-glow-rose transition-all"
              >
                <PlusCircle size={20} />
                <span className="uppercase tracking-tighter italic">Barang Keluar</span>
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Content */}
        {activeTab === 'stats' ? (
          <SummaryCharts items={items} />
        ) : (
          <InventoryTable 
            items={items} 
            isAdmin={isAdmin} 
            onEdit={(item) => { setEditingItem(item); setFormType(item.type); setIsFormOpen(true); }}
            onDelete={handleDelete}
          />
        )}
      </main>

      {/* Forms */}
      <InventoryForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        type={formType}
        onSave={handleSave}
        initialData={editingItem}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        initialData={settings}
      />

      <footer className="bg-slate-900/40 border-t border-white/5 p-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-cyan animate-ping"></div>
            <span className="text-neon-cyan">KONEKSI TERENKRIPSI AKTIF</span>
          </div>
          <p>© 2026 Isecond Store Protocol. Hak Cipta Dilindungi.</p>
          <div className="flex gap-6 uppercase tracking-widest">
            <a href="#" className="hover:text-neon-cyan transition-colors">Keamanan</a>
            <a href="#" className="hover:text-neon-cyan transition-colors">Log Akses</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
