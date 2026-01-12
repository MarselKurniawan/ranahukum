import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Mic, Paperclip, Play, Pause, FileText, X, Clock, CheckCircle } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useConsultation } from "@/hooks/useConsultations";
import { useMessages, useSendMessage } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { useChatUpload } from "@/hooks/useChatUpload";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: consultation, isLoading: loadingConsultation } = useConsultation(id || '');
  const { data: messages = [], isLoading: loadingMessages } = useMessages(id || '');
  const sendMessage = useSendMessage();
  const { isUploading, isRecording, sendFileMessage, toggleRecording } = useChatUpload({ 
    consultationId: id || '' 
  });
  
  const [inputValue, setInputValue] = useState("");
  const [elapsedTime, setElapsedTime] = useState("00:00");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    await sendMessage.mutateAsync({
      consultationId: id,
      content,
      messageType: 'text'
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await sendFileMessage(file);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessageContent = (message: { message_type: string; content: string; file_url: string | null }, isUser: boolean) => {
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

  if (loadingConsultation || loadingMessages) {
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

  const lawyer = consultation.lawyers;
  const lawyerUserId = (lawyer as { user_id?: string })?.user_id;

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
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="relative">
                <img
                  src={lawyer?.image_url || '/placeholder.svg'}
                  alt={lawyer?.name || 'Lawyer'}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {!isCompleted && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-card" />
                )}
              </div>
              <div>
                <h2 className="font-semibold text-sm">{lawyer?.name}</h2>
                {isCompleted ? (
                  <p className="text-xs text-muted-foreground">Konsultasi Selesai</p>
                ) : (
                  <p className="text-xs text-success">Online</p>
                )}
              </div>
            </div>
          </div>
          {/* Consultation Timer */}
          <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{elapsedTime}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 pb-20 overflow-y-auto">
        <div className="space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Belum ada pesan. Mulai percakapan!
            </div>
          )}
          {messages.map((message) => {
            const isUser = message.sender_id === user?.id;
            const isLawyer = message.sender_id === lawyerUserId;
            
            return (
              <div
                key={message.id}
                className={cn(
                  "flex animate-fade-in",
                  isUser ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5",
                    isUser
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-secondary text-secondary-foreground rounded-bl-md"
                  )}
                >
                  {renderMessageContent(message, isUser)}
                  <p
                    className={cn(
                      "text-[10px] mt-1",
                      isUser
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
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
      {!isCompleted && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card/95 backdrop-blur-lg border-t border-border p-3 z-50">
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
              <Paperclip className={cn("w-5 h-5", isUploading && "animate-pulse")} />
            </Button>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isRecording ? "Rekaman aktif..." : "Ketik pesan..."}
              className="flex-1 rounded-full bg-secondary border-0"
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              disabled={isRecording}
            />
            {inputValue.trim() ? (
              <Button
                variant="gradient"
                size="icon"
                className="shrink-0 rounded-full"
                onClick={handleSend}
                disabled={sendMessage.isPending || isUploading}
              >
                <Send className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant={isRecording ? "destructive" : "secondary"}
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

      {/* Completed notice */}
      {isCompleted && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-muted/95 backdrop-blur-lg border-t border-border p-4 z-50">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <CheckCircle className="w-5 h-5 text-success" />
            <p className="text-sm">Konsultasi ini sudah selesai</p>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
