import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <MobileLayout showBottomNav={false}>
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-10 p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">Syarat & Ketentuan</h1>
        </div>
      </div>

      <div className="p-4 space-y-6 text-sm text-foreground/90 leading-relaxed">
        <p className="text-muted-foreground text-xs">Terakhir diperbarui: 9 Maret 2026</p>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">1. Penerimaan Syarat</h2>
          <p>Dengan mengakses dan menggunakan platform RanahHukum, Anda menyetujui untuk terikat oleh syarat dan ketentuan ini. Jika Anda tidak menyetujui salah satu ketentuan, mohon untuk tidak menggunakan layanan kami.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">2. Deskripsi Layanan</h2>
          <p>RanahHukum adalah platform marketplace yang menghubungkan klien dengan pengacara berlisensi untuk konsultasi hukum. Layanan kami meliputi:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Konsultasi hukum via chat dan voice call</li>
            <li>Pendampingan hukum</li>
            <li>Konsultasi tatap muka</li>
            <li>Asisten hukum berbasis AI</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">3. Pendaftaran Akun</h2>
          <p>Untuk menggunakan layanan, Anda harus membuat akun dengan memberikan informasi yang akurat dan lengkap. Anda bertanggung jawab untuk menjaga kerahasiaan kredensial akun Anda.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">4. Pengacara & Verifikasi</h2>
          <p>Semua pengacara di platform kami melalui proses verifikasi termasuk pengecekan lisensi, sertifikasi, dan kualifikasi profesional. Namun, RanahHukum tidak menjamin hasil dari setiap konsultasi hukum.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">5. Pembayaran</h2>
          <p>Tarif konsultasi ditentukan oleh masing-masing pengacara dan tercantum di profil mereka. Pembayaran harus dilakukan sebelum konsultasi dimulai. Kebijakan pengembalian dana mengacu pada ketentuan pembatalan yang berlaku.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">6. Pembatalan & Refund</h2>
          <p>Klien dapat membatalkan konsultasi sebelum sesi dimulai. Refund akan diproses sesuai dengan kebijakan pembatalan yang berlaku. Konsultasi yang sudah dimulai tidak dapat dibatalkan.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">7. Kerahasiaan</h2>
          <p>Semua komunikasi antara klien dan pengacara bersifat rahasia. RanahHukum tidak akan mengungkapkan informasi konsultasi kepada pihak ketiga tanpa persetujuan Anda, kecuali diwajibkan oleh hukum.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">8. Batasan Tanggung Jawab</h2>
          <p>RanahHukum bertindak sebagai perantara dan tidak bertanggung jawab atas nasihat hukum yang diberikan oleh pengacara. Keputusan untuk mengikuti nasihat hukum sepenuhnya menjadi tanggung jawab klien.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">9. Pelanggaran & Sanksi</h2>
          <p>RanahHukum berhak menangguhkan atau menghapus akun yang melanggar syarat dan ketentuan ini, termasuk namun tidak terbatas pada penyalahgunaan platform, penipuan, atau perilaku tidak profesional.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">10. Perubahan Ketentuan</h2>
          <p>RanahHukum berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diberitahukan melalui platform dan berlaku efektif setelah dipublikasikan.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">11. Kontak</h2>
          <p>Jika Anda memiliki pertanyaan tentang syarat dan ketentuan ini, silakan hubungi kami melalui fitur bantuan di dalam aplikasi.</p>
        </section>
      </div>
    </MobileLayout>
  );
}
