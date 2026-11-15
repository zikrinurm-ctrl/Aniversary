import React, { useEffect, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Lock,
  LogIn,
  LogOut,
  Plus,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAppData } from '../contexts/AppDataContext';
import { compressImageFile } from '../lib/indexedDb';
import { storage } from '../lib/firebase';
import { MemoryCategory, TruthOrDareCategory } from '../types';

type AdminTab = 'profile' | 'secret' | 'timeline' | 'memories' | 'games';

export const AdminPage: React.FC = () => {
  const {
    user,
    isAdmin,
    authLoading,
    authError,
    signInAdmin,
    signOutUser,
    siteConfig,
    updateSiteConfig,
    timeline,
    saveTimelineItem,
    removeTimelineItem,
    memories,
    addMemory,
    removeMemory,
    addTruthOrDare,
    quizQuestions,
    saveQuizQuestion,
    removeQuizQuestion,
    addLoveLetter,
  } = useAppData();

  const [tab, setTab] = useState<AdminTab>('profile');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Profile & Final Letter state
  const [coupleNames, setCoupleNames] = useState(siteConfig.coupleNames);
  const [heroGreeting, setHeroGreeting] = useState(siteConfig.heroGreeting);
  const [couplePhotoUrl, setCouplePhotoUrl] = useState(siteConfig.couplePhotoUrl);
  const [finalLetter, setFinalLetter] = useState(siteConfig.finalLetter);

  // Secret Message state
  const [secretHint, setSecretHint] = useState(siteConfig.secretHint);
  const [secretMessage, setSecretMessage] = useState(siteConfig.secretMessage);
  const [newSecretCode, setNewSecretCode] = useState('');

  // Timeline form state
  const [tlTitle, setTlTitle] = useState('');
  const [tlDate, setTlDate] = useState('');
  const [tlDesc, setTlDesc] = useState('');
  const [tlPhoto, setTlPhoto] = useState('');

  // Memory upload state
  const [memFile, setMemFile] = useState<File | undefined>(undefined);
  const [memCaption, setMemCaption] = useState('');
  const [memDate, setMemDate] = useState('');
  const [memCat, setMemCat] = useState<MemoryCategory>('Special Moments');

  // Truth or Dare state
  const [todKind, setTodKind] = useState<'truth' | 'dare'>('truth');
  const [todCat, setTodCat] = useState<TruthOrDareCategory>('Romantic');
  const [todPrompt, setTodPrompt] = useState('');

  // Quiz editor state
  const [quizId, setQuizId] = useState('');
  const [quizQ, setQuizQ] = useState('');
  const [quizOpts, setQuizOpts] = useState(['', '', '', '']);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizExp, setQuizExp] = useState('');

  // Love letter form state
  const [letterTitle, setLetterTitle] = useState('');
  const [letterBody, setLetterBody] = useState('');

  useEffect(() => {
    setCoupleNames(siteConfig.coupleNames);
    setHeroGreeting(siteConfig.heroGreeting);
    setCouplePhotoUrl(siteConfig.couplePhotoUrl);
    setFinalLetter(siteConfig.finalLetter);
    setSecretHint(siteConfig.secretHint);
    setSecretMessage(siteConfig.secretMessage);
  }, [siteConfig]);

  const notify = (msg: string) => {
    setFeedback(msg);
    window.setTimeout(() => setFeedback(null), 5000);
  };

  if (authLoading) {
    return (
      <div className="max-w-md mx-auto rounded-3xl bg-white border border-pink-100 p-8 text-center text-sm text-[#7c5a6c]">
        Memeriksa status autentikasi Admin...
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto rounded-3xl bg-white border border-pink-100 shadow-sm p-7 sm:p-8 text-center space-y-5">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-pink-50 text-rose-500 flex items-center justify-center">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h1 className="font-display text-2xl font-bold text-[#4a2336]">Admin Mode</h1>
          <p className="text-sm text-[#6b485b]">
            Halaman ini dilindungi autentikasi Firebase. Hanya pemilik website yang dapat mengubah konten, foto, dan pesan rahasia.
          </p>
        </div>

        {authError && (
          <p className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
            {authError}
          </p>
        )}

        <button
          type="button"
          onClick={() => void signInAdmin()}
          className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-rose-500 text-white font-semibold text-sm hover:bg-rose-600 inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>Masuk dengan Google (Pemilik)</span>
        </button>

        {user && !isAdmin && (
          <button
            type="button"
            onClick={() => void signOutUser()}
            className="text-xs text-[#7c5a6c] hover:text-rose-500 underline cursor-pointer"
          >
            Keluar dari {user.email}
          </button>
        )}
      </div>
    );
  }

  const handleUploadCouplePhoto = async (file: File) => {
    try {
      const compressed = await compressImageFile(file, 1280, 0.85);
      const storageRef = ref(storage, `profile/couple_${Date.now()}.jpg`);
      await uploadBytes(storageRef, compressed, { contentType: 'image/jpeg' });
      const url = await getDownloadURL(storageRef);
      setCouplePhotoUrl(url);
      await updateSiteConfig({ couplePhotoUrl: url });
      notify('Foto pasangan berhasil diunggah & diperbarui!');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Gagal mengunggah foto pasangan.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-rose-500">Terautentikasi sebagai {user.email}</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#4a2336]">
            Admin Mode · Kelola Our Little World
          </h1>
        </div>
        <button
          type="button"
          onClick={() => void signOutUser()}
          className="min-h-[42px] px-4 py-2 rounded-xl bg-white border border-pink-200 text-xs font-semibold text-[#6b485b] hover:bg-pink-50 inline-flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>

      {feedback && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex flex-wrap gap-1.5 bg-white p-2 rounded-2xl border border-pink-100">
        {[
          { id: 'profile' as AdminTab, label: 'Profil & Surat Final' },
          { id: 'secret' as AdminTab, label: 'Secret Message' },
          { id: 'timeline' as AdminTab, label: 'Timeline' },
          { id: 'memories' as AdminTab, label: 'Foto Kenangan' },
          { id: 'games' as AdminTab, label: 'Kuis, ToD & Surat' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer whitespace-nowrap ${
              tab === t.id ? 'bg-rose-500 text-white' : 'text-[#6b485b] hover:bg-pink-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Profile & Final Letter */}
      {tab === 'profile' && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await updateSiteConfig({ coupleNames, heroGreeting, couplePhotoUrl, finalLetter });
              notify('Profil pasangan & surat final disimpan ke Firestore!');
            } catch (err) {
              notify(err instanceof Error ? err.message : 'Gagal menyimpan.');
            }
          }}
          className="rounded-3xl bg-white border border-pink-100 p-6 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6b485b] mb-1">Nama Pasangan</label>
              <input
                type="text"
                value={coupleNames}
                onChange={(e) => setCoupleNames(e.target.value)}
                required
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6b485b] mb-1">Unggah Foto Pasangan Baru</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleUploadCouplePhoto(f);
                }}
                className="w-full min-h-[44px] text-xs text-[#6b485b] file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:bg-pink-50 file:text-rose-600 file:font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6b485b] mb-1">URL Foto Pasangan</label>
            <input
              type="text"
              value={couplePhotoUrl}
              onChange={(e) => setCouplePhotoUrl(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6b485b] mb-1">Ucapan Dashboard</label>
            <input
              type="text"
              value={heroGreeting}
              onChange={(e) => setHeroGreeting(e.target.value)}
              required
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6b485b] mb-1">
              Surat Panjang Halaman Final Surprise
            </label>
            <textarea
              rows={8}
              value={finalLetter}
              onChange={(e) => setFinalLetter(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl bg-[#fff9fb] border border-pink-200 text-sm leading-relaxed"
            />
          </div>

          <button
            type="submit"
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 cursor-pointer"
          >
            Simpan Perubahan
          </button>
        </form>
      )}

      {/* TAB 2: Secret Message */}
      {tab === 'secret' && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await updateSiteConfig({
                secretHint,
                secretMessage,
                ...(newSecretCode.trim() ? { newSecretCode } : {}),
              });
              setNewSecretCode('');
              notify('Pesan rahasia & kode berhasil diperbarui!');
            } catch (err) {
              notify(err instanceof Error ? err.message : 'Gagal menyimpan pesan rahasia.');
            }
          }}
          className="rounded-3xl bg-white border border-pink-100 p-6 space-y-4"
        >
          <div className="flex items-center gap-2 text-rose-500 text-xs font-semibold">
            <Lock className="w-4 h-4" />
            <span>Kode rahasia dienkripsi SHA-256 sebelum disimpan</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6b485b] mb-1">Petunjuk (Teka-Teki)</label>
            <input
              type="text"
              value={secretHint}
              onChange={(e) => setSecretHint(e.target.value)}
              required
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6b485b] mb-1">
              Kode Rahasia Baru (kosongkan jika tidak ingin mengubah)
            </label>
            <input
              type="text"
              value={newSecretCode}
              onChange={(e) => setNewSecretCode(e.target.value)}
              placeholder="Contoh: 201125"
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6b485b] mb-1">Isi Pesan Rahasia</label>
            <textarea
              rows={5}
              value={secretMessage}
              onChange={(e) => setSecretMessage(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl bg-[#fff9fb] border border-pink-200 text-sm"
            />
          </div>

          <button
            type="submit"
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 cursor-pointer"
          >
            Simpan Secret Message
          </button>
        </form>
      )}

      {/* TAB 3: Timeline */}
      {tab === 'timeline' && (
        <div className="space-y-4">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await saveTimelineItem({
                  id: `milestone-${Date.now()}`,
                  title: tlTitle,
                  dateLabel: tlDate,
                  description: tlDesc,
                  imageUrl: tlPhoto || undefined,
                  sortOrder: timeline.length + 1,
                });
                setTlTitle('');
                setTlDate('');
                setTlDesc('');
                setTlPhoto('');
                notify('Milestone timeline baru ditambahkan!');
              } catch (err) {
                notify(err instanceof Error ? err.message : 'Gagal menambah timeline.');
              }
            }}
            className="rounded-3xl bg-white border border-pink-100 p-6 space-y-3"
          >
            <h2 className="font-display text-base font-bold text-[#4a2336]">Tambah Momen Timeline</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                value={tlTitle}
                onChange={(e) => setTlTitle(e.target.value)}
                placeholder="Judul momen"
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
              />
              <input
                type="text"
                required
                value={tlDate}
                onChange={(e) => setTlDate(e.target.value)}
                placeholder="Tanggal (contoh: 10 Jan 2026)"
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
              />
            </div>
            <input
              type="text"
              value={tlPhoto}
              onChange={(e) => setTlPhoto(e.target.value)}
              placeholder="URL foto opsional"
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
            />
            <textarea
              rows={3}
              required
              value={tlDesc}
              onChange={(e) => setTlDesc(e.target.value)}
              placeholder="Cerita singkat momen ini..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
            />
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan Milestone</span>
            </button>
          </form>

          <div className="rounded-3xl bg-white border border-pink-100 p-5 space-y-2">
            {timeline.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 py-2 border-b border-pink-50 last:border-0">
                <div>
                  <div className="text-sm font-semibold text-[#4a2336]">{t.title}</div>
                  <div className="text-xs text-[#7c5a6c]">{t.dateLabel}</div>
                </div>
                {t.ownerUid && (
                  <button
                    type="button"
                    onClick={() => void removeTimelineItem(t.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Memories */}
      {tab === 'memories' && (
        <div className="space-y-4">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!memFile) return;
              try {
                const res = await addMemory({
                  file: memFile,
                  caption: memCaption,
                  dateLabel: memDate || 'Kenangan Kita',
                  category: memCat,
                });
                setMemFile(undefined);
                setMemCaption('');
                setMemDate('');
                notify(res.syncedToCloud ? 'Foto diunggah ke cloud!' : 'Foto tersimpan lokal.');
              } catch (err) {
                notify(err instanceof Error ? err.message : 'Gagal unggah foto.');
              }
            }}
            className="rounded-3xl bg-white border border-pink-100 p-6 space-y-3"
          >
            <h2 className="font-display text-base font-bold text-[#4a2336] flex items-center gap-2">
              <Camera className="w-4 h-4 text-rose-500" />
              <span>Unggah Foto Kenangan</span>
            </h2>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setMemFile(e.target.files?.[0])}
              className="w-full text-xs text-[#6b485b]"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                required
                value={memCaption}
                onChange={(e) => setMemCaption(e.target.value)}
                placeholder="Caption foto"
                className="min-h-[44px] px-3 py-2 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
              />
              <input
                type="text"
                value={memDate}
                onChange={(e) => setMemDate(e.target.value)}
                placeholder="Tanggal"
                className="min-h-[44px] px-3 py-2 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
              />
              <select
                value={memCat}
                onChange={(e) => setMemCat(e.target.value as MemoryCategory)}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
              >
                <option value="First Dates">First Dates</option>
                <option value="Jalan-Jalan">Jalan-Jalan</option>
                <option value="Random Lucu">Random Lucu</option>
                <option value="Special Moments">Special Moments</option>
              </select>
            </div>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold cursor-pointer"
            >
              Unggah & Simpan
            </button>
          </form>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {memories.map((m) => (
              <div key={m.id} className="rounded-2xl bg-white border border-pink-100 overflow-hidden">
                <img src={m.imageUrl} alt={m.caption} referrerPolicy="no-referrer" className="w-full h-24 object-cover" />
                <div className="p-2 flex items-center justify-between gap-1">
                  <span className="text-xs truncate text-[#4a2336]">{m.caption}</span>
                  <button
                    type="button"
                    onClick={() => void removeMemory(m)}
                    className="p-1 text-rose-500 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Games & Letters */}
      {tab === 'games' && (
        <div className="space-y-5">
          {/* Add Truth or Dare */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await addTruthOrDare({ kind: todKind, category: todCat, prompt: todPrompt });
                setTodPrompt('');
                notify('Pertanyaan Truth or Dare ditambahkan!');
              } catch (err) {
                notify(err instanceof Error ? err.message : 'Gagal menambah Truth or Dare.');
              }
            }}
            className="rounded-3xl bg-white border border-pink-100 p-6 space-y-3"
          >
            <h2 className="font-display text-base font-bold text-[#4a2336]">
              Tambah Truth or Dare Baru
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
              <select
                value={todKind}
                onChange={(e) => setTodKind(e.target.value as 'truth' | 'dare')}
                className="min-h-[44px] px-3 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
              >
                <option value="truth">Truth</option>
                <option value="dare">Dare</option>
              </select>
              <select
                value={todCat}
                onChange={(e) => setTodCat(e.target.value as TruthOrDareCategory)}
                className="min-h-[44px] px-3 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
              >
                {['Romantic', 'Funny', 'Deep Talk', 'Relationship', 'Jealousy', 'Childhood', 'Future', 'Random'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <input
              type="text"
              required
              value={todPrompt}
              onChange={(e) => setTodPrompt(e.target.value)}
              placeholder="Tulis pertanyaan atau tantangan baru..."
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
            />
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold cursor-pointer"
            >
              Simpan Truth or Dare
            </button>
          </form>

          {/* Edit / Add Love Quiz */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await saveQuizQuestion({
                  id: quizId || `quiz-${Date.now()}`,
                  question: quizQ,
                  options: quizOpts.filter((o) => o.trim().length > 0),
                  correctIndex: quizCorrect,
                  explanation: quizExp || 'Jawaban tersimpan!',
                  sortOrder: quizQuestions.length + 1,
                });
                setQuizId('');
                setQuizQ('');
                setQuizOpts(['', '', '', '']);
                setQuizExp('');
                notify('Pertanyaan Love Quiz disimpan!');
              } catch (err) {
                notify(err instanceof Error ? err.message : 'Gagal menyimpan kuis.');
              }
            }}
            className="rounded-3xl bg-white border border-pink-100 p-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-[#4a2336]">
                {quizId ? 'Edit Pertanyaan Love Quiz' : 'Tambah / Edit Love Quiz'}
              </h2>
              <select
                value={quizId}
                onChange={(e) => {
                  const sel = quizQuestions.find((q) => q.id === e.target.value);
                  if (sel) {
                    setQuizId(sel.id);
                    setQuizQ(sel.question);
                    setQuizOpts([
                      sel.options[0] || '',
                      sel.options[1] || '',
                      sel.options[2] || '',
                      sel.options[3] || '',
                    ]);
                    setQuizCorrect(sel.correctIndex);
                    setQuizExp(sel.explanation);
                  } else {
                    setQuizId('');
                    setQuizQ('');
                    setQuizOpts(['', '', '', '']);
                    setQuizExp('');
                  }
                }}
                className="min-h-[38px] max-w-[200px] px-2.5 rounded-xl bg-pink-50 border border-pink-200 text-xs"
              >
                <option value="">+ Buat Soal Baru</option>
                {quizQuestions.map((q, idx) => (
                  <option key={q.id} value={q.id}>
                    #{idx + 1}: {q.question.slice(0, 28)}...
                  </option>
                ))}
              </select>
            </div>

            <input
              type="text"
              required
              value={quizQ}
              onChange={(e) => setQuizQ(e.target.value)}
              placeholder="Teks pertanyaan..."
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quizOpts.map((opt, idx) => (
                <input
                  key={idx}
                  type="text"
                  required={idx < 2}
                  value={opt}
                  onChange={(e) => {
                    const copy = [...quizOpts];
                    copy[idx] = e.target.value;
                    setQuizOpts(copy);
                  }}
                  placeholder={`Pilihan ${idx + 1}${idx < 2 ? ' (wajib)' : ''}`}
                  className="min-h-[42px] px-3 py-2 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
                />
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={quizCorrect}
                onChange={(e) => setQuizCorrect(Number(e.target.value))}
                className="min-h-[42px] px-3 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
              >
                <option value={0}>Jawaban Benar: Pilihan 1</option>
                <option value={1}>Jawaban Benar: Pilihan 2</option>
                <option value={2}>Jawaban Benar: Pilihan 3</option>
                <option value={3}>Jawaban Benar: Pilihan 4</option>
              </select>
              <input
                type="text"
                required
                value={quizExp}
                onChange={(e) => setQuizExp(e.target.value)}
                placeholder="Penjelasan singkat setelah menjawab"
                className="min-h-[42px] px-3 py-2 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold cursor-pointer"
              >
                Simpan Soal Quiz
              </button>
              {quizId && (
                <button
                  type="button"
                  onClick={() => void removeQuizQuestion(quizId)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-50 text-rose-600 text-xs font-semibold cursor-pointer"
                >
                  Hapus dari Cloud
                </button>
              )}
            </div>
          </form>

          {/* Add Love Letter */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await addLoveLetter({
                  title: letterTitle,
                  body: letterBody,
                  author: 'Zikri untuk Diann',
                });
                setLetterTitle('');
                setLetterBody('');
                notify('Surat cinta baru ditambahkan ke koleksi Love Letter!');
              } catch (err) {
                notify(err instanceof Error ? err.message : 'Gagal menambah surat.');
              }
            }}
            className="rounded-3xl bg-white border border-pink-100 p-6 space-y-3"
          >
            <h2 className="font-display text-base font-bold text-[#4a2336]">
              Tambah Surat Cinta Baru
            </h2>
            <input
              type="text"
              required
              value={letterTitle}
              onChange={(e) => setLetterTitle(e.target.value)}
              placeholder="Judul surat cinta"
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
            />
            <textarea
              rows={3}
              required
              value={letterBody}
              onChange={(e) => setLetterBody(e.target.value)}
              placeholder="Tulis isi surat cinta..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
            />
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold cursor-pointer"
            >
              Simpan Surat Cinta
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
