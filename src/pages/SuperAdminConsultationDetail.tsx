import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, User, Scale } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { 
  useIsSuperAdmin, 
  useAllConsultations,
  useConsultationMessages
} from "@/hooks/useSuperAdmin";

export default function SuperAdminConsultationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { data: isSuperAdmin, isLoading: checkingAdmin } = useIsSuperAdmin();
  const { data: allConsultations = [], isLoading: loadingConsultations } = useAllConsultations();
  const { data: messages = [], isLoading: loadingMessages } = useConsultationMessages(id || '');

  const consultation = allConsultations.find(c => c.id === id);

  useEffect(() => {
    if (!loading && !checkingAdmin && (!user || !isSuperAdmin)) {
      navigate('/auth');
    }
  }, [user, isSuperAdmin, loading, checkingAdmin, navigate]);

  if (loading || checkingAdmin || loadingConsultations) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="p-4 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MobileLayout>
    );
  }

  if (!consultation) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="p-4 text-center">
          <p>Konsultasi tidak ditemukan</p>
          <Button onClick={() => navigate('/admin/dashboard')} className="mt-4">
            Kembali
          </Button>
        </div>
      </MobileLayout>
    );
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <MobileLayout showBottomNav={false}>
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-10">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">Detail Konsultasi</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Consultation Info */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted-foreground">Topik Konsultasi</p>
                <p className="font-medium">{consultation.topic}</p>
              </div>
              <Badge
                variant={
                  consultation.status === 'completed' ? 'success' :
                  consultation.status === 'active' ? 'accent' :
                  consultation.status === 'pending' ? 'warning' : 'secondary'
                }
              >
                {consultation.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Klien</p>
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {consultation.client_profile?.full_name || 'Anonim'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Lawyer</p>
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      <Scale className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {consultation.lawyer?.name || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Tarif</p>
                <p className="font-semibold">Rp {consultation.price.toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tanggal</p>
                <p className="text-sm">{formatDate(consultation.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat History */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Riwayat Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingMessages ? (
              <div className="p-4">
                <Skeleton className="h-20 w-full" />
              </div>
            ) : messages.length > 0 ? (
              <ScrollArea className="h-[400px] p-4">
                <div className="space-y-3">
                  {messages.map((message) => {
                    const isClient = message.sender_id === consultation.client_id;
                    const isLawyer = message.sender_id === consultation.lawyer?.user_id;
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            isClient
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-muted rounded-bl-md'
                          }`}
                        >
                          <p className="text-xs font-medium mb-1 opacity-70">
                            {isClient ? 'Klien' : isLawyer ? 'Lawyer' : 'Unknown'}
                          </p>
                          {message.message_type === 'text' ? (
                            <p className="text-sm">{message.content}</p>
                          ) : message.message_type === 'image' ? (
                            <img 
                              src={message.file_url || ''} 
                              alt="Attachment" 
                              className="max-w-full rounded-lg"
                            />
                          ) : (
                            <p className="text-sm italic">[{message.message_type}]</p>
                          )}
                          <p className={`text-[10px] mt-1 ${isClient ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-sm">
                Tidak ada pesan dalam konsultasi ini
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
