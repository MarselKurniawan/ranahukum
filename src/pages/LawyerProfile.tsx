import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Camera, LogOut } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useLawyerProfile, useUpdateLawyerProfile } from "@/hooks/useLawyerProfile";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useSpecializationTypes } from "@/hooks/useSpecializationTypes";
import { useAppSetting } from "@/hooks/useLegalAssistance";
import { LawyerCredentialsForm } from "@/components/LawyerCredentialsForm";
import { LawyerSideMenu } from "@/components/LawyerSideMenu";

export default function LawyerProfile() {
  const navigate = useNavigate();
  const { user, role, loading: authLoading, signOut } = useAuth();
  const { data: profile, isLoading } = useLawyerProfile();
  const updateProfile = useUpdateLawyerProfile();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { data: specializationTypes = [], isLoading: loadingSpecs } = useSpecializationTypes();
  const { data: chatPriceSetting } = useAppSetting('chat_consultation_price');
  
  // Get consultation price from global settings
  const consultationPrice = chatPriceSetting 
    ? (chatPriceSetting.value as { amount?: number })?.amount || 0 
    : 0;

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    experience_years: 0,
    specialization: [] as string[],
    image_url: "" as string | null,
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
        experience_years: profile.experience_years || 0,
        specialization: profile.specialization || [],
        image_url: profile.image_url || null,
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `lawyer-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: urlData.publicUrl }));
      toast({
        title: "Berhasil",
        description: "Foto profil berhasil diunggah"
      });
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Gagal mengunggah foto",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile.mutateAsync({
        ...formData,
        submitted_at: new Date().toISOString()
      });
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

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || isLoading || loadingSpecs) {
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
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-semibold">Edit Profil Lawyer</h1>
          </div>
          <LawyerSideMenu />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 pb-32 space-y-4">
        {/* Profile Photo */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Foto Profil *</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={formData.image_url || undefined} />
                <AvatarFallback className="text-2xl">
                  {formData.name?.[0] || 'L'}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground text-center">
              Foto profil wajib untuk verifikasi akun
            </p>
          </CardContent>
        </Card>

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
              {specializationTypes.map((spec) => (
                <Badge
                  key={spec.id}
                  variant={formData.specialization.includes(spec.name) ? "default" : "outline"}
                  className="cursor-pointer transition-colors"
                  onClick={() => toggleSpecialization(spec.name)}
                >
                  {spec.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Credentials - Bio, Certifications, Licenses */}
        <LawyerCredentialsForm />

        {/* Pricing Notice */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-1">Tentang Tarif Layanan</p>
            <p className="text-xs text-muted-foreground">
              Tarif konsultasi chat diatur secara global oleh Admin. 
              Tarif saat ini: <strong>Rp {consultationPrice.toLocaleString('id-ID')}</strong>
            </p>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Card className="border-destructive/30">
          <CardContent className="p-4">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Keluar dari Akun
            </Button>
          </CardContent>
        </Card>
      </form>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card/95 backdrop-blur-lg border-t border-border p-4 z-40">
        <Button 
          type="submit" 
          variant="gradient" 
          className="w-full"
          disabled={updateProfile.isPending}
          onClick={handleSubmit}
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
    </MobileLayout>
  );
}
