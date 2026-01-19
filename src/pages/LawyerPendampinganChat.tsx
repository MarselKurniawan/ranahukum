import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Send, Calendar, Clock, Video, ExternalLink, Info, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { 
  usePendampinganInterviewMessages, 
  useSendPendampinganInterviewMessage,
  useLawyerPendampinganChatInterview
} from "@/hooks/usePendampinganInterviewChat";
import { InterviewCountdown } from "@/components/InterviewCountdown";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export default function LawyerPendampinganChat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Get the lawyer's pendampingan interview or pending status
  const { data: interview, isLoading: interviewLoading } = useLawyerPendampinganChatInterview();
  const { data: messages, isLoading: messagesLoading } = usePendampinganInterviewMessages(interview?.id || null);
  const sendMessage = useSendPendampinganInterviewMessage();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !interview?.id) return;

    try {
      await sendMessage.mutateAsync({
        interviewId: interview.id,
        content: message.trim(),
        senderType: 'lawyer'
      });
      setMessage("");
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getStatusBadge = (status: string, lawyerStatus?: string) => {
    if (lawyerStatus === 'pending' || status === 'pending_review') {
      return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">Menunggu Review</Badge>;
    }
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
            <Skeleton className="h-16 w-3/4" />
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
            <span className="font-medium">Chat Pendampingan</span>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center text-muted-foreground">
              <p>Belum ada permintaan aktivasi pendampingan.</p>
              <p className="text-sm mt-2">Ajukan aktivasi pendampingan terlebih dahulu dari dashboard.</p>
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  const isPendingReview = interview.status === 'pending_review' || interview.lawyer_pendampingan_status === 'pending';
  const isScheduled = interview.status === 'scheduled';
  const canSendMessage = interview.id && (isPendingReview || isScheduled);

  return (
    <MobileLayout showBottomNav={false}>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="flex items-center gap-3 p-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="font-semibold">Chat Aktivasi Pendampingan</h1>
                {getStatusBadge(interview.status, interview.lawyer_pendampingan_status)}
              </div>
              <p className="text-xs text-muted-foreground">dengan Tim Admin</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/lawyer/dashboard')}
              className="gap-1.5"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </div>
          
          {/* Interview Info - only show if scheduled */}
          {isScheduled && interview.scheduled_date && (
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

          {/* Pending Info */}
          {isPendingReview && (
            <div className="px-4 pb-3">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                <Info className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-warning">Menunggu Review Admin</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Tim admin akan meninjau permintaan Anda dan mungkin menjadwalkan interview. 
                    Anda dapat mengirim pesan untuk bertanya atau menambahkan informasi.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {/* System message */}
            {isScheduled && interview.scheduled_date ? (
              <div className="flex justify-center">
                <div className="bg-muted/50 text-muted-foreground text-xs px-3 py-1.5 rounded-full">
                  Interview dijadwalkan pada {format(new Date(interview.scheduled_date), 'dd MMM yyyy', { locale: idLocale })}
                </div>
              </div>
            ) : isPendingReview ? (
              <div className="flex justify-center">
                <div className="bg-muted/50 text-muted-foreground text-xs px-3 py-1.5 rounded-full">
                  Permintaan aktivasi pendampingan terkirim
                </div>
              </div>
            ) : null}

            {/* Show placeholder if no interview id yet (pending without interview) */}
            {!interview.id && isPendingReview && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Chat akan tersedia setelah admin menjadwalkan interview.</p>
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
                      <AvatarFallback className={isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                        {isOwnMessage ? 'L' : 'A'}
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
        {canSendMessage ? (
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
        ) : !interview.id && isPendingReview ? (
          <div className="p-4 border-t bg-muted/50">
            <p className="text-center text-sm text-muted-foreground">
              Chat akan tersedia setelah admin menjadwalkan interview
            </p>
          </div>
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
    </MobileLayout>
  );
}
