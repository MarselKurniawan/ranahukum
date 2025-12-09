import { useNavigate } from "react-router-dom";
import { 
  User, 
  Settings, 
  CreditCard, 
  Bell, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Shield,
  FileText,
  Star
} from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const menuItems = [
  { icon: User, label: "Edit Profil", path: "/profile/edit" },
  { icon: CreditCard, label: "Metode Pembayaran", path: "/profile/payment" },
  { icon: Bell, label: "Notifikasi", path: "/profile/notifications", badge: "3" },
  { icon: FileText, label: "Riwayat Transaksi", path: "/profile/transactions" },
  { icon: Star, label: "Ulasan Saya", path: "/profile/reviews" },
  { icon: Shield, label: "Keamanan", path: "/profile/security" },
  { icon: HelpCircle, label: "Bantuan", path: "/profile/help" },
];

export default function Profile() {
  const navigate = useNavigate();

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
                <h2 className="font-bold text-lg">Pengguna Anonim</h2>
                <p className="text-sm text-muted-foreground">Belum login</p>
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

        {/* Login CTA */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-1">Daftar atau Masuk</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Dapatkan akses penuh ke semua fitur aplikasi
            </p>
            <div className="flex gap-2">
              <Button variant="gradient" className="flex-1">
                Daftar
              </Button>
              <Button variant="outline" className="flex-1">
                Masuk
              </Button>
            </div>
          </CardContent>
        </Card>

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

        {/* Logout */}
        <Button
          variant="ghost"
          className="w-full mt-4 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Keluar
        </Button>

        {/* App Version */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Versi 1.0.0
        </p>
      </div>
    </MobileLayout>
  );
}
