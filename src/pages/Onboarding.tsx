import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Camera, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import welcomeImg from "@/assets/onboarding-welcome.png";
import consultImg from "@/assets/onboarding-consult.png";
import verifiedImg from "@/assets/onboarding-verified.png";
import assistImg from "@/assets/onboarding-assist.png";

const slides = [
  {
    image: welcomeImg,
    title: "Selamat Datang di RanahHukum",
    description: "Platform konsultasi hukum terpercaya yang menghubungkan Anda dengan pengacara berlisensi secara mudah dan cepat.",
  },
  {
    image: consultImg,
    title: "Konsultasi Fleksibel",
    description: "Chat, voice call, atau tatap muka — pilih cara konsultasi yang paling nyaman untuk Anda. Tersedia 24/7.",
  },
  {
    image: verifiedImg,
    title: "Pengacara Terverifikasi",
    description: "Semua pengacara telah melalui proses verifikasi ketat termasuk pengecekan lisensi dan kualifikasi profesional.",
  },
  {
    image: assistImg,
    title: "Pendampingan Hukum",
    description: "Butuh lebih dari konsultasi? Dapatkan pendampingan hukum lengkap dari pengacara pilihan Anda.",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<"slides" | "profile">("slides");
  const [profileName, setProfileName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);

  const animateTransition = (cb: () => void) => {
    setAnimating(true);
    setTimeout(() => {
      cb();
      setAnimating(false);
    }, 250);
  };

  const handleNext = () => {
    if (current < slides.length - 1) {
      animateTransition(() => setCurrent(current + 1));
    } else {
      animateTransition(() => setPhase("profile"));
    }
  };

  const handleSkip = () => {
    animateTransition(() => setPhase("profile"));
  };

  const handleFinish = () => {
    localStorage.setItem("ranahhukum_onboarding_done", "true");
    if (profileName.trim()) {
      localStorage.setItem("ranahhukum_profile_name", profileName.trim());
    }
    if (profilePhoto) {
      localStorage.setItem("ranahhukum_profile_photo", profilePhoto);
    }
    navigate("/", { replace: true });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (phase === "profile") {
    return (
      <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
        <div className="flex justify-end p-4">
          <Button variant="ghost" size="sm" onClick={handleFinish} className="text-muted-foreground">
            Lewati
          </Button>
        </div>

        <div className={`flex-1 flex flex-col items-center justify-center px-8 text-center transition-all duration-300 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
          {/* Avatar upload */}
          <label htmlFor="photo-upload" className="relative cursor-pointer group mb-6">
            <Avatar className="w-28 h-28 border-4 border-primary/20 group-hover:border-primary/40 transition-colors">
              <AvatarImage src={profilePhoto || undefined} />
              <AvatarFallback className="bg-muted text-muted-foreground">
                <User className="w-12 h-12" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Camera className="w-4 h-4 text-primary-foreground" />
            </div>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </label>

          <h1 className="text-2xl font-bold mb-2 text-foreground">Setup Profil Anda</h1>
          <p className="text-muted-foreground text-sm mb-8 max-w-xs">
            Lengkapi profil agar pengacara dapat mengenal Anda lebih baik
          </p>

          <div className="w-full space-y-4 text-left">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Nama Lengkap</Label>
              <Input
                id="name"
                placeholder="Masukkan nama lengkap"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
        </div>

        <div className="px-8 pb-12">
          <Button
            variant="gradient"
            size="lg"
            className="w-full"
            onClick={handleFinish}
          >
            {profileName.trim() ? "Mulai Sekarang" : "Lewati & Mulai"}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  const slide = slides[current];
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
      <div className={`flex-1 flex flex-col items-center justify-center px-8 text-center transition-all duration-300 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <div className="w-48 h-48 mb-8 flex items-center justify-center">
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-contain drop-shadow-lg"
          />
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
              onClick={() => animateTransition(() => setCurrent(i))}
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
          {isLast ? "Setup Profil" : "Lanjut"}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
