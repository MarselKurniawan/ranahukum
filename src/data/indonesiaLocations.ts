// Data kota dan kecamatan Indonesia
// Format: { city: string, districts: string[] }

export interface IndonesiaLocation {
  city: string;
  districts: string[];
}

export const INDONESIA_LOCATIONS: IndonesiaLocation[] = [
  {
    city: "Jakarta Pusat",
    districts: ["Cempaka Putih", "Gambir", "Johar Baru", "Kemayoran", "Menteng", "Sawah Besar", "Senen", "Tanah Abang"]
  },
  {
    city: "Jakarta Utara",
    districts: ["Cilincing", "Kelapa Gading", "Koja", "Pademangan", "Penjaringan", "Tanjung Priok"]
  },
  {
    city: "Jakarta Barat",
    districts: ["Cengkareng", "Grogol Petamburan", "Kalideres", "Kebon Jeruk", "Kembangan", "Palmerah", "Taman Sari", "Tambora"]
  },
  {
    city: "Jakarta Selatan",
    districts: ["Cilandak", "Jagakarsa", "Kebayoran Baru", "Kebayoran Lama", "Mampang Prapatan", "Pancoran", "Pasar Minggu", "Pesanggrahan", "Setiabudi", "Tebet"]
  },
  {
    city: "Jakarta Timur",
    districts: ["Cakung", "Cipayung", "Ciracas", "Duren Sawit", "Jatinegara", "Kramat Jati", "Makasar", "Matraman", "Pasar Rebo", "Pulo Gadung"]
  },
  {
    city: "Bandung",
    districts: ["Andir", "Antapani", "Arcamanik", "Astana Anyar", "Babakan Ciparay", "Bandung Kidul", "Bandung Kulon", "Bandung Wetan", "Batununggal", "Bojongloa Kaler", "Bojongloa Kidul", "Buahbatu", "Cibeunying Kaler", "Cibeunying Kidul", "Cibiru", "Cicendo", "Cidadap", "Cinambo", "Coblong", "Gedebage", "Kiaracondong", "Lengkong", "Mandalajati", "Panyileukan", "Rancasari", "Regol", "Sukajadi", "Sukasari", "Sumur Bandung", "Ujungberung"]
  },
  {
    city: "Surabaya",
    districts: ["Asemrowo", "Benowo", "Bubutan", "Bulak", "Dukuh Pakis", "Gayungan", "Genteng", "Gubeng", "Gunung Anyar", "Jambangan", "Karang Pilang", "Kenjeran", "Krembangan", "Lakarsantri", "Mulyorejo", "Pabean Cantikan", "Pakal", "Rungkut", "Sambikerep", "Sawahan", "Semampir", "Simokerto", "Sukolilo", "Sukomanunggal", "Tambaksari", "Tandes", "Tegalsari", "Tenggilis Mejoyo", "Wiyung", "Wonocolo", "Wonokromo"]
  },
  {
    city: "Semarang",
    districts: ["Banyumanik", "Candisari", "Gajahmungkur", "Gayamsari", "Genuk", "Gunungpati", "Mijen", "Ngaliyan", "Pedurungan", "Semarang Barat", "Semarang Selatan", "Semarang Tengah", "Semarang Timur", "Semarang Utara", "Tembalang", "Tugu"]
  },
  {
    city: "Yogyakarta",
    districts: ["Danurejan", "Gedongtengen", "Gondokusuman", "Gondomanan", "Jetis", "Kotagede", "Kraton", "Mantrijeron", "Mergangsan", "Ngampilan", "Pakualaman", "Tegalrejo", "Umbulharjo", "Wirobrajan"]
  },
  {
    city: "Medan",
    districts: ["Medan Amplas", "Medan Area", "Medan Barat", "Medan Baru", "Medan Belawan", "Medan Deli", "Medan Denai", "Medan Helvetia", "Medan Johor", "Medan Kota", "Medan Labuhan", "Medan Maimun", "Medan Marelan", "Medan Perjuangan", "Medan Petisah", "Medan Polonia", "Medan Selayang", "Medan Sunggal", "Medan Tembung", "Medan Timur", "Medan Tuntungan"]
  },
  {
    city: "Makassar",
    districts: ["Biringkanaya", "Bontoala", "Kepulauan Sangkarrang", "Makassar", "Mamajang", "Manggala", "Mariso", "Panakkukang", "Rappocini", "Tallo", "Tamalanrea", "Tamalate", "Ujung Pandang", "Ujung Tanah", "Wajo"]
  },
  {
    city: "Palembang",
    districts: ["Alang-Alang Lebar", "Bukit Kecil", "Gandus", "Ilir Barat I", "Ilir Barat II", "Ilir Timur I", "Ilir Timur II", "Ilir Timur III", "Jakabaring", "Kalidoni", "Kemuning", "Kertapati", "Plaju", "Sako", "Seberang Ulu I", "Seberang Ulu II", "Sematang Borang", "Sukarami"]
  },
  {
    city: "Denpasar",
    districts: ["Denpasar Barat", "Denpasar Selatan", "Denpasar Timur", "Denpasar Utara"]
  },
  {
    city: "Tangerang",
    districts: ["Batuceper", "Benda", "Cibodas", "Ciledug", "Cipondoh", "Jatiuwung", "Karang Tengah", "Karawaci", "Larangan", "Neglasari", "Periuk", "Pinang", "Tangerang"]
  },
  {
    city: "Tangerang Selatan",
    districts: ["Ciputat", "Ciputat Timur", "Pamulang", "Pondok Aren", "Serpong", "Serpong Utara", "Setu"]
  },
  {
    city: "Bekasi",
    districts: ["Bantar Gebang", "Bekasi Barat", "Bekasi Selatan", "Bekasi Timur", "Bekasi Utara", "Jatiasih", "Jatisampurna", "Medan Satria", "Mustika Jaya", "Pondok Gede", "Pondok Melati", "Rawalumbu"]
  },
  {
    city: "Depok",
    districts: ["Beji", "Bojongsari", "Cilodong", "Cimanggis", "Cinere", "Cipayung", "Limo", "Pancoran Mas", "Sawangan", "Sukmajaya", "Tapos"]
  },
  {
    city: "Bogor",
    districts: ["Bogor Barat", "Bogor Selatan", "Bogor Tengah", "Bogor Timur", "Bogor Utara", "Tanah Sareal"]
  },
  {
    city: "Malang",
    districts: ["Blimbing", "Kedungkandang", "Klojen", "Lowokwaru", "Sukun"]
  },
  {
    city: "Batam",
    districts: ["Batam Kota", "Batu Aji", "Batu Ampar", "Belakang Padang", "Bengkong", "Bulang", "Galang", "Lubuk Baja", "Nongsa", "Sagulung", "Sei Beduk", "Sekupang"]
  },
  {
    city: "Pekanbaru",
    districts: ["Bukit Raya", "Lima Puluh", "Marpoyan Damai", "Payung Sekaki", "Pekanbaru Kota", "Rumbai", "Rumbai Pesisir", "Sail", "Senapelan", "Sukajadi", "Tampan", "Tenayan Raya"]
  },
  {
    city: "Padang",
    districts: ["Bungus Teluk Kabung", "Koto Tangah", "Kuranji", "Lubuk Begalung", "Lubuk Kilangan", "Nanggalo", "Padang Barat", "Padang Selatan", "Padang Timur", "Padang Utara", "Pauh"]
  },
  {
    city: "Bandar Lampung",
    districts: ["Bumi Waras", "Enggal", "Kedamaian", "Kedaton", "Kemiling", "Labuhan Ratu", "Langkapura", "Panjang", "Rajabasa", "Sukabumi", "Sukarame", "Tanjung Karang Barat", "Tanjung Karang Pusat", "Tanjung Karang Timur", "Tanjung Senang", "Teluk Betung Barat", "Teluk Betung Selatan", "Teluk Betung Timur", "Teluk Betung Utara", "Way Halim"]
  },
  {
    city: "Balikpapan",
    districts: ["Balikpapan Barat", "Balikpapan Kota", "Balikpapan Selatan", "Balikpapan Tengah", "Balikpapan Timur", "Balikpapan Utara"]
  },
  {
    city: "Samarinda",
    districts: ["Loa Janan Ilir", "Palaran", "Samarinda Ilir", "Samarinda Kota", "Samarinda Seberang", "Samarinda Ulu", "Samarinda Utara", "Sambutan", "Sungai Kunjang", "Sungai Pinang"]
  },
  {
    city: "Pontianak",
    districts: ["Pontianak Barat", "Pontianak Kota", "Pontianak Selatan", "Pontianak Tenggara", "Pontianak Timur", "Pontianak Utara"]
  },
  {
    city: "Banjarmasin",
    districts: ["Banjarmasin Barat", "Banjarmasin Selatan", "Banjarmasin Tengah", "Banjarmasin Timur", "Banjarmasin Utara"]
  },
  {
    city: "Manado",
    districts: ["Bunaken", "Bunaken Kepulauan", "Malalayang", "Mapanget", "Paal 2", "Sario", "Singkil", "Tikala", "Tuminting", "Wanea", "Wenang"]
  },
  {
    city: "Kendari",
    districts: ["Abeli", "Baruga", "Kambu", "Kadia", "Kendari", "Kendari Barat", "Mandonga", "Nambo", "Poasia", "Puuwatu", "Wua-Wua"]
  },
  {
    city: "Ambon",
    districts: ["Baguala", "Leitimur Selatan", "Nusaniwe", "Sirimau", "Teluk Ambon"]
  },
  {
    city: "Jayapura",
    districts: ["Abepura", "Heram", "Jayapura Selatan", "Jayapura Utara", "Muara Tami"]
  },
  {
    city: "Kupang",
    districts: ["Alak", "Kelapa Lima", "Kota Lama", "Kota Raja", "Maulafa", "Oebobo"]
  },
  {
    city: "Mataram",
    districts: ["Ampenan", "Cakranegara", "Mataram", "Sandubaya", "Sekarbela", "Selaparang"]
  },
  {
    city: "Solo (Surakarta)",
    districts: ["Banjarsari", "Jebres", "Laweyan", "Pasar Kliwon", "Serengan"]
  },
  {
    city: "Cirebon",
    districts: ["Harjamukti", "Kejaksan", "Kesambi", "Lemahwungkuk", "Pekalipan"]
  },
  {
    city: "Tasikmalaya",
    districts: ["Bungursari", "Cibeureum", "Cihideung", "Cipedes", "Indihiang", "Kawalu", "Mangkubumi", "Purbaratu", "Tamansari", "Tawang"]
  },
  {
    city: "Serang",
    districts: ["Cipocok Jaya", "Curug", "Kasemen", "Serang", "Taktakan", "Walantaka"]
  },
  {
    city: "Cilegon",
    districts: ["Cibeber", "Cilegon", "Citangkil", "Ciwandan", "Gerogol", "Jombang", "Pulomerak", "Purwakarta"]
  }
];

// Get list of all cities
export function getCities(): string[] {
  return INDONESIA_LOCATIONS.map(loc => loc.city).sort();
}

// Get districts for a given city
export function getDistrictsByCity(city: string): string[] {
  const location = INDONESIA_LOCATIONS.find(loc => loc.city === city);
  return location ? location.districts.sort() : [];
}
