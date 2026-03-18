import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, Lock, Eye, EyeOff, Camera, Loader2 } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Password change
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const { data: profileData } = useQuery({
    queryKey: ['user-profile-edit', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user
  });

  useEffect(() => {
    if (profileData) {
      setFullName(profileData.full_name || "");
      setPhone(profileData.phone || "");
      setAvatarUrl(profileData.avatar_url || null);
    } else if (user) {
      setFullName(user.user_metadata?.full_name || "");
    }
  }, [profileData, user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const { uploadToExternalStorage } = await import("@/lib/externalStorage");
      const folder = `user-photos_${user.id}`;
      const publicUrl = await uploadToExternalStorage(file, folder);

      // Save to profiles table
      await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          avatar_url: publicUrl,
          email: user.email
        }, { onConflict: 'user_id' });

      setAvatarUrl(publicUrl);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast({
        title: "Berhasil",
        description: "Foto profil berhasil diperbarui"
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Gagal",
        description: "Gagal mengunggah foto profil",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: fullName,
          phone: phone,
          email: user.email
        }, { onConflict: 'user_id' });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast({
        title: "Profil Diperbarui",
        description: "Perubahan berhasil disimpan"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat menyimpan profil",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Password Tidak Cocok", description: "Password baru dan konfirmasi harus sama", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Password Terlalu Pendek", description: "Password minimal 6 karakter", variant: "destructive" });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Password Diperbarui", description: "Password berhasil diubah" });
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message || "Terjadi kesalahan saat mengubah password", variant: "destructive" });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  const displayName = fullName || user.email?.split('@')[0] || 'U';

  return (
    <MobileLayout showBottomNav={false}>
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-10">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">Edit Profil</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Profile Photo */}
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="text-2xl">
                  {displayName[0]?.toUpperCase() || 'U'}
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
            <p className="text-sm text-muted-foreground mt-3">Ketuk untuk mengubah foto</p>
          </CardContent>
        </Card>

        {/* Profile Info */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  value={user.email || ""}
                  disabled
                  className="pl-10 bg-muted"
                />
              </div>
              <p className="text-xs text-muted-foreground">Email tidak dapat diubah</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">No. Telepon</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="pl-10"
                />
              </div>
            </div>

            <Button 
              variant="gradient" 
              className="w-full mt-2"
              onClick={handleSaveProfile}
              disabled={isLoading}
            >
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardContent className="p-4">
            <button
              className="flex items-center justify-between w-full"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Ubah Password</span>
              </div>
              <span className="text-primary text-sm">{showPasswordSection ? "Batal" : "Ubah"}</span>
            </button>

            {showPasswordSection && (
              <div className="mt-4 space-y-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Password Baru</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi password baru"
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button 
                  variant="gradient" 
                  className="w-full"
                  onClick={handleChangePassword}
                  disabled={isChangingPassword || !newPassword || !confirmPassword}
                >
                  {isChangingPassword ? "Mengubah..." : "Ubah Password"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
