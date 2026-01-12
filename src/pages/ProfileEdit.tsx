import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, Lock, Eye, EyeOff, Camera } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Password change
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || "");
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) {
      setFullName(data.full_name || "");
      setPhone(data.phone || "");
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Update auth metadata
      await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      // Update/insert profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: fullName,
          phone: phone,
          email: user.email
        }, { onConflict: 'user_id' });

      if (error) throw error;

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
      toast({
        title: "Password Tidak Cocok",
        description: "Password baru dan konfirmasi harus sama",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password Terlalu Pendek",
        description: "Password minimal 6 karakter",
        variant: "destructive"
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Password Diperbarui",
        description: "Password berhasil diubah"
      });
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: "Gagal",
        description: error.message || "Terjadi kesalahan saat mengubah password",
        variant: "destructive"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

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
              <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-12 h-12 text-muted-foreground" />
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Camera className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>
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
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
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
