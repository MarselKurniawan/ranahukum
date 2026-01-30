import { Home, MessageCircle, User, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLawyerFaceToFaceRequests } from "@/hooks/useFaceToFace";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/lawyer/dashboard", matchStart: true },
  { icon: Users, label: "Tatap Muka", path: "/lawyer/face-to-face", matchStart: false },
  { icon: User, label: "Profil", path: "/lawyer/profile", matchStart: false },
];

export function LawyerBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: faceToFaceRequests = [] } = useLawyerFaceToFaceRequests();
  
  // Count pending face-to-face requests
  const pendingF2FCount = faceToFaceRequests.filter(r => r.status === 'pending').length;

  const isPathActive = (item: typeof navItems[0]) => {
    if (item.path === "/lawyer/dashboard") {
      // Dashboard is active for /lawyer/dashboard and related consultation pages
      return location.pathname === "/lawyer/dashboard" || 
             location.pathname.startsWith("/lawyer/chat/") ||
             location.pathname.startsWith("/lawyer/consultation/");
    }
    if (item.path === "/lawyer/face-to-face") {
      return location.pathname.startsWith("/lawyer/face-to-face");
    }
    return location.pathname === item.path;
  };

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card/95 backdrop-blur-lg border-t border-border z-50">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const isActive = isPathActive(item);
          const Icon = item.icon;
          const showBadge = item.path === "/lawyer/face-to-face" && pendingF2FCount > 0;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1.5 px-6 rounded-lg transition-all duration-200 relative",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-all duration-200 relative",
                isActive && "bg-primary/10"
              )}>
                <Icon className={cn(
                  "w-5 h-5 transition-all duration-200",
                  isActive && "scale-110"
                )} />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center font-bold">
                    {pendingF2FCount > 9 ? '9+' : pendingF2FCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
