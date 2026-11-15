import { GuessPicturePuzzle } from '../types';
import {
  COUPLE_HERO_IMAGE,
  MEMORY_CAFE_IMAGE,
  MEMORY_PICNIC_IMAGE,
  MEMORY_TWILIGHT_IMAGE,
  WELCOME_ENVELOPE_IMAGE,
} from './seedCore';

// 32 Guess The Picture puzzles (using generated high-res images + custom illustrated SVG scenes)
export const SEED_GUESS_PICTURES: GuessPicturePuzzle[] = [
  { id: 'gp-1', level: 1, title: 'Suasana Kencan Hangat', hint: 'Tempat nongkrong santai minum kopi & makan kue bareng', answers: ['kafe', 'cafe', 'coffee shop', 'ngopi', 'kencan di kafe'], imageUrl: MEMORY_CAFE_IMAGE, sceneType: 'photo' },
  { id: 'gp-2', level: 2, title: 'Langkah Di Ujung Hari', hint: 'Jalan di tepi laut saat matahari terbenam berwarna pink', answers: ['senja', 'sunset', 'pantai', 'dermaga', 'matahari terbenam'], imageUrl: MEMORY_TWILIGHT_IMAGE, sceneType: 'photo' },
  { id: 'gp-3', level: 3, title: 'Pesan Tersegel Lilin', hint: 'Pembawa pesan romantis sebelum dibuka', answers: ['surat cinta', 'amplop', 'surat', 'love letter'], imageUrl: WELCOME_ENVELOPE_IMAGE, sceneType: 'photo' },
  { id: 'gp-4', level: 4, title: 'Duduk Santai Di Rumput', hint: 'Makan bersama di atas kain dengan lampu peri & bunga tulip', answers: ['piknik', 'picnic', 'piknik malam'], imageUrl: MEMORY_PICNIC_IMAGE, sceneType: 'photo' },
  { id: 'gp-5', level: 5, title: 'Di Bawah Pohon Sakura', hint: 'Dua orang tersenyum di tengah bunga bermekaran', answers: ['sakura', 'pasangan', 'zikri dan diann', 'bunga sakura', 'cinta'], imageUrl: COUPLE_HERO_IMAGE, sceneType: 'photo' },
  { id: 'gp-6', level: 6, title: 'Teka-teki Visual 6', hint: 'Benda manis dengan lilin menyala di hari spesial', answers: ['kue', 'kue ulang tahun', 'kue anniversary', 'cake'], sceneType: 'cake' },
  { id: 'gp-7', level: 7, title: 'Teka-teki Visual 7', hint: 'Bintang bercahaya saat malam hari + bulan sabit', answers: ['malam', 'bintang', 'malam berbintang', 'bulan dan bintang'], sceneType: 'night_sky' },
  { id: 'gp-8', level: 8, title: 'Teka-teki Visual 8', hint: 'Alat untuk mengabadikan kenangan foto instan', answers: ['kamera', 'polaroid', 'kamera polaroid', 'foto'], sceneType: 'camera' },
  { id: 'gp-9', level: 9, title: 'Teka-teki Visual 9', hint: 'Tetesan air dari langit + alat pelindung warna pastel', answers: ['hujan', 'payung', 'hujan dan payung', 'musim hujan'], sceneType: 'umbrella_rain' },
  { id: 'gp-10', level: 10, title: 'Teka-teki Visual 10', hint: 'Minuman hangat pagi hari dengan busa bentuk hati', answers: ['kopi', 'latte', 'kopi susu', 'cappuccino'], sceneType: 'latte_heart' },
  { id: 'gp-11', level: 11, title: 'Teka-teki Visual 11', hint: 'Simbol janji suci yang melingkar di jari', answers: ['cincin', 'ring', 'janji', 'cincin pasangan'], sceneType: 'rings' },
  { id: 'gp-12', level: 12, title: 'Teka-teki Visual 12', hint: 'Bunga berwarna pink lembut yang identik dengan kasih sayang', answers: ['mawar', 'bunga mawar', 'bunga', 'rose'], sceneType: 'rose' },
  { id: 'gp-13', level: 13, title: 'Teka-teki Visual 13', hint: 'Dua piringan lagu & nada musik berputar', answers: ['musik', 'lagu', 'music', 'vinyl', 'piringan hitam'], sceneType: 'music_vinyl' },
  { id: 'gp-14', level: 14, title: 'Teka-teki Visual 14', hint: 'Pesan rahasia yang dijaga oleh pengunci emas', answers: ['gembok', 'rahasia', 'pesan rahasia', 'kunci'], sceneType: 'padlock' },
  { id: 'gp-15', level: 15, title: 'Teka-teki Visual 15', hint: 'Tanggal merah muda dilingkari hati di bulan ke-11', answers: ['20 november', 'anniversary', 'kalender', 'tanggal jadian'], sceneType: 'calendar' },
  { id: 'gp-16', level: 16, title: 'Teka-teki Visual 16', hint: 'Makanan penutup dingin manis dengan dua sendok', answers: ['es krim', 'ice cream', 'gelato'], sceneType: 'ice_cream' },
  { id: 'gp-17', level: 17, title: 'Teka-teki Visual 17', hint: 'Tempat tinggal hangat beratap hati', answers: ['rumah', 'home', 'pulang'], sceneType: 'home_heart' },
  { id: 'gp-18', level: 18, title: 'Teka-teki Visual 18', hint: 'Layar besar dan sekotak camilan jagung untuk kencan', answers: ['bioskop', 'nonton', 'film', 'popcorn', 'nonton film'], sceneType: 'cinema' },
  { id: 'gp-19', level: 19, title: 'Teka-teki Visual 19', hint: 'Kendaraan roda dua untuk jalan sore keliling kota', answers: ['motor', 'vespa', 'skuter', 'jalan sore'], sceneType: 'scooter' },
  { id: 'gp-20', level: 20, title: 'Teka-teki Visual 20', hint: 'Penunjuk waktu detik demi detik menuju hari spesial', answers: ['jam', 'waktu', 'countdown', 'jam pasir'], sceneType: 'clock' },
  { id: 'gp-21', level: 21, title: 'Teka-teki Visual 21', hint: 'Dua cangkir teh manis dengan asap berbentuk hati', answers: ['teh', 'minum teh', 'tea time', 'teh hangat'], sceneType: 'teacup' },
  { id: 'gp-22', level: 22, title: 'Teka-teki Visual 22', hint: 'Bola dunia kecil dikelilingi hati', answers: ['dunia kecil', 'our little world', 'bumi', 'dunia'], sceneType: 'little_world' },
  { id: 'gp-23', level: 23, title: 'Teka-teki Visual 23', hint: 'Kotak pita pink berisi kejutan spesial', answers: ['kado', 'hadiah', 'kejutan', 'gift'], sceneType: 'gift_box' },
  { id: 'gp-24', level: 24, title: 'Teka-teki Visual 24', hint: 'Lampu-lampu kecil warna-warni meledak di langit malam', answers: ['kembang api', 'fireworks', 'pesta'], sceneType: 'fireworks' },
  { id: 'gp-25', level: 25, title: 'Teka-teki Visual 25', hint: 'Buah merah manis dengan bintik-bintik kecil di atas krim', answers: ['stroberi', 'strawberry'], sceneType: 'strawberry' },
  { id: 'gp-26', level: 26, title: 'Teka-teki Visual 26', hint: 'Pesawat kertas yang membawa pesan rindu', answers: ['pesawat kertas', 'paper plane', 'rindu'], sceneType: 'paper_plane' },
  { id: 'gp-27', level: 27, title: 'Teka-teki Visual 27', hint: 'Lengkungan tujuh warna yang muncul setelah hujan', answers: ['pelangi', 'rainbow'], sceneType: 'rainbow' },
  { id: 'gp-28', level: 28, title: 'Teka-teki Visual 28', hint: 'Boneka beruang manis yang suka dipeluk', answers: ['boneka', 'beruang', 'teddy bear', 'boneka beruang'], sceneType: 'teddy' },
  { id: 'gp-29', level: 29, title: 'Teka-teki Visual 29', hint: 'Dua headphone yang dipakai mendengarkan satu lagu bareng', answers: ['headphone', 'earphone', 'dengar lagu'], sceneType: 'headphones' },
  { id: 'gp-30', level: 30, title: 'Teka-teki Visual 30', hint: 'Pasir lembut, ombak biru, dan kerang laut', answers: ['pantai', 'laut', 'liburan', 'ombak'], sceneType: 'beach' },
  { id: 'gp-31', level: 31, title: 'Teka-teki Visual 31', hint: 'Buku bersampul hati tempat menyimpan catatan rahasia', answers: ['diary', 'buku harian', 'catatan', 'jurnal'], sceneType: 'diary' },
  { id: 'gp-32', level: 32, title: 'Teka-teki Visual 32', hint: 'Kupu-kupu pastel terbang di taman bunga', answers: ['kupu-kupu', 'kupu kupu', 'butterfly'], sceneType: 'butterfly' },
];

