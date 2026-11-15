import { RadioMoodTag } from '../types';
import { extractYouTubeId } from '../lib/time';

export type CatalogCollectionId = 'our_love' | 'english' | 'slank' | 'indie';

export interface CatalogSongRecommendation {
  catalogId: string;
  collectionId: CatalogCollectionId;
  title: string;
  artist: string;
  moodTag: RadioMoodTag;
  note: string;
}

export interface CatalogCollectionMeta {
  id: CatalogCollectionId;
  title: string;
  subtitle: string;
  accentGradient: string;
  defaultMood: RadioMoodTag;
}

export const RADIO_CATALOG_COLLECTIONS: CatalogCollectionMeta[] = [
  {
    id: 'our_love',
    title: 'OUR LOVE SONGS 💗',
    subtitle: 'Lagu cinta Indonesia pilihan untuk Zikri & Diann',
    accentGradient: 'from-rose-500/15 via-pink-400/10 to-purple-400/15',
    defaultMood: 'Romantic',
  },
  {
    id: 'english',
    title: 'ENGLISH LOVE SONGS 🌙',
    subtitle: 'Balada romantis barat untuk malam yang hangat',
    accentGradient: 'from-purple-500/15 via-fuchsia-400/10 to-rose-400/15',
    defaultMood: 'Romantic',
  },
  {
    id: 'slank',
    title: 'SLANK CORNER 🎸',
    subtitle: 'Koleksi lagu klasik penuh cerita & nostalgia',
    accentGradient: 'from-amber-500/15 via-rose-400/10 to-pink-400/15',
    defaultMood: 'Rock',
  },
  {
    id: 'indie',
    title: 'INDIE & LATE NIGHT ☁️',
    subtitle: 'Teman ngobrol pelan & perjalanan malam berdua',
    accentGradient: 'from-indigo-400/15 via-purple-400/10 to-pink-400/15',
    defaultMood: 'Chill',
  },
];

export const CURATED_RADIO_CATALOG: CatalogSongRecommendation[] = [
  // A. OUR LOVE SONGS
  {
    catalogId: 'cat-tulus-teman-hidup',
    collectionId: 'our_love',
    title: 'Teman Hidup',
    artist: 'Tulus',
    moodTag: 'Special',
    note: 'Rekomendasi utama — tetaplah bersamaku menjadi teman hidup.',
  },
  {
    catalogId: 'cat-payung-teduh-akad',
    collectionId: 'our_love',
    title: 'Akad',
    artist: 'Payung Teduh',
    moodTag: 'Romantic',
    note: 'Harapan indah melangkah menuju masa depan bersama.',
  },
  {
    catalogId: 'cat-nadhif-penjaga-hati',
    collectionId: 'our_love',
    title: 'Penjaga Hati',
    artist: 'Nadhif Basalamah',
    moodTag: 'Romantic',
    note: 'Untuk dia yang selalu menjaga hati dengan lembut.',
  },
  {
    catalogId: 'cat-yovie-janji-suci',
    collectionId: 'our_love',
    title: 'Janji Suci',
    artist: 'Yovie & Nuno',
    moodTag: 'Romantic',
    note: 'Janji tulus yang diucap sepenuh hati.',
  },
  {
    catalogId: 'cat-kahitna-cantik',
    collectionId: 'our_love',
    title: 'Cantik',
    artist: 'Kahitna',
    moodTag: 'Mood',
    note: 'Senyum manis yang selalu bikin jatuh hati lagi.',
  },
  {
    catalogId: 'cat-budi-mesin-waktu',
    collectionId: 'our_love',
    title: 'Mesin Waktu',
    artist: 'Budi Doremi',
    moodTag: 'Sad',
    note: 'Mengingat kembali detik-detik awal saling mengenal.',
  },
  {
    catalogId: 'cat-rizky-hingga-tua',
    collectionId: 'our_love',
    title: 'Hingga Tua Bersama',
    artist: 'Rizky Febian',
    moodTag: 'Special',
    note: 'Doa sederhana untuk tetap menua berdua.',
  },

  // B. ENGLISH LOVE SONGS
  {
    catalogId: 'cat-ed-perfect',
    collectionId: 'english',
    title: 'Perfect',
    artist: 'Ed Sheeran',
    moodTag: 'Romantic',
    note: 'Dansa pelan di bawah bintang berdua.',
  },
  {
    catalogId: 'cat-stephen-until-i-found-you',
    collectionId: 'english',
    title: 'Until I Found You',
    artist: 'Stephen Sanchez',
    moodTag: 'Romantic',
    note: 'Nuansa retro manis saat jatuh cinta lagi.',
  },
  {
    catalogId: 'cat-john-legend-all-of-me',
    collectionId: 'english',
    title: 'All of Me',
    artist: 'John Legend',
    moodTag: 'Romantic',
    note: 'Menerima segala sisi indah dan unik satu sama lain.',
  },
  {
    catalogId: 'cat-christina-thousand-years',
    collectionId: 'english',
    title: 'A Thousand Years',
    artist: 'Christina Perri',
    moodTag: 'Special',
    note: 'Kesabaran & rasa sayang yang tidak pernah pudar.',
  },
  {
    catalogId: 'cat-elvis-cant-help',
    collectionId: 'english',
    title: "Can't Help Falling in Love",
    artist: 'Elvis Presley',
    moodTag: 'Chill',
    note: 'Klasik sepanjang masa untuk suasana tenang.',
  },
  {
    catalogId: 'cat-bruno-just-the-way',
    collectionId: 'english',
    title: 'Just the Way You Are',
    artist: 'Bruno Mars',
    moodTag: 'Mood',
    note: 'Pengingat lembut bahwa kamu selalu mempesona apa adanya.',
  },
  {
    catalogId: 'cat-daniel-caesar-best-part',
    collectionId: 'english',
    title: 'Best Part',
    artist: 'Daniel Caesar',
    moodTag: 'Chill',
    note: 'Kamulah bagian terbaik dari setiap hari.',
  },

  // C. SLANK CORNER
  {
    catalogId: 'cat-slank-terlalu-manis',
    collectionId: 'slank',
    title: 'Terlalu Manis',
    artist: 'Slank',
    moodTag: 'Rock',
    note: 'Kenangan terlalu manis untuk dilupakan.',
  },
  {
    catalogId: 'cat-slank-ku-tak-bisa',
    collectionId: 'slank',
    title: 'Ku Tak Bisa',
    artist: 'Slank',
    moodTag: 'Sad',
    note: 'Jauh darimu selalu bikin kangen setengah mati.',
  },
  {
    catalogId: 'cat-slank-pandangan-pertama',
    collectionId: 'slank',
    title: 'Pandangan Pertama',
    artist: 'Slank',
    moodTag: 'Mood',
    note: 'Getar pertama kali bertatap muka.',
  },
  {
    catalogId: 'cat-slank-kirim-aku-bunga',
    collectionId: 'slank',
    title: 'Kirim Aku Bunga',
    artist: 'Slank',
    moodTag: 'Rock',
    note: 'Sedikit romansa klasik ala Slank.',
  },
  {
    catalogId: 'cat-slank-kamu-harus-pulang',
    collectionId: 'slank',
    title: 'Kamu Harus Pulang',
    artist: 'Slank',
    moodTag: 'Chill',
    note: 'Pengingat manis untuk pulang tepat waktu dengan aman.',
  },

  // D. INDIE & LATE NIGHT
  {
    catalogId: 'cat-hindia-evaluasi',
    collectionId: 'indie',
    title: 'Evaluasi',
    artist: 'Hindia',
    moodTag: 'Sad',
    note: 'Pengingat untuk saling menguatkan saat hari terasa berat.',
  },
  {
    catalogId: 'cat-nadin-bertaut',
    collectionId: 'indie',
    title: 'Bertaut',
    artist: 'Nadin Amizah',
    moodTag: 'Indie',
    note: 'Hangatnya doa dan pelukan di malam yang sunyi.',
  },
  {
    catalogId: 'cat-bernadya-satu-bulan',
    collectionId: 'indie',
    title: 'Satu Bulan',
    artist: 'Bernadya',
    moodTag: 'Sad',
    note: 'Lagu sendu untuk didengarkan pelan sambil bercerita.',
  },
  {
    catalogId: 'cat-tulus-monokrom',
    collectionId: 'indie',
    title: 'Monokrom',
    artist: 'Tulus',
    moodTag: 'Chill',
    note: 'Terima kasih atas setiap warna dalam lembaran kenangan.',
  },
  {
    catalogId: 'cat-fourtwnty-zona-nyaman',
    collectionId: 'indie',
    title: 'Zona Nyaman',
    artist: 'Fourtwnty',
    moodTag: 'Chill',
    note: 'Santai sejenak, menikmati kopi sore tanpa terburu-buru.',
  },
  {
    catalogId: 'cat-payung-teduh-pelukan',
    collectionId: 'indie',
    title: 'Untuk Perempuan yang Sedang Dalam Pelukan',
    artist: 'Payung Teduh',
    moodTag: 'Indie',
    note: 'Lagu paling tenang sebelum terlelap.',
  },
];

