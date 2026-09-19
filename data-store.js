/* =========================================================
   OMBAR NEWS — Data Store (CMS-ready)
   ---------------------------------------------------------
   Single source of truth for site content. Used by both the
   public site (script.js) and the admin dashboard (admin.js).

   Persistence model (works on static hosting: GitHub Pages /
   Cloudflare Pages — no backend needed):
     • Defaults are baked into this file (DEFAULT_*).
     • Admin edits are saved to localStorage under OMBAR_KEY.
     • On load: localStorage overrides win; defaults fill gaps.
     • To publish edits for ALL visitors on static hosting,
       use the admin "Export" button → download ombar-data.json
       → replace the DEFAULT_* in this file (or commit the JSON
       and call OMBAR_DATA.importJSON in a tiny bootstrap) →
       redeploy. See DEPLOY.md.
   ========================================================= */
(function (global) {
  'use strict';

  var IMG = 'images/';
  var OMBAR_KEY = 'ombar_data_v1';
  var OMBAR_AUTH_KEY = 'ombar_admin_session';
  var OMBAR_CRED_KEY = 'ombar_admin_creds';

  /* ---------------- DEFAULT CATEGORIES ---------------- */
  var DEFAULT_CATEGORIES = {
    'raja-ampat': { name: 'Raja Ampat', desc: 'Berita terbaru dari gugusan kepulauan Raja Ampat — Waisai, Wayag, masyarakat, dan pemerintahan.' },
    'papua-barat-daya': { name: 'Papua Barat Daya', desc: 'Kabar terkini dari Provinsi Papua Barat Daya: Sorong, Raja Ampat, hingga pemerintahan provinsi.' },
    'papua': { name: 'Papua', desc: 'Berita dari seluruh tanah Papua: pembangunan, masyarakat, budaya, dan lingkungan.' },
    'national': { name: 'National', desc: 'Berita nasional Indonesia: politik, ekonomi, hingga peristiwa penting.' },
    'world': { name: 'World', desc: 'Sorotan internasional — diplomasi, ekonomi global, dan isu lintas negara.' },
    'politics': { name: 'Politics', desc: 'Berita politik nasional dan daerah, kebijakan, hingga dinamika pemerintahan.' },
    'economy': { name: 'Economy', desc: 'Perekonomian Papua, Indonesia, dan global — investasi, UMKM, hingga ekonomi biru.' },
    'sports': { name: 'Sports', desc: 'Kabar olahraga dari Raja Ampat, Papua, hingga kancah nasional.' },
    'culture': { name: 'Culture', desc: 'Budaya, seni, dan tradisi Papua serta Indonesia yang layak dikenang.' },
    'travel': { name: 'Travel', desc: 'Destinasi, tips perjalanan, dan cerita wisata Raja Ampat & sekitarnya.' }
  };

  /* ---------------- DEFAULT SETTINGS ---------------- */
  var DEFAULT_SETTINGS = {
    siteName: 'OMBAR NEWS',
    tagline: 'Raja Ampat & Beyond',
    description: 'OMBAR NEWS — Portal berita digital profesional yang fokus pada berita Raja Ampat, Papua Barat Daya, Papua, nasional, dan internasional.',
    footerAbout: 'Portal berita digital yang menyoroti Raja Ampat, Papua Barat Daya, Papua, Indonesia, dan dunia. Jurnalisme yang dekat dengan laut, kepulauan, dan masyarakat.',
    breakingLabel: 'BREAKING'
  };

  /* ---------------- DEFAULT BREAKING (custom ticker items) ---------------- */
  // Empty = ticker auto-derives from latest articles. Add strings to prepend custom items.
  var DEFAULT_BREAKING = [];

  /* ---------------- DEFAULT ARTICLES ---------------- */
  var DEFAULT_ARTICLES = [
    {
      id: 'wayag-destinasi-terdicari-asia-tenggara',
      category: 'raja-ampat',
      tags: ['Wayag', 'Wisata', 'Penghargaan'],
      title: 'Wayag Sabet Predikat Destinasi Wisata Paling Dicari di Asia Tenggara',
      excerpt: 'Gugusan karst berbentuk jamur Wayag kembali mencuri perhatian dunia setelah dinobatkan menjadi destinasi paling dicari di Asia Tenggara pada survei travel tahun ini.',
      image: IMG + 'wayag-viewpoint.jpg',
      author: 'Mira Waisai',
      publishedAt: '2026-01-15T08:30:00+09:00',
      updatedAt: '2026-01-15T11:10:00+09:00',
      reads: 18420,
      featured: true,
      content: [
        { type: 'p', text: 'WAISAI, OMBAR NEWS — Gugusan karst ikonik Wayag di Raja Ampat, Papua Barat Daya, kembali mencuri perhatian dunia. Pada survei tahunan sebuah platform travel regional, Wayag dinobatkan sebagai destinasi paling dicari di Asia Tenggara untuk tahun 2026, mengalahkan sejumlah pulau populer di Thailand dan Filipina.' },
        { type: 'p', text: 'Predikat itu disambut antusias oleh pemerintah daerah, pelaku pariwisata, dan masyarakat adat. Bagi mereka, ini bukan sekadar penghargaan, melainkan validasi atas kerja keras menjaga laut dan kepulauan selama puluhan tahun.' },
        { type: 'blockquote', text: 'Wayag bukan sekadar pemandangan. Wayag adalah rumah, ladang, dan identitas kami. Penghargaan ini wajib dibayar dengan konservasi yang lebih kuat.', cite: 'Yulius Mayor, Kepala Distrik Waigeo Barat' },
        { type: 'h2', text: 'Daya tarik yang sulit ditolak' },
        { type: 'p', text: 'Daya tarik Wayag terletak pada gugusan pulau karst berbentuk jamur yang mengelilingi laguna berwarna toska. Dari titik panjat di puncak bukit karang, wisatawan dapat menyaksikan ratusan pulau kecil seolah melayang di atas permukaan laut.' },
        { type: 'p', text: 'Selain pemandangan, Wayag juga menawarkan penyelaman dengan biodiversitas tertinggi di planet ini. Para ahli kelautan kerap menyebut Raja Ampat sebagai "jantung biodiversitas laut dunia" dengan lebih dari 1.500 pulau kecil dan 75 persen spesies karang dunia.' },
        { type: 'h2', text: 'Antusiasme dan kehati-hatian' },
        { type: 'p', text: 'Meski disambut positif, sejumlah aktivis lingkungan meminta pemerintah tidak terjebak euforia. Mereka menekankan pentingnya membatasi jumlah pengunjung harian dan memperkuat zona konservasi agar tekanan wisata tidak merusak ekosistem.' },
        { type: 'p', text: 'Pemerintah daerah menyatakan siap mengeluarkan aturan kuota kunjungan yang lebih ketat, sekaligus memperbanyak patroli laut untuk mencegah penambangan terumbu dan penangkapan ikan ilegal.' },
        { type: 'p', text: 'OMBAR NEWS akan terus memantau perkembangan kebijakan pariwisata berkelanjutan di Raja Ampat.' }
      ]
    },
    {
      id: 'pbd-target-satu-juta-wisatawan',
      category: 'papua-barat-daya',
      tags: ['Pariwisata', 'Investasi'],
      title: 'Pemda Papua Barat Daya Targetkan Satu Juta Wisatawan Kunjungi Raja Ampat 2026',
      excerpt: 'Pemerintah Provinsi Papua Barat Daya menetapkan target satu juta kunjungan wisatawan ke Raja Ampat sepanjang 2026, didukung pembenahan akses dan fasilitas.',
      image: IMG + 'boat-lagoon.jpg',
      author: 'Daud Saly',
      publishedAt: '2026-01-14T14:00:00+09:00',
      reads: 9210,
      content: [
        { type: 'p', text: 'SORONG, OMBAR NEWS — Pemerintah Provinsi Papua Barat Daya menetapkan target ambisius: satu juta kunjungan wisatawan ke Raja Ampat sepanjang 2026. Target itu disampaikan dalam rapat koordinasi pariwisata di Sorong.' },
        { type: 'p', text: 'Gubernur menyebut pencapaian target akan didukung pembenahan akses transportasi, peningkatan kapasitas bandara, serta pelatihan ratusan pemandu wisata lokal.' },
        { type: 'h2', text: 'Infrastruktur pengungkit' },
        { type: 'p', text: 'Sejumlah proyek infrastruktur telah masuk dalam daftar prioritas, termasuk pelebaran landasan bandara dan penambahan dermaga penyebrangan cepat Sorong–Waisai.' },
        { type: 'p', text: 'Pemda juga menjanjikan insentif bagi pelaku usaha lokal yang berkomitmen pada pariwisata berkelanjutan.' }
      ]
    },
    {
      id: 'waisai-pusat-logistik-kepulauan',
      category: 'raja-ampat',
      tags: ['Waisai', 'Logistik', 'Pemerintahan'],
      title: 'Waisai Siap Jadi Pusat Logistik dan Pelayanan Publik di Kepulauan Raja Ampat',
      excerpt: 'Pemkot Waisai menyelesaikan tahap pertama pelabuhan multi-fungsi yang akan menjadi simpul distribusi barang antar-pulau di Raja Ampat.',
      image: IMG + 'waisai-town.jpg',
      author: 'Rina Mansim',
      publishedAt: '2026-01-13T09:15:00+09:00',
      reads: 6430,
      content: [
        { type: 'p', text: 'WAISAI, OMBAR NEWS — Kota Waisai, ibu kota Kabupaten Raja Ampat, menyelesaikan tahap pertama pelabuhan multi-fungsi. Pelabuhan ini akan menjadi simpul distribusi barang antar-pulau sekaligus terminal penumpang.' },
        { type: 'p', text: 'Wali Kota Waisai menyebut pelabuhan ini menjawab keluhan lama warga kepulauan soal mahal dan lambatnya distribusi kebutuhan pokok.' },
        { type: 'p', text: 'Pelabuhan tahap dua akan menambah dermaga khusus kapal wisata dan cold storage untuk hasil tangkapan nelayan.' }
      ]
    },
    {
      id: 'nelayan-arborek-sertifikasi-biodiversitas',
      category: 'economy',
      tags: ['Arborek', 'Ekonomi', 'Lingkungan'],
      title: 'Nelayan Kampung Arborek Raih Sertifikasi Biodiversitas, Pendapatan Naik 40 Persen',
      excerpt: 'Kelompok nelayan kampung Arborek sukses memanfaatkan ekowisata berbasis komunitas, membuktikan bahwa konservasi bisa mengangkat ekonomi.',
      image: IMG + 'coral-reef.jpg',
      author: 'Mira Waisai',
      publishedAt: '2026-01-12T10:00:00+09:00',
      reads: 11250,
      content: [
        { type: 'p', text: 'KAMPUNG ARBOREK, OMBAR NEWS — Kelompok nelayan kampung Arborek, Distrik Meos Mansar, meraih sertifikasi biodiversitas dari lembaga konservasi internasional. Sertifikasi ini mengukuhkan praktik tangkap ramah lingkungan mereka.' },
        { type: 'p', text: 'Sejak bersertifikasi, pendapatan kelompok naik hingga 40 persen berkat permintaan ikan berkelanjutan dari hotel dan resort setempat.' },
        { type: 'blockquote', text: 'Kami menjaga laut karena laut menjaga kami. Kini laut juga menghidupi keluarga kami dengan lebih layak.', cite: 'Mama Yosefa, ketua kelompok nelayan Arborek' },
        { type: 'p', text: 'Model Arborek kini direplikasi ke tiga kampung lain di Raja Ampat.' }
      ]
    },
    {
      id: 'konservasi-hiu-paus-teluk-mayalibit',
      category: 'raja-ampat',
      tags: ['Lingkungan', 'Konservasi', 'Hiu Paus'],
      title: 'Konservasi Hiu Paus di Teluk Mayalibit Mulai Tunjukkan Hasil',
      excerpt: 'Populasi hiu paus muda yang terpantau di Teluk Mayalibit meningkat dua tahun berturut-turut, tanda baik bagi upaya konservasi laut Raja Ampat.',
      image: IMG + 'manta-ray.jpg',
      author: 'Andreas Kambu',
      publishedAt: '2026-01-11T07:45:00+09:00',
      reads: 8740,
      content: [
        { type: 'p', text: 'TELUK MAYALIBIT, OMBAR NEWS — Populasi hiu paus muda yang terpantau di Teluk Mayalibit meningkat dua tahun berturut-turut. Tim riset kelautan menyebut ini tanda baik bagi upaya konservasi laut Raja Ampat.' },
        { type: 'p', text: 'Kawasan perlindungan yang diperluas tahun lalu diyakini berperan besar, dengan menutup area inti dari aktivitas kapal.' },
        { type: 'p', text: 'Peneliti menyebut data ini penting karena hiu paus adalah indikator kesuburan ekosistem.' }
      ]
    },
    {
      id: 'festival-bahari-raja-ampat-2026',
      category: 'culture',
      tags: ['Budaya', 'Festival', 'Waisai'],
      title: 'Festival Bahari Raja Ampat 2026 Akan Hadirkan 2.000 Penari Tradisional',
      excerpt: 'Festival tahunan bahari Raja Ampat tahun ini dijanjikan lebih megah dengan ribuan penari tradisional dan parade kapal layar adat.',
      image: IMG + 'papuan-culture.jpg',
      author: 'Rina Mansim',
      publishedAt: '2026-01-10T16:20:00+09:00',
      reads: 13980,
      content: [
        { type: 'p', text: 'WAISAI, OMBAR NEWS — Festival Bahari Raja Ampat 2026 dijadwalkan berlangsung pada akhir Maret. Panitia menargetkan 2.000 penari tradisional dari berbagai kampung akan tampil dalam parade pembuka.' },
        { type: 'p', text: 'Festival tahun lalu sukses mendatangkan puluhan ribu wisatawan. Tahun ini, panitia menambahkan cabang lomba layar adat dan kuliner lokal.' },
        { type: 'p', text: 'Wali Kota Waisai menyebut festival adalah ruang merayakan identitas kepulauan sekaligus menggerakkan ekonomi kreatif.' }
      ]
    },
    {
      id: 'sorong-gempa-warga-diminta-tenang',
      category: 'papua-barat-daya',
      tags: ['Bencana', 'Sorong'],
      title: 'Kabupaten Sorong Diguncang Gempa, Warga Diminta Tenang dan Waspada',
      excerpt: 'Gempa berkekuatan sedang mengguncang wilayah Sorong pagi ini. BMKG menyebut tidak berpotensi tsunami namun meminta masyarakat tetap waspada.',
      image: IMG + 'waisai-town.jpg',
      author: 'Redaksi OMBAR',
      publishedAt: '2026-01-15T06:05:00+09:00',
      reads: 7120,
      content: [
        { type: 'p', text: 'SORONG, OMBAR NEWS — Gempa berkekuatan sedang mengguncang wilayah Sorong dan sekitarnya pagi ini. Berdasarkan data BMKG, gempa tidak berpotensi tsunami.' },
        { type: 'p', text: 'Warga diminta tetap tenang namun waspada terhadap gempa susulan. Pemerintah daerah telah menyiagakan tim tanggap bencana.' },
        { type: 'p', text: 'Hingga berita ini diturunkan belum ada laporan kerusakan signifikan.' }
      ]
    },
    {
      id: 'pendidikan-anak-kepulauan-waigeo',
      category: 'raja-ampat',
      tags: ['Pendidikan', 'Waigeo', 'Kampung'],
      title: 'Pendidikan Anak Kepulauan: Tantangan dan Harapan di Distrik Waigeo',
      excerpt: 'Akses sekolah yang terbatas dan listrik tidak stabil menjadi tantangan harian anak-anak di pulau-pulau Waigeo. Sebuah inisiatif baru mencoba menjawabnya.',
      image: IMG + 'local-village.jpg',
      author: 'Daud Saly',
      publishedAt: '2026-01-09T08:00:00+09:00',
      reads: 5890,
      content: [
        { type: 'p', text: 'WAIGEO, OMBAR NEWS — Bagi anak-anak di kampung-kampung Pulau Waigeo, bersekolah bukan hal sederhana. Sebagian harus menempuh perahu selama satu jam untuk mencapai sekolah terdekat.' },
        { type: 'p', text: 'Sebuah inisiatif "Sekolah Apung" mencoba menjawab dengan membawa guru keliling antar-kampung. Program ini didukung donasi dan pemerintah daerah.' },
        { type: 'p', text: 'Penggerak program menyebut tujuh kampung telah dilayani, dengan target dua belas kampung pada akhir tahun.' }
      ]
    },
    {
      id: 'ekonomi-biru-pbd-tumbuh-6-2-persen',
      category: 'economy',
      tags: ['Ekonomi Biru', 'PDB'],
      title: 'Ekonomi Biru Papua Barat Daya Tumbuh 6,2 Persen di Kuartal Ketiga',
      excerpt: 'Pertumbuhan ekonomi Papua Barat Daya didorong sektor perikanan, pariwisata, dan transportasi laut yang sehat sepanjang kuartal ketiga.',
      image: IMG + 'waisai-town.jpg',
      author: 'Andreas Kambu',
      publishedAt: '2026-01-08T13:30:00+09:00',
      reads: 6650,
      content: [
        { type: 'p', text: 'SORONG, OMBAR NEWS — Badan Pusat Statistik mencatat pertumbuhan ekonomi Papua Barat Daya mencapai 6,2 persen pada kuartal ketiga. Sumbangan terbesar datang dari sektor perikanan dan pariwisata.' },
        { type: 'p', text: 'Pertumbuhan ini melampaui rata-rata nasional. Gubernur menyebut ekonomi biru yang berkelanjutan menjadi strategi utama.' }
      ]
    },
    {
      id: 'indonesia-tuan-rumah-ktt-pasifik',
      category: 'national',
      tags: ['Diplomasi', 'Pembangunan Hijau'],
      title: 'Indonesia Tuan Rumah KTT Pasifik, Papua Jadi Fokus Pembangunan Hijau',
      excerpt: 'Sebagai tuan rumah KTT Pasifik, Indonesia menyoroti Papua sebagai wilayah strategis pembangunan rendah karbon dan ekonomi biru.',
      image: IMG + 'hero-rajaampat.jpg',
      author: 'Redaksi OMBAR',
      publishedAt: '2026-01-07T11:00:00+09:00',
      reads: 7980,
      content: [
        { type: 'p', text: 'JAKARTA, OMBAR NEWS — Indonesia menjadi tuan rumah KTT Negara-Negara Pasifik. Dalam forum ini, Papua ditonjolkan sebagai wilayah strategis untuk pembangunan rendah karbon.' },
        { type: 'p', text: 'Presiden menegaskan komitmen menjaga hutan dan laut Papua sebagai paru-paru dunia, sekaligus mengangkat kesejahteraan masyarakat adat.' },
        { type: 'p', text: 'Sejumlah negara mitra menyatakan kesiapan mendukung pendanaan hijau untuk proyek-proyek di Papua.' }
      ]
    },
    {
      id: 'diplomasi-pasifik-indonesia-perkuat-kerja-sama',
      category: 'world',
      tags: ['Diplomasi', 'Internasional'],
      title: 'Diplomasi Pasifik: Indonesia Perkuat Kerja Sama dengan Negara Kepulauan',
      excerpt: 'Indonesia menandatangani sejumlah nota kesepahaman dengan negara-negara kepulauan Pasifik terkait perubahan iklim dan ekonomi biru.',
      image: IMG + 'boat-lagoon.jpg',
      author: 'Redaksi OMBAR',
      publishedAt: '2026-01-06T15:40:00+09:00',
      reads: 5120,
      content: [
        { type: 'p', text: 'JAKARTA, OMBAR NEWS — Pada sisi marjin KTT Pasifik, Indonesia menandatangani sejumlah nota kesepahaman dengan negara-negara kepulauan terkait perubahan iklim dan ekonomi biru.' },
        { type: 'p', text: 'Menteri Luar Negeri menyebut kerja sama ini menempatkan Indonesia sebagai mitra yang setara dan saling menghormati.' }
      ]
    },
    {
      id: 'pekan-olahraga-pbd-2026-dibuka',
      category: 'sports',
      tags: ['Olahraga', 'Sorong'],
      title: 'Pekan Olahraga Papua Barat Daya 2026 Resmi Dibuka di Sorong',
      excerpt: 'Lebih dari 2.500 atlet dari seluruh kabupaten bertanding dalam Pekan Olahraga Papua Barat Daya 2026 yang dibuka secara meriah di Sorong.',
      image: IMG + 'papuan-culture.jpg',
      author: 'Daud Saly',
      publishedAt: '2026-01-05T18:10:00+09:00',
      reads: 9440,
      content: [
        { type: 'p', text: 'SORONG, OMBAR NEWS — Pekan Olahraga Papua Barat Daya 2026 resmi dibuka malam tadi di Stadion Sorong. Lebih dari 2.500 atlet dari seluruh kabupaten bertanding dalam cabang olahraga prestasi dan tradisional.' },
        { type: 'p', text: 'Gubernur berharap event ini menemukan bibit atlet baru yang mewakili Papua Barat Daya di tingkat nasional.' }
      ]
    },
    {
      id: 'tari-cendrawasih-panggung-internasional',
      category: 'culture',
      tags: ['Seni', 'Cendrawasih', 'Budaya'],
      title: 'Seni Tari Cendrawasih Papua Diangkat ke Panggung Internasional',
      excerpt: 'Grup tari tradisional Papua sukses membawa tarian Cendrawasih ke festival seni internasional, memperkenalkan kekayaan budaya Papua ke dunia.',
      image: IMG + 'papuan-culture.jpg',
      author: 'Rina Mansim',
      publishedAt: '2026-01-04T09:50:00+09:00',
      reads: 6730,
      content: [
        { type: 'p', text: 'JAYAPURA, OMBAR NEWS — Grup tari tradisional Papua sukses membawa tarian Cendrawasih ke festival seni internasional. Tarian yang meniru gerakan burung cendrawasih ini mendapat standing ovation.' },
        { type: 'p', text: 'Koreografer grup menyebut keberhasilan ini bukti bahwa budaya lokal tetap relevan di panggung dunia.' }
      ]
    },
    {
      id: 'rute-penerbangan-sorong-waisai-setiap-jam',
      category: 'travel',
      tags: ['Transportasi', 'Wisata'],
      title: 'Rute Penerbangan Sorong–Waisai Kini Tersedia Setiap Jam',
      excerpt: 'Maskapai menambah frekuensi penerbangan Sorong–Waisai menjadi setiap jam untuk mengakomodasi lonjakan wisatawan menuju Raja Ampat.',
      image: IMG + 'beach-piaynemo.jpg',
      author: 'Mira Waisai',
      publishedAt: '2026-01-03T12:25:00+09:00',
      reads: 7610,
      content: [
        { type: 'p', text: 'SORONG, OMBAR NEWS — Maskapai penerbangan menambah frekuensi rute Sorong–Waisai menjadi setiap jam. Langkah ini menjawab lonjakan permintaan tiket menuju Raja Ampat.' },
        { type: 'p', text: 'Pemerintah daerah menyambut positif dan berharap harga tiket turun seiring banyaknya pilihan jadwal.' }
      ]
    },
    {
      id: 'piaynemo-festival-matahari-terbenam',
      category: 'travel',
      tags: ['Piaynemo', 'Wisata', 'Festival'],
      title: 'Piaynemo Jadi Lokasi Festival Matahari Terbenam Pertama di Raja Ampat',
      excerpt: 'Kampung Pulau Piaynemo menggelar festival matahari terbenam perdana, memadukan wisata, musik, dan kuliner lokal di puncak berpemandangan laguna.',
      image: IMG + 'beach-piaynemo.jpg',
      author: 'Rina Mansim',
      publishedAt: '2026-01-02T17:00:00+09:00',
      reads: 8210,
      content: [
        { type: 'p', text: 'PIAYNEMO, OMBAR NEWS — Kampung Pulau Piaynemo menggelar festival matahari terbenam perdana. Acara memadukan wisata, musik akustik, dan kuliner lokal di puncak karang berpemandangan laguna.' },
        { type: 'p', text: 'Panitia menyebut festival menjadi cara baru menikmati Raja Ampat sambil memberi nilai ekonomi bagi warga kampung.' }
      ]
    },
    {
      id: 'tambrauw-ekowisata-hutan',
      category: 'papua-barat-daya',
      tags: ['Tambrauw', 'Ekowisata', 'Lingkungan'],
      title: 'Tambrauw Kembangkan Ekowisata Berbasis Hutan dan Burung Cendrawasih',
      excerpt: 'Kabupaten Tambrauw menargetkan ekowisata berbasis hutan sebagai pilar ekonomi baru, menjaga hutan sambil membuka lapangan kerja.',
      image: IMG + 'papuan-culture.jpg',
      author: 'Andreas Kambu',
      publishedAt: '2026-01-01T10:20:00+09:00',
      reads: 5920,
      content: [
        { type: 'p', text: 'TAMBRAUW, OMBAR NEWS — Kabupaten Tambrauw, Papua Barat Daya, mengembangkan ekowisata berbasis hutan sebagai pilar ekonomi baru. Fokusnya pada pengamatan burung cendrawasih dan treking hutan tropis.' },
        { type: 'p', text: 'Bupati menyebut model ini menjaga hutan sambil membuka lapangan kerja bagi masyarakat adat.' }
      ]
    },
    {
      id: 'jayapura-infrastruktur-jalan-tol-laut',
      category: 'papua',
      tags: ['Jayapura', 'Infrastruktur'],
      title: 'Jayapura Percepat Pembangunan Infrastruktur dan Jalan Tol Laut Papua',
      excerpt: 'Pemerintah mempercepat pembangunan jalan dan konektivitas laut di Papua untuk menurunkan biaya logistik dan membuka isolasi daerah.',
      image: IMG + 'waisai-town.jpg',
      author: 'Redaksi OMBAR',
      publishedAt: '2025-12-30T09:00:00+09:00',
      reads: 6840,
      content: [
        { type: 'p', text: 'JAYAPURA, OMBAR NEWS — Pemerintah mempercepat pembangunan jalan dan konektivitas laut di Papua. Tujuannya menurunkan biaya logistik dan membuka isolasi daerah.' },
        { type: 'p', text: 'Sejumlah ruas jalan trans-Papua dipercepat penyelesaiannya tahun ini.' }
      ]
    },
    {
      id: 'pilpres-2026-kampanye-damai',
      category: 'politics',
      tags: ['Pemilu', 'Demokrasi'],
      title: 'Kampanye Damai Jadi Tuntutan Utama Menjelang Pilkada Serentak 2026',
      excerpt: 'Komisi Pemilihan Umum menekankan kampanye damai dan bebas hoaks menjelang pemilihan kepala daerah serentak tahun ini.',
      image: IMG + 'waisai-town.jpg',
      author: 'Redaksi OMBAR',
      publishedAt: '2026-01-14T12:00:00+09:00',
      reads: 7230,
      content: [
        { type: 'p', text: 'JAKARTA, OMBAR NEWS — Komisi Pemilihan Umum menekankan kampanye damai dan bebas hoaks menjelang pemilihan kepala daerah serentak 2026.' },
        { type: 'p', text: 'KPU meminta seluruh pasangan calon dan pendukung menjaga etika berpolitik yang sehat.' }
      ]
    },
    {
      id: 'indonesia-anggaran-infrastruktur-2026',
      category: 'national',
      tags: ['APBN', 'Infrastruktur'],
      title: 'Pemerintah Alokasikan Anggaran Infrastruktur Papua Terbesar dalam APBN 2026',
      excerpt: 'Dalam APBN 2026, alokasi infrastruktur untuk Papua naik signifikan, menandai komitmen pemerataan pembangunan timur Indonesia.',
      image: IMG + 'hero-rajaampat.jpg',
      author: 'Redaksi OMBAR',
      publishedAt: '2026-01-13T15:30:00+09:00',
      reads: 6510,
      content: [
        { type: 'p', text: 'JAKARTA, OMBAR NEWS — Dalam APBN 2026, alokasi infrastruktur untuk Papua naik signifikan. Menkeu menyebut ini menandai komitmen pemerataan pembangunan timur Indonesia.' }
      ]
    },
    {
      id: 'parlemen-tinjau-uu-pemerintahan-daerah',
      category: 'politics',
      tags: ['Legislasi', 'Otonomi Daerah'],
      title: 'DPR Tinjau UU Pemerintahan Daerah, Otonomi Khusus Papua Jadi Sorotan',
      excerpt: 'Panitia khusus DPR memulai pembahasan revisi UU pemerintahan daerah dengan fokus pada penguatan otonomi khusus Papua.',
      image: IMG + 'boat-lagoon.jpg',
      author: 'Redaksi OMBAR',
      publishedAt: '2026-01-12T13:00:00+09:00',
      reads: 4870,
      content: [
        { type: 'p', text: 'JAKARTA, OMBAR NEWS — Panitia khusus DPR memulai pembahasan revisi UU pemerintahan daerah. Fokusnya penguatan otonomi khusus Papua.' }
      ]
    },
    {
      id: 'asean-kerja-sama-laut-biru',
      category: 'world',
      tags: ['ASEAN', 'Ekonomi Biru'],
      title: 'ASEAN Sepakati Kerja Sama Ekonomi Laut Biru Lindungi Laut Tengah',
      excerpt: 'Negara-negara ASEAN menyepakati kerja sama ekonomi laut biru untuk melindungi ekosistem laut sekaligus menggerakkan perekonomian.',
      image: IMG + 'coral-reef.jpg',
      author: 'Redaksi OMBAR',
      publishedAt: '2026-01-11T18:00:00+09:00',
      reads: 5340,
      content: [
        { type: 'p', text: 'JAKARTA, OMBAR NEWS — Negara-negara ASEAN menyepakati kerja sama ekonomi laut biru untuk melindungi ekosistem laut sekaligus menggerakkan perekonomian kawasan.' }
      ]
    }
  ];

  /* ---------------- DEFAULT ADMIN CREDENTIALS ---------------- */
  // NOTE: client-side only. For real security use a backend / auth provider.
  var DEFAULT_CREDENTIALS = { username: 'admin', password: 'ombar2026' };

  /* ---------------- STORAGE HELPERS ---------------- */
  function readStore() {
    try {
      var raw = localStorage.getItem(OMBAR_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }
  function writeStore(obj) {
    try { localStorage.setItem(OMBAR_KEY, JSON.stringify(obj)); return true; }
    catch (e) { return false; }
  }

  function deepClone(o) { return JSON.parse(JSON.stringify(o)); }
  function merge(base, override) {
    return Object.assign({}, base, override || {});
  }

  /* ---------------- PUBLIC API ---------------- */
  var store = readStore() || {};

  var OMBAR_DATA = {
    VERSION: 1,
    IMG: IMG,
    KEYS: { DATA: OMBAR_KEY, AUTH: OMBAR_AUTH_KEY, CRED: OMBAR_CRED_KEY },

    /* Categories */
    getCategories: function () {
      return deepClone(store.categories || DEFAULT_CATEGORIES);
    },
    saveCategories: function (cats) {
      store.categories = cats;
      writeStore(store);
    },

    /* Settings */
    getSettings: function () {
      return merge(DEFAULT_SETTINGS, store.settings || {});
    },
    saveSettings: function (settings) {
      store.settings = merge(DEFAULT_SETTINGS, settings || {});
      writeStore(store);
    },

    /* Breaking ticker (custom items) */
    getBreaking: function () {
      return deepClone(store.breaking && store.breaking.length ? store.breaking : DEFAULT_BREAKING);
    },
    saveBreaking: function (items) {
      store.breaking = items || [];
      writeStore(store);
    },

    /* Articles */
    getArticles: function () {
      return deepClone(store.articles || DEFAULT_ARTICLES);
    },
    getArticle: function (id) {
      var list = this.getArticles();
      for (var i = 0; i < list.length; i++) { if (list[i].id === id) return list[i]; }
      return null;
    },
    saveArticles: function (articles) {
      store.articles = articles || [];
      writeStore(store);
    },
    upsertArticle: function (article) {
      var list = this.getArticles();
      var idx = -1;
      for (var i = 0; i < list.length; i++) { if (list[i].id === article.id) { idx = i; break; } }
      if (idx >= 0) list[idx] = article; else list.unshift(article);
      this.saveArticles(list);
      return list;
    },
    deleteArticle: function (id) {
      var list = this.getArticles().filter(function (a) { return a.id !== id; });
      this.saveArticles(list);
      return list;
    },

    /* Defaults (for reset / reference) */
    defaults: function () {
      return {
        categories: deepClone(DEFAULT_CATEGORIES),
        settings: deepClone(DEFAULT_SETTINGS),
        breaking: deepClone(DEFAULT_BREAKING),
        articles: deepClone(DEFAULT_ARTICLES)
      };
    },

    /* Export / Import / Reset */
    exportJSON: function () {
      return JSON.stringify({
        version: 1,
        exportedAt: new Date().toISOString(),
        categories: this.getCategories(),
        settings: this.getSettings(),
        breaking: this.getBreaking(),
        articles: this.getArticles()
      }, null, 2);
    },
    importJSON: function (jsonStr) {
      var data;
      try { data = JSON.parse(jsonStr); }
      catch (e) { throw new Error('Format JSON tidak valid.'); }
      if (data.categories) this.saveCategories(data.categories);
      if (data.settings) this.saveSettings(data.settings);
      if (data.breaking) this.saveBreaking(data.breaking);
      if (data.articles) this.saveArticles(data.articles);
      store = readStore() || {};
      return true;
    },
    resetAll: function () {
      store = {};
      try { localStorage.removeItem(OMBAR_KEY); } catch (e) {}
    },

    /* Auth (client-side gate only — not real security) */
    getCredentials: function () {
      try {
        var raw = localStorage.getItem(OMBAR_CRED_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      return deepClone(DEFAULT_CREDENTIALS);
    },
    setCredentials: function (creds) {
      try { localStorage.setItem(OMBAR_CRED_KEY, JSON.stringify(creds)); } catch (e) {}
    },
    login: function (username, password) {
      var c = this.getCredentials();
      if (username === c.username && password === c.password) {
        try { sessionStorage.setItem(OMBAR_AUTH_KEY, JSON.stringify({ user: username, ts: Date.now() })); } catch (e) {}
        return true;
      }
      return false;
    },
    logout: function () {
      try { sessionStorage.removeItem(OMBAR_AUTH_KEY); } catch (e) {}
    },
    isLoggedIn: function () {
      try { return !!sessionStorage.getItem(OMBAR_AUTH_KEY); } catch (e) { return false; }
    },
    currentUser: function () {
      try {
        var raw = sessionStorage.getItem(OMBAR_AUTH_KEY);
        return raw ? JSON.parse(raw).user : null;
      } catch (e) { return null; }
    },

    /* Image library (existing themed images shipped with the site) */
    imageLibrary: function () {
      return [
        'images/hero-rajaampat.jpg',
        'images/wayag-viewpoint.jpg',
        'images/waisai-town.jpg',
        'images/coral-reef.jpg',
        'images/manta-ray.jpg',
        'images/papuan-culture.jpg',
        'images/beach-piaynemo.jpg',
        'images/local-village.jpg',
        'images/boat-lagoon.jpg'
      ];
    },

    /* Hosting-proof image resolver.
       Returns a base64 data URI if the image is in the embedded
       OMBAR_IMAGES_BASE64 map (loaded from images-data.js), else
       returns the original path. This guarantees images ALWAYS show
       even when the images/ folder wasn't uploaded to the hosting. */
    resolveImage: function (path) {
      if (!path) return '';
      if (/^(data:|https?:)?\/\//.test(path)) return path;
      var map = global.OMBAR_IMAGES_BASE64 || {};
      if (map[path]) return map[path];
      return path;
    },

    /* Auto-load published data from ombar-data.json (if it exists on the
       hosting). This makes articles posted via the admin dashboard
       available to ALL visitors — not just the admin's browser. The
       public site fetches the JSON once on load, then merges it with
       any localStorage overrides the current visitor may have.

       Returns a Promise that resolves when data is ready (immediately
       if no JSON file exists or fetch fails). */
    ready: null,
    loadPublished: function () {
      if (this.ready) return this.ready;
      this.ready = new Promise(function (resolve) {
        // Try to fetch the published JSON. Use a cache-busting query so
        // visitors always see the latest content after re-upload.
        var url = 'ombar-data.json?t=' + Date.now();
        fetch(url, { cache: 'no-store' })
          .then(function (r) { return r.ok ? r.json() : null; })
          .then(function (data) {
            if (data && data.articles) {
              // Published JSON becomes the new defaults. localStorage edits
              // (from this visitor's admin session) still win on top.
              publishedData = data;
            }
            resolve(true);
          })
          .catch(function () { resolve(true); }); // no JSON file → use defaults
      });
      return this.ready;
    },

  };

  // Published data placeholder — filled by loadPublished().
  var publishedData = null;

  // Re-point getArticles/getSettings/getCategories/getBreaking to use
  // publishedData (if loaded) as the base, with localStorage overrides.
  OMBAR_DATA.getArticles = function () {
    var base = (store.articles) ? store.articles
              : (publishedData && publishedData.articles) ? publishedData.articles
              : DEFAULT_ARTICLES;
    return deepClone(base);
  };
  OMBAR_DATA.getSettings = function () {
    var base = (store.settings) ? store.settings
              : (publishedData && publishedData.settings) ? publishedData.settings
              : DEFAULT_SETTINGS;
    return merge(DEFAULT_SETTINGS, base);
  };
  OMBAR_DATA.getCategories = function () {
    var base = (store.categories) ? store.categories
              : (publishedData && publishedData.categories) ? publishedData.categories
              : DEFAULT_CATEGORIES;
    return deepClone(base);
  };
  OMBAR_DATA.getBreaking = function () {
    var base = (store.breaking) ? store.breaking
              : (publishedData && publishedData.breaking) ? publishedData.breaking
              : DEFAULT_BREAKING;
    return deepClone(base);
  };

  global.OMBAR_DATA = OMBAR_DATA;
})(window);