export interface EmojiPuzzle {
  id: string;
  emojis: string;
  hint: string;
  answers: string[];
  displayAnswer: string;
}

export const EMOJI_PUZZLES: EmojiPuzzle[] = [
  { id: 'em-1', emojis: '💌 🔐 ❤️', hint: 'Salah satu halaman di website ini yang butuh kode!', answers: ['pesan rahasia', 'secret message', 'surat rahasia'], displayAnswer: 'Pesan Rahasia' },
  { id: 'em-2', emojis: '🎂 🕯️ 🌬️ ✨', hint: 'Aktivitas seru meniup api di atas kue', answers: ['tiup lilin', 'candle surprise', 'ulang tahun', 'make a wish'], displayAnswer: 'Tiup Lilin' },
  { id: 'em-3', emojis: '☕ 🍰 💬 😊', hint: 'Nongkrong manis di kedai kopi berdua', answers: ['kencan di kafe', 'ngopi bareng', 'cafe date', 'ngopi'], displayAnswer: 'Kencan di Kafe' },
  { id: 'em-4', emojis: '🌅 🌊 👫 🚶', hint: 'Jalan santai di tepi pantai pas matahari terbenam', answers: ['jalan sore', 'lihat sunset', 'pantai senja', 'sunset'], displayAnswer: 'Lihat Sunset di Pantai' },
  { id: 'em-5', emojis: '🤗 💓 🧸', hint: 'Tombol pengiriman rasa hangat kalau lagi kangen', answers: ['pelukan virtual', 'virtual hug', 'pelukan'], displayAnswer: 'Pelukan Virtual' },
  { id: 'em-6', emojis: '🍿 🎬 🥤 💑', hint: 'Nonton layar lebar berdua', answers: ['nonton bioskop', 'bioskop', 'nonton film', 'movie date'], displayAnswer: 'Nonton Bioskop' },
  { id: 'em-7', emojis: '📅 2️⃣0️⃣ 🍂 💖', hint: 'Hari spesial kita di bulan November', answers: ['anniversary', '20 november', 'hari jadian'], displayAnswer: 'Anniversary 20 November' },
  { id: 'em-8', emojis: '🌧️ ☂️ 🍜 😋', hint: 'Cuaca dingin paling enak makan yang berkuah hangat', answers: ['makan mie saat hujan', 'hujan makan mie', 'mie kuah', 'bakso'], displayAnswer: 'Makan Hangat Saat Hujan' },
  { id: 'em-9', emojis: '🌙 ⭐ 💭 ❤️', hint: 'Memikirkan pasangan sebelum tidur', answers: ['kangen sebelum tidur', 'rindu malam', 'kangen', 'selamat malam'], displayAnswer: 'Rindu Sebelum Tidur' },
  { id: 'em-10', emojis: '💍 🤝 💬 ❤️', hint: 'Komitmen bersama untuk saling menjaga', answers: ['janji pasangan', 'our promise', 'janji', 'komitmen'], displayAnswer: 'Janji Pasangan' },
  { id: 'em-11', emojis: '📸 🖼️ ✨ 🕰️', hint: 'Kumpulan foto momen manis masa lalu', answers: ['album kenangan', 'memories', 'kenangan', 'foto kenangan'], displayAnswer: 'Album Kenangan' },
  { id: 'em-12', emojis: '🍦 🍓 😋 ☀️', hint: 'Camilan dingin rasa buah merah', answers: ['es krim stroberi', 'ice cream', 'es krim'], displayAnswer: 'Es Krim Stroberi' },
  { id: 'em-13', emojis: '🎵 🎧 💑 🎶', hint: 'Mendengarkan daftar putar romantis berdua', answers: ['ruang musik', 'music room', 'dengar lagu', 'musik'], displayAnswer: 'Ruang Musik' },
  { id: 'em-14', emojis: '🏠 💖 🔑 😊', hint: 'Kalimat di halaman Final Surprise: Thank you for being...', answers: ['rumah', 'my home', 'rumahku', 'thank you for being my home'], displayAnswer: 'Rumah (My Home)' },
  { id: 'em-15', emojis: '🎆 🎉 🕛 💗', hint: 'Kejutan tepat pukul 00:00 WIT!', answers: ['midnight surprise', 'kejutan tengah malam', 'tahun baru', 'anniversary'], displayAnswer: 'Midnight Surprise' },
  { id: 'em-16', emojis: '🛵 💨 🌆 ❤️', hint: 'Naik motor sore-sore keliling kota berdua', answers: ['motoran sore', 'naik motor', 'keliling kota', 'jalan sore'], displayAnswer: 'Motoran Sore Berdua' },
];

