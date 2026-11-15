import { GameRoom, MultiplayerGameType } from '../types';
import { EMOJI_PUZZLES, GUESS_SONG_ITEMS } from './gamesData';
import { SEED_LOVE_QUIZ } from './quizAndLettersData';

export interface MultiplayerGameMeta {
  id: MultiplayerGameType;
  title: string;
  subtitle: string;
  howToPlay: string;
  turnMode: 'alternating' | 'simultaneous';
  badge: string;
  accentFrom: string;
  accentTo: string;
}

export const MULTIPLAYER_GAMES: MultiplayerGameMeta[] = [
  {
    id: 'tictactoe',
    title: 'Tic Tac Toe',
    subtitle: 'Duel X vs O bergantian real-time',
    howToPlay: 'Susun 3 simbol berurutan secara mendatar, menurun, atau diagonal.',
    turnMode: 'alternating',
    badge: 'Klasik 3x3',
    accentFrom: '#f43f5e',
    accentTo: '#ec4899',
  },
  {
    id: 'connect_four',
    title: 'Connect Four',
    subtitle: 'Jatuhkan koin di papan 7×6 & rangkai 4 sejajar',
    howToPlay: 'Pilih kolom untuk menjatuhkan koin. Pemain pertama menyusun 4 koin sejajar menang!',
    turnMode: 'alternating',
    badge: 'Strategi 7×6',
    accentFrom: '#ec4899',
    accentTo: '#a855f7',
  },
  {
    id: 'memory_match',
    title: 'Memory Match',
    subtitle: 'Buka kartu berpasangan & uji ingatan bersama',
    howToPlay: 'Buka 2 kartu tiap giliran. Jika gambar cocok, kamu dapat +10 poin & giliran bonus!',
    turnMode: 'alternating',
    badge: 'Ingatan 4×4',
    accentFrom: '#a855f7',
    accentTo: '#6366f1',
  },
  {
    id: 'quiz_battle',
    title: 'Couple Quiz Battle',
    subtitle: 'Adu cepat & tepat soal kisah kita berdua',
    howToPlay: 'Jawab 5 soal kuis bersama secara rahasia, lalu bandingkan skor & penjelasan.',
    turnMode: 'simultaneous',
    badge: '5 Soal',
    accentFrom: '#f43f5e',
    accentTo: '#f59e0b',
  },
  {
    id: 'guess_emoji',
    title: 'Guess The Emoji',
    subtitle: 'Balapan tebak rangkaian emoji romantis',
    howToPlay: 'Siapa paling cepat menebak arti emoji dengan benar langsung mengunci +10 poin!',
    turnMode: 'simultaneous',
    badge: '6 Level',
    accentFrom: '#fb7185',
    accentTo: '#f97316',
  },
  {
    id: 'truth_or_dare',
    title: 'Truth or Dare Multiplayer',
    subtitle: 'Pilih jujur atau tantangan secara bergantian',
    howToPlay: 'Saat giliranmu, tarik kartu Truth/Dare yang sama di kedua HP lalu selesaikan (+10).',
    turnMode: 'alternating',
    badge: '6 Ronde',
    accentFrom: '#db2777',
    accentTo: '#9333ea',
  },
  {
    id: 'spin_wheel',
    title: 'Spin The Wheel',
    subtitle: 'Putar roda kejutan yang sinkron di dua layar',
    howToPlay: 'Putar bergantian selama 4 putaran dan lihat hadiah atau misi manis yang muncul!',
    turnMode: 'alternating',
    badge: '4 Putaran',
    accentFrom: '#e11d48',
    accentTo: '#c084fc',
  },
  {
    id: 'this_or_that',
    title: 'This or That',
    subtitle: 'Pilih antara 2 opsi & cek seberapa kompak kita',
    howToPlay: 'Pilihanmu disembunyikan sampai pasangan juga memilih. Cocok = Match!',
    turnMode: 'simultaneous',
    badge: '8 Dilema',
    accentFrom: '#f472b6',
    accentTo: '#fb7185',
  },
  {
    id: 'who_knows_better',
    title: 'Who Knows Better?',
    subtitle: 'Seberapa hafal kamu tentang kebiasaan pasangan?',
    howToPlay: 'Satu orang menjawab tentang dirinya, satunya lagi menebak. Tebakan cocok = +15 poin!',
    turnMode: 'simultaneous',
    badge: '6 Ronde',
    accentFrom: '#8b5cf6',
    accentTo: '#ec4899',
  },
  {
    id: 'guess_song',
    title: 'Guess The Song',
    subtitle: 'Beri clue melodi/lirik & pasangan menebak lagu',
    howToPlay: 'Tukar peran setiap ronde! Pemberi clue mengirim petunjuk, penebak menjawab secepatnya.',
    turnMode: 'simultaneous',
    badge: '4 Ronde',
    accentFrom: '#f43f5e',
    accentTo: '#8b5cf6',
  },
];

