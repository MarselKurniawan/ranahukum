import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Send, MessageCircle, CheckCircle, Link as LinkIcon,
  ExternalLink, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  useLawyerActiveInterview, 
  useInterviewMessages, 
  useSendInterviewMessage,
  useUpdateInterviewMeetLink 
} from "@/hooks/useInterviewChat";

export default function LawyerInterviewChat() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const { data: session, isLoading: loadingSession } = useLawyerActiveInterview();
  const { data: messages = [], isLoading: loadingMessages } = useInterviewMessages(session?.id || '');
  const sendMessage = useSendInterviewMessage();
  const updateMeetLink = useUpdateInterviewMeetLink();

  const [newMessage, setNewMessage] = useState("");
  const [meetLinkDialogOpen, setMeetLinkDialogOpen] = useState(false);
  const [meetLink, setMeetLink] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session?.id) return;

    try {
      await sendMessage.mutateAsync({
        interviewId: session.id,
        content: newMessage.trim(),
        senderType: 'lawyer'
      });
      setNewMessage("");
    } catch (error) {
      toast({
        title: "Gagal mengirim pesan",
        variant: "destructive"
      });
    }
  };

  const handleUpdateMeetLink = async () => {
    if (!meetLink.trim() || !session?.id) return;

    try {
      await updateMeetLink.mutateAsync({
        sessionId: session.id,
        meetLink: meetLink.trim()
      });
      toast({ title: "Link Google Meet berhasil ditambahkan" });
      setMeetLinkDialogOpen(false);
      setMeetLink("");
    } catch (error) {
      toast({
        title: "Gagal menambahkan link",
        variant: "destructive"
      });
    }
  };

  if (loading || loadingSession) {
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
        <div className="text-center px-4">
          <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">Tidak Ada Interview Aktif</p>
          <p className="text-sm text-muted-foreground mb-4">
            Anda tidak memiliki sesi interview yang sedang berlangsung saat ini.
          </p>
          <Button onClick={() => navigate('/lawyer/dashboard')}>
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
            onClick={() => navigate('/lawyer/dashboard')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Avatar className="w-10 h-10 bg-primary/10">
            <AvatarFallback>
              <ShieldCheck className="w-5 h-5 text-primary" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium">Interview Verifikasi</p>
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
                  <ExternalLink className="w-3 h-3" />
                  Buka Meet
                </a>
              )}
            </div>
          </div>
          {isSessionActive && !session.google_meet_link && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setMeetLinkDialogOpen(true)}
            >
              <LinkIcon className="w-4 h-4 mr-1" />
              Tambah Link
            </Button>
          )}
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-2xl mx-auto">
          {/* Session Info Card */}
          <Card className="bg-primary/5 border-primary/20 mb-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Interview Verifikasi</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tim admin sedang melakukan verifikasi akun Anda. 
                    Silakan jawab pertanyaan dengan jujur dan lengkap.
                  </p>
                  {!session.google_meet_link && isSessionActive && (
                    <p className="text-sm text-primary mt-2">
                      Anda dapat menambahkan link Google Meet jika diperlukan.
                    </p>
                  )}
                </div>
              </div>
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
                Menunggu pesan dari admin...
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isLawyer = message.sender_type === 'lawyer';
              return (
                <div
                  key={message.id}
                  className={`flex ${isLawyer ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      isLawyer
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted rounded-bl-md'
                    }`}
                  >
                    {!isLawyer && (
                      <p className={`text-xs font-medium mb-1 ${isLawyer ? 'text-primary-foreground/70' : 'text-primary'}`}>
                        Admin
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${isLawyer ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
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

      {/* Add Google Meet Link Dialog */}
      <Dialog open={meetLinkDialogOpen} onOpenChange={setMeetLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambahkan Link Google Meet</DialogTitle>
            <DialogDescription>
              Masukkan link Google Meet untuk wawancara dengan admin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Link Google Meet</Label>
              <Input
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMeetLinkDialogOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleUpdateMeetLink}
              disabled={!meetLink.trim() || updateMeetLink.isPending}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
