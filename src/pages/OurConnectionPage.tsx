import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Camera,
  Check,
  Copy,
  Eye,
  EyeOff,
  Gamepad2,
  Heart,
  Link2,
  LogIn,
  LogOut,
  MessageCircleHeart,
  Music,
  ShieldCheck,
  UserPlus,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useAppData } from '../contexts/AppDataContext';
import { useCouple } from '../contexts/CoupleContext';
import { formatWitTime } from '../lib/time';
import { PageId, PartnerRoleName } from '../types';

function isTrulyOnline(online: boolean | undefined, lastSeenMs: number | undefined, nowMs: number): boolean {
  if (!online || !lastSeenMs) return false;
  return nowMs - lastSeenMs < 65000;
}

function formatLastSeen(lastSeenMs: number | undefined): string {
  if (!lastSeenMs) return 'Belum tercatat';
  const dateStr = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jayapura',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .format(new Date(lastSeenMs))
    .replace(/\./g, ':');
  return `${dateStr} WIT`;
}

export const OurConnectionPage: React.FC<{ onNavigate: (page: PageId) => void }> = ({
  onNavigate,
}) => {
  const { user } = useAppData();
  const {
    firebaseReady,
    coupleSpace,
    isPaired,
    myRoleName,
    partnerPresence,
    myPresence,
    shareActivePage,
    setShareActivePage,
    unreadChatCount,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logoutCoupleAccount,
    createCoupleSpace,
    joinCoupleSpace,
    leaveCoupleSpace,
  } = useCouple();

  const [roleChoice, setRoleChoice] = useState<PartnerRoleName>('Zikri');
  const [authMode, setAuthMode] = useState<'google' | 'email-login' | 'email-register'>('google');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteInput, setInviteInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 5000);
    return () => window.clearInterval(id);
  }, []);

  if (!firebaseReady) {
    return (
      <div className="max-w-xl mx-auto rounded-3xl bg-white border border-rose-200 p-6 sm:p-8 space-y-4">
        <h1 className="font-display text-2xl font-bold text-[#4a2336]">
          Our Connection 💗 · Belum Terkonfigurasi
        </h1>
        <p className="text-sm text-[#5e3c4e] leading-relaxed">
          Konfigurasi Firebase belum ditemukan di <code>firebase-applet-config.json</code>. Lengkapi konfigurasi Firebase Authentication, Cloud Firestore, dan Firebase Storage agar fitur koneksi dua perangkat dapat aktif secara real-time.
        </p>
      </div>
    );
  }

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setBusy(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal masuk dengan Google.');
    } finally {
      setBusy(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setBusy(true);
    try {
      if (authMode === 'email-register') {
        await registerWithEmail(email, password, roleChoice);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('operation-not-allowed')) {
        setErrorMsg(
          'Login Email/Password belum diaktifkan di Firebase Console (Authentication → Sign-in method → Email/Password). Gunakan tombol Masuk dengan Google di atas atau aktifkan provider Email/Password di Firebase Console.'
        );
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleCreateSpace = async () => {
    setErrorMsg(null);
    setBusy(true);
    try {
      await createCoupleSpace(roleChoice);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal membuat Couple Space.');
    } finally {
      setBusy(false);
    }
  };

  const handleJoinSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setBusy(true);
    try {
      await joinCoupleSpace(inviteInput, roleChoice);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal bergabung ke Couple Space.');
    } finally {
      setBusy(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard restriction
    }
  };

  // Determine Zikri & Diann display presence slots accurately
  const mySlotOnline = isTrulyOnline(myPresence?.online, myPresence?.lastSeenMs, nowMs);
  const partnerSlotOnline = isTrulyOnline(partnerPresence?.online, partnerPresence?.lastSeenMs, nowMs);

  const zikriStatus =
    myRoleName === 'Zikri'
      ? { name: 'Zikri', online: mySlotOnline, presence: myPresence, isMe: true }
      : { name: 'Zikri', online: partnerSlotOnline, presence: partnerPresence, isMe: false };

  const diannStatus =
    myRoleName === 'Diann'
      ? { name: 'Diann', online: mySlotOnline, presence: myPresence, isMe: true }
      : { name: 'Diann', online: partnerSlotOnline, presence: partnerPresence, isMe: false };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-rose-500">
            Real-Time Couple Space · {formatWitTime(nowMs)} WIT
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#4a2336]">
            OUR CONNECTION 💗
          </h1>
        </div>
        {user && (
          <button
            type="button"
            onClick={() => void logoutCoupleAccount()}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-white border border-pink-200 text-xs font-semibold text-[#6b485b] hover:bg-pink-50 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar ({user.email || myRoleName})</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs sm:text-sm text-rose-700">
          {errorMsg}
        </div>
      )}

      {/* STATE 1: Not Signed In */}
      {!user && (
        <div className="rounded-3xl bg-white border border-pink-100 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="space-y-1.5">
            <h2 className="font-display text-xl font-bold text-[#4a2336]">
              Masuk Untuk Menghubungkan Dua Perangkat
            </h2>
            <p className="text-sm text-[#6b485b]">
              Status saat ini: <span className="font-semibold text-rose-600">Belum Terhubung</span>. Zikri dan Diann masing-masing masuk dengan akun berbeda agar bisa terhubung secara real-time.
            </p>
          </div>

          {/* Role Selection */}
          <div>
            <p className="text-xs font-semibold text-[#6b485b] mb-2">Pilih Identitas Kamu:</p>
            <div className="grid grid-cols-2 gap-2.5">
              {(['Zikri', 'Diann'] as PartnerRoleName[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleChoice(r)}
                  className={`min-h-[46px] rounded-2xl border text-sm font-semibold transition-colors cursor-pointer ${
                    roleChoice === r
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-[#fff9fb] text-[#4a2336] border-pink-200 hover:bg-pink-50'
                  }`}
                >
                  Aku {r}
                </button>
              ))}
            </div>
          </div>

          {/* Auth Method Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-pink-50/70 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setAuthMode('google')}
              className={`flex-1 min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                authMode === 'google' ? 'bg-white text-rose-600 shadow-xs' : 'text-[#6b485b]'
              }`}
            >
              Google (Cepat)
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('email-login')}
              className={`flex-1 min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                authMode === 'email-login' ? 'bg-white text-rose-600 shadow-xs' : 'text-[#6b485b]'
              }`}
            >
              Masuk Email
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('email-register')}
              className={`flex-1 min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                authMode === 'email-register' ? 'bg-white text-rose-600 shadow-xs' : 'text-[#6b485b]'
              }`}
            >
              Daftar Email
            </button>
          </div>

          {authMode === 'google' ? (
            <div className="space-y-3">
              <button
                type="button"
                disabled={busy}
                onClick={handleGoogleLogin}
                className="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-display font-semibold text-sm shadow-md shadow-rose-200 hover:brightness-105 inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{busy ? 'Menghubungkan...' : `Masuk dengan Google sebagai ${roleChoice}`}</span>
              </button>
              <p className="text-xs text-[#7c5a6c] text-center">
                Gunakan dua akun Google berbeda di HP/browser Zikri dan Diann untuk langsung terhubung.
              </p>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email akun..."
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
              />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kata sandi (minimal 6 karakter)"
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
              />
              <button
                type="submit"
                disabled={busy}
                className="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-rose-500 text-white font-semibold text-sm hover:bg-rose-600 cursor-pointer"
              >
                {busy
                  ? 'Memproses...'
                  : authMode === 'email-register'
                  ? `Daftar Akun ${roleChoice}`
                  : `Masuk sebagai ${roleChoice}`}
              </button>
            </form>
          )}
        </div>
      )}

      {/* STATE 2: Signed In, Not Yet in a Couple Space */}
      {user && !coupleSpace && (
        <div className="space-y-5">
          <div className="rounded-3xl bg-white border border-pink-100 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-[#4a2336]">
                Pilih Peran & Hubungkan Couple Space
              </h2>
              <span className="text-xs font-semibold text-rose-500">Status: Belum Terhubung</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {(['Zikri', 'Diann'] as PartnerRoleName[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleChoice(r)}
                  className={`min-h-[44px] rounded-xl border text-sm font-semibold cursor-pointer ${
                    roleChoice === r
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-[#fff9fb] text-[#4a2336] border-pink-200'
                  }`}
                >
                  Saya {r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Create Couple Space */}
            <div className="rounded-3xl bg-white border border-pink-100 shadow-sm p-6 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="w-11 h-11 rounded-2xl bg-pink-50 text-rose-500 flex items-center justify-center">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <h3 className="font-display text-lg font-bold text-[#4a2336]">
                  Create Couple Space
                </h3>
                <p className="text-xs sm:text-sm text-[#6b485b] leading-relaxed">
                  Buat ruang privat baru dan dapatkan kode undangan unik untuk dibagikan ke pasanganmu.
                </p>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={handleCreateSpace}
                className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 cursor-pointer"
              >
                {busy ? 'Membuat Ruang...' : 'Create Couple Space'}
              </button>
            </div>

            {/* Join Couple Space */}
            <form
              onSubmit={handleJoinSpace}
              className="rounded-3xl bg-white border border-pink-100 shadow-sm p-6 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-[#4a2336]">
                  Join Couple Space
                </h3>
                <p className="text-xs sm:text-sm text-[#6b485b] leading-relaxed">
                  Sudah punya kode undangan dari pasangan? Masukkan di bawah untuk langsung terhubung berdua.
                </p>
                <input
                  type="text"
                  required
                  value={inviteInput}
                  onChange={(e) => setInviteInput(e.target.value.toUpperCase())}
                  placeholder="Masukkan kode undangan (misal: ZD4K9P2M)"
                  maxLength={12}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm font-mono uppercase tracking-wider"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 cursor-pointer"
              >
                {busy ? 'Menghubungkan...' : 'Join Couple Space'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STATE 3: Couple Space Created, Waiting for Partner (memberCount === 1) */}
      {user && coupleSpace && !isPaired && (
        <div className="rounded-3xl bg-white border border-pink-200 shadow-sm p-6 sm:p-8 text-center space-y-5">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-pink-50 text-rose-500 flex items-center justify-center">
            <Link2 className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-amber-600">
              Menunggu Pasangan Bergabung (1 / 2 Anggota)
            </p>
            <h2 className="font-display text-2xl font-bold text-[#4a2336]">
              Bagikan Kode Undangan Ini ke Pasanganmu
            </h2>
            <p className="text-sm text-[#6b485b] max-w-md mx-auto">
              Minta pasanganmu login dengan akun berbeda di perangkat lain, buka halaman <strong>Our Connection</strong>, lalu masukkan kode undangan di bawah.
            </p>
          </div>

          <div className="inline-flex items-center gap-3 rounded-2xl bg-[#fff5f8] border border-pink-200 px-6 py-4">
            <span className="font-mono text-2xl sm:text-3xl font-bold tracking-widest text-rose-600">
              {coupleSpace.inviteCode}
            </span>
            <button
              type="button"
              onClick={() => void handleCopyCode(coupleSpace.inviteCode)}
              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-white border border-pink-200 text-xs font-semibold text-rose-600 hover:bg-pink-50 inline-flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Disalin' : 'Salin'}</span>
            </button>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => void leaveCoupleSpace()}
              className="text-xs text-[#7c5a6c] hover:text-rose-500 underline cursor-pointer"
            >
              Ganti ruang atau gabung ke kode undangan lain
            </button>
          </div>
        </div>
      )}

      {/* STATE 4: Paired! Both Accounts Connected (memberCount === 2) */}
      {user && coupleSpace && isPaired && (
        <div className="space-y-5">
          {/* Connected Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500 text-white p-6 sm:p-8 text-center shadow-lg shadow-pink-200/60 space-y-2"
          >
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-100">
              <ShieldCheck className="w-4 h-4" />
              <span>Terhubung Secara Real-Time · Ruang Privat (2/2 Anggota)</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Zikri ♡ Diann
            </h2>
            <p className="font-handwriting text-2xl sm:text-3xl text-pink-100">
              Two Hearts, One Little World
            </p>
          </motion.div>

          {/* Real-Time Couple Status (Online / Offline / Last Seen / Active Page) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[zikriStatus, diannStatus].map((partner) => (
              <div
                key={partner.name}
                className="rounded-3xl bg-white border border-pink-100 shadow-sm p-5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="font-display text-lg font-bold text-[#4a2336]">
                    {partner.name} {partner.isMe ? '(Kamu)' : ''}
                  </div>
                  <div
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                      partner.online ? 'text-emerald-600' : 'text-[#7c5a6c]'
                    }`}
                  >
                    {partner.online ? (
                      <>
                        <Wifi className="w-4 h-4" />
                        <span>Online</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-4 h-4" />
                        <span>Offline</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-xs text-[#6b485b] space-y-1">
                  <div>
                    Last Seen:{' '}
                    <span className="font-medium text-[#4a2336]">
                      {partner.online ? 'Aktif sekarang' : formatLastSeen(partner.presence?.lastSeenMs)}
                    </span>
                  </div>
                  <div>
                    Halaman aktif:{' '}
                    <span className="font-medium text-rose-600">
                      {partner.presence?.sharePage
                        ? partner.presence.currentPage
                        : 'Disembunyikan (Privat)'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Active Page Sharing Privacy Toggle */}
          <div className="rounded-2xl bg-white border border-pink-100 p-4 flex items-center justify-between gap-3">
            <div className="text-xs sm:text-sm text-[#4a2336]">
              <span className="font-semibold">Bagikan Halaman Aktif ke Pasangan</span>
              <p className="text-xs text-[#7c5a6c]">
                Menampilkan halaman yang sedang kamu buka di website ini (tanpa pelacakan GPS).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShareActivePage(!shareActivePage)}
              className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 cursor-pointer ${
                shareActivePage
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-pink-50 text-[#6b485b] border border-pink-200'
              }`}
            >
              {shareActivePage ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>{shareActivePage ? 'Diizinkan' : 'Privat'}</span>
            </button>
          </div>

          {/* Quick Shortcuts to Shared Real-Time Features */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                page: 'chat' as PageId,
                label: unreadChatCount > 0 ? `Chat (${unreadChatCount} Baru)` : 'Private Chat',
                icon: MessageCircleHeart,
              },
              { page: 'mini-games' as PageId, label: 'Play Together', icon: Gamepad2 },
              { page: 'memories' as PageId, label: 'Shared Memories', icon: Camera },
              { page: 'music' as PageId, label: 'Shared Music', icon: Music },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.page}
                  type="button"
                  onClick={() => onNavigate(item.page)}
                  className="min-h-[78px] p-4 rounded-2xl bg-white border border-pink-100 hover:border-rose-200 hover:bg-pink-50/40 text-left flex flex-col justify-between gap-2 cursor-pointer"
                >
                  <Icon className="w-5 h-5 text-rose-500" />
                  <span className="font-display text-sm font-semibold text-[#4a2336]">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
