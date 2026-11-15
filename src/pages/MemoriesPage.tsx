import React, { useEffect, useMemo, useState } from 'react';
import { Camera, MessageCircle, Plus, Send, Trash2, User, X } from 'lucide-react';
import { useAppData } from '../contexts/AppDataContext';
import { useCouple } from '../contexts/CoupleContext';
import { MemoryCategory, MemoryCommentItem, MemoryItem } from '../types';

const CATEGORIES: Array<'Semua' | MemoryCategory> = [
  'Semua',
  'First Dates',
  'Jalan-Jalan',
  'Random Lucu',
  'Special Moments',
];

export const MemoriesPage: React.FC = () => {
  const { memories, addMemory, removeMemory, isAdmin } = useAppData();
  const {
    coupleSpace,
    spaceMemories,
    uploadSpaceMemory,
    deleteSpaceMemory,
    subscribeMemoryComments,
    addMemoryComment,
    myRoleName,
  } = useCouple();

  const [albumMode, setAlbumMode] = useState<'shared' | 'showcase'>(
    coupleSpace ? 'shared' : 'showcase'
  );
  const [filter, setFilter] = useState<'Semua' | MemoryCategory>('Semua');
  const [lightboxItem, setLightboxItem] = useState<MemoryItem | null>(null);
  const [comments, setComments] = useState<MemoryCommentItem[]>([]);
  const [commentText, setCommentText] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  const [file, setFile] = useState<File | undefined>(undefined);
  const [caption, setCaption] = useState('');
  const [dateLabel, setDateLabel] = useState('');
  const [category, setCategory] = useState<MemoryCategory>('Special Moments');
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (coupleSpace) {
      setAlbumMode('shared');
    }
  }, [Boolean(coupleSpace)]);

  // Subscribe to real-time comments when viewing a shared space memory in Lightbox
  useEffect(() => {
    if (!lightboxItem || !coupleSpace || !lightboxItem.uploaderUid) {
      setComments([]);
      return;
    }
    const unsub = subscribeMemoryComments(lightboxItem.id, setComments);
    return () => unsub();
  }, [coupleSpace, lightboxItem, subscribeMemoryComments]);

  const activeList = useMemo(() => {
    const source =
      coupleSpace && albumMode === 'shared'
        ? spaceMemories.length > 0
          ? spaceMemories
          : []
        : memories;
    if (filter === 'Semua') return source;
    return source.filter((m) => m.category === filter);
  }, [albumMode, coupleSpace, filter, memories, spaceMemories]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !caption.trim()) {
      setStatusMsg('Pilih file foto dan tulis caption singkat terlebih dahulu.');
      return;
    }
    setUploading(true);
    setStatusMsg(null);
    try {
      if (coupleSpace && albumMode === 'shared') {
        await uploadSpaceMemory({
          file,
          caption,
          dateLabel: dateLabel || 'Kenangan Kita',
          category,
        });
        setStatusMsg(
          `Foto berhasil diunggah oleh ${myRoleName} ke Galeri Bersama dan langsung muncul di perangkat pasangan!`
        );
      } else {
        const res = await addMemory({
          file,
          caption,
          dateLabel: dateLabel || 'Kenangan Kita',
          category,
        });
        setStatusMsg(
          res.syncedToCloud
            ? 'Foto berhasil diunggah ke Firebase Storage & Firestore!'
            : 'Foto disimpan aman di penyimpanan lokal (IndexedDB). Hubungkan Couple Space untuk berbagi real-time!'
        );
      }
      setFile(undefined);
      setCaption('');
      setDateLabel('');
      setShowUpload(false);
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : 'Gagal mengunggah foto.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lightboxItem || !commentText.trim()) return;
    await addMemoryComment(lightboxItem.id, commentText);
    setCommentText('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-rose-500">
            Our Memories · {activeList.length} Foto Tersimpan
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#4a2336]">
            {coupleSpace && albumMode === 'shared'
              ? 'Galeri Bersama Real-Time 📸'
              : 'Album Kenangan Kita 📸'}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setShowUpload((v) => !v)}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showUpload ? 'Tutup Form' : 'Unggah Foto'}</span>
        </button>
      </div>

      {coupleSpace && (
        <div className="flex gap-1.5 bg-white p-1.5 rounded-2xl border border-pink-100 w-fit">
          <button
            type="button"
            onClick={() => setAlbumMode('shared')}
            className={`min-h-[38px] px-4 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
              albumMode === 'shared' ? 'bg-rose-500 text-white' : 'text-[#6b485b] hover:bg-pink-50'
            }`}
          >
            Galeri Couple Space ({spaceMemories.length})
          </button>
          <button
            type="button"
            onClick={() => setAlbumMode('showcase')}
            className={`min-h-[38px] px-4 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
              albumMode === 'showcase' ? 'bg-rose-500 text-white' : 'text-[#6b485b] hover:bg-pink-50'
            }`}
          >
            Album Showcase ({memories.length})
          </button>
        </div>
      )}

      {statusMsg && (
        <p className="rounded-2xl bg-pink-50 border border-pink-200 px-4 py-3 text-xs sm:text-sm text-[#4a2336]">
          {statusMsg}
        </p>
      )}

      {showUpload && (
        <form
          onSubmit={handleUpload}
          className="rounded-3xl bg-white border border-pink-100 shadow-sm p-5 sm:p-6 space-y-4"
        >
          <h2 className="font-display text-base font-bold text-[#4a2336]">
            {coupleSpace && albumMode === 'shared'
              ? `Unggah ke Galeri Bersama sebagai ${myRoleName}`
              : 'Unggah Foto Kenangan Baru'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#6b485b] mb-1">Pilih Foto</label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setFile(e.target.files?.[0])}
                className="w-full min-h-[44px] text-xs text-[#6b485b] file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:bg-pink-50 file:text-rose-600 file:font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6b485b] mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MemoryCategory)}
                className="w-full min-h-[44px] px-3 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
              >
                <option value="First Dates">First Dates</option>
                <option value="Jalan-Jalan">Jalan-Jalan</option>
                <option value="Random Lucu">Random Lucu</option>
                <option value="Special Moments">Special Moments</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Cerita singkat atau caption foto..."
              maxLength={400}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
            />
            <input
              type="text"
              value={dateLabel}
              onChange={(e) => setDateLabel(e.target.value)}
              placeholder="Tanggal foto (contoh: 14 Feb 2026)"
              maxLength={50}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 cursor-pointer"
          >
            {uploading ? 'Mengunggah...' : 'Simpan Foto Kenangan'}
          </button>
        </form>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-1.5 bg-white/85 p-2 rounded-2xl border border-pink-100">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              filter === cat ? 'bg-rose-500 text-white' : 'text-[#6b485b] hover:bg-pink-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {activeList.length === 0 ? (
        <div className="rounded-3xl bg-white border border-pink-100 p-10 text-center space-y-2">
          <Camera className="w-8 h-8 text-pink-300 mx-auto" />
          <p className="font-display font-semibold text-[#4a2336]">
            {coupleSpace && albumMode === 'shared'
              ? 'Galeri Couple Space masih kosong'
              : 'Belum ada foto di kategori ini'}
          </p>
          <p className="text-xs text-[#7c5a6c]">
            Tekan tombol Unggah Foto agar langsung tersinkron ke perangkat pasanganmu.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeList.map((mem) => {
            const isShared = Boolean(mem.uploaderUid);
            const canDelete = isShared || mem.isLocalOnly || isAdmin;
            return (
              <div
                key={mem.id}
                className="group rounded-3xl bg-white border border-pink-100 shadow-sm overflow-hidden flex flex-col"
              >
                <button
                  type="button"
                  onClick={() => setLightboxItem(mem)}
                  className="relative aspect-[4/3] w-full overflow-hidden bg-pink-50 cursor-pointer"
                >
                  <img
                    src={mem.imageUrl}
                    alt={mem.caption}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </button>
                <div className="p-4 flex-1 flex flex-col justify-between gap-2">
                  <div>
                    <div className="text-xs text-[#7c5a6c]">
                      {mem.category} · {mem.dateLabel}
                      {mem.uploaderName ? ` · Oleh ${mem.uploaderName}` : ''}
                    </div>
                    <p className="mt-1 text-sm font-medium text-[#4a2336] leading-snug">
                      {mem.caption}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {isShared ? (
                      <button
                        type="button"
                        onClick={() => setLightboxItem(mem)}
                        className="text-xs text-rose-500 font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Komentar</span>
                      </button>
                    ) : (
                      <span />
                    )}

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() =>
                          void (isShared ? deleteSpaceMemory(mem) : removeMemory(mem))
                        }
                        className="min-h-[36px] px-2.5 py-1 rounded-lg text-xs text-rose-500 hover:bg-rose-50 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal with Real-Time Comments for Shared Memories */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="max-w-3xl w-full max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-black flex items-center justify-center max-h-[55vh]">
              <img
                src={lightboxItem.imageUrl}
                alt={lightboxItem.caption}
                referrerPolicy="no-referrer"
                className="max-h-[55vh] w-auto object-contain"
              />
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                aria-label="Tutup lightbox"
                className="absolute top-3 right-3 min-h-[44px] min-w-[44px] rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 overflow-y-auto">
              <div className="text-xs text-rose-500 font-semibold flex flex-wrap items-center gap-2">
                <span>
                  {lightboxItem.category} · {lightboxItem.dateLabel}
                </span>
                {lightboxItem.uploaderName && (
                  <span className="inline-flex items-center gap-1 text-[#6b485b]">
                    <User className="w-3.5 h-3.5" />
                    Diunggah oleh {lightboxItem.uploaderName}
                  </span>
                )}
              </div>
              <p className="text-base font-medium text-[#4a2336]">{lightboxItem.caption}</p>

              {coupleSpace && lightboxItem.uploaderUid && (
                <div className="pt-3 border-t border-pink-100 space-y-3">
                  <div className="text-xs font-semibold text-[#6b485b]">
                    Komentar Pasangan ({comments.length})
                  </div>
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {comments.length === 0 ? (
                      <p className="text-xs text-[#8d6b7c]">Belum ada komentar. Tulis komentar pertama!</p>
                    ) : (
                      comments.map((c) => (
                        <div key={c.id} className="rounded-xl bg-[#fff8fa] px-3 py-2 text-xs">
                          <span className="font-semibold text-rose-600">{c.authorName}: </span>
                          <span className="text-[#4a2336]">{c.text}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Tulis komentar manis..."
                      maxLength={350}
                      className="flex-1 min-h-[40px] px-3 py-1.5 rounded-xl bg-[#fff9fb] border border-pink-200 text-xs"
                    />
                    <button
                      type="submit"
                      className="min-h-[40px] px-3.5 rounded-xl bg-rose-500 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
