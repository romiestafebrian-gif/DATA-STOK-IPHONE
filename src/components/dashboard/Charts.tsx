import React, { useMemo } from 'react';
import { InventoryItem } from '../../types';
import { formatIDR, cn } from '../../lib/utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area
} from 'recharts';
import { Database } from 'lucide-react';
import { format, startOfWeek, startOfMonth, isSameWeek, isSameMonth } from 'date-fns';

interface Props {
  items: InventoryItem[];
}

export default function SummaryCharts({ items }: Props) {
  const chartData = useMemo(() => {
    // Process data for charts
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return format(d, 'yyyy-MM-dd');
    }).reverse();

    return last7Days.map(dateStr => {
      const dayItems = items.filter(item => item.date.startsWith(dateStr));
      const masuk = dayItems.filter(i => i.type === 'IN').reduce((acc, i) => acc + (Number(i.quantity) || 0), 0);
      const keluar = dayItems.filter(i => i.type === 'OUT').reduce((acc, i) => acc + (Number(i.quantity) || 0), 0);
      const buyCost = dayItems.filter(i => i.type === 'IN').reduce((acc, i) => acc + ((Number(i.buyPrice) || 0) * (Number(i.quantity) || 0)), 0);
      const revenue = dayItems.filter(i => i.type === 'OUT').reduce((acc, i) => acc + ((Number(i.sellPrice) || 0) * (Number(i.quantity) || 0)), 0);

      return {
        date: format(new Date(dateStr), 'dd.MM'),
        Masuk: masuk,
        Keluar: keluar,
        Pengeluaran: buyCost,
        Pendapatan: revenue,
        Profit: revenue - buyCost
      };
    });
  }, [items]);

  const stats = useMemo(() => {
    const totalMasuk = items.filter(i => i.type === 'IN').reduce((acc, i) => acc + (Number(i.quantity) || 0), 0);
    const totalKeluar = items.filter(i => i.type === 'OUT').reduce((acc, i) => acc + (Number(i.quantity) || 0), 0);
    const totalBuyCost = items.filter(i => i.type === 'IN').reduce((acc, i) => acc + ((Number(i.buyPrice) || 0) * (Number(i.quantity) || 0)), 0);
    const totalRevenue = items.filter(i => i.type === 'OUT').reduce((acc, i) => acc + ((Number(i.sellPrice) || 0) * (Number(i.quantity) || 0)), 0);
    
    const now = new Date();
    const weeklyProfit = items.filter(i => isSameWeek(new Date(i.date), now)).reduce((acc, i) => {
      const qty = Number(i.quantity) || 0;
      const val = i.type === 'IN' ? -((Number(i.buyPrice) || 0) * qty) : ((Number(i.sellPrice) || 0) * qty);
      return acc + val;
    }, 0);
    
    const monthlyProfit = items.filter(i => isSameMonth(new Date(i.date), now)).reduce((acc, i) => {
      const qty = Number(i.quantity) || 0;
      const val = i.type === 'IN' ? -((Number(i.buyPrice) || 0) * qty) : ((Number(i.sellPrice) || 0) * qty);
      return acc + val;
    }, 0);

    return { totalMasuk, totalKeluar, totalBuyCost, totalRevenue, totalProfit: totalRevenue - totalBuyCost, weeklyProfit, monthlyProfit };
  }, [items]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Barang Masuk" value={stats.totalMasuk} subtitle="UNIT TOTAL" color="cyan" />
        <StatCard title="Barang Keluar" value={stats.totalKeluar} subtitle="UNIT TERJUAL" color="orange" />
        <StatCard title="Arus Modal" value={formatIDR(stats.totalBuyCost)} subtitle="" color="rose" />
        <StatCard title="Pendapatan" value={formatIDR(stats.totalRevenue)} subtitle="" color="lime" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatCard title="Keuntungan Mingguan" value={formatIDR(stats.weeklyProfit)} subtitle="" color="purple" />
        <StatCard title="Keuntungan Bulanan" value={formatIDR(stats.monthlyProfit)} subtitle="" color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartContainer title="THROUGHPUT SISTEM (UNIT)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                contentStyle={{ backgroundColor: '#020617', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <Legend iconType="rect" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
              <Bar dataKey="Masuk" fill="#0ff" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Keluar" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="PERFORMA FINANSIAL (NET)">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f0" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#0f0" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} />
              <Tooltip 
                 formatter={(value: number) => formatIDR(value)}
                 contentStyle={{ backgroundColor: '#020617', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
                 itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <Legend iconType="rect" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
              <Area type="monotone" dataKey="Profit" stroke="#0f0" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={4} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, color }: { title: string, value: string | number, subtitle: string, color: string }) {
  const colors: Record<string, string> = {
    cyan: 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20',
    orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    rose: 'bg-neon-rose/10 text-neon-rose border-neon-rose/20',
    lime: 'bg-neon-lime/10 text-neon-lime border-neon-lime/20',
    purple: 'bg-neon-purple/10 text-neon-purple border-neon-purple/20',
  };

  const glow: Record<string, string> = {
    cyan: 'neon-glow-cyan',
    orange: 'shadow-[0_0_10px_rgba(245,158,11,0.2)]',
    rose: 'neon-glow-rose',
    lime: 'neon-glow-lime',
    purple: 'neon-glow-purple',
  };

  return (
    <div className={cn("bg-slate-900/60 p-6 rounded-2xl border backdrop-blur-sm transition-all hover:scale-[1.02] cursor-default", colors[color], glow[color])}>
      <div className="text-[10px] font-black tracking-widest mb-4 flex items-center gap-2">
        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", color === 'cyan' ? 'bg-neon-cyan' : color === 'rose' ? 'bg-neon-rose' : 'bg-current')}></div>
        {title.toUpperCase()}
      </div>
      <div className="text-2xl font-black text-white tracking-tighter italic">{value}</div>
      {subtitle && <div className="text-[10px] text-slate-500 mt-2 font-mono tracking-widest">{subtitle}</div>}
    </div>
  );
}

function ChartContainer({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 shadow-sm h-96 flex flex-col backdrop-blur-sm relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent"></div>
      <h3 className="text-sm font-black text-slate-300 mb-6 flex items-center gap-2 italic tracking-tighter">
        <Database size={16} className="text-neon-cyan group-hover:animate-spin" />
        {title}
      </h3>
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
}