export const MEMORY_CARD_SYMBOLS = [
  '💗', '🌹', '🍰', '☕', '💌', '💍', '🌙', '🧸',
];

export interface ThisOrThatPrompt {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
}

export const THIS_OR_THAT_DECK: ThisOrThatPrompt[] = [
  { id: 'tot-1', question: 'Pilih suasana kencan favorit kita:', optionA: 'Ngopi santai di kafe estetik ☕', optionB: 'Piknik sore lihat senja 🌅' },
  { id: 'tot-2', question: 'Waktu ngobrol paling nyaman:', optionA: 'Pagi hari sambil sarapan 🥐', optionB: 'Tengah malam deep talk 🌙' },
  { id: 'tot-3', question: 'Kalau lagi hujan deras di luar:', optionA: 'Makan mie kuah hangat 🍜', optionB: 'Nonton film pakai selimut 🎬' },
  { id: 'tot-4', question: 'Hadiah kecil paling bikin senyum:', optionA: 'Surat tulisan tangan 💌', optionB: 'Camilan favorit dadakan 🍓' },
  { id: 'tot-5', question: 'Gaya liburan impian berdua:', optionA: 'Pantai tenang & suara ombak 🏖️', optionB: 'Pegunungan sejuk & berkabut ⛰️' },
  { id: 'tot-6', question: 'Cara paling ampuh kalau lagi kangen:', optionA: 'Telponan dengar suara 📞', optionB: 'Langsung ketemu & peluk 🤗' },
  { id: 'tot-7', question: 'Menu dessert berdua:', optionA: 'Es krim rasa buah/cokelat 🍨', optionB: 'Kue stroberi manis 🍰' },
  { id: 'tot-8', question: 'Foto kenangan favorit:', optionA: 'Candid lagi ketawa bareng 📸', optionB: 'Pose rapi kompak berdua ✨' },
  { id: 'tot-9', question: 'Playlist pas lagi jalan berdua:', optionA: 'Lagu cinta tenang & akustik 🎸', optionB: 'Lagu ceria bikin nyanyi bareng 🎤' },
  { id: 'tot-10', question: 'Aktivitas weekend santai:', optionA: 'Keliling naik motor cari jajan 🛵', optionB: 'Masak bareng di rumah 🍳' },
  { id: 'tot-11', question: 'Saat salah satu lagi capek:', optionA: 'Dengerin cerita tanpa nyela 🫶', optionB: 'Pijat bahu & kasih minuman hangat 🍵' },
  { id: 'tot-12', question: 'Kencan malam yang lebih seru:', optionA: 'Bioskop + makan malam 🍿', optionB: 'Jalan kaki keliling taman lampu kota ✨' },
  { id: 'tot-13', question: 'Tipe pesan teks paling disuka:', optionA: 'Chat panjang penuh cerita 💬', optionB: 'Voice note suara lembut 🎙️' },
  { id: 'tot-14', question: 'Kalau main game berdua:', optionA: 'Tim kompak kerjasama 🤝', optionB: 'Adu skor saling ledek lucu 🏆' },
  { id: 'tot-15', question: 'Minuman pendamping ngobrol:', optionA: 'Matcha / Es cokelat manis 🧋', optionB: 'Kopi susu / Teh hangat ☕' },
  { id: 'tot-16', question: 'Kejutan anniversary terbaik:', optionA: 'Website & surat penuh kenangan 💗', optionB: 'Makan malam spesial berdua 🕯️' },
];

