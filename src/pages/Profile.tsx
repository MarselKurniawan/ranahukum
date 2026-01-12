import { useNavigate } from "react-router-dom";
import { 
  User, 
  Bell, 
  LogOut, 
  ChevronRight,
  FileText
} from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  { icon: User, label: "Edit Profil", path: "/profile/edit" },
  { icon: Bell, label: "Notifikasi", path: "/profile/notifications", badge: "3" },
  { icon: FileText, label: "Riwayat Transaksi", path: "/profile/transactions" },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, role, signOut, loading } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Berhasil Keluar",
      description: "Sampai jumpa lagi!"
    });
    navigate('/');
  };

  const isAnonymous = user?.is_anonymous;
  const userName = user?.user_metadata?.full_name || (isAnonymous ? "Pengguna Anonim" : user?.email?.split('@')[0] || "Pengguna");
  const userEmail = isAnonymous ? "Anonim" : (user?.email || "Belum login");

  return (
    <MobileLayout>
      <div className="p-4">
        {/* Header Profile */}
        <Card className="mb-6 overflow-hidden">
          <div className="gradient-hero h-20" />
          <CardContent className="p-4 -mt-10">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-xl bg-secondary border-4 border-card flex items-center justify-center">
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
              <div className="flex-1 pb-1">
                <h2 className="font-bold text-lg">{userName}</h2>
                <p className="text-sm text-muted-foreground">{userEmail}</p>
                {role && (
                  <Badge variant="secondary" className="mt-1 capitalize">
                    {role}
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
              <div className="text-center">
                <p className="text-lg font-bold text-primary">0</p>
                <p className="text-xs text-muted-foreground">Konsultasi</p>
              </div>
              <div className="text-center border-x border-border">
                <p className="text-lg font-bold text-primary">0</p>
                <p className="text-xs text-muted-foreground">Ulasan</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-primary">Rp 0</p>
                <p className="text-xs text-muted-foreground">Total Bayar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Login CTA - Only show if not logged in or anonymous */}
        {(!user || isAnonymous) && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-1">
                {isAnonymous ? "Buat Akun Sekarang" : "Daftar atau Masuk"}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {isAnonymous 
                  ? "Simpan riwayat konsultasi dan dapatkan fitur lengkap"
                  : "Dapatkan akses penuh ke semua fitur aplikasi"
                }
              </p>
              <div className="flex gap-2">
                <Button variant="gradient" className="flex-1" onClick={() => navigate('/auth')}>
                  {isAnonymous ? "Buat Akun" : "Daftar"}
                </Button>
                {!isAnonymous && (
                  <Button variant="outline" className="flex-1" onClick={() => navigate('/auth')}>
                    Masuk
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lawyer Dashboard Link */}
        {role === 'lawyer' && (
          <Card className="mb-6 border-accent/20 bg-accent/5">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-1">Dashboard Lawyer</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Kelola konsultasi dan jadwal Anda
              </p>
              <Button variant="gradient" className="w-full" onClick={() => navigate('/lawyer/dashboard')}>
                Buka Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Menu Items */}
        <Card>
          <CardContent className="p-0">
            {menuItems.map((item, index) => (
              <button
                key={item.path}
                className={`w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors ${
                  index !== menuItems.length - 1 ? "border-b border-border" : ""
                }`}
                onClick={() => navigate(item.path)}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <Badge variant="destructive" className="text-[10px] px-1.5">
                      {item.badge}
                    </Badge>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Logout - Only show if logged in */}
        {user && (
          <Button
            variant="ghost"
            className="w-full mt-4 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Keluar
          </Button>
        )}

        {/* App Version */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Versi 1.0.0
        </p>
      </div>
    </MobileLayout>
  );
}
