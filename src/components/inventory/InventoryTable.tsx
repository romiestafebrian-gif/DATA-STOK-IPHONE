import { useState } from 'react';
import { InventoryItem, UserProfile } from '../../types';
import { formatIDR, cn } from '../../lib/utils';
import { Edit2, Trash2, Search, Filter, ArrowUpRight, ArrowDownLeft, Info, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

export default function InventoryTable({ items, onEdit, onDelete, isAdmin }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "IN" | "OUT">("ALL");

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.series.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "ALL" || item.type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="bg-slate-900/40 rounded-2xl border border-white/5 overflow-hidden backdrop-blur-sm">
      <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/60">
        <h2 className="text-xl font-black text-white italic tracking-tighter uppercase flex items-center gap-2">
          <div className="w-1 h-6 bg-neon-cyan neon-glow-cyan"></div>
          Daftar Stok iPhone
        </h2>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="SISTEM SEARCH..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950/50 rounded-xl border border-white/10 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/30 outline-none text-sm text-slate-200 placeholder:text-slate-600 transition-all"
            />
          </div>
          <div className="flex bg-slate-950/50 p-1 rounded-xl border border-white/5">
            {(["ALL", "IN", "OUT"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all",
                  filterType === type 
                    ? "bg-neon-cyan text-slate-950 shadow-[0_0_10px_rgba(0,255,255,0.3)]" 
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                {type === "ALL" ? "Semua" : type === "IN" ? "Masuk" : "Keluar"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/30 border-b border-white/5">
              <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">ID DATA</th>
              <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Model</th>
              <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipe</th>
              <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
              <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Jml</th>
              <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Nilai Aset</th>
              <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <div className="flex items-center gap-1.5 justify-start">
                  <Calendar size={12} className="text-white" />
                  <span>Waktu</span>
                </div>
              </th>
              {isAdmin && <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Ops</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                    <span className="font-mono text-xs text-neon-cyan/70">#{item.id.slice(-6).toUpperCase()}</span>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-100">{item.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono italic uppercase">{item.series} • {item.storage}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-sm text-[10px] font-black bg-slate-950 text-slate-400 border border-white/10 uppercase tracking-tighter">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className={cn(
                      "flex items-center gap-1.5 text-xs font-black uppercase tracking-tighter",
                      item.type === 'IN' ? 'text-neon-lime' : 'text-neon-rose'
                    )}>
                      {item.type === 'IN' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      {item.type === 'IN' ? 'Diterima' : 'Terkirim'}
                    </div>
                    <div className="text-[9px] text-slate-600 mt-1 uppercase font-black italic">{item.supplier}</div>
                  </td>
                  <td className="p-4 font-mono font-bold text-neon-cyan">{item.quantity}</td>
                  <td className="p-4 font-mono">
                    {item.type === 'IN' ? (
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-500">BELI <span className="text-slate-300">{formatIDR(item.buyPrice)}</span></div>
                        <div className="text-[10px] text-slate-500">JUAL <span className="text-neon-lime font-bold">{formatIDR(item.sellPrice)}</span></div>
                      </div>
                    ) : (
                      <div className="text-sm font-medium text-slate-700">---</div>
                    )}
                  </td>
                  <td className="p-4 text-[10px] text-slate-500 font-mono">
                    {format(new Date(item.date), 'dd.MM.yy | HH:mm')}
                  </td>
                  {isAdmin && (
                    <td className="p-4">
                      <div className="flex gap-1 md:opacity-20 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onEdit(item)}
                          className="p-2 text-neon-cyan hover:bg-neon-cyan/10 rounded-lg transition-colors border border-white/5 md:border-transparent hover:border-neon-cyan/30"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => onDelete(item.id)}
                          className="p-2 text-neon-rose hover:bg-neon-rose/10 rounded-lg transition-colors border border-white/5 md:border-transparent hover:border-neon-rose/30"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isAdmin ? 8 : 7} className="p-12 text-center text-slate-600 italic text-sm border-none">
                  SIGNAL LOST: DATA NOT FOUND
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-6 bg-slate-950/20 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="flex items-start gap-3">
          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-neon-cyan neon-glow-cyan animate-pulse"></div>
          <div>
            <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Protocol.Create</div>
            <p className="text-[10px] text-slate-600">INPUT NEW DATA MODULE</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-neon-cyan neon-glow-cyan animate-pulse"></div>
          <div>
            <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Protocol.Read</div>
            <p className="text-[10px] text-slate-600">FETCH STORED RECORDS</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-neon-cyan neon-glow-cyan animate-pulse"></div>
          <div>
            <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Protocol.Update</div>
            <p className="text-[10px] text-slate-600">PATCH EXISTING BUFFER</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-neon-cyan neon-glow-cyan animate-pulse"></div>
          <div>
            <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Protocol.Delete</div>
            <p className="text-[10px] text-slate-600">WIPE SECTOR FROM DISK</p>
          </div>
        </div>
      </div>
    </div>
  );
}