export interface WhoKnowsPrompt {
  id: string;
  template: string; // Uses {TARGET} placeholder
  options: [string, string, string, string];
}

export const WHO_KNOWS_BETTER_DECK: WhoKnowsPrompt[] = [
  {
    id: 'wkb-1',
    template: 'Kalau {TARGET} lagi bad mood, hal paling cepat balikin senyumnya adalah...',
    options: ['Makanan enak & cemilan', 'Pelukan hangat & dengerin cerita', 'Diajak jalan cari angin', 'Tidur nyenyak sebentar'],
  },
  {
    id: 'wkb-2',
    template: 'Minuman yang paling sering dipilih {TARGET} kalau lagi nongkrong:',
    options: ['Kopi / Latte', 'Es Cokelat / Matcha', 'Teh Manis / Lemon Tea', 'Air Putih / Jus Segar'],
  },
  {
    id: 'wkb-3',
    template: 'Aktivitas malam minggu favoritnya {TARGET} adalah...',
    options: ['Jalan cari kuliner malam', 'Nonton film berdua', 'Deep talk berdua tanpa gangguan', 'Main game bareng sampai ketawa'],
  },
  {
    id: 'wkb-4',
    template: 'Bahasa cinta (Love Language) yang paling bikin {TARGET} merasa disayang:',
    options: ['Words of Affirmation (Kata manis)', 'Quality Time (Waktu berdua)', 'Physical Touch (Peluk & genggam)', 'Acts of Service (Perhatian nyata)'],
  },
  {
    id: 'wkb-5',
    template: 'Kalau foto bareng, gaya andalan {TARGET} biasanya...',
    options: ['Senyum manis klasik', 'Pose lucu / jahil', 'Candid nggak lihat kamera', 'Pose tangan bentuk hati'],
  },
  {
    id: 'wkb-6',
    template: 'Waktu paling produktif dan berenergi buat {TARGET}:',
    options: ['Pagi hari setelah bangun', 'Siang bolong', 'Sore menjelang senja', 'Malam hari saat suasana tenang'],
  },
  {
    id: 'wkb-7',
    template: 'Momen paling berkesan di web Our Little World menurut {TARGET}:',
    options: ['Countdown & Midnight Surprise', 'Private Chat & Kenangan Foto', 'Tiup Lilin & Love Letters', 'Play Together & Ruang Musik'],
  },
  {
    id: 'wkb-8',
    template: 'Kalau lagi kangen banget, reaksi pertama {TARGET} adalah...',
    options: ['Langsung chat panjang / spam stiker', 'Telpon / Video call langsung', 'Minta ketemuan secepatnya', 'Cuma kode halus nunggu disapa'],
  },
  {
    id: 'wkb-9',
    template: 'Genre film yang paling betah ditonton {TARGET} berdua:',
    options: ['Komedi Romantis', 'Animasi / Lucu Santai', 'Aksi / Petualangan', 'Drama Mengharukan'],
  },
  {
    id: 'wkb-10',
    template: 'Hal kecil dari pasangan yang paling bikin {TARGET} luluh:',
    options: ['Ingat detail cerita kecilnya', 'Sabar nunggu & selalu ngabarin', 'Ketawa bareng hal receh', 'Selalu bilang makasih & sayang'],
  },
];

