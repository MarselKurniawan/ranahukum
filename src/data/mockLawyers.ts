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
  ],
  pidana: [
    { question: "Bagaimana cara membuat laporan polisi?", answer: "Datang ke kantor polisi terdekat, bawa KTP, bukti/kronologi kejadian. Laporan akan dicatat dan Anda mendapat Surat Tanda Penerimaan Laporan (STPL)." },
    { question: "Apa hak tersangka dalam proses hukum?", answer: "Tersangka berhak mendapat pendampingan pengacara, diberitahu tentang tuduhan, tidak disiksa, dikunjungi keluarga, dan diadili secara terbuka." },
  ],
  keluarga: [
    { question: "Bagaimana proses perceraian?", answer: "Gugatan diajukan ke Pengadilan Agama (Islam) atau Pengadilan Negeri. Proses meliputi mediasi, sidang, dan putusan. Dokumen: surat nikah, KTP, KK, bukti alasan cerai." },
    { question: "Bagaimana pembagian harta gono-gini?", answer: "Harta yang diperoleh selama pernikahan dibagi rata (50:50), kecuali ada perjanjian pranikah atau kesepakatan lain yang disahkan pengadilan." },
    { question: "Bagaimana prosedur pembagian warisan?", answer: "Untuk Muslim: sesuai hukum waris Islam (faraidh). Non-Muslim: KUHPerdata. Buat akta keterangan waris di notaris, lalu balik nama aset." },
  ],
  pertanahan: [
    { question: "Dokumen apa untuk sengketa tanah?", answer: "Sertifikat tanah (SHM/SHGB), bukti PBB, akta jual beli, surat ukur, IMB (jika ada bangunan), dan riwayat kepemilikan." },
    { question: "Bagaimana cara balik nama sertifikat?", answer: "Ajukan ke BPN dengan akta jual beli dari PPAT, KTP penjual-pembeli, sertifikat asli, bukti PBB, dan izin peralihan (jika diperlukan)." },
  ],
  ketenagakerjaan: [
    { question: "Apa hak karyawan jika di-PHK?", answer: "Hak: uang pesangon (berdasarkan masa kerja), uang penghargaan masa kerja, uang penggantian hak (cuti, ongkos pulang). Besaran diatur UU Cipta Kerja." },
    { question: "Bagaimana jika tidak dibayar upah?", answer: "Laporkan ke Disnaker setempat, bisa juga menggugat ke PHI (Pengadilan Hubungan Industrial). Simpan bukti kontrak dan slip gaji." },
  ],
  bisnis: [
    { question: "Bagaimana mendirikan PT?", answer: "Buat akta pendirian di notaris, daftarkan ke Kemenkumham via AHU Online, urus NIB di OSS, lalu TDP dan izin usaha lainnya." },
    { question: "Apa yang harus ada dalam kontrak bisnis?", answer: "Identitas pihak, objek perjanjian, hak & kewajiban, jangka waktu, force majeure, penyelesaian sengketa, dan tanda tangan bermaterai." },
  ],
};