export interface GuessSongItem {
  id: string;
  lyricClue: string;
  hint: string;
  options: string[];
  correctIndex: number;
  melody: { freq: number; dur: number }[];
}

export const GUESS_SONG_ITEMS: GuessSongItem[] = [
  {
    id: 'gs-1',
    lyricClue: '"Bundaku bilang jangan terlalu berharap, tapi aku jatuh hati juga..." (atau lagu tentang hangatnya pelukan & bertautnya dua jiwa)',
    hint: 'Penyanyi wanita indie Indonesia, judul satu kata: B _ _ _ _ _ _',
    options: ['Bertaut — Nadin Amizah', 'Monokrom — Tulus', 'Sial — Mahalini', 'Komang — Raim Laode'],
    correctIndex: 0,
    melody: [{ freq: 392, dur: 0.35 }, { freq: 440, dur: 0.35 }, { freq: 493.88, dur: 0.4 }, { freq: 523.25, dur: 0.55 }, { freq: 493.88, dur: 0.35 }, { freq: 440, dur: 0.5 }],
  },
  {
    id: 'gs-2',
    lyricClue: '"Have I ever told you, I want you to the bone..."',
    hint: 'Lagu populer Pamungkas yang sangat ikonik!',
    options: ['Kenangan Manis', 'To The Bone — Pamungkas', 'I Love You But I’m Letting Go', 'One Only'],
    correctIndex: 1,
    melody: [{ freq: 523.25, dur: 0.3 }, { freq: 587.33, dur: 0.3 }, { freq: 659.25, dur: 0.45 }, { freq: 587.33, dur: 0.3 }, { freq: 523.25, dur: 0.5 }],
  },
  {
    id: 'gs-3',
    lyricClue: '"Lembaran foto hitam putih, aku coba ingat lagi warna bajumu kala itu..."',
    hint: 'Lagu Tulus tentang kenangan berharga',
    options: ['Hati-Hati di Jalan — Tulus', 'Sepatu — Tulus', 'Monokrom — Tulus', 'Teman Hidup — Tulus'],
    correctIndex: 2,
    melody: [{ freq: 440, dur: 0.3 }, { freq: 493.88, dur: 0.3 }, { freq: 523.25, dur: 0.4 }, { freq: 659.25, dur: 0.5 }, { freq: 587.33, dur: 0.45 }],
  },
  {
    id: 'gs-4',
    lyricClue: '"Darling, just hold my hand, be my girl, I’ll be your man..."',
    hint: 'Lagu dansa romantis Ed Sheeran',
    options: ['Photograph — Ed Sheeran', 'Thinking Out Loud — Ed Sheeran', 'Perfect — Ed Sheeran', 'Shivers — Ed Sheeran'],
    correctIndex: 2,
    melody: [{ freq: 392, dur: 0.32 }, { freq: 523.25, dur: 0.32 }, { freq: 587.33, dur: 0.35 }, { freq: 659.25, dur: 0.55 }, { freq: 587.33, dur: 0.4 }],
  },
  {
    id: 'gs-5',
    lyricClue: '"Sebab kau terlalu indah dari sekadar kata, dunia berhenti sejenak menikmati indahmu..."',
    hint: 'Lagu Raim Laode yang viral & manis banget',
    options: ['Komang — Raim Laode', 'Lesung Pipi — Raim Laode', 'Penjaga Hati — Nadhif Basalamah', 'Tak Segampang Itu — Anggi'],
    correctIndex: 0,
    melody: [{ freq: 329.63, dur: 0.35 }, { freq: 392, dur: 0.35 }, { freq: 440, dur: 0.4 }, { freq: 523.25, dur: 0.55 }, { freq: 493.88, dur: 0.4 }],
  },
  {
    id: 'gs-6',
    lyricClue: '"Karena bersamamu semua terasa indah, gundah gulana hatiku pun sirna..."',
    hint: 'Lagu Nadhif Basalamah tentang menjaga hati',
    options: ['Penjaga Hati — Nadhif Basalamah', 'Kisah Sempurna — Mahalini', 'Janji Setia — Tiara Andini', 'Kasih Putih — Glenn Fredly'],
    correctIndex: 0,
    melody: [{ freq: 440, dur: 0.3 }, { freq: 523.25, dur: 0.35 }, { freq: 587.33, dur: 0.35 }, { freq: 659.25, dur: 0.5 }, { freq: 523.25, dur: 0.45 }],
  },
  {
    id: 'gs-7',
    lyricClue: '"Tetaplah bersamaku jadi teman hidupku, berdua kita hadapi dunia..."',
    hint: 'Lagu klasik pernikahan & pasangan dari Tulus',
    options: ['Ruang Sendiri — Tulus', 'Teman Hidup — Tulus', 'Pamit — Tulus', 'Cahaya — Tulus'],
    correctIndex: 1,
    melody: [{ freq: 392, dur: 0.35 }, { freq: 440, dur: 0.35 }, { freq: 523.25, dur: 0.45 }, { freq: 587.33, dur: 0.55 }, { freq: 523.25, dur: 0.4 }],
  },
  {
    id: 'gs-8',
    lyricClue: '"Wise men say, only fools rush in, but I can’t help falling in love with you..."',
    hint: 'Lagu cinta abadi Elvis Presley',
    options: ['Can’t Help Falling in Love', 'Fly Me to the Moon', 'Stand By Me', 'La Vie En Rose'],
    correctIndex: 0,
    melody: [{ freq: 392, dur: 0.45 }, { freq: 587.33, dur: 0.45 }, { freq: 392, dur: 0.45 }, { freq: 440, dur: 0.3 }, { freq: 493.88, dur: 0.3 }, { freq: 523.25, dur: 0.6 }],
  },
  {
    id: 'gs-9',
    lyricClue: '"Dan bila kau di sampingku, semua rasa takut hilang..." (band legendaris Indonesia, lagu Anugerah Terindah...)',
    hint: 'Sheila On 7 tentang anugerah terindah',
    options: ['Dan — Sheila On 7', 'Anugerah Terindah Yang Pernah Kumiliki — SO7', 'Sephia — SO7', 'Kita — SO7'],
    correctIndex: 1,
    melody: [{ freq: 523.25, dur: 0.3 }, { freq: 587.33, dur: 0.3 }, { freq: 659.25, dur: 0.4 }, { freq: 783.99, dur: 0.55 }, { freq: 659.25, dur: 0.4 }],
  },
  {
    id: 'gs-10',
    lyricClue: '"I’ll never be alone, you’ll never be alone, I’m always gonna love you..." atau "Cause all of me loves all of you..."',
    hint: 'Lagu piano romantis John Legend',
    options: ['All of Me — John Legend', 'A Thousand Years — Christina Perri', 'Just the Way You Are — Bruno Mars', 'Yellow — Coldplay'],
    correctIndex: 0,
    melody: [{ freq: 493.88, dur: 0.35 }, { freq: 523.25, dur: 0.35 }, { freq: 587.33, dur: 0.4 }, { freq: 659.25, dur: 0.5 }, { freq: 587.33, dur: 0.45 }],
  },
  {
    id: 'gs-11',
    lyricClue: '"I have died every day waiting for you, darling don’t be afraid..."',
    hint: 'Christina Perri — seribu tahun!',
    options: ['Jar of Hearts', 'A Thousand Years — Christina Perri', 'Say You Won’t Let Go', 'Love Story'],
    correctIndex: 1,
    melody: [{ freq: 587.33, dur: 0.35 }, { freq: 659.25, dur: 0.35 }, { freq: 739.99, dur: 0.45 }, { freq: 783.99, dur: 0.55 }, { freq: 659.25, dur: 0.45 }],
  },
  {
    id: 'gs-12',
    lyricClue: '"Look at the stars, look how they shine for you..."',
    hint: 'Lagu Coldplay berwarna kuning!',
    options: ['Fix You — Coldplay', 'Paradise — Coldplay', 'Yellow — Coldplay', 'The Scientist — Coldplay'],
    correctIndex: 2,
    melody: [{ freq: 493.88, dur: 0.35 }, { freq: 493.88, dur: 0.35 }, { freq: 440, dur: 0.4 }, { freq: 392, dur: 0.55 }, { freq: 440, dur: 0.4 }],
  },
  {
    id: 'gs-13',
    lyricClue: '"Kau adalah bukti dari cantiknya paras dan hati..."',
    hint: 'Virgoun tentang bukti cinta',
    options: ['Surat Cinta Untuk Starla — Virgoun', 'Bukti — Virgoun', 'Akad — Payung Teduh', 'Zona Nyaman — Fourtwnty'],
    correctIndex: 1,
    melody: [{ freq: 392, dur: 0.32 }, { freq: 493.88, dur: 0.32 }, { freq: 587.33, dur: 0.4 }, { freq: 659.25, dur: 0.55 }, { freq: 587.33, dur: 0.4 }],
  },
  {
    id: 'gs-14',
    lyricClue: '"Betapa bahagianya hatiku saat ku duduk berdua denganmu, berjalan bersamamu..."',
    hint: 'Payung Teduh tentang berjalan bersama',
    options: ['Untuk Perempuan Yang Sedang Dalam Pelukan', 'Akad — Payung Teduh', 'Resah — Payung Teduh', 'Menuju Senja'],
    correctIndex: 1,
    melody: [{ freq: 440, dur: 0.3 }, { freq: 493.88, dur: 0.3 }, { freq: 523.25, dur: 0.4 }, { freq: 587.33, dur: 0.5 }, { freq: 659.25, dur: 0.55 }],
  },
  {
    id: 'gs-15',
    lyricClue: '"When I see your face, there’s not a thing that I would change, cause you’re amazing..."',
    hint: 'Bruno Mars memuji apa adanya dirimu',
    options: ['Marry You — Bruno Mars', 'Just the Way You Are — Bruno Mars', 'Count on Me — Bruno Mars', 'Treasure — Bruno Mars'],
    correctIndex: 1,
    melody: [{ freq: 523.25, dur: 0.3 }, { freq: 523.25, dur: 0.3 }, { freq: 587.33, dur: 0.35 }, { freq: 659.25, dur: 0.45 }, { freq: 783.99, dur: 0.5 }],
  },
];

