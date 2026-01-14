import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, Send, MessageCircle, CheckCircle, Link as LinkIcon,
  ExternalLink, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  useInterviewSession, 
  useInterviewMessages, 
  useSendInterviewMessage,
  useEndInterviewSession 
} from "@/hooks/useInterviewChat";
import { useIsSuperAdmin } from "@/hooks/useSuperAdmin";

export default function SuperAdminInterviewChat() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const { data: isSuperAdmin, isLoading: checkingAdmin } = useIsSuperAdmin();
  const { data: session, isLoading: loadingSession } = useInterviewSession(id || '');
  const { data: messages = [], isLoading: loadingMessages } = useInterviewMessages(id || '');
  const sendMessage = useSendInterviewMessage();
  const endInterview = useEndInterviewSession();

  const [newMessage, setNewMessage] = useState("");
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if not super admin
  useEffect(() => {
    if (!loading && !checkingAdmin && (!user || !isSuperAdmin)) {
      toast({
        title: "Akses Ditolak",
        description: "Halaman ini hanya untuk Super Admin",
        variant: "destructive"
      });
      navigate('/auth');
    }
  }, [user, isSuperAdmin, loading, checkingAdmin, navigate, toast]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !id) return;

    try {
      await sendMessage.mutateAsync({
        interviewId: id,
        content: newMessage.trim(),
        senderType: 'admin'
      });
      setNewMessage("");
    } catch (error) {
      toast({
        title: "Gagal mengirim pesan",
        variant: "destructive"
      });
    }
  };

  const handleEndInterview = async () => {
    if (!id) return;

    try {
      await endInterview.mutateAsync({ sessionId: id });
      toast({ title: "Interview berhasil diakhiri" });
      navigate('/admin/dashboard');
    } catch (error) {
      toast({
        title: "Gagal mengakhiri interview",
        variant: "destructive"
      });
    }
  };

  if (loading || checkingAdmin || loadingSession) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Skeleton className="h-14 w-full mb-4" />
        <Skeleton className="h-[calc(100vh-200px)] w-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Sesi interview tidak ditemukan</p>
          <Button className="mt-4" onClick={() => navigate('/admin/dashboard')}>
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const isSessionActive = session.status === 'active';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/admin/dashboard')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarImage src={session.lawyer?.image_url || undefined} />
            <AvatarFallback>{session.lawyer?.name?.[0] || 'L'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{session.lawyer?.name || 'Lawyer'}</p>
            <div className="flex items-center gap-2">
              <Badge 
                variant={isSessionActive ? 'success' : 'secondary'}
                className="text-xs"
              >
                {isSessionActive ? 'Aktif' : 'Selesai'}
              </Badge>
              {session.google_meet_link && (
                <a 
                  href={session.google_meet_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary flex items-center gap-1 hover:underline"
                >
                  <LinkIcon className="w-3 h-3" />
                  Meet
                </a>
              )}
            </div>
          </div>
          {isSessionActive && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setEndDialogOpen(true)}
            >
              Akhiri
            </Button>
          )}
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-2xl mx-auto">
          {/* Session Info Card */}
          <Card className="bg-muted/50 mb-6">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                Sesi interview dimulai pada{" "}
                {new Date(session.started_at || session.created_at).toLocaleString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              {session.notes && (
                <p className="text-sm mt-2">
                  <span className="font-medium">Catatan:</span> {session.notes}
                </p>
              )}
            </CardContent>
          </Card>

          {loadingMessages ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-3/4" />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                Belum ada pesan. Mulai percakapan dengan lawyer.
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isAdmin = message.sender_type === 'admin';
              return (
                <div
                  key={message.id}
                  className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      isAdmin
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${isAdmin ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {new Date(message.created_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      {isSessionActive ? (
        <div className="border-t bg-background p-4">
          <div className="max-w-2xl mx-auto flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ketik pesan..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={sendMessage.isPending}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sendMessage.isPending}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-t bg-muted/50 p-4">
          <p className="text-center text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 inline mr-1" />
            Sesi interview telah berakhir
          </p>
        </div>
      )}

      {/* End Interview Dialog */}
      <AlertDialog open={endDialogOpen} onOpenChange={setEndDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Akhiri Interview?</AlertDialogTitle>
            <AlertDialogDescription>
              Sesi interview dengan {session.lawyer?.name} akan diakhiri. 
              Anda masih dapat melihat riwayat chat setelahnya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleEndInterview}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Akhiri Interview
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
