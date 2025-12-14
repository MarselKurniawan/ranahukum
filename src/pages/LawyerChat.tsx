import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Send, Mic, Paperclip, MoreVertical, 
  Phone, Video, XCircle, FileText, Lightbulb 
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  content: string;
  sender: "lawyer" | "client";
  timestamp: Date;
  type: "text" | "voice" | "file";
  fileName?: string;
}

const mockClient = {
  id: "1",
  name: "Andi Pratama",
  photo: "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100&h=100&fit=crop&crop=face",
  topic: "Konsultasi perceraian dan hak asuh anak",
};

const mockMessages: Message[] = [
  {
    id: "1",
    content: "Selamat siang Pak, saya ingin berkonsultasi tentang proses perceraian dan hak asuh anak.",
    sender: "client",
    timestamp: new Date(Date.now() - 600000),
    type: "text",
  },
  {
    id: "2",
    content: "Selamat siang Pak Andi. Baik, silakan ceritakan lebih detail tentang situasi Anda.",
    sender: "lawyer",
    timestamp: new Date(Date.now() - 540000),
    type: "text",
  },
  {
    id: "3",
    content: "Saya sudah menikah 5 tahun dan memiliki 1 anak berusia 3 tahun. Istri saya ingin bercerai dan mengambil hak asuh anak sepenuhnya.",
    sender: "client",
    timestamp: new Date(Date.now() - 480000),
    type: "text",
  },
];

export default function LawyerChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [advice, setAdvice] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "lawyer",
      timestamp: new Date(),
      type: "text",
    };

    setMessages([...messages, newMessage]);
    setInputValue("");
  };

  const handleVoiceNote = () => {
    setIsRecording(!isRecording);
    if (isRecording) {
      const newMessage: Message = {
        id: Date.now().toString(),
        content: "Voice note (0:05)",
        sender: "lawyer",
        timestamp: new Date(),
        type: "voice",
      };
      setMessages([...messages, newMessage]);
    }
  };

  const handleEndConsultation = () => {
    // Would save to database in real app
    navigate("/lawyer/dashboard");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <MobileLayout showBottomNav={false}>
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Avatar className="w-10 h-10">
              <AvatarImage src={mockClient.photo} alt={mockClient.name} />
              <AvatarFallback>{mockClient.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-sm">{mockClient.name}</h2>
              <Badge variant="success" className="text-[10px]">Konsultasi Aktif</Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon">
              <Phone className="w-5 h-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowEndDialog(true)} className="text-destructive">
                  <XCircle className="w-4 h-4 mr-2" />
                  Akhiri Konsultasi
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="px-4 pb-3">
          <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2">
            📋 Topik: {mockClient.topic}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 pb-24 overflow-y-auto">
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2 animate-fade-in",
                message.sender === "lawyer" ? "justify-end" : "justify-start"
              )}
            >
              {message.sender === "client" && (
                <Avatar className="w-8 h-8">
                  <AvatarImage src={mockClient.photo} alt={mockClient.name} />
                  <AvatarFallback>{mockClient.name[0]}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2.5",
                  message.sender === "lawyer"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-secondary text-secondary-foreground rounded-bl-md"
                )}
              >
                {message.type === "voice" && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="h-1 bg-primary-foreground/30 rounded-full w-20" />
                    </div>
                    <span className="text-xs">0:05</span>
                  </div>
                )}
                {message.type === "file" && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    <span className="text-sm">{message.fileName}</span>
                  </div>
                )}
                {message.type === "text" && (
                  <p className="text-sm">{message.content}</p>
                )}
                <p className={cn(
                  "text-[10px] mt-1",
                  message.sender === "lawyer" ? "text-primary-foreground/60" : "text-muted-foreground"
                )}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card/95 backdrop-blur-lg border-t border-border p-3 z-50">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Paperclip className="w-5 h-5 text-muted-foreground" />
          </Button>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ketik pesan..."
            className="flex-1 rounded-full bg-secondary border-0"
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />
          {inputValue.trim() ? (
            <Button
              variant="gradient"
              size="icon"
              className="shrink-0 rounded-full"
              onClick={handleSend}
            >
              <Send className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              className="shrink-0 rounded-full"
              onClick={handleVoiceNote}
            >
              <Mic className={cn("w-4 h-4", isRecording && "animate-pulse")} />
            </Button>
          )}
        </div>
      </div>

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
            <Button variant="gradient" onClick={handleEndConsultation}>
              Akhiri Konsultasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
