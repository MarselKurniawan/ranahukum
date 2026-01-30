import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { cn } from "@/lib/utils";

export interface MobileLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
  customBottomNav?: ReactNode;
  className?: string;
}

export function MobileLayout({ 
  children, 
  showBottomNav = true,
  customBottomNav,
  className 
}: MobileLayoutProps) {
  const hasBottomNav = showBottomNav || customBottomNav;
  
  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className={cn(
        "mobile-container w-full bg-background relative",
        hasBottomNav && "pb-20",
        className
      )}>
        {children}
        {customBottomNav ? customBottomNav : showBottomNav && <BottomNav />}
      </div>
    </div>
  );
}