export const WHEEL_REWARDS = [
  { label: 'Peluk 15 Detik', color: '#f9a8d4', detail: 'Wajib peluk pasangan hangat selama 15 detik sekarang juga!' },
  { label: 'Traktir Es Krim', color: '#d8b4fe', detail: 'Voucher traktiran es krim atau minuman favorit di kencan berikutnya!' },
  { label: '3 Pujian Tulus', color: '#fbcfe8', detail: 'Sebutkan 3 hal yang paling kamu kagumi dari pasanganmu!' },
  { label: 'Selfie Lucu', color: '#fed7aa', detail: 'Ambil 1 foto selfie berdua dengan pose hati!' },
  { label: 'Pijat Bahu 2 Menit', color: '#e9d5ff', detail: 'Berikan pijatan bahu lembut selama 2 menit biar rileks!' },
  { label: 'Bisikin Rahasia', color: '#f472b6', detail: 'Bisikkan satu hal manis yang jarang kamu ucapkan ke pasanganmu!' },
  { label: 'Request Lagu', color: '#c4b5fd', detail: 'Pemenang bebas pilih lagu apa pun di Music Room!' },
  { label: '1 Permintaan Bebas', color: '#fda4af', detail: 'Selamat! Kamu dapat 1 permintaan manis yang harus dikabulkan hari ini!' },
];
