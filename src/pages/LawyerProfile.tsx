import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useLawyerProfile, useUpdateLawyerProfile } from "@/hooks/useLawyerProfile";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const SPECIALIZATION_OPTIONS = [
  "Hukum Keluarga",
  "Hukum Pidana", 
  "Hukum Perdata",
  "Hukum Bisnis",
  "Hukum Properti",
  "Hukum Ketenagakerjaan",
  "Hukum Pajak",
  "Hukum Imigrasi",
];

export default function LawyerProfile() {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const { data: profile, isLoading } = useLawyerProfile();
  const updateProfile = useUpdateLawyerProfile();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    price: 0,
    pendampingan_price: 0,
    experience_years: 0,
    specialization: [] as string[],
  });

  useEffect(() => {
    if (!authLoading && (!user || role !== 'lawyer')) {
      navigate('/auth');
    }
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        location: profile.location || "",
        price: profile.price || 0,
        pendampingan_price: profile.pendampingan_price || 0,
        experience_years: profile.experience_years || 0,
        specialization: profile.specialization || [],
      });
    }
  }, [profile]);

  const toggleSpecialization = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.includes(spec)
        ? prev.specialization.filter(s => s !== spec)
        : [...prev.specialization, spec]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile.mutateAsync(formData);
      toast({
        title: "Berhasil",
        description: "Profil berhasil diperbarui"
      });
      navigate('/lawyer/dashboard');
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat menyimpan profil",
        variant: "destructive"
      });
    }
  };

  if (authLoading || isLoading) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="p-4 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showBottomNav={false}>
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-10">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">Edit Profil Lawyer</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 pb-24 space-y-4">
        {/* Basic Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Informasi Dasar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nama lengkap Anda"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Lokasi *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Contoh: Jakarta Selatan"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Pengalaman (Tahun) *</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                value={formData.experience_years}
                onChange={(e) => setFormData(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                placeholder="Tahun pengalaman"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Specialization */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Spesialisasi *</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">Pilih minimal 1 spesialisasi</p>
            <div className="flex flex-wrap gap-2">
              {SPECIALIZATION_OPTIONS.map((spec) => (
                <Badge
                  key={spec}
                  variant={formData.specialization.includes(spec) ? "default" : "outline"}
                  className="cursor-pointer transition-colors"
                  onClick={() => toggleSpecialization(spec)}
                >
                  {spec}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Tarif Layanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price">Tarif Konsultasi Chat *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="1000"
                  className="pl-10"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                  placeholder="50000"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">Tarif per sesi konsultasi chat</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pendampingan_price">Tarif Pendampingan</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
                <Input
                  id="pendampingan_price"
                  type="number"
                  min="0"
                  step="1000"
                  className="pl-10"
                  value={formData.pendampingan_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, pendampingan_price: parseInt(e.target.value) || 0 }))}
                  placeholder="500000"
                />
              </div>
              <p className="text-xs text-muted-foreground">Tarif untuk layanan pendampingan hukum</p>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card/95 backdrop-blur-lg border-t border-border p-4 z-50">
          <Button 
            type="submit" 
            variant="gradient" 
            className="w-full"
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Simpan Profil
              </>
            )}
          </Button>
        </div>
      </form>
    </MobileLayout>
  );
}
