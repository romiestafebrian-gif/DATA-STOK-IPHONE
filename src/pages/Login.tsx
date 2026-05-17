import { useState } from 'react';
import { signInWithGoogle } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { Apple, ShieldCheck, User as UserIcon, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Login() {
  const { createProfile, user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<'Admin' | 'User'>('User');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Simple admin password for demo
  const ADMIN_KEY = "admin1234";

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      
      let currentUser = user;
      if (!currentUser) {
        console.log("Initiating Google Login...");
        const result = await signInWithGoogle();
        currentUser = result.user;
        console.log("Google Login Success:", currentUser.email);
      }
      
      // Verification logic after we have the user
      if (role === 'Admin') {
        const isOwner = currentUser.email === 'romiestafebrian@gmail.com';
        if (!isOwner && password !== ADMIN_KEY) {
          toast.error("Password admin salah! Hubungi pemilik toko.");
          setIsLoggingIn(false);
          return;
        }
        if (isOwner && password !== ADMIN_KEY) {
          toast.info("Akses Khusus: Bypass password untuk pemilik terdeteksi.");
        }
      }

      console.log("Finalizing profile for:", currentUser.uid, "Role:", role);
      await createProfile(currentUser.uid, currentUser.email, role);
      toast.success(`Akses Disetujui: Selamat Datang ${role}`);
    } catch (error: any) {
      console.error("Login detail error:", error);
      
      // Try to parse the JSON error from handleFirestoreError
      try {
        const firestoreError = JSON.parse(error.message);
        if (firestoreError.error && firestoreError.error.includes("permissions")) {
          toast.error("PERMISSION_DENIED: Perangkat Anda belum terdaftar dengan peran ini.");
          return;
        }
      } catch (e) {
        // Not a JSON error or other error
      }
      
      toast.error(error.message || "Gagal masuk. Pastikan koneksi internet stabil.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { logout } = await import('../lib/firebase');
      await logout();
      toast.info("Sesi keluar berhasil.");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-neon-cyan selection:text-slate-900 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-10 backdrop-blur-sm"
      >
        <div className="bg-slate-950 p-10 text-white text-center border-b border-white/5 relative">
          <div className="bg-neon-cyan/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-neon-cyan/30 neon-glow-cyan rotate-12">
            <Apple size={40} className="text-neon-cyan -rotate-12" />
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Isecond Store</h1>
          <p className="text-white/60 text-xs font-medium mt-2 italic">iphone second & manajemen inventori</p>
          <p className="text-neon-cyan text-[10px] font-black tracking-[0.3em] mt-4 uppercase opacity-70">Protokol Kontrol Inventori</p>
          <div className="absolute top-4 right-4 flex gap-1">
            <div className="w-1 h-1 bg-neon-cyan rounded-full animate-ping"></div>
            <div className="w-1 h-1 bg-neon-purple rounded-full animate-ping delay-75"></div>
          </div>
        </div>

        <div className="p-10 space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center block">Pilih Tingkat Akses</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setRole('User')}
                className={cn(
                  "flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all group",
                  role === 'User' 
                    ? "border-neon-cyan bg-neon-cyan/5 text-neon-cyan neon-glow-cyan" 
                    : "border-white/5 hover:border-white/20 text-slate-500"
                )}
              >
                <div className={cn("p-2 rounded-lg bg-slate-950 transition-colors", role === 'User' ? "text-neon-cyan" : "text-slate-600")}>
                  <UserIcon size={24} />
                </div>
                <span className="font-black text-[11px] uppercase tracking-widest">User</span>
              </button>
              <button
                onClick={() => setRole('Admin')}
                className={cn(
                  "flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all group",
                  role === 'Admin' 
                    ? "border-neon-purple bg-neon-purple/5 text-neon-purple neon-glow-purple" 
                    : "border-white/5 hover:border-white/20 text-slate-500"
                )}
              >
                <div className={cn("p-2 rounded-lg bg-slate-950 transition-colors", role === 'Admin' ? "text-neon-purple" : "text-slate-600")}>
                  <ShieldCheck size={24} />
                </div>
                <span className="font-black text-[11px] uppercase tracking-widest">Admin</span>
              </button>
            </div>
          </div>

          {role === 'Admin' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="space-y-3"
            >
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Kunci Akses Diperlukan</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-4 bg-slate-950 rounded-xl border border-white/10 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple/30 outline-none transition-all text-white font-mono placeholder:text-slate-800"
                />
              </div>
            </motion.div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className={cn(
                "w-full font-black p-5 rounded-xl flex items-center justify-center gap-4 transition-all disabled:opacity-30 relative group",
                role === 'Admin' 
                  ? "bg-slate-950 text-neon-purple border border-neon-purple/30 hover:border-neon-purple neon-glow-purple" 
                  : "bg-slate-950 text-neon-cyan border border-neon-cyan/30 hover:border-neon-cyan neon-glow-cyan"
              )}
            >
              {isLoggingIn ? (
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-150"></div>
                </div>
              ) : (
                <>
                  <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                  <span className="uppercase tracking-[0.2em] italic">
                    {user ? `Lanjutkan (${user.email?.split('@')[0]})` : 'Login dengan Google'}
                  </span>
                </>
              )}
            </button>

            {user && (
              <button
                onClick={handleLogout}
                className="w-full py-2 text-[10px] text-slate-600 hover:text-red-400 transition-colors uppercase font-black tracking-widest flex items-center justify-center gap-2"
              >
                Ganti Akun Google? <span className="underline italic">Log Out</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-6 bg-slate-950/50 border-t border-white/5 text-center">
          <p className="text-[9px] text-slate-600 font-mono tracking-widest uppercase">Sistem v2.4.1 • Personel Berwenang Saja</p>
        </div>
      </motion.div>
    </div>
  );
}
