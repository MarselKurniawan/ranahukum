export interface Lawyer {
  id: string;
  name: string;
  photo: string;
  specializations: string[];
  rating: number;
  totalConsultations: number;
  price: number;
  isOnline: boolean;
  responseTime: string;
  bio: string;
  experience: number;
  education: string;
  licenseNumber: string;
  location: {
    city: string;
    province: string;
  };
  pendampinganPrice?: number;
  isVerified: boolean;
}

export const specializations = [
  "Semua",
  "Perceraian",
  "Pertanahan",
  "Pidana",
  "Perdata",
  "Bisnis",
  "Ketenagakerjaan",
  "Waris",
  "Kontrak",
  "Pajak",
];

export const mockLawyers: Lawyer[] = [
  {
    id: "1",
    name: "Dr. Ahmad Fauzi, S.H., M.H.",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    specializations: ["Perceraian", "Waris", "Perdata"],
    rating: 4.9,
    totalConsultations: 1250,
    price: 150000,
    isOnline: true,
    responseTime: "< 5 menit",
    bio: "Pengacara berpengalaman dengan fokus pada hukum keluarga dan waris. Telah menangani lebih dari 500 kasus perceraian dengan tingkat keberhasilan tinggi.",
    experience: 15,
    education: "Universitas Indonesia",
    licenseNumber: "12345/ADV/2010",
    location: { city: "Jakarta Selatan", province: "DKI Jakarta" },
    pendampinganPrice: 5000000,
    isVerified: true,
  },
  {
    id: "2",
    name: "Sarah Wijaya, S.H., LL.M.",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face",
    specializations: ["Pertanahan", "Kontrak", "Bisnis"],
    rating: 4.8,
    totalConsultations: 890,
    price: 175000,
    isOnline: true,
    responseTime: "< 10 menit",
    bio: "Spesialis hukum properti dan kontrak bisnis. Lulusan terbaik dari program LLM di Belanda.",
    experience: 10,
    education: "Leiden University",
    licenseNumber: "23456/ADV/2014",
    location: { city: "Bandung", province: "Jawa Barat" },
    pendampinganPrice: 7500000,
    isVerified: true,
  },
  {
    id: "3",
    name: "Budi Santoso, S.H., M.Kn.",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    specializations: ["Pidana", "Perdata"],
    rating: 4.7,
    totalConsultations: 2100,
    price: 200000,
    isOnline: false,
    responseTime: "< 30 menit",
    bio: "Mantan jaksa dengan pengalaman 20 tahun di bidang hukum pidana. Ahli dalam pembelaan kasus-kasus kompleks.",
    experience: 20,
    education: "Universitas Gadjah Mada",
    licenseNumber: "34567/ADV/2005",
    location: { city: "Yogyakarta", province: "DI Yogyakarta" },
    pendampinganPrice: 10000000,
    isVerified: true,
  },
  {
    id: "4",
    name: "Dewi Lestari, S.H.",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face",
    specializations: ["Ketenagakerjaan", "Bisnis", "Kontrak"],
    rating: 4.9,
    totalConsultations: 650,
    price: 125000,
    isOnline: true,
    responseTime: "< 5 menit",
    bio: "Konsultan hukum ketenagakerjaan untuk berbagai perusahaan multinasional. Aktif memberikan pelatihan HR legal.",
    experience: 8,
    education: "Universitas Airlangga",
    licenseNumber: "45678/ADV/2016",
    location: { city: "Surabaya", province: "Jawa Timur" },
    pendampinganPrice: 4500000,
    isVerified: false,
  },
  {
    id: "5",
    name: "Ricky Hadinata, S.H., M.H.",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face",
    specializations: ["Pajak", "Bisnis", "Kontrak"],
    rating: 4.6,
    totalConsultations: 420,
    price: 250000,
    isOnline: false,
    responseTime: "< 1 jam",
    bio: "Ahli hukum perpajakan dengan sertifikasi konsultan pajak. Berpengalaman menangani sengketa pajak di pengadilan.",
    experience: 12,
    education: "Universitas Padjajaran",
    licenseNumber: "56789/ADV/2012",
    location: { city: "Semarang", province: "Jawa Tengah" },
    pendampinganPrice: 8000000,
    isVerified: true,
  },
  {
    id: "6",
    name: "Maria Gonzales, S.H.",
    photo: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=200&h=200&fit=crop&crop=face",
    specializations: ["Perceraian", "Waris", "Perdata"],
    rating: 4.8,
    totalConsultations: 780,
    price: 140000,
    isOnline: true,
    responseTime: "< 5 menit",
    bio: "Pengacara keluarga dengan pendekatan mediasi. Mengutamakan penyelesaian damai untuk kepentingan anak.",
    experience: 9,
    education: "Universitas Katolik Parahyangan",
    licenseNumber: "67890/ADV/2015",
    location: { city: "Denpasar", province: "Bali" },
    pendampinganPrice: 6000000,
    isVerified: false,
  },
];