function sampleIndices(total: number, pickCount: number): number[] {
  const arr = Array.from({ length: total }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, Math.min(pickCount, total));
}

function buildShuffledMemoryDeck(): string[] {
  const doubled = [...MEMORY_CARD_SYMBOLS, ...MEMORY_CARD_SYMBOLS];
  for (let i = doubled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [doubled[i], doubled[j]] = [doubled[j], doubled[i]];
  }
  return doubled;
}

export function createInitialGameState(
  gameType: MultiplayerGameType,
  player1Id: string
): { gameState: Record<string, unknown>; turnMode: 'player1' | 'both' } {
  switch (gameType) {
    case 'tictactoe':
      return {
        turnMode: 'player1',
        gameState: {
          board: Array(9).fill(''),
          winLine: [],
          starterId: player1Id,
        },
      };
    case 'connect_four':
      return {
        turnMode: 'player1',
        gameState: {
          cells: Array(42).fill(''),
          lastCol: -1,
          lastRow: -1,
          winCells: [],
          starterId: player1Id,
        },
      };
    case 'memory_match':
      return {
        turnMode: 'player1',
        gameState: {
          cards: buildShuffledMemoryDeck(),
          matched: [],
          flipped: [],
          lastPair: [],
          lastMatchBy: '',
          pairsCount: 0,
        },
      };
    case 'quiz_battle':
      return {
        turnMode: 'both',
        gameState: {
          qIds: sampleIndices(SEED_LOVE_QUIZ.length, 5),
          round: 0,
          p1Pick: -1,
          p2Pick: -1,
          revealed: false,
          roundStartedAt: Date.now(),
        },
      };
    case 'guess_emoji':
      return {
        turnMode: 'both',
        gameState: {
          pIds: sampleIndices(EMOJI_PUZZLES.length, 6),
          round: 0,
          solvedByUid: '',
          solvedByName: '',
          showHint: false,
          wrongCount: 0,
        },
      };
    case 'truth_or_dare':
      return {
        turnMode: 'player1',
        gameState: {
          phase: 'pick',
          kind: '',
          category: '',
          prompt: '',
          roundsDone: 0,
          maxRounds: 6,
          lastAction: '',
        },
      };
    case 'spin_wheel':
      return {
        turnMode: 'player1',
        gameState: {
          rotation: 0,
          spinsDone: 0,
          maxSpins: 4,
          lastIndex: -1,
          lastSpinnerName: '',
          lastRewardLabel: '',
          lastRewardDetail: '',
        },
      };
    case 'this_or_that':
      return {
        turnMode: 'both',
        gameState: {
          deckIds: sampleIndices(THIS_OR_THAT_DECK.length, 8),
          round: 0,
          p1Choice: -1,
          p2Choice: -1,
          revealed: false,
          matchesCount: 0,
        },
      };
    case 'who_knows_better':
      return {
        turnMode: 'both',
        gameState: {
          deckIds: sampleIndices(WHO_KNOWS_BETTER_DECK.length, 6),
          round: 0,
          targetUid: player1Id,
          p1Ans: -1,
          p2Ans: -1,
          revealed: false,
        },
      };
    case 'guess_song':
      return {
        turnMode: 'both',
        gameState: {
          songIds: sampleIndices(GUESS_SONG_ITEMS.length, 4),
          round: 0,
          clueGiverUid: player1Id,
          clueSent: false,
          customHint: '',
          guessPick: -1,
          guessCorrect: false,
          revealed: false,
        },
      };
  }
}

export function buildRematchState(
  room: GameRoom
): { gameState: Record<string, unknown>; currentTurn: string } {
  const nextStarter =
    room.currentTurn === room.player1Id ? room.player2Id : room.player1Id;
  const init = createInitialGameState(room.gameType, nextStarter);
  return {
    gameState: init.gameState,
    currentTurn: init.turnMode === 'both' ? 'both' : nextStarter,
  };
}
