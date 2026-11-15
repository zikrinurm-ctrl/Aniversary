import { LoveLetterItem, QuizQuestion } from '../types';

// 30 Editable Indonesian Relationship Quiz Questions
export const SEED_LOVE_QUIZ: QuizQuestion[] = [
  {
    id: 'quiz-1',
    sortOrder: 1,
    question: 'Tanggal berapa Zikri & Diann resmi jadian?',
    options: ['20 November 2025', '14 Februari 2025', '20 Oktober 2025', '1 November 2025'],
    correctIndex: 0,
    explanation: '20 November 2025 adalah hari spesial dimulainya perjalanan resmi kita!',
  },
  {
    id: 'quiz-2',
    sortOrder: 2,
    question: 'Apa hal terpenting saat sedang ada perbedaan pendapat dalam hubungan?',
    options: ['Langsung menghilang seharian', 'Saling mendengarkan dengan tenang', 'Mencari siapa yang paling salah', 'Menunggu sampai lupa sendiri'],
    correctIndex: 1,
    explanation: 'Saling mendengarkan dengan tenang selalu membantu kita memahami isi hati masing-masing.',
  },
  {
    id: 'quiz-3',
    sortOrder: 3,
    question: 'Zona waktu spesial yang dipakai untuk hitung mundur anniversary di website ini adalah?',
    options: ['WIB (UTC+7)', 'WITA (UTC+8)', 'WIT (Asia/Jayapura UTC+9)', 'GMT (UTC+0)'],
    correctIndex: 2,
    explanation: 'Countdown ini dikunci tepat pada 20 November 2026 pukul 00:00:00 WIT!',
  },
  {
    id: 'quiz-4',
    sortOrder: 4,
    question: 'Kalau pasangan sedang lelah setelah beraktivitas seharian, respons terbaik adalah?',
    options: ['Memberi ruang nyaman, perhatian lembut, dan pelukan', 'Menuntut balasan chat secepat kilat', 'Marah karena terasa cuek', 'Membandingkan dengan orang lain'],
    correctIndex: 0,
    explanation: 'Perhatian lembut dan pengertian selalu jadi pengisi energi terbaik.',
  },
  {
    id: 'quiz-5',
    sortOrder: 5,
    question: 'Apa arti dari "Our Little World" untuk Zikri & Diann?',
    options: ['Sekadar nama folder foto', 'Dunia kecil penuh cerita, kenangan, dan rasa nyaman kita berdua', 'Tempat main game saja', 'Catatan tugas harian'],
    correctIndex: 1,
    explanation: 'Website ini dibuat sebagai ruang aman dan manis milik Zikri & Diann.',
  },
  {
    id: 'quiz-6',
    sortOrder: 6,
    question: 'Momen sederhana apa yang biasanya paling cepat memperbaiki bad mood?',
    options: ['Diem-dieman lebih lama', 'Dengar suara pasangan, pelukan, dan makanan enak', 'Scroll media sosial sendirian', 'Main tebak-tebakan bikin kesel'],
    correctIndex: 1,
    explanation: 'Kombinasi perhatian hangat dan cemilan favorit hampir tidak pernah gagal!',
  },
  {
    id: 'quiz-7',
    sortOrder: 7,
    question: 'Apa langkah terbaik setelah salah satu melakukan kesalahan kecil?',
    options: ['Gengsi minta maaf', 'Mengakui dengan tulus, minta maaf, dan perbaiki', 'Menyalahkan cuaca', 'Berpura-pura tidak terjadi apa-apa'],
    correctIndex: 1,
    explanation: 'Ketulusan jauh lebih berharga daripada mempertahankan ego.',
  },
  {
    id: 'quiz-8',
    sortOrder: 8,
    question: 'Kapan anniversary pertama Zikri & Diann dirayakan?',
    options: ['20 November 2026', '20 Desember 2026', '25 November 2026', '1 Januari 2027'],
    correctIndex: 0,
    explanation: 'Tepat satu tahun dari 20 November 2025 adalah 20 November 2026!',
  },
  {
    id: 'quiz-9',
    sortOrder: 9,
    question: 'Salah satu janji utama di halaman Our Promise adalah...',
    options: ['Selalu belanja setiap hari', 'Tidak mudah menyerah & menjaga komunikasi', 'Tidak boleh tidur siang', 'Harus selalu setuju tanpa diskusi'],
    correctIndex: 1,
    explanation: 'Tidak mudah menyerah dan menjaga komunikasi membuat hubungan tetap kuat.',
  },
  {
    id: 'quiz-10',
    sortOrder: 10,
    question: 'Berapa lama jarak dari 20 November 2025 ke 20 November 2026?',
    options: ['300 hari', '365 hari (1 tahun penuh)', '400 hari', '180 hari'],
    correctIndex: 1,
    explanation: '365 hari penuh tawa, belajar bersama, dan saling menjaga.',
  },
  {
    id: 'quiz-11',
    sortOrder: 11,
    question: 'Kalau kencan hujan turun deras di luar, aktivitas paling seru yang bisa dilakukan adalah?',
    options: ['Batal ketemu sambil cemberut', 'Nonton bareng, ngemil hangat, dan main Truth or Dare', 'Nunggu hujan reda sambil diam saja', 'Pulang tanpa pamit'],
    correctIndex: 1,
    explanation: 'Hujan justru bikin suasana ngobrol dan main bareng makin hangat!',
  },
  {
    id: 'quiz-12',
    sortOrder: 12,
    question: 'Apa tanda hubungan yang sehat dan bikin betah?',
    options: ['Takut cerita kalau lagi sedih', 'Bisa jadi diri sendiri tanpa takut dihakimi', 'Selalu jaga image terus', 'Jarang komunikasi biar misterius'],
    correctIndex: 1,
    explanation: 'Menjadi diri sendiri dan merasa aman adalah kunci rumah yang sesungguhnya.',
  },
  {
    id: 'quiz-13',
    sortOrder: 13,
    question: 'Kalau Diann lagi diam dan cuma balas singkat, sebaiknya Zikri ngapain?',
    options: ['Ikutan dingin juga', 'Tanya dengan lembut apakah ada yang mengganjal dan siap dengerin', 'Langsung tidur tanpa kabar', 'Bikin status sindiran'],
    correctIndex: 1,
    explanation: 'Pendekatan lembut dan sabar selalu lebih cepat mencairkan suasana.',
  },
  {
    id: 'quiz-14',
    sortOrder: 14,
    question: 'Kebiasaan kecil sebelum tidur yang paling bikin nyenyak adalah?',
    options: ['Bertengkar dulu', 'Ngucapin selamat malam dan doa baik untuk esok hari', 'Lupa bilang apa-apa', 'Minum kopi 3 gelas'],
    correctIndex: 1,
    explanation: 'Ucapan hangat sebelum tidur menutup hari dengan rasa tenang.',
  },
  {
    id: 'quiz-15',
    sortOrder: 15,
    question: 'Dalam satu hubungan, siapa yang harus berjuang menjaga kehangatan?',
    options: ['Zikri saja', 'Diann saja', 'Berdua saling menjaga dan melengkapi', 'Orang lain'],
    correctIndex: 2,
    explanation: 'Hubungan selalu menjadi indah karena usaha dua orang sekaligus.',
  },
  {
    id: 'quiz-16',
    sortOrder: 16,
    question: 'Hal paling lucu saat pasangan sedang foto berdua biasanya adalah?',
    options: ['Salah pose berkali-kali tapi tetap ketawa bareng', 'Nggak mau senyum sama sekali', 'Kamera selalu dimatikan', 'Nggak pernah simpan fotonya'],
    correctIndex: 0,
    explanation: 'Foto yang agak candid dan penuh tawa justru kenangan yang paling asli!',
  },
  {
    id: 'quiz-17',
    sortOrder: 17,
    question: 'Kalimat utama yang menyambut di Welcome Page website ini adalah?',
    options: ['Welcome Home User', 'Hi, My Favorite Person 💗', 'Happy Monday!', 'Login To Continue'],
    correctIndex: 1,
    explanation: 'Karena Diann memang orang favorit nomor satu di dunia kecil ini.',
  },
  {
    id: 'quiz-18',
    sortOrder: 18,
    question: 'Kalau pasangan tiba-tiba ngasih kejutan kecil tanpa alasan khusus, itu artinya?',
    options: ['Lagi salah pencet', 'Dia selalu memikirkan kebahagiaanmu bahkan di hari biasa', 'Lagi gabut aja', 'Ada maunya'],
    correctIndex: 1,
    explanation: 'Perhatian kecil di hari biasa sering kali jauh lebih bermakna.',
  },
  {
    id: 'quiz-19',
    sortOrder: 19,
    question: 'Apa yang paling penting dijaga ketika sedang sama-sama sibuk?',
    options: ['Kabar singkat yang tulus dan saling percaya', 'Menghilang sampai minggu depan', 'Mengeluh terus tanpa solusi', 'Saling curiga'],
    correctIndex: 0,
    explanation: 'Satu kabar singkat sudah cukup bikin hati pasangan tenang.',
  },
  {
    id: 'quiz-20',
    sortOrder: 20,
    question: 'Di fitur Candle Surprise, setelah mengucapkan harapan dan meniup lilin, apa yang muncul?',
    options: ['Layar error', 'Api padam, asap naik, dan perayaan confetti', 'Timer mundur ulang', 'Musik berhenti'],
    correctIndex: 1,
    explanation: 'Semoga semua harapan baik yang ditiup bersama lilin itu terkabul!',
  },
  {
    id: 'quiz-21',
    sortOrder: 21,
    question: 'Apa warna utama yang melambangkan suasana lembut & romantis website ini?',
    options: ['Neon hijau dan hitam', 'Pastel pink, soft purple, putih, dan peach', 'Abu-abu gelap', 'Merah menyala'],
    correctIndex: 1,
    explanation: 'Warna pastel lembut dipilih supaya selalu nyaman dan manis dilihat.',
  },
  {
    id: 'quiz-22',
    sortOrder: 22,
    question: 'Kalau sedang kencan di kafe, apa hal terbaik untuk dilakukan?',
    options: ['Main HP masing-masing terus', 'Ngobrol, ketawa, dan nikmati momen tanpa terburu-buru', 'Diam dari awal sampai pulang', 'Hitung ubin lantai'],
    correctIndex: 1,
    explanation: 'Kehadiran penuh jauh lebih berharga daripada apa pun di atas meja.',
  },
  {
    id: 'quiz-23',
    sortOrder: 23,
    question: 'Salah satu cara menunjukkan rasa menghargai usaha pasangan adalah?',
    options: ['Menganggap semuanya biasa saja', 'Mengucapkan terima kasih dengan tulus sekecil apa pun usahanya', 'Selalu menuntut lebih', 'Diam saja'],
    correctIndex: 1,
    explanation: 'Ucapan terima kasih yang tulus membuat pasangan merasa sangat berarti.',
  },
  {
    id: 'quiz-24',
    sortOrder: 24,
    question: 'Di Final Surprise, kalimat penutup penuh kehangatan yang muncul adalah?',
    options: ['See You Next Year', 'Thank You For Being My Home', 'Game Over', 'Try Again'],
    correctIndex: 1,
    explanation: 'Thank You For Being My Home — karena rumah bukan tempat, tapi kamu.',
  },
  {
    id: 'quiz-25',
    sortOrder: 25,
    question: 'Jika ada masalah yang membuat salah satu kecewa, kapan waktu terbaik membicarakannya?',
    options: ['Saat emosi masih meledak-ledak', 'Setelah hati lebih tenang agar bicara dari rasa sayang', 'Dipendam setahun', 'Diceritakan ke semua orang dulu'],
    correctIndex: 1,
    explanation: 'Kepala dingin membuat solusi lebih mudah ditemukan tanpa saling melukai.',
  },
  {
    id: 'quiz-26',
    sortOrder: 26,
    question: 'Apa fungsi utama fitur Virtual Hug di website ini?',
    options: ['Menghitung kalori', 'Mengirim pelukan virtual hangat kapan pun lagi kangen', 'Mematikan layar HP', 'Menghapus pesan'],
    correctIndex: 1,
    explanation: 'Kapan pun butuh pelukan instan, tombol Virtual Hug selalu siap!',
  },
  {
    id: 'quiz-27',
    sortOrder: 27,
    question: 'Apa milestone pertama di Our Journey timeline?',
    options: ['First Meeting', 'First Anniversary', 'Getting Married', 'World Tour'],
    correctIndex: 0,
    explanation: 'Semuanya berawal dari First Meeting sebelum akhirnya menjadi kita.',
  },
  {
    id: 'quiz-28',
    sortOrder: 28,
    question: 'Mengapa penting menyimpan kenangan foto di Our Memories?',
    options: ['Supaya memori HP penuh', 'Agar momen berharga bisa dilihat ulang kapan saja sambil tersenyum', 'Supaya bisa dihapus nanti', 'Untuk syarat lomba'],
    correctIndex: 1,
    explanation: 'Foto menangkap detik yang tidak bisa diulang lagi.',
  },
  {
    id: 'quiz-29',
    sortOrder: 29,
    question: 'Kalau salah satu sedang kurang percaya diri, pasangan yang baik akan?',
    options: ['Ikut mengejek', 'Mengingatkan kelebihan dan selalu mendukung dari samping', 'Membiarkan saja', 'Pergi menjauh'],
    correctIndex: 1,
    explanation: 'Kita adalah tim terbaik untuk menguatkan satu sama lain.',
  },
  {
    id: 'quiz-30',
    sortOrder: 30,
    question: 'Harapan paling indah setelah melewati 1st Anniversary adalah?',
    options: ['Cukup sampai di sini', 'Terus melangkah ke tahun-tahun berikutnya dengan cinta yang makin dewasa', 'Lupa tanggalnya', 'Tidak usah dirayakan'],
    correctIndex: 1,
    explanation: 'Ini baru bab pertama dari cerita panjang Zikri & Diann!',
  },
];

