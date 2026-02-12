import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Send, Mic, Paperclip, 
  XCircle, FileText, Lightbulb, Play, Pause, X, Clock, Ban
} from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useConsultation, useUpdateConsultation } from "@/hooks/useConsultations";
import { useMessages, useSendMessage, Message } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { useChatUpload } from "@/hooks/useChatUpload";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { CancelRequestDialog } from "@/components/CancelRequestDialog";
import { useCancelConsultation } from "@/hooks/useCancelRequest";
import { VoiceCallButton } from "@/components/VoiceCallButton";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

function VoicePlayer({ src }: { src: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2">
      <audio ref={audioRef} src={src} preload="metadata" />
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={togglePlay}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </Button>
      <div className="flex-1">
        <div className="h-1 bg-background/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-current rounded-full transition-all"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
      </div>
      <span className="text-xs opacity-70">
        {formatDuration(currentTime)} / {formatDuration(duration || 0)}
      </span>
    </div>
  );
}

export default function LawyerChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { data: consultation, isLoading: loadingConsultation } = useConsultation(id || '');
  const { data: messages = [], isLoading: loadingMessages } = useMessages(id || '');
  const sendMessage = useSendMessage();
  const updateConsultation = useUpdateConsultation();
  const { isUploading, isRecording, sendFileMessage, toggleRecording } = useChatUpload({ 
    consultationId: id || '' 
  });
  const { isOtherUserTyping, setTyping } = useTypingIndicator(id || '');
  const cancelConsultation = useCancelConsultation();
  
  const [inputValue, setInputValue] = useState("");
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [advice, setAdvice] = useState("");
  const [elapsedTime, setElapsedTime] = useState("00:00");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // IMPORTANT: Hooks must be called unconditionally.
  const isAnonymousConsultation = (consultation as { is_anonymous?: boolean } | null | undefined)?.is_anonymous === true;
  const clientId = consultation?.client_id;

  // Fetch client's phone number from profiles
  const { data: clientProfile } = useQuery({
    queryKey: ['client-profile-phone', clientId],
    queryFn: async () => {
      if (!clientId || isAnonymousConsultation) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('phone, whatsapp')
        .eq('user_id', clientId)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!clientId && !isAnonymousConsultation
  });

  const clientPhone = clientProfile?.whatsapp || clientProfile?.phone || '';

  useEffect(() => {
    if (!authLoading && (!user || role !== 'lawyer')) {
      toast({
        title: "Akses Ditolak",
        description: "Halaman ini hanya untuk lawyer",
        variant: "destructive"
      });
      navigate('/auth');
    }
  }, [user, role, authLoading, navigate, toast]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (value.length > 0) {
      setTyping(true);
    } else {
      setTyping(false);
    }
  };

  // Timer effect - moved before early returns
  const isCompleted = consultation?.status === 'completed';
  
  useEffect(() => {
    if (!consultation?.started_at || isCompleted) return;
    
    const startTime = new Date(consultation.started_at).getTime();
    
    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.floor((now - startTime) / 1000);
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      
      if (hours > 0) {
        setElapsedTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setElapsedTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [consultation?.started_at, isCompleted]);

  const handleSend = async () => {
    if (!inputValue.trim() || !id) return;

    const content = inputValue;
    setInputValue("");

    try {
      await sendMessage.mutateAsync({
        consultationId: id,
        content,
        messageType: 'text'
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({ title: "Gagal mengirim pesan", variant: "destructive" });
      setInputValue(content);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await sendFileMessage(file);
      } catch (error) {
        console.error("Failed to send file message:", error);
        toast({ title: "Gagal mengirim file", variant: "destructive" });
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleEndConsultation = async () => {
    if (!id) return;
    
    try {
      await updateConsultation.mutateAsync({ 
        id, 
        status: 'completed',
        lawyer_notes: advice || undefined
      });
      toast({ title: "Konsultasi selesai" });
      setShowEndDialog(false);
      navigate("/lawyer/dashboard");
    } catch (error) {
      toast({
        title: "Gagal mengakhiri konsultasi",
        variant: "destructive"
      });
    }
  };

  const handleCancelConsultation = async (reason: string) => {
    if (!id) return;
    try {
      await cancelConsultation.mutateAsync({
        consultationId: id,
        cancelReason: reason
      });
      toast({ title: "Konsultasi dibatalkan" });
      setShowCancelDialog(false);
      navigate('/lawyer/dashboard');
    } catch (error) {
      toast({ title: "Gagal membatalkan konsultasi", variant: "destructive" });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessageContent = (message: Message, isLawyer: boolean) => {
    if (message.message_type === 'voice' && message.file_url) {
      return <VoicePlayer src={message.file_url} />;
    }

    if (message.message_type === 'file' && message.file_url) {
      const isImage = message.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
      
      if (isImage) {
        return (
          <div className="space-y-1">
            <img 
              src={message.file_url} 
              alt="Uploaded image"
              className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.file_url!, '_blank')}
            />
          </div>
        );
      }

      return (
        <a 
          href={message.file_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:underline"
        >
          <FileText className="w-4 h-4" />
          <span className="text-sm">{message.content}</span>
        </a>
      );
    }

    return <p className="text-sm">{message.content}</p>;
  };

  if (loadingConsultation || loadingMessages || authLoading) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="p-4 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-20 w-3/4" />
          <Skeleton className="h-20 w-3/4 ml-auto" />
          <Skeleton className="h-20 w-3/4" />
        </div>
      </MobileLayout>
    );
  }

  if (!consultation) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="flex items-center justify-center h-screen">
          <p>Konsultasi tidak ditemukan</p>
        </div>
      </MobileLayout>
    );
  }

  const client = (consultation as { profiles?: { full_name: string | null } }).profiles;
  const clientName = client?.full_name;
  // When anonymous, show 'Pengguna Anonim'; otherwise show actual client name or 'Pengguna'
  const displayName = isAnonymousConsultation ? 'Pengguna Anonim' : (clientName && clientName.trim() ? clientName : 'Pengguna');
  const displayInitial = isAnonymousConsultation ? 'A' : (clientName && clientName.trim() ? clientName[0].toUpperCase() : 'P');
  const lawyerData = consultation.lawyers;
  const lawyerUserId = (lawyerData as { user_id?: string })?.user_id;

  return (
    <MobileLayout showBottomNav={false}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-10">
        <div className="flex items-center gap-2 p-3">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          {/* Avatar hidden for privacy */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="font-semibold text-sm truncate">{displayName}</h2>
              {consultation.display_id && (
                <span className="text-[10px] font-mono text-primary bg-primary/10 px-1 py-0.5 rounded shrink-0">
                  {consultation.display_id}
                </span>
              )}
            </div>
            <Badge 
              variant={consultation.status === 'active' ? 'success' : 'secondary'} 
              className="text-[10px]"
            >
            {consultation.status === 'active' ? 'Konsultasi Aktif' : 
               consultation.status === 'completed' ? 'Selesai' : 
               consultation.status}
            </Badge>
            {/* Call upgrade notification for lawyer */}
            {consultation.status === 'active' && (consultation as { is_call_enabled?: boolean }).is_call_enabled && !isAnonymousConsultation && (
              <Badge variant="outline" className="text-[10px] border-success text-success">
                📞 Call Aktif
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Voice Call Button - Only show if call is enabled and not anonymous */}
            {consultation.status === 'active' && !isAnonymousConsultation && (consultation as { is_call_enabled?: boolean }).is_call_enabled && (
              <VoiceCallButton
                consultationId={id!}
                receiverId={clientId}
                receiverPhone={clientPhone}
                isLawyer={true}
                disabled={isCompleted}
              />
            )}
            {/* Consultation Timer */}
            <div className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium">{elapsedTime}</span>
            </div>
            {/* End Consultation Button */}
            {consultation.status === 'active' && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setShowEndDialog(true)}
                className="text-xs h-8 px-2"
              >
                <XCircle className="w-3.5 h-3.5 mr-1" />
                Akhiri
              </Button>
            )}
            {/* Cancel Button - for pending/accepted status */}
            {(consultation.status === 'pending' || consultation.status === 'accepted') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelDialog(true)}
                className="text-xs h-8 px-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Ban className="w-3.5 h-3.5 mr-1" />
                Batalkan
              </Button>
            )}
          </div>
        </div>

        <div className="px-3 pb-2">
          <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-1.5 truncate">
            📋 Topik: {consultation.topic}
          </p>
        </div>
      </div>

      {/* Call Upgrade Notification for Lawyer */}
      {consultation.status === 'active' && (consultation as { is_call_enabled?: boolean }).is_call_enabled && !isAnonymousConsultation && (
        <div className="mx-4 mt-2 p-3 bg-success/10 border border-success/30 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📞</span>
            <div>
              <p className="text-sm font-medium text-success">Fitur Telepon Aktif</p>
              <p className="text-xs text-muted-foreground">Klien telah mengaktifkan fitur telepon</p>
            </div>
          </div>
          {clientPhone && (
            <VoiceCallButton
              consultationId={id!}
              receiverId={clientId}
              receiverPhone={clientPhone}
              isLawyer={true}
              disabled={isCompleted}
            />
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 p-4 pb-24 overflow-y-auto">
        <div className="space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Belum ada pesan. Mulai percakapan!
            </div>
          )}
          {messages.map((message) => {
            const isCurrentUserMessage = message.sender_id === user?.id;
            
            return (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2 animate-fade-in",
                  isCurrentUserMessage ? "justify-end" : "justify-start"
                )}
              >
                {!isCurrentUserMessage && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{displayInitial}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5",
                    isCurrentUserMessage
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-secondary text-secondary-foreground rounded-bl-md"
                  )}
                >
                  {renderMessageContent(message, isCurrentUserMessage)}
                  <p className={cn(
                    "text-[10px] mt-1",
                    isCurrentUserMessage ? "text-primary-foreground/60" : "text-muted-foreground"
                  )}>
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input - only show if consultation is active */}
      {consultation.status === 'active' && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card/95 backdrop-blur-lg border-t border-border p-3 z-50">
          {/* Typing indicator */}
          {isOtherUserTyping && (
            <div className="flex items-center gap-2 mb-2 px-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-muted-foreground">Klien sedang mengetik...</span>
            </div>
          )}

          {/* Recording indicator */}
          {isRecording && (
            <div className="flex items-center justify-center gap-2 mb-2 text-destructive">
              <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
              <span className="text-sm">Merekam...</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={toggleRecording}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isRecording}
            >
              <Paperclip className={cn("w-5 h-5 text-muted-foreground", isUploading && "animate-pulse")} />
            </Button>
            <Input
              value={inputValue}
              onChange={handleInputChange}
              placeholder={isRecording ? "Rekaman aktif..." : "Ketik pesan..."}
              className="flex-1 rounded-full bg-secondary border-0"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  setTyping(false);
                  handleSend();
                }
              }}
              disabled={isRecording}
            />
            {inputValue.trim() ? (
              <Button
                variant="gradient"
                size="icon"
                className="shrink-0 rounded-full"
                onClick={() => {
                  setTyping(false);
                  handleSend();
                }}
                disabled={sendMessage.isPending || isUploading}
              >
                <Send className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant={isRecording ? "destructive" : "outline"}
                size="icon"
                className="shrink-0 rounded-full"
                onClick={toggleRecording}
                disabled={isUploading}
              >
                <Mic className={cn("w-4 h-4", isRecording && "animate-pulse")} />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* View-only notice for completed consultations */}
      {consultation.status === 'completed' && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-muted/95 backdrop-blur-lg border-t border-border p-4 z-50 text-center">
          <p className="text-sm text-muted-foreground">Konsultasi ini sudah selesai</p>
        </div>
      )}

      {/* End Consultation Dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent className="max-w-[90%] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-warning" />
              Akhiri Konsultasi
            </DialogTitle>
            <DialogDescription>
              Berikan saran atau rekomendasi untuk klien sebelum mengakhiri konsultasi.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Saran dari Pengacara (opsional)
              </label>
              <Textarea
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                placeholder="Tuliskan saran, rekomendasi, atau langkah selanjutnya untuk klien..."
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowEndDialog(false)}>
              Batal
            </Button>
            <Button 
              variant="gradient" 
              onClick={handleEndConsultation}
              disabled={updateConsultation.isPending}
            >
              Akhiri Konsultasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <CancelRequestDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleCancelConsultation}
        type="consultation"
        userType="lawyer"
        isLoading={cancelConsultation.isPending}
      />
    </MobileLayout>
  );
}
