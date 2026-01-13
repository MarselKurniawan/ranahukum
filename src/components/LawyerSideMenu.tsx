import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Menu, X, Home, User, LogOut, Settings, 
  FileText, Banknote, ChevronRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useLawyerProfile } from "@/hooks/useLawyerProfile";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/lawyer/dashboard" },
  { icon: User, label: "Profil Saya", path: "/lawyer/profile" },
  { icon: Banknote, label: "Pengaturan Harga", path: "/lawyer/pricing" },
  { icon: FileText, label: "Dokumen Verifikasi", path: "/lawyer/documents" },
];

export function LawyerSideMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { data: profile } = useLawyerProfile();

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] p-0">
        <SheetHeader className="p-4 pb-2">
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>
        
        {/* Profile Section */}
        <div className="px-4 py-3 bg-muted/50">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={profile?.image_url || undefined} />
              <AvatarFallback>{profile?.name?.[0] || 'L'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{profile?.name || 'Lawyer'}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.location}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Menu Items */}
        <div className="py-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "hover:bg-muted text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1 text-left">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            );
          })}
        </div>

        <Separator />

        {/* Logout */}
        <div className="py-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="flex-1 text-left">Keluar</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
