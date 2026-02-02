import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Send, Calendar, Clock, MapPin, 
  CheckCircle, User, AlertCircle, FileText 
} from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useFaceToFaceRequest,
  useFaceToFaceMessages,
  useSendFaceToFaceMessage,
  useUpdateFaceToFaceRequest,
} from "@/hooks/useFaceToFace";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function LawyerFaceToFaceChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: request, isLoading: isLoadingRequest } = useFaceToFaceRequest(id || "");
  const { data: messages = [], isLoading: isLoadingMessages } = useFaceToFaceMessages(id || "");
  const sendMessage = useSendFaceToFaceMessage();
  const updateRequest = useUpdateFaceToFaceRequest();

  const [newMessage, setNewMessage] = useState("");
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [meetingNotes, setMeetingNotes] = useState("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !id) return;

    try {
      await sendMessage.mutateAsync({
        requestId: id,
        content: newMessage.trim(),
      });
      setNewMessage("");
    } catch (error) {
      toast.error("Gagal mengirim pesan");
    }
  };

  const handleProposeSchedule = async () => {
    if (!selectedDate || !selectedTime || !selectedLocation || !id) {
      toast.error("Lengkapi semua data jadwal");
      return;
    }

    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const content = `📅 Proposal Jadwal Pertemuan:\n\n📆 Tanggal: ${format(selectedDate, "EEEE, dd MMMM yyyy", { locale: localeId })}\n⏰ Waktu: ${selectedTime}\n📍 Lokasi: ${selectedLocation}`;

      await sendMessage.mutateAsync({
        requestId: id,
        content,
        messageType: "schedule_proposal",
        proposedDate: dateStr,
        proposedTime: selectedTime,
        proposedLocation: selectedLocation,
      });

      setShowScheduleDialog(false);
      setSelectedDate(undefined);
      setSelectedTime("");
      setSelectedLocation("");
      toast.success("Proposal jadwal terkirim");
    } catch (error) {
      toast.error("Gagal mengirim proposal jadwal");
    }
  };

  const handleCompleteSession = async () => {
    if (!id) return;

    try {
      await updateRequest.mutateAsync({
        id,
        status: "completed",
        meeting_notes: meetingNotes || undefined,
      });
      setShowCompleteDialog(false);
      toast.success("Pertemuan ditandai selesai");
    } catch (error) {
      toast.error("Gagal menyelesaikan pertemuan");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoadingRequest || isLoadingMessages) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="p-4 space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </MobileLayout>
    );
  }

  if (!request) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Permintaan tidak ditemukan</p>
            <Button className="mt-4" onClick={() => navigate("/lawyer/face-to-face")}>
              Kembali
            </Button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  const isCompleted = request.status === "completed";
  const isCancelled = request.status === "cancelled";
  const isReadOnly = isCompleted || isCancelled;

  return (
    <MobileLayout showBottomNav={false}>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-10 p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/lawyer/face-to-face")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold truncate">{request.profiles?.full_name || 'Pengguna'}</p>
                <Badge variant="outline" className="text-xs shrink-0">
                  {request.display_id || "Tatap Muka"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {request.case_type || "Konsultasi Tatap Muka"}
              </p>
            </div>
          </div>
        </div>

        {/* Request Info Card */}
        <div className="p-3 border-b border-border bg-muted/30">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Deskripsi Kasus</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {request.case_description}
                  </p>
                </div>
              </div>

              {request.status === "scheduled" && request.meeting_date && (
                <div className="mt-3 p-2 bg-success/10 rounded-lg border border-success/20">
                  <p className="text-xs font-medium text-success mb-1">Jadwal Dikonfirmasi</p>
                  <div className="space-y-0.5 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      <span>{format(new Date(request.meeting_date), "EEEE, dd MMMM yyyy", { locale: localeId })}</span>
                    </div>
                    {request.meeting_time && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        <span>{request.meeting_time}</span>
                      </div>
                    )}
                    {request.meeting_location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" />
                        <span>{request.meeting_location}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Mulai diskusi dengan klien tentang jadwal pertemuan
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.sender_id === user?.id;
              const isScheduleProposal = message.message_type === "schedule_proposal";

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    isOwn ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2",
                      isOwn
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md",
                      isScheduleProposal && "border-2 border-primary/30"
                    )}
                  >
                    {isScheduleProposal && (
                      <div className="flex items-center gap-1 mb-1">
                        <Calendar className="w-3 h-3" />
                        <span className="text-xs font-medium">Proposal Jadwal</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={cn(
                      "text-[10px] mt-1",
                      isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {format(new Date(message.created_at), "HH:mm")}
                    </p>
                    {isScheduleProposal && message.is_schedule_accepted && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-success">
                        <CheckCircle className="w-3 h-3" />
                        <span>Diterima</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Actions */}
        {!isReadOnly && (
          <div className="border-t border-border bg-card p-3 space-y-2">
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => setShowScheduleDialog(true)}
              >
                <Calendar className="w-4 h-4 mr-1" />
                Ajukan Jadwal
              </Button>
              {request.status === "scheduled" && (
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setShowCompleteDialog(true)}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Selesai
                </Button>
              )}
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Ketik pesan..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                className="flex-1"
              />
              <Button 
                size="icon" 
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sendMessage.isPending}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {isReadOnly && (
          <div className="border-t border-border bg-muted/50 p-4 text-center">
            <Badge variant={isCompleted ? "secondary" : "destructive"}>
              {isCompleted ? "Pertemuan Selesai" : "Dibatalkan"}
            </Badge>
          </div>
        )}
      </div>

      {/* Schedule Proposal Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Ajukan Jadwal Pertemuan</DialogTitle>
            <DialogDescription>
              Tentukan tanggal, waktu, dan lokasi pertemuan dengan klien
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tanggal</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <Calendar className="w-4 h-4 mr-2" />
                    {selectedDate 
                      ? format(selectedDate, "EEEE, dd MMMM yyyy", { locale: localeId })
                      : "Pilih tanggal"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Waktu</Label>
              <Input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Lokasi</Label>
              <Textarea
                placeholder="Alamat lengkap lokasi pertemuan..."
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              onClick={handleProposeSchedule}
              disabled={!selectedDate || !selectedTime || !selectedLocation || sendMessage.isPending}
              className="w-full"
            >
              Kirim Proposal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Session Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Selesaikan Pertemuan</DialogTitle>
            <DialogDescription>
              Tandai bahwa pertemuan tatap muka telah selesai dilakukan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Catatan Pertemuan (Opsional)</Label>
              <Textarea
                placeholder="Tambahkan catatan tentang pertemuan..."
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              onClick={handleCompleteSession}
              disabled={updateRequest.isPending}
              className="w-full"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Tandai Selesai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
