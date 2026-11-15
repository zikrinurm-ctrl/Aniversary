import React, { useState } from 'react';
import { CheckCircle2, Music, Send, Volume2 } from 'lucide-react';
import { GUESS_SONG_ITEMS } from '../../data/gamesData';
import { playChime, playMelodyNotes, playSoftError } from '../../lib/sound';
import { MultiplayerBoardProps } from './TicTacToeMP';

export const GuessSongMP: React.FC<MultiplayerBoardProps> = ({
  room,
  myUid,
  onMove,
}) => {
  const gs = room.gameState as {
    songIds?: number[];
    round?: number;
    clueGiverUid?: string;
    clueSent?: boolean;
    customHint?: string;
    guessPick?: number;
    guessCorrect?: boolean;
    revealed?: boolean;
  };

  const songIds = Array.isArray(gs.songIds) && gs.songIds.length > 0 ? gs.songIds : [0, 1, 2, 3];
  const round = Number(gs.round || 0);
  const clueGiverUid = String(gs.clueGiverUid || room.player1Id);
  const clueSent = Boolean(gs.clueSent);
  const customHint = String(gs.customHint || '');
  const guessPick = typeof gs.guessPick === 'number' ? gs.guessPick : -1;
  const guessCorrect = Boolean(gs.guessCorrect);
  const revealed = Boolean(gs.revealed);

  const amIClueGiver = myUid === clueGiverUid;
  const clueGiverName =
    clueGiverUid === room.player1Id ? room.player1Name : room.player2Name;
  const guesserName =
    clueGiverUid === room.player1Id ? room.player2Name : room.player1Name;

  const songItem = GUESS_SONG_ITEMS[songIds[round] % GUESS_SONG_ITEMS.length];
  const [hintDraft, setHintDraft] = useState('');

  const handleSendClue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amIClueGiver || clueSent) return;
    playMelodyNotes(songItem.melody);

    const safeHint = hintDraft.trim().slice(0, 140) || songItem.hint;
    setHintDraft('');

    await onMove((latest, uid) => {
      const curGs = latest.gameState as Record<string, unknown>;
      if (curGs.clueGiverUid !== uid || curGs.clueSent) return null;
      return {
        gameState: {
          ...curGs,
          clueSent: true,
          customHint: safeHint,
        },
        currentTurn: 'both',
        turnNumber: latest.turnNumber + 1,
        score: latest.score,
        winnerId: '',
        status: 'playing',
        historyTitle: 'Guess The Song',
      };
    });
  };

  const handleGuessOption = async (optIdx: number) => {
    if (amIClueGiver || !clueSent || revealed) return;
    const isCorrect = optIdx === songItem.correctIndex;
    if (isCorrect) playChime([523.25, 659.25, 783.99], 85);
    else playSoftError();

    await onMove((latest, uid) => {
      const curGs = latest.gameState as Record<string, unknown>;
      if (!curGs.clueSent || curGs.revealed || curGs.clueGiverUid === uid) return null;
      const nextScore = { ...latest.score };
      if (isCorrect) {
        const guesserIsP1 = latest.player1Id === uid;
        if (guesserIsP1) nextScore.player1 += 15;
        else nextScore.player2 += 15;
      }
      return {
        gameState: {
          ...curGs,
          guessPick: optIdx,
          guessCorrect: isCorrect,
          revealed: true,
        },
        currentTurn: 'both',
        turnNumber: latest.turnNumber + 1,
        score: nextScore,
        winnerId: '',
        status: 'playing',
        historyTitle: 'Guess The Song',
      };
    });
  };

  const handleNext = async () => {
    await onMove((latest) => {
      const curGs = latest.gameState as { songIds?: number[]; round?: number; clueGiverUid?: string };
      const ids = Array.isArray(curGs.songIds) ? curGs.songIds : songIds;
      const r = Number(curGs.round || 0);
      if (r + 1 >= ids.length) {
        const winnerId =
          latest.score.player1 > latest.score.player2
            ? latest.player1Id
            : latest.score.player2 > latest.score.player1
            ? latest.player2Id
            : 'draw';
        return {
          gameState: { ...curGs, round: r },
          currentTurn: 'both',
          turnNumber: latest.turnNumber + 1,
          score: latest.score,
          winnerId,
          status: 'finished',
          historyTitle: 'Guess The Song',
        };
      }
      const nextClueGiver =
        curGs.clueGiverUid === latest.player1Id ? latest.player2Id : latest.player1Id;
      return {
        gameState: {
          songIds: ids,
          round: r + 1,
          clueGiverUid: nextClueGiver,
          clueSent: false,
          customHint: '',
          guessPick: -1,
          guessCorrect: false,
          revealed: false,
        },
        currentTurn: 'both',
        turnNumber: latest.turnNumber + 1,
        score: latest.score,
        winnerId: '',
        status: 'playing',
        historyTitle: 'Guess The Song',
      };
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#7c5a6c]">
        <span className="inline-flex items-center gap-1.5">
          <Music className="w-4 h-4 text-rose-500" />
          <span>Lagu {round + 1} / {songIds.length}</span>
        </span>
        <span className="text-rose-600">
          Pemberi Clue: {clueGiverName} · Penebak: {guesserName}
        </span>
      </div>

      {!clueSent ? (
        amIClueGiver ? (
          <form
            onSubmit={handleSendClue}
            className="rounded-2xl bg-[#fff7fa] border border-pink-200 p-4 space-y-3"
          >
            <div className="text-xs font-semibold text-rose-600">
              Giliran kamu memberi clue lagu untuk {guesserName}!
            </div>
            <p className="text-sm font-medium text-[#4a2336] italic">{songItem.lyricClue}</p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => playMelodyNotes(songItem.melody)}
                className="min-h-[40px] px-3 py-1.5 rounded-xl bg-purple-100 text-purple-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>Dengar Nada</span>
              </button>
              <span className="text-xs text-[#7c5a6c]">
                Jawaban: <strong>{songItem.options[songItem.correctIndex]}</strong>
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={hintDraft}
                onChange={(e) => setHintDraft(e.target.value)}
                placeholder={`Clue tambahan (opsional, default: ${songItem.hint})`}
                maxLength={140}
                className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl bg-white border border-pink-200 text-sm"
              />
              <button
                type="submit"
                className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Clue!</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="rounded-2xl bg-[#fff7fa] border border-pink-100 p-6 text-center space-y-2">
            <p className="font-display text-base font-bold text-[#4a2336]">
              Menunggu Clue dari {clueGiverName}...
            </p>
            <p className="text-xs text-[#7c5a6c]">
              {clueGiverName} sedang menyiapkan petunjuk lirik & melodi untuk kamu tebak!
            </p>
          </div>
        )
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#fff7fa] border border-pink-100 p-4 space-y-3">
            <p className="text-sm sm:text-base font-medium text-[#4a2336] italic">
              {songItem.lyricClue}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-[#6b485b]">Clue {clueGiverName}: {customHint}</span>
              <button
                type="button"
                onClick={() => playMelodyNotes(songItem.melody)}
                className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-purple-100 text-purple-700 text-xs font-semibold hover:bg-purple-200 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>Putar Nada Clue</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {songItem.options.map((opt, i) => {
              let cls = 'bg-white border-pink-100 text-[#4a2336] hover:bg-pink-50';
              if (revealed) {
                if (i === songItem.correctIndex) {
                  cls = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold';
                } else if (i === guessPick) {
                  cls = 'bg-rose-50 border-rose-300 text-rose-800';
                }
              }
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={amIClueGiver || revealed}
                  onClick={() => void handleGuessOption(i)}
                  className={`min-h-[48px] px-4 py-2.5 rounded-2xl border text-left text-xs sm:text-sm ${
                    amIClueGiver || revealed ? 'cursor-default' : 'cursor-pointer'
                  } ${cls}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {!revealed && amIClueGiver && (
            <p className="text-xs text-center text-[#7c5a6c]">
              Clue terkirim! Menunggu {guesserName} memilih jawaban...
            </p>
          )}

          {revealed && (
            <div className="rounded-2xl bg-pink-50 border border-pink-200 p-4 space-y-3">
              <div className="text-xs sm:text-sm font-semibold text-[#4a2336] inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {guessCorrect
                    ? `${guesserName} menebak dengan tepat (+15 poin)!`
                    : `Kurang tepat! Lagu yang benar: ${songItem.options[songItem.correctIndex]}`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => void handleNext()}
                className="w-full min-h-[44px] rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 cursor-pointer"
              >
                {round + 1 >= songIds.length ? 'Lihat Hasil Akhir' : 'Tukar Peran & Lagu Berikutnya'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