// 52 Heartfelt Indonesian Love Letters
const LETTER_BODIES: Array<{ title: string; body: string }> = [
  {
    title: 'Alasan Sederhana',
    body: 'Kadang aku tidak butuh alasan besar untuk tersenyum di tengah hari yang melelahkan. Cukup ingat namamu, lalu semuanya terasa lebih ringan.',
  },
  {
    title: 'Rumah Paling Nyaman',
    body: 'Di mana pun kakiku melangkah hari ini, rasanya selalu ada satu tempat pulang yang paling tenang: saat mengobrol denganmu.',
  },
  {
    title: 'Terima Kasih Sudah Sabar',
    body: 'Terima kasih karena tidak pernah lelah memahami kekuranganku, dan selalu memberiku kesempatan untuk belajar menjadi pasangan yang lebih baik.',
  },
  {
    title: 'Tentang Tawa Kecilmu',
    body: 'Suara tawamu masih menjadi melodi favoritku. Sesederhana melihatmu bahagia saja sudah cukup membuat hariku terasa utuh.',
  },
  {
    title: 'Satu Tahun Pertama',
    body: 'Satu tahun bersama mengajarkanku bahwa cinta bukan tentang selalu sempurna, melainkan tentang terus memilih satu sama lain setiap hari.',
  },
  {
    title: 'Untuk Hari Yang Berat',
    body: 'Kalau hari ini terasa berat untukmu, ingatlah bahwa kamu tidak perlu menanggung semuanya sendirian. Ada aku yang selalu siap mendengarkan.',
  },
  {
    title: 'Pesan Tengah Malam',
    body: 'Semoga malam ini tidurmu nyenyak, mimpimu indah, dan esok pagi kamu bangun dengan hati yang ringan karena tahu ada seseorang yang sangat menyayangimu.',
  },
  {
    title: 'Hal-Hal Kecil',
    body: 'Aku suka caramu memperhatikan detail kecil, cara kamu bercerita dengan antusias, dan cara kamu membuat hal biasa terasa istimewa.',
  },
  {
    title: 'Jangan Lupa Istirahat',
    body: 'Di tengah kesibukanmu mengejar mimpi, jangan lupa jaga kesehatanmu ya. Kamu terlalu berharga untuk kelelahan sendirian.',
  },
  {
    title: 'Pilihan Yang Sama',
    body: 'Kalau waktu bisa diputar kembali ke November 2025, aku tetap akan menjatuhkan pilihan yang sama: kamu, Diann.',
  },
  {
    title: 'Tentang Rindu',
    body: 'Lucu ya, baru saja selesai mengobrol, tapi beberapa jam kemudian rasanya sudah ingin cerita banyak hal lagi ke kamu.',
  },
  {
    title: 'Cahaya Sore',
    body: 'Setiap kali melihat langit senja yang berwarna merah muda, entah kenapa pikiranku selalu langsung teringat pada kehangatanmu.',
  },
  {
    title: 'Teman Terbaik',
    body: 'Lebih dari sekadar pasangan, kamu juga teman cerita terbaik yang pernah kupunya. Bersamamu tidak pernah ada kata kehabisan topik.',
  },
  {
    title: 'Doa Di Setiap Langkah',
    body: 'Di setiap langkah yang kamu ambil, semoga selalu ada ketenangan, keberkahan, dan hal-hal baik yang mendekat ke arahmu.',
  },
  {
    title: 'Beda Pendapat',
    body: 'Walaupun kadang kita pernah berbeda pendapat, aku bersyukur kita selalu memilih duduk bersama dan menyelesaikannya dengan kepala dingin.',
  },
  {
    title: 'Kehadiranmu',
    body: 'Kehadiranmu bukan hanya mengisi waktu luangku, tapi juga memberi makna baru di setiap hari yang kujalani.',
  },
  {
    title: 'Saat Kamu Tersenyum',
    body: 'Tolong sering-sering tersenyum ya, karena senyummu itu seperti tombol reset untuk semua rasa penatku.',
  },
  {
    title: 'Bertumbuh Bersama',
    body: 'Aku senang melihat kita berdua pelan-pelan bertumbuh menjadi versi diri yang lebih sabar, lebih peduli, dan lebih dewasa.',
  },
  {
    title: 'Bukan Kebetulan',
    body: 'Di antara jutaan kemungkinan di dunia ini, bertemu dan berjalan sejauh ini bersamamu terasa seperti anugerah paling indah.',
  },
  {
    title: 'Pelukan Jauh',
    body: 'Kalau saat ini aku belum ada di sampingmu, anggap saja surat kecil ini sebagai pelukan hangat dariku untukmu.',
  },
  {
    title: 'Kejujuran Hati',
    body: 'Aku mungkin tidak selalu pandai merangkai kata puitis, tapi setiap perhatian kecilku datang dari hati yang benar-benar tulus menyayangimu.',
  },
  {
    title: 'Lagu Kita',
    body: 'Banyak lagu cinta terdengar lebih masuk akal sejak ada kamu di hidupku.',
  },
  {
    title: 'Tenang Dalam Diam',
    body: 'Bersamamu, bahkan duduk diam tanpa bicara apa pun sudah terasa nyaman dan menenangkan.',
  },
  {
    title: 'Semangat Pagi',
    body: 'Selamat menjalani hari ini, sayang! Apa pun tantangan yang kamu temui hari ini, aku yakin kamu pasti bisa melewatinya.',
  },
  {
    title: 'Apresiasi Untukmu',
    body: 'Mungkin jarang terucap setiap hari, tapi aku sangat menghargai setiap waktu, tenaga, dan kasih sayang yang kamu berikan untuk hubungan kita.',
  },
  {
    title: 'Masa Depan Cerah',
    body: 'Membayangkan tahun-tahun ke depan bersamamu selalu membuatku bersemangat untuk bekerja lebih keras dan menjaga hubungan ini sebaik mungkin.',
  },
  {
    title: 'Tentang Kamu',
    body: 'Kamu tidak perlu berubah menjadi siapa pun untuk dicintai. Jadilah Diann apa adanya, karena versi dirimu yang sekarang sudah sangat luar biasa.',
  },
  {
    title: 'Hujan Di Luar',
    body: 'Kalau hujan turun dan suasana jadi dingin, ingat saja ada hati yang selalu hangat setiap kali menyebut namamu.',
  },
  {
    title: 'Obrolan Sederhana',
    body: 'Dari membahas makanan enak sampai rencana masa depan, tidak ada satu pun menit bersamamu yang terasa sia-sia.',
  },
  {
    title: 'Janji Kecil',
    body: 'Aku berjanji akan terus belajar menjadi pendengar yang baik, tidak mudah egois, dan selalu menjaga perasaanmu.',
  },
  {
    title: 'Kenangan Indah',
    body: 'Terima kasih sudah menciptakan begitu banyak kenangan manis yang selalu bisa kita tertawakan bersama di masa depan.',
  },
  {
    title: 'Kekuatan Doa',
    body: 'Namamu selalu jadi salah satu hal yang paling sering kusebut dalam doa-doa baikku.',
  },
  {
    title: 'Saling Melengkapi',
    body: 'Kita punya karakter yang berbeda, tapi justru perbedaan itu yang membuat kita saling melengkapi dengan cara yang unik.',
  },
  {
    title: 'Jangan Takut Gagal',
    body: 'Kalau suatu hari rencanamu belum berjalan sesuai harapan, kamu tetap punya aku yang selalu percaya penuh pada kemampuanmu.',
  },
  {
    title: 'Favoritku',
    body: 'Dari semua notifikasi yang masuk ke HP-ku setiap hari, namamu selalu jadi satu-satunya yang kutunggu.',
  },
  {
    title: 'Detik Demi Detik',
    body: 'Waktu berjalan begitu cepat saat bersamamu. Baru kemarin rasanya 20 November 2025, kini kita sudah merayakan satu tahun penuh.',
  },
  {
    title: 'Cinta Yang Tenang',
    body: 'Bersamamu aku belajar bahwa cinta terbaik bukan yang penuh drama, melainkan yang membuat hati terasa damai.',
  },
  {
    title: 'Satu Tim',
    body: 'Ingat selalu bahwa kita berada di tim yang sama. Bukan aku melawan kamu, tapi kita berdua menghadapi masalah bersama.',
  },
  {
    title: 'Hadiah Terindah',
    body: 'Website kecil ini hanyalah sebagian kecil dari rasa syukurku. Hadiah terindahnya tetap kehadiranmu di hidupku.',
  },
  {
    title: 'Saat Kamu Sedih',
    body: 'Tidak apa-apa kok kalau sesekali kamu ingin menangis atau merasa lemah. Bahuku selalu terbuka kapan saja kamu butuh bersandar.',
  },
  {
    title: 'Langkah Pelan',
    body: 'Kita tidak perlu terburu-buru membandingkan perjalanan kita dengan orang lain. Nikmati saja ritme kita sendiri dengan bahagia.',
  },
  {
    title: 'Kopi & Cerita',
    body: 'Suatu hari nanti kita akan duduk santai sambil minum minuman favorit kita dan mengenang betapa manisnya masa-masa ini.',
  },
  {
    title: 'Selalu Ada',
    body: 'Di hari baikmu aku akan ikut bersorak paling kencang. Di hari sulitmu aku akan menggenggam tanganmu paling erat.',
  },
  {
    title: 'Bintang Malam',
    body: 'Kalau malam terasa sepi, lihatlah ke langit dan ingat bahwa di bawah langit yang sama ada aku yang selalu memikirkanmu.',
  },
  {
    title: 'Kepercayaan',
    body: 'Terima kasih sudah mempercayakan hatimu kepadaku. Kepercayaan itu akan selalu kujaga dengan penuh tanggung jawab.',
  },
  {
    title: 'Versi Terbaik',
    body: 'Bersamamu membuatku ingin terus menjadi versi terbaik dari diriku sendiri, bukan karena terpaksa, tapi karena kamu layak mendapatkan yang terbaik.',
  },
  {
    title: 'Warna Pastel',
    body: 'Hidupku dulu terasa seperti sketsa biasa, sampai kamu datang membawa warna-warna lembut yang menenangkan.',
  },
  {
    title: 'Jangan Ragu',
    body: 'Kalau suatu saat pikiranmu dipenuhi keraguan, kembalilah ke ruang kecil ini dan ingat betapa berartinya kamu bagiku.',
  },
  {
    title: 'Hari Ini & Nanti',
    body: 'Aku mencintaimu bukan hanya untuk hari ini yang indah, tapi juga untuk hari-hari ke depan yang akan kita lalui bersama.',
  },
  {
    title: 'Terima Kasih, Diann',
    body: 'Terima kasih sudah lahir ke dunia ini, sudah bertahan sejauh ini, dan sudah memilih untuk berjalan di sampingku.',
  },
  {
    title: 'Menuju Tahun Kedua',
    body: 'Selamat ulang tahun pertama untuk kisah kita! Mari kita buat tahun kedua penuh tawa, petualangan baru, dan cinta yang makin hangat.',
  },
  {
    title: 'Untukmu Selalu',
    body: 'Apa pun yang berubah seiring waktu, satu hal yang selalu kuharap tetap sama: kita yang tetap pulang ke satu sama lain.',
  },
];

export const SEED_LOVE_LETTERS: LoveLetterItem[] = LETTER_BODIES.map((item, idx) => ({
  id: `letter-${idx + 1}`,
  title: item.title,
  body: item.body,
  author: 'Zikri untuk Diann',
}));