// Law categories for AI Assistant
export const lawCategories = [
  { id: "perdata", name: "Hukum Perdata", icon: "📋", description: "Perjanjian, wanprestasi, ganti rugi" },
  { id: "pidana", name: "Hukum Pidana", icon: "⚖️", description: "Tindak pidana, pembelaan, pelaporan" },
  { id: "keluarga", name: "Hukum Keluarga", icon: "👨‍👩‍👧", description: "Perceraian, waris, hak asuh" },
  { id: "pertanahan", name: "Hukum Pertanahan", icon: "🏠", description: "Sertifikat, sengketa tanah, jual beli" },
  { id: "ketenagakerjaan", name: "Hukum Ketenagakerjaan", icon: "💼", description: "PHK, kontrak kerja, upah" },
  { id: "bisnis", name: "Hukum Bisnis", icon: "🏢", description: "Kontrak, pendirian PT, perizinan" },
];

export const faqByCategory: Record<string, { question: string; answer: string }[]> = {
  perdata: [
    { question: "Apa itu wanprestasi?", answer: "Wanprestasi adalah ingkar janji atau tidak dipenuhinya prestasi dalam suatu perjanjian. Terdapat 4 bentuk: tidak melakukan apa yang dijanjikan, melaksanakan tapi tidak sesuai, terlambat melaksanakan, atau melakukan yang dilarang." },
    { question: "Bagaimana cara menggugat ganti rugi?", answer: "Gugatan ganti rugi diajukan ke Pengadilan Negeri dengan menyertakan bukti kerugian materiil/imateriil, bukti hubungan sebab-akibat, dan identitas para pihak." },
    { question: "Apa perbedaan perjanjian dan perikatan?", answer: "Perikatan adalah hubungan hukum antara dua pihak yang satu menuntut prestasi dari pihak lain. Perjanjian adalah salah satu sumber perikatan (selain undang-undang). Semua perjanjian adalah perikatan, tapi tidak semua perikatan berasal dari perjanjian." },
    { question: "Berapa lama batas waktu menggugat perdata?", answer: "Batas waktu (daluwarsa) gugatan perdata umumnya 30 tahun (Pasal 1967 KUHPerdata). Namun untuk kasus tertentu seperti wanprestasi jual beli 2 tahun, sewa menyewa 5 tahun." },
    { question: "Apa itu somasi?", answer: "Somasi adalah teguran/peringatan tertulis dari kreditur kepada debitur agar memenuhi kewajibannya. Somasi penting sebagai bukti bahwa debitur telah diperingatkan sebelum gugatan diajukan." },
  ],
  pidana: [
    { question: "Bagaimana cara membuat laporan polisi?", answer: "Datang ke kantor polisi terdekat, bawa KTP, bukti/kronologi kejadian. Laporan akan dicatat dan Anda mendapat Surat Tanda Penerimaan Laporan (STPL)." },
    { question: "Apa hak tersangka dalam proses hukum?", answer: "Tersangka berhak mendapat pendampingan pengacara, diberitahu tentang tuduhan, tidak disiksa, dikunjungi keluarga, dan diadili secara terbuka." },
    { question: "Apa bedanya laporan dan pengaduan?", answer: "Laporan: memberitahukan bahwa terjadi tindak pidana, bisa oleh siapa saja. Pengaduan: pemberitahuan disertai permintaan untuk menindak, hanya oleh korban untuk delik aduan (seperti pencemaran nama baik, KDRT ringan)." },
    { question: "Berapa lama proses penyidikan?", answer: "Untuk tersangka yang ditahan: maksimal 60 hari (20 hari + 40 hari perpanjangan). Jika tidak ditahan, tidak ada batasan waktu, tapi penyidik wajib memberikan SP2HP (Surat Pemberitahuan Perkembangan Hasil Penyidikan)." },
    { question: "Apa itu penangguhan penahanan?", answer: "Permohonan agar tersangka/terdakwa tidak ditahan dengan jaminan uang atau orang. Syarat: tidak akan melarikan diri, menghilangkan barang bukti, atau mengulangi tindak pidana." },
    { question: "Bagaimana cara mencabut laporan polisi?", answer: "Untuk delik aduan, pengaduan bisa dicabut dalam 3 bulan setelah pengaduan. Untuk delik biasa, laporan tidak bisa dicabut karena negara yang menuntut. Namun, perdamaian bisa menjadi pertimbangan." },
  ],
  keluarga: [
    { question: "Bagaimana proses perceraian?", answer: "Gugatan diajukan ke Pengadilan Agama (Islam) atau Pengadilan Negeri. Proses meliputi mediasi, sidang, dan putusan. Dokumen: surat nikah, KTP, KK, bukti alasan cerai." },
    { question: "Bagaimana pembagian harta gono-gini?", answer: "Harta yang diperoleh selama pernikahan dibagi rata (50:50), kecuali ada perjanjian pranikah atau kesepakatan lain yang disahkan pengadilan." },
    { question: "Bagaimana prosedur pembagian warisan?", answer: "Untuk Muslim: sesuai hukum waris Islam (faraidh). Non-Muslim: KUHPerdata. Buat akta keterangan waris di notaris, lalu balik nama aset." },
    { question: "Siapa yang berhak atas hak asuh anak?", answer: "Anak di bawah 12 tahun biasanya ikut ibu (hadhanah). Pertimbangan utama: kepentingan terbaik anak, kemampuan finansial, lingkungan, dan perilaku orang tua." },
    { question: "Apa itu perjanjian pranikah?", answer: "Perjanjian tertulis sebelum pernikahan tentang pemisahan harta, disahkan notaris dan dicatatkan di KUA/Catatan Sipil. Bisa dibuat setelah menikah dengan penetapan pengadilan." },
    { question: "Bagaimana cara mengurus akta kelahiran?", answer: "Ke Disdukcapil dengan membawa: surat keterangan lahir dari RS/bidan, buku nikah orang tua, KK dan KTP orang tua, 2 saksi. Gratis jika dalam 60 hari sejak kelahiran." },
  ],
  pertanahan: [
    { question: "Dokumen apa untuk sengketa tanah?", answer: "Sertifikat tanah (SHM/SHGB), bukti PBB, akta jual beli, surat ukur, IMB (jika ada bangunan), dan riwayat kepemilikan." },
    { question: "Bagaimana cara balik nama sertifikat?", answer: "Ajukan ke BPN dengan akta jual beli dari PPAT, KTP penjual-pembeli, sertifikat asli, bukti PBB, dan izin peralihan (jika diperlukan)." },
    { question: "Apa perbedaan SHM dan SHGB?", answer: "SHM (Sertifikat Hak Milik): hak terkuat, turun temurun, tanpa batas waktu. SHGB (Sertifikat Hak Guna Bangunan): hak untuk mendirikan bangunan di atas tanah bukan miliknya, jangka waktu 30 tahun, dapat diperpanjang." },
    { question: "Bagaimana jika sertifikat ganda?", answer: "Ajukan pembatalan ke BPN atau gugatan ke PTUN (jika sertifikat diterbitkan pejabat TUN). Siapkan bukti kepemilikan terdahulu, riwayat tanah, dan saksi-saksi." },
    { question: "Apa itu PPJB dan kapan digunakan?", answer: "PPJB (Perjanjian Pengikatan Jual Beli) adalah perjanjian pendahuluan sebelum AJB. Digunakan saat pembayaran belum lunas atau sertifikat sedang dalam proses." },
  ],
  ketenagakerjaan: [
    { question: "Apa hak karyawan jika di-PHK?", answer: "Hak: uang pesangon (berdasarkan masa kerja), uang penghargaan masa kerja, uang penggantian hak (cuti, ongkos pulang). Besaran diatur UU Cipta Kerja." },
    { question: "Bagaimana jika tidak dibayar upah?", answer: "Laporkan ke Disnaker setempat, bisa juga menggugat ke PHI (Pengadilan Hubungan Industrial). Simpan bukti kontrak dan slip gaji." },
    { question: "Berapa lama masa percobaan kerja?", answer: "Maksimal 3 bulan untuk PKWTT (karyawan tetap). PKWT (kontrak) tidak boleh ada masa percobaan. Jika ada, maka hubungan kerja otomatis PKWTT." },
    { question: "Apa itu PKWT dan PKWTT?", answer: "PKWT: Perjanjian Kerja Waktu Tertentu (kontrak), maksimal 5 tahun total. PKWTT: Perjanjian Kerja Waktu Tidak Tertentu (tetap), berlaku sampai pensiun atau PHK." },
    { question: "Bagaimana aturan lembur?", answer: "Lembur maksimal 4 jam/hari dan 18 jam/minggu. Upah lembur: jam pertama 1,5x upah per jam, jam berikutnya 2x. Hari libur: 2x upah per jam untuk 8 jam pertama." },
    { question: "Apa saja jenis cuti yang menjadi hak karyawan?", answer: "Cuti tahunan: 12 hari (setelah 1 tahun kerja). Cuti sakit, cuti melahirkan (3 bulan), cuti haid, cuti penting (pernikahan, kematian keluarga). Rincian ada di UU Ketenagakerjaan dan peraturan perusahaan." },
  ],
  bisnis: [
    { question: "Bagaimana mendirikan PT?", answer: "Buat akta pendirian di notaris, daftarkan ke Kemenkumham via AHU Online, urus NIB di OSS, lalu TDP dan izin usaha lainnya." },
    { question: "Apa yang harus ada dalam kontrak bisnis?", answer: "Identitas pihak, objek perjanjian, hak & kewajiban, jangka waktu, force majeure, penyelesaian sengketa, dan tanda tangan bermaterai." },
    { question: "Apa itu NIB dan bagaimana cara mendapatkannya?", answer: "NIB (Nomor Induk Berusaha) adalah identitas pelaku usaha. Diperoleh melalui sistem OSS (Online Single Submission) di oss.go.id dengan login menggunakan akun OSS." },
    { question: "Apa perbedaan PT dan CV?", answer: "PT: badan hukum, tanggung jawab terbatas pada modal, minimal 2 pemegang saham. CV: bukan badan hukum, sekutu aktif tanggung jawab penuh, sekutu pasif terbatas pada modal." },
    { question: "Bagaimana cara mendaftarkan merek dagang?", answer: "Daftar ke DJKI Kemenkumham melalui merek.dgip.go.id. Biaya mulai Rp500.000 (UKM online). Proses sekitar 6-12 bulan jika tidak ada keberatan." },
    { question: "Apa itu due diligence dalam akuisisi perusahaan?", answer: "Proses investigasi menyeluruh terhadap perusahaan target meliputi aspek hukum, keuangan, operasional, dan pajak sebelum transaksi untuk mengidentifikasi risiko dan nilai sebenarnya." },
  ],
};
