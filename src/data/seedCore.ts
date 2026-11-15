import coupleHeroImg from '../assets/images/couple_hero_portrait_1794717131151.jpg';
import welcomeEnvelopeImg from '../assets/images/welcome_envelope_art_1794717131459.jpg';
import memoryCafeImg from '../assets/images/memory_cafe_date_1794717131529.jpg';
import memoryTwilightImg from '../assets/images/memory_twilight_walk_1794717132300.jpg';
import memoryPicnicImg from '../assets/images/memory_picnic_lights_1794717133016.jpg';
import {
  MemoryItem,
  PromiseItem,
  SiteConfig,
  SongItem,
  TimelineItem,
} from '../types';

export const COUPLE_HERO_IMAGE = coupleHeroImg;
export const WELCOME_ENVELOPE_IMAGE = welcomeEnvelopeImg;
export const MEMORY_CAFE_IMAGE = memoryCafeImg;
export const MEMORY_TWILIGHT_IMAGE = memoryTwilightImg;
export const MEMORY_PICNIC_IMAGE = memoryPicnicImg;

export const DEFAULT_SECRET_CODE = '201125';

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  coupleNames: 'Zikri & Diann',
  heroGreeting: 'Terima kasih sudah selalu menjadi rumah paling hangat untukku pulang.',
  couplePhotoUrl: COUPLE_HERO_IMAGE,
  finalLetter: `Sayangku Diann,

Selamat hari anniversary kita yang pertama, 20 November 2026.

Tidak terasa sudah satu tahun penuh kita berjalan beriringan sejak hari pertama kita resmi bersama pada 20 November 2025. Sepanjang waktu itu, ada banyak sekali tawa kecil, obrolan larut malam, momen sederhana yang justru terasa paling berharga, dan pelajaran berharga tentang bagaimana cara saling memahami.

Aku ingin kamu tahu bahwa setiap hari bersamamu selalu terasa istimewa. Terima kasih sudah sabar menghadapiku, sudah mendengarkan cerita-ceritaku yang kadang tidak penting, dan sudah tetap memilih bertahan bahkan di hari-hari yang tidak mudah.

Semoga di tahun-tahun berikutnya, kita tetap tumbuh bersama, saling menjaga komunikasi, tidak mudah menyerah, dan selalu menemukan cara baru untuk membuat satu sama lain tersenyum.

Catatan ini bisa kamu atau aku edit kapan saja lewat Admin Mode agar kita bisa menambahkan cerita pribadi kita yang sebenarnya di sini.

Dengan penuh cinta,
Zikri`,
  secretHint: 'Tanggal jadian kita dalam 6 angka (DDMMYY)',
  secretCodeHash: '',
  secretMessage:
    'Untuk Diann tersayang: Terima kasih sudah hadir dan membuat duniaku terasa jauh lebih tenang, hangat, dan penuh warna. Apa pun yang terjadi nanti, aku tetap ingin merayakan banyak 20 November berikutnya bersamamu.',
};

export const DEFAULT_TIMELINE: TimelineItem[] = [
  {
    id: 'milestone-1',
    title: 'First Meeting',
    dateLabel: 'Awal Cerita',
    description:
      'Pertemuan pertama yang sederhana, tapi diam-diam menjadi titik awal dari semua hal manis yang terjadi setelahnya.',
    imageUrl: MEMORY_CAFE_IMAGE,
    sortOrder: 1,
    isPublic: true,
  },
  {
    id: 'milestone-2',
    title: 'Getting Closer',
    dateLabel: 'Mulai Dekat',
    description:
      'Dari obrolan singkat yang berubah jadi chat panjang setiap malam, saling bertukar cerita kecil hingga tidak terasa waktu berjalan begitu cepat.',
    imageUrl: MEMORY_PICNIC_IMAGE,
    sortOrder: 2,
    isPublic: true,
  },
  {
    id: 'milestone-3',
    title: 'First Feelings',
    dateLabel: 'Rasa Pertama',
    description:
      'Momen ketika sadar bahwa menunggu balasan darimu sudah menjadi kebiasaan favorit setiap hari.',
    imageUrl: MEMORY_TWILIGHT_IMAGE,
    sortOrder: 3,
    isPublic: true,
  },
  {
    id: 'milestone-4',
    title: 'Officially Together — 20 November 2025',
    dateLabel: '20 November 2025',
    description:
      'Hari di mana kita resmi memilih satu sama lain dan memulai perjalanan ini sebagai Zikri & Diann.',
    imageUrl: WELCOME_ENVELOPE_IMAGE,
    sortOrder: 4,
    isPublic: true,
  },
  {
    id: 'milestone-5',
    title: 'Our First Anniversary — 20 November 2026',
    dateLabel: '20 November 2026',
    description:
      'Genap satu tahun bersama! Terima kasih sudah bertumbuh, tertawa, dan saling menggenggam erat sampai hari ini.',
    imageUrl: COUPLE_HERO_IMAGE,
    sortOrder: 5,
    isPublic: true,
  },
];

