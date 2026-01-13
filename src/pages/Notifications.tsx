import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Gift, Megaphone, Info, X, CheckCheck } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { 
  useNotifications, 
  useMarkNotificationRead, 
  useMarkAllNotificationsRead,
  type Notification 
} from "@/hooks/useNotifications";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useState } from "react";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "promo":
      return <Gift className="w-5 h-5" />;
    case "announcement":
      return <Megaphone className="w-5 h-5" />;
    default:
      return <Info className="w-5 h-5" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "promo":
      return "bg-green-500/10 text-green-600";
    case "announcement":
      return "bg-blue-500/10 text-blue-600";
    default:
      return "bg-gray-500/10 text-gray-600";
  }
};

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: notifications = [], isLoading } = useNotifications();
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();
  const [selectedNotification, setSelectedNotification] = useState<(Notification & { is_read: boolean }) | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMM yyyy, HH:mm", { locale: localeId });
  };

  const handleNotificationClick = (notification: Notification & { is_read: boolean }) => {
    // Mark as read when opened
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }
    setSelectedNotification(notification);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <MobileLayout showBottomNav={false}>
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-semibold">Notifikasi</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount} baru
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-xs"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Tandai dibaca
            </Button>
          )}
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Tidak ada notifikasi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !notification.is_read ? "border-primary/50 bg-primary/5" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm line-clamp-1">{notification.title}</h3>
                        {!notification.is_read && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 shrink-0">Baru</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {notification.description}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-2">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Notification Detail Dialog */}
      <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
        <DialogContent className="max-w-[400px] p-0 overflow-hidden rounded-2xl">
          {selectedNotification?.image_url && (
            <div className="relative h-48 overflow-hidden">
              <img
                src={selectedNotification.image_url}
                alt={selectedNotification.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedNotification(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
          
          <div className="p-4 space-y-4">
            <DialogHeader className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getNotificationColor(selectedNotification?.type || 'info')}`}>
                  {getNotificationIcon(selectedNotification?.type || 'info')}
                </div>
                <Badge variant="outline" className="text-xs capitalize">
                  {selectedNotification?.type === 'promo' ? 'Promo' : 
                   selectedNotification?.type === 'announcement' ? 'Pengumuman' : 'Info'}
                </Badge>
              </div>
              <DialogTitle className="text-left">{selectedNotification?.title}</DialogTitle>
            </DialogHeader>

            <p className="text-sm text-muted-foreground">
              {selectedNotification?.description}
            </p>

            {selectedNotification?.promo_code && (
              <Card className="border-dashed border-2 border-primary">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Kode Promo</p>
                  <p className="text-xl font-bold text-primary">{selectedNotification.promo_code}</p>
                  {selectedNotification.valid_until && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Berlaku sampai {format(new Date(selectedNotification.valid_until), "d MMMM yyyy", { locale: localeId })}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            <p className="text-xs text-muted-foreground">
              {selectedNotification && formatDate(selectedNotification.created_at)}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