export function buildYouTubeSearchUrl(title: string, artist: string): string {
  const q = encodeURIComponent(`${artist} ${title}`.trim());
  return `https://www.youtube.com/results?search_query=${q}`;
}

export interface VerifiedYouTubeResult {
  youtubeId: string;
  canonicalUrl: string;
  title: string;
  authorName: string;
  thumbnailUrl: string;
}

/**
 * Verifies a user-provided YouTube URL using YouTube's official public oEmbed endpoint.
 * Never invents fake video IDs; rejects invalid or non-embeddable links cleanly.
 */
export async function verifyYouTubeUrlViaOEmbed(rawUrl: string): Promise<VerifiedYouTubeResult> {
  const youtubeId = extractYouTubeId(rawUrl.trim());
  if (!youtubeId) {
    throw new Error(
      'Link YouTube tidak valid. Contoh format valid: https://www.youtube.com/watch?v=... atau https://youtu.be/...'
    );
  }
  const canonicalUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(canonicalUrl)}&format=json`;

  try {
    const res = await fetch(oembedUrl);
    if (!res.ok) {
      throw new Error(
        res.status === 401 || res.status === 403
          ? 'Video YouTube ini tidak mengizinkan pemutaran embed eksternal oleh pemiliknya.'
          : 'Video YouTube tidak ditemukan atau tidak tersedia.'
      );
    }
    const data = (await res.json()) as {
      title?: string;
      author_name?: string;
      thumbnail_url?: string;
    };
    return {
      youtubeId,
      canonicalUrl,
      title: (data.title || '').trim(),
      authorName: (data.author_name || '').trim(),
      thumbnailUrl:
        (data.thumbnail_url || '').trim() ||
        `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    };
  } catch (err) {
    if (err instanceof Error && err.message.includes('Video YouTube')) {
      throw err;
    }
    throw new Error(
      'Gagal memverifikasi link YouTube via oEmbed (periksa koneksi atau pastikan video publik & dapat di-embed).'
    );
  }
}
