import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <MobileLayout showBottomNav={false}>
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-10 p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">Kebijakan Privasi</h1>
        </div>
      </div>

      <div className="p-4 space-y-6 text-sm text-foreground/90 leading-relaxed">
        <p className="text-muted-foreground text-xs">Terakhir diperbarui: 9 Maret 2026</p>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">1. Informasi yang Kami Kumpulkan</h2>
          <p>Kami mengumpulkan informasi yang Anda berikan secara langsung saat mendaftar dan menggunakan layanan kami, termasuk:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Nama lengkap, email, dan nomor telepon</li>
            <li>Informasi profil dan foto</li>
            <li>Riwayat konsultasi dan transaksi</li>
            <li>Pesan dan komunikasi dalam platform</li>
            <li>Data lokasi (jika diizinkan)</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">2. Penggunaan Informasi</h2>
          <p>Informasi Anda digunakan untuk:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Menyediakan dan meningkatkan layanan kami</li>
            <li>Memproses transaksi dan pembayaran</li>
            <li>Mengirim notifikasi terkait layanan</li>
            <li>Memverifikasi identitas pengacara</li>
            <li>Menyelesaikan sengketa dan memberikan dukungan</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">3. Perlindungan Data</h2>
          <p>Kami menerapkan langkah-langkah keamanan teknis dan organisasi untuk melindungi data pribadi Anda, termasuk enkripsi data, kontrol akses, dan audit keamanan berkala.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">4. Berbagi Informasi</h2>
          <p>Kami tidak menjual data pribadi Anda. Informasi hanya dibagikan kepada:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Pengacara yang terlibat dalam konsultasi Anda</li>
            <li>Penyedia layanan pembayaran</li>
            <li>Otoritas hukum jika diwajibkan oleh undang-undang</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">5. Kerahasiaan Konsultasi</h2>
          <p>Semua komunikasi antara klien dan pengacara dilindungi oleh kerahasiaan profesional. RanahHukum tidak mengakses isi konsultasi kecuali ada laporan pelanggaran atau diwajibkan oleh hukum.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">6. Penyimpanan Data</h2>
          <p>Data Anda disimpan selama akun Anda aktif atau selama diperlukan untuk menyediakan layanan. Anda dapat meminta penghapusan data dengan menghubungi tim kami.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">7. Hak Pengguna</h2>
          <p>Anda memiliki hak untuk:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Mengakses data pribadi yang kami simpan</li>
            <li>Memperbarui atau memperbaiki informasi Anda</li>
            <li>Meminta penghapusan data pribadi Anda</li>
            <li>Menarik persetujuan penggunaan data</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">8. Cookie & Teknologi Pelacakan</h2>
          <p>Kami menggunakan cookie dan teknologi serupa untuk meningkatkan pengalaman pengguna, menganalisis penggunaan platform, dan menyediakan fitur yang dipersonalisasi.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">9. Perubahan Kebijakan</h2>
          <p>Kebijakan privasi ini dapat diperbarui sewaktu-waktu. Kami akan memberitahukan perubahan signifikan melalui notifikasi dalam aplikasi.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">10. Kontak</h2>
          <p>Untuk pertanyaan tentang kebijakan privasi ini atau permintaan terkait data pribadi Anda, silakan hubungi kami melalui fitur bantuan di dalam aplikasi.</p>
        </section>
      </div>
    </MobileLayout>
  );
}
