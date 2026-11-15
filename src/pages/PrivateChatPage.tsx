import React, { useEffect, useRef, useState } from 'react';
import { Check, CheckCheck, Heart, Link2, Send, Smile, Wifi, WifiOff } from 'lucide-react';
import { useAppData } from '../contexts/AppDataContext';
import { useCouple } from '../contexts/CoupleContext';
import { playGentlePop } from '../lib/sound';
import { PageId } from '../types';

const ROMANTIC_STICKERS = [
  { id: 'hug', label: '💗 Peluk Erat' },
  { id: 'kiss', label: '😘 Kecup Manis' },
  { id: 'miss', label: '🌸 Kangen Kamu' },
  { id: 'cheer', label: '✨ Semangat Sayang' },
  { id: 'anniv', label: '🎂 Happy 1st Anniv' },
  { id: 'sorry', label: '🥺 Maafin Aku' },
  { id: 'love', label: '🥰 Sayang Banget' },
  { id: 'night', label: '🌙 Met Bobo' },
];

const QUICK_EMOJIS = ['💗', '🥰', '😘', '🤗', '✨', '🌸', '🥺', '😂', '🫶', '🎂'];

function formatChatTime(ms: number): string {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jayapura',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .format(new Date(ms))
    .replace(/\./g, ':');
}

export const PrivateChatPage: React.FC<{ onNavigate: (page: PageId) => void }> = ({
  onNavigate,
}) => {
  const { user } = useAppData();
  const {
    coupleSpace,
    isPaired,
    partnerName,
    partnerPresence,
    chatMessages,
    sendChatMessage,
    markPartnerMessagesRead,
  } = useCouple();

  const [text, setText] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const [sending, setSending] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 10000);
    return () => window.clearInterval(id);
  }, []);

  // Mark incoming partner messages as read automatically when chat is visible
  useEffect(() => {
    if (coupleSpace && document.visibilityState === 'visible') {
      void markPartnerMessagesRead();
    }
  }, [coupleSpace, chatMessages, markPartnerMessagesRead]);

  // Auto-scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length]);

  if (!user || !coupleSpace) {
    return (
      <div className="max-w-xl mx-auto rounded-3xl bg-white border border-pink-100 p-8 text-center space-y-4">
        <Heart className="w-10 h-10 text-rose-500 mx-auto" />
        <h1 className="font-display text-2xl font-bold text-[#4a2336]">
          Private Chat Zikri & Diann
        </h1>
        <p className="text-sm text-[#6b485b]">
          Hubungkan kedua akun di halaman <strong>Our Connection</strong> terlebih dahulu untuk mulai berkirim pesan privat secara real-time.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('connection')}
          className="min-h-[46px] px-6 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 inline-flex items-center gap-2 cursor-pointer"
        >
          <Link2 className="w-4 h-4" />
          <span>Buka Our Connection</span>
        </button>
      </div>
    );
  }

  const partnerOnline =
    Boolean(partnerPresence?.online) &&
    Boolean(partnerPresence?.lastSeenMs) &&
    nowMs - (partnerPresence?.lastSeenMs || 0) < 65000;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await sendChatMessage(text, '');
      playGentlePop();
      setText('');
    } finally {
      setSending(false);
    }
  };

  const handleSendSticker = async (label: string) => {
    setShowStickers(false);
    await sendChatMessage('', label);
    playGentlePop();
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-170px)] min-h-[480px] rounded-3xl bg-white border border-pink-100 shadow-sm overflow-hidden">
      {/* Romantic Chat Header */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-[#fff5f8] to-[#f8f1ff] border-b border-pink-100 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-base sm:text-lg font-bold text-[#4a2336]">
            {isPaired ? `Chat Privat dengan ${partnerName}` : 'Chat Ruang Pasangan'}
          </h1>
          <div className="text-xs text-[#7c5a6c] flex items-center gap-1.5">
            {isPaired ? (
              partnerOnline ? (
                <span className="text-emerald-600 font-semibold inline-flex items-center gap-1">
                  <Wifi className="w-3.5 h-3.5" />
                  <span>
                    Online{partnerPresence?.sharePage ? ` · ${partnerPresence.currentPage}` : ''}
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>
                    Offline
                    {partnerPresence?.lastSeenMs
                      ? ` · Terakhir dilihat ${formatChatTime(partnerPresence.lastSeenMs)} WIT`
                      : ''}
                  </span>
                </span>
              )
            ) : (
              <span>Menunggu pasangan bergabung di Our Connection</span>
            )}
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-[#fffafc]">
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-[#7c5a6c]">
            <Heart className="w-8 h-8 text-pink-300" />
            <p className="text-sm font-medium text-[#4a2336]">Belum ada pesan di ruang ini</p>
            <p className="text-xs">Kirim pesan manis atau stiker pertamamu di bawah!</p>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isMine = msg.senderUid === user.uid;
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[82%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-xs ${
                    isMine
                      ? 'bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-br-sm'
                      : 'bg-white border border-pink-100 text-[#4a2336] rounded-bl-sm'
                  }`}
                >
                  {!isMine && (
                    <div className="text-[11px] font-semibold text-rose-500 mb-0.5">
                      {msg.senderName}
                    </div>
                  )}

                  {msg.sticker && (
                    <div
                      className={`text-lg sm:text-xl font-display font-semibold py-1 ${
                        isMine ? 'text-white' : 'text-rose-600'
                      }`}
                    >
                      {msg.sticker}
                    </div>
                  )}

                  {msg.text && (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {msg.text}
                    </p>
                  )}

                  <div
                    className={`mt-1 flex items-center justify-end gap-1 text-[10px] tabular-nums ${
                      isMine ? 'text-pink-100' : 'text-[#8d6b7c]'
                    }`}
                  >
                    <span>{formatChatTime(msg.createdAtMs)}</span>
                    {isMine &&
                      (msg.readByPartner ? (
                        <span className="inline-flex items-center gap-0.5" title="Dibaca">
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Dibaca</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5" title="Terkirim">
                          <Check className="w-3.5 h-3.5" />
                          <span>Terkirim</span>
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Sticker & Quick Emoji Drawer */}
      {showStickers && (
        <div className="px-4 py-3 bg-[#fff6fa] border-t border-pink-100 space-y-2.5">
          <div className="flex flex-wrap gap-1.5">
            {QUICK_EMOJIS.map((emo) => (
              <button
                key={emo}
                type="button"
                onClick={() => setText((prev) => prev + emo)}
                className="min-w-[36px] min-h-[36px] rounded-xl bg-white border border-pink-100 text-lg hover:bg-pink-50 cursor-pointer"
              >
                {emo}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {ROMANTIC_STICKERS.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => void handleSendSticker(st.label)}
                className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-white border border-pink-200 text-xs font-semibold text-rose-600 hover:bg-pink-50 cursor-pointer truncate"
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-white border-t border-pink-100 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => setShowStickers((s) => !s)}
          aria-label="Buka emoji dan stiker"
          className={`min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
            showStickers ? 'bg-rose-500 text-white' : 'bg-pink-50 text-rose-500 hover:bg-pink-100'
          }`}
        >
          <Smile className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tulis pesan manis untuk pasanganmu..."
          maxLength={1500}
          className="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm text-[#4a2336] focus:outline-none focus:ring-2 focus:ring-rose-300"
        />

        <button
          type="submit"
          disabled={!text.trim() || sending}
          aria-label="Kirim pesan"
          className="min-h-[44px] px-4 rounded-xl bg-rose-500 text-white font-semibold text-sm hover:bg-rose-600 disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Kirim</span>
        </button>
      </form>
    </div>
  );
};
