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
  },
];
