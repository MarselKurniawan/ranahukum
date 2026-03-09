import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, MessageCircle, Shield, Gavel, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const slides = [
  {
    icon: Scale,
    title: "Selamat Datang di RanahHukum",
    description: "Platform konsultasi hukum terpercaya yang menghubungkan Anda dengan pengacara berlisensi secara mudah dan cepat.",
    color: "from-primary to-blue-600",
  },
  {
    icon: MessageCircle,
    title: "Konsultasi Fleksibel",
    description: "Chat, voice call, atau tatap muka — pilih cara konsultasi yang paling nyaman untuk Anda. Tersedia 24/7.",
    color: "from-accent to-emerald-600",
  },
  {
    icon: Shield,
    title: "Pengacara Terverifikasi",
    description: "Semua pengacara telah melalui proses verifikasi ketat termasuk pengecekan lisensi dan kualifikasi profesional.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Gavel,
    title: "Pendampingan Hukum",
    description: "Butuh lebih dari konsultasi? Dapatkan pendampingan hukum lengkap dari pengacara pilihan Anda.",
    color: "from-violet-500 to-purple-600",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  const handleNext = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = () => {
    localStorage.setItem("ranahhukum_onboarding_done", "true");
    navigate("/", { replace: true });
  };

  const slide = slides[current];
  const Icon = slide.icon;
  const isLast = current === slides.length - 1;

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Skip button */}
      <div className="flex justify-end p-4">
        {!isLast && (
          <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground">
            Lewati
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${slide.color} flex items-center justify-center mb-8 shadow-lg`}>
          <Icon className="w-14 h-14 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-3 text-foreground">{slide.title}</h1>
        <p className="text-muted-foreground leading-relaxed text-sm max-w-xs">{slide.description}</p>
      </div>

      {/* Dots & Button */}
      <div className="px-8 pb-12 space-y-6">
        {/* Dots */}
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        <Button
          variant="gradient"
          size="lg"
          className="w-full"
          onClick={handleNext}
        >
          {isLast ? "Mulai Sekarang" : "Lanjut"}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