export const DEFAULT_MEMORIES: MemoryItem[] = [
  {
    id: 'mem-1',
    caption: 'Kopi sore & kue favorit — obrolan santai yang bikin lupa waktu.',
    dateLabel: '20 November 2025',
    category: 'First Dates',
    imageUrl: MEMORY_CAFE_IMAGE,
    isPublic: true,
  },
  {
    id: 'mem-2',
    caption: 'Jalan sore menikmati langit senja merah muda bersama kamu.',
    dateLabel: 'Desember 2025',
    category: 'Jalan-Jalan',
    imageUrl: MEMORY_TWILIGHT_IMAGE,
    isPublic: true,
  },
  {
    id: 'mem-3',
    caption: 'Piknik kecil dengan lampu-lampu hangat dan tawa yang tidak pernah habis.',
    dateLabel: 'Februari 2026',
    category: 'Special Moments',
    imageUrl: MEMORY_PICNIC_IMAGE,
    isPublic: true,
  },
  {
    id: 'mem-4',
    caption: 'Ilustrasi dunia kecil kita berdua — Zikri & Diann.',
    dateLabel: '20 November 2026',
    category: 'Random Lucu',
    imageUrl: COUPLE_HERO_IMAGE,
    isPublic: true,
  },
];

export const DEFAULT_SONGS: SongItem[] = [
  {
    id: 'audio-our-little-world',
    title: 'Our Little World (Piano Theme)',
    artist: 'Zikri & Diann Anniversary Mix',
    youtubeUrl: '',
    youtubeId: 'audio-our-little-world',
    audioUrl: '/audio/our_little_world.wav',
    artworkUrl: COUPLE_HERO_IMAGE,
    sourceType: 'audio',
    moodTag: 'Special',
    isSpecialSong: true,
    isFavorite: true,
    durationSec: 26,
    sortOrder: 1,
    isPublic: true,
  },
  {
    id: 'audio-senja-bersamamu',
    title: 'Senja Bersamamu (Music Box)',
    artist: 'Our Little World Sessions',
    youtubeUrl: '',
    youtubeId: 'audio-senja-bersamamu',
    audioUrl: '/audio/senja_bersamamu.wav',
    artworkUrl: MEMORY_TWILIGHT_IMAGE,
    sourceType: 'audio',
    moodTag: 'Romantic',
    isFavorite: true,
    durationSec: 25,
    sortOrder: 2,
    isPublic: true,
  },
  {
    id: 'audio-lullaby-november',
    title: 'Lullaby 20 November',
    artist: 'Soft Acoustic Memory',
    youtubeUrl: '',
    youtubeId: 'audio-lullaby-november',
    audioUrl: '/audio/lullaby_november.wav',
    artworkUrl: WELCOME_ENVELOPE_IMAGE,
    sourceType: 'audio',
    moodTag: 'Romantic',
    durationSec: 28,
    sortOrder: 3,
    isPublic: true,
  },
  {
    id: 'audio-starlight-walk',
    title: 'Starlight Walk',
    artist: 'Pastel Twilight Ensemble',
    youtubeUrl: '',
    youtubeId: 'audio-starlight-walk',
    audioUrl: '/audio/starlight_walk.wav',
    artworkUrl: MEMORY_PICNIC_IMAGE,
    sourceType: 'audio',
    moodTag: 'Mood',
    durationSec: 23,
    sortOrder: 4,
    isPublic: true,
  },
  {
    id: 'audio-warm-tea-duet',
    title: 'Warm Tea Duet',
    artist: 'Late Night Cozy Notes',
    youtubeUrl: '',
    youtubeId: 'audio-warm-tea-duet',
    audioUrl: '/audio/warm_tea_duet.wav',
    artworkUrl: MEMORY_CAFE_IMAGE,
    sourceType: 'audio',
    moodTag: 'Chill',
    isSpecialSong: false,
    durationSec: 27,
    sortOrder: 5,
    isPublic: true,
  },
];

export const DEFAULT_PROMISES: PromiseItem[] = [
  {
    id: 'promise-1',
    authorName: 'Zikri & Diann',
    text: 'Saling mendengarkan dengan sungguh-sungguh, bahkan saat cerita itu terdengar sederhana.',
    isPublic: true,
  },
  {
    id: 'promise-2',
    authorName: 'Zikri & Diann',
    text: 'Saling menghargai perasaan, waktu, dan usaha sekecil apa pun yang kita lakukan.',
    isPublic: true,
  },
  {
    id: 'promise-3',
    authorName: 'Zikri & Diann',
    text: 'Tidak mudah menyerah ketika suasana sedang sulit atau ada perbedaan pendapat.',
    isPublic: true,
  },
  {
    id: 'promise-4',
    authorName: 'Zikri & Diann',
    text: 'Selalu belajar memahami satu sama lain dengan sabar dan tanpa menghakimi.',
    isPublic: true,
  },
  {
    id: 'promise-5',
    authorName: 'Zikri & Diann',
    text: 'Menjaga komunikasi tetap terbuka, jujur, dan hangat setiap hari.',
    isPublic: true,
  },
];
