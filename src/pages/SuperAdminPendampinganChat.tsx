import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Send, Calendar, Clock, Video, ExternalLink, CheckCircle, X, Info, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { 
  usePendampinganInterviewMessages, 
  useSendPendampinganInterviewMessage,
  usePendampinganInterviewById
} from "@/hooks/usePendampinganInterviewChat";
import { useCompletePendampinganInterview } from "@/hooks/usePendampinganRequest";
import { useToast } from "@/hooks/use-toast";
import { InterviewCountdown } from "@/components/InterviewCountdown";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
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
import { Textarea } from "@/components/ui/textarea";

export default function SuperAdminPendampinganChat() {
  const { id: interviewId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");
  
  const { data: interview, isLoading: interviewLoading } = usePendampinganInterviewById(interviewId || null);
  const { data: messages, isLoading: messagesLoading } = usePendampinganInterviewMessages(interviewId || null);
  const sendMessage = useSendPendampinganInterviewMessage();
  const completeInterview = useCompletePendampinganInterview();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !interviewId) return;

    try {
      await sendMessage.mutateAsync({
        interviewId,
        content: message.trim(),
        senderType: 'admin'
      });
      setMessage("");
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleComplete = async (approve: boolean) => {
    if (!interviewId || !interview?.lawyer?.id) return;

    try {
      await completeInterview.mutateAsync({
        interviewId,
        lawyerId: interview.lawyer.id,
        approve,
        notes: completionNotes
      });
      toast({
        title: approve ? "Pendampingan Diaktifkan" : "Pendampingan Ditolak",
        description: approve 
          ? "Layanan pendampingan lawyer telah diaktifkan" 
          : "Permintaan aktivasi pendampingan telah ditolak"
      });
      setShowApproveDialog(false);
      setShowRejectDialog(false);
      setCompletionNotes("");
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">Terjadwal</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-success/10 text-success border-success/30">Selesai</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">Dibatalkan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (interviewLoading) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="flex flex-col h-screen">
          <div className="flex items-center gap-3 p-4 border-b bg-card">
            <Skeleton className="h-8 w-8" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex-1 p-4 space-y-4">
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="h-16 w-2/3 ml-auto" />
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (!interview) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="flex flex-col h-screen">
          <div className="flex items-center gap-3 p-4 border-b bg-card">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="font-medium">Interview Tidak Ditemukan</span>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-muted-foreground">Interview pendampingan tidak ditemukan.</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showBottomNav={false}>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="flex items-center gap-3 p-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={interview.lawyer?.image_url || undefined} />
              <AvatarFallback>{interview.lawyer?.name?.charAt(0) || 'L'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-semibold truncate">{interview.lawyer?.name || 'Lawyer'}</h1>
                {getStatusBadge(interview.status)}
              </div>
              <p className="text-xs text-muted-foreground">Interview Pendampingan</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/admin/dashboard')}
              className="gap-1.5"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </div>
          
          {/* Interview Info */}
          {interview.scheduled_date && (
            <div className="px-4 pb-3 space-y-3">
              {/* Countdown Timer */}
              <InterviewCountdown 
                scheduledDate={interview.scheduled_date}
                scheduledTime={interview.scheduled_time || '10:00'}
                status={interview.status}
              />
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(interview.scheduled_date), 'EEEE, dd MMMM yyyy', { locale: idLocale })}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{interview.scheduled_time} WIB</span>
                </div>
              </div>
              {interview.google_meet_link && (
                <a 
                  href={interview.google_meet_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <Video className="h-4 w-4" />
                  <span>Buka Google Meet</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}

          {/* Action buttons for scheduled interviews */}
          {interview.status === 'scheduled' && (
            <div className="px-4 pb-3 flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => setShowRejectDialog(true)}
              >
                <X className="h-4 w-4 mr-1" />
                Tolak
              </Button>
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => setShowApproveDialog(true)}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Setujui & Aktifkan
              </Button>
            </div>
          )}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {/* System message */}
            {interview.scheduled_date && (
              <div className="flex justify-center">
                <div className="bg-muted/50 text-muted-foreground text-xs px-3 py-1.5 rounded-full">
                  Interview dijadwalkan pada {format(new Date(interview.scheduled_date), 'dd MMM yyyy', { locale: idLocale })}
                </div>
              </div>
            )}

            {messages?.map((msg) => {
              const isOwnMessage = msg.sender_id === user?.id;
              
              return (
                <div 
                  key={msg.id} 
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[80%] ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                    <Avatar className="h-8 w-8 shrink-0">
                      {!isOwnMessage && (
                        <AvatarImage src={interview.lawyer?.image_url || undefined} />
                      )}
                      <AvatarFallback className={isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                        {isOwnMessage ? 'A' : interview.lawyer?.name?.charAt(0) || 'L'}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`rounded-2xl px-4 py-2 ${
                      isOwnMessage 
                        ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                        : 'bg-muted rounded-tl-sm'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {format(new Date(msg.created_at), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {messagesLoading && (
              <div className="space-y-4">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-12 w-2/3 ml-auto" />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        {interview.status === 'scheduled' ? (
          <form onSubmit={handleSendMessage} className="p-4 border-t bg-card">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tulis pesan..."
                className="flex-1"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!message.trim() || sendMessage.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-4 border-t bg-muted/50">
            <p className="text-center text-sm text-muted-foreground">
              {interview.status === 'completed' 
                ? 'Interview telah selesai' 
                : 'Interview telah dibatalkan'}
            </p>
          </div>
        )}
      </div>

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Setujui Aktivasi Pendampingan?</AlertDialogTitle>
            <AlertDialogDescription>
              Layanan pendampingan untuk {interview.lawyer?.name} akan diaktifkan setelah Anda menyetujui.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Textarea
              placeholder="Catatan (opsional)"
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleComplete(true)}
              disabled={completeInterview.isPending}
            >
              {completeInterview.isPending ? 'Memproses...' : 'Setujui & Aktifkan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tolak Aktivasi Pendampingan?</AlertDialogTitle>
            <AlertDialogDescription>
              Permintaan aktivasi pendampingan untuk {interview.lawyer?.name} akan ditolak.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Textarea
              placeholder="Alasan penolakan (opsional)"
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleComplete(false)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={completeInterview.isPending}
            >
              {completeInterview.isPending ? 'Memproses...' : 'Tolak'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MobileLayout>
  );
}
