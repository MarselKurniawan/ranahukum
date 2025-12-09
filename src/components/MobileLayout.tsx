import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { cn } from "@/lib/utils";

interface MobileLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
  className?: string;
}

export function MobileLayout({ 
  children, 
  showBottomNav = true,
  className 
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className={cn(
        "mobile-container w-full bg-background relative",
        showBottomNav && "pb-20",
        className
      )}>
        {children}
        {showBottomNav && <BottomNav />}
      </div>
    </div>
  );
}
