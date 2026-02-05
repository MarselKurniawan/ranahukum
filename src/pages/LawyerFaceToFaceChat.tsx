import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Send, Calendar, Clock, MapPin, 
  CheckCircle, User, AlertCircle, FileText, Banknote,
  Camera, X, Paperclip, Loader2
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
  useConfirmMeeting,
  useCompleteFaceToFace,
} from "@/hooks/useFaceToFace";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function LawyerFaceToFaceChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: request, isLoading: isLoadingRequest } = useFaceToFaceRequest(id || "");
  const { data: messages = [], isLoading: isLoadingMessages } = useFaceToFaceMessages(id || "");
  const sendMessage = useSendFaceToFaceMessage();
  const updateRequest = useUpdateFaceToFaceRequest();
  const confirmMeeting = useConfirmMeeting();
  const completeFaceToFace = useCompleteFaceToFace();

  const [newMessage, setNewMessage] = useState("");
  const [showPriceDialog, setShowPriceDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [priceOffer, setPriceOffer] = useState("");
  const [priceNote, setPriceNote] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [meetingNotes, setMeetingNotes] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSendingFile, setIsSendingFile] = useState(false);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSendPriceOffer = async () => {
    if (!priceOffer || !id) {
      toast.error("Masukkan harga penawaran");
      return;
    }

    const price = parseInt(priceOffer.replace(/\D/g, ""));
    if (isNaN(price) || price <= 0) {
      toast.error("Harga tidak valid");
      return;
    }

    try {
      const content = `💰 Penawaran Harga: Rp ${price.toLocaleString("id-ID")}${priceNote ? `\n\n${priceNote}` : ""}`;
      
      await sendMessage.mutateAsync({
        requestId: id,
        content,
        messageType: "price_offer",
        isPriceOffer: true,
        offeredPrice: price,
      });

      setShowPriceDialog(false);
      setPriceOffer("");
      setPriceNote("");
      toast.success("Penawaran harga terkirim");
    } catch (error) {
      toast.error("Gagal mengirim penawaran");
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `face-to-face/${id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("legal-assistance-docs")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("legal-assistance-docs")
        .getPublicUrl(filePath);

      setEvidenceUrl(publicUrl);
      toast.success("Foto berhasil diunggah");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Gagal mengunggah foto");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleConfirmMeeting = async () => {
    if (!id) return;

    try {
      await confirmMeeting.mutateAsync({
        requestId: id,
        evidenceUrl: evidenceUrl || undefined,
        notes: meetingNotes || undefined,
      });
      setShowMeetingDialog(false);
      setEvidenceUrl("");
      setMeetingNotes("");
    } catch (error) {
      toast.error("Gagal mengkonfirmasi pertemuan");
    }
  };

  const handleCompleteSession = async () => {
    if (!id) return;

    try {
      await completeFaceToFace.mutateAsync({
        requestId: id,
        notes: meetingNotes || undefined,
      });
      setShowCompleteDialog(false);
      toast.success("Pertemuan berhasil diselesaikan");
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
  const isPaid = request.payment_status === "paid";
  const canSchedule = isPaid && ["in_progress", "scheduled"].includes(request.status);
  const canConfirmMeeting = request.status === "scheduled" && isPaid;
  const canComplete = request.status === "met";

  return (
    <MobileLayout showBottomNav={false}>
      <div className="flex flex-col h-screen">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

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

              {/* Agreed Price */}
              {request.agreed_price && (
                <div className="mt-3 p-2 bg-success/10 rounded-lg border border-success/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-success">Harga Disepakati</p>
                      <p className="text-sm font-bold text-success">{formatCurrency(request.agreed_price)}</p>
                    </div>
                    <Badge variant={isPaid ? "outline" : "secondary"} className={isPaid ? "border-success text-success" : ""}>
                      {isPaid ? "Lunas" : "Belum Bayar"}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Schedule Info */}
              {request.meeting_date && isPaid && (
                <div className="mt-3 p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-xs font-medium text-primary mb-1">📅 Jadwal Pertemuan</p>
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

              {/* Meeting Evidence */}
              {request.meeting_met_at && (
                <div className="mt-3 p-2 bg-success/10 rounded-lg border border-success/20">
                  <p className="text-xs font-medium text-success mb-1">✅ Sudah Bertemu</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(request.meeting_met_at), "dd MMM yyyy, HH:mm", { locale: localeId })}
                  </p>
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
                Mulai diskusi dengan klien. Tawarkan harga terlebih dahulu.
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.sender_id === user?.id;
              const isScheduleProposal = message.message_type === "schedule_proposal";
              const isPriceOffer = message.message_type === "price_offer";
              const isFile = message.message_type === "file";
              const fileUrl = message.file_url;

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
                      (isScheduleProposal || isPriceOffer) && "border-2 border-primary/30"
                    )}
                  >
                    {isScheduleProposal && (
                      <div className="flex items-center gap-1 mb-1">
                        <Calendar className="w-3 h-3" />
                        <span className="text-xs font-medium">Proposal Jadwal</span>
                      </div>
                    )}
                    {isPriceOffer && (
                      <div className="flex items-center gap-1 mb-1">
                        <Banknote className="w-3 h-3" />
                        <span className="text-xs font-medium">Penawaran Harga</span>
                      </div>
                    )}
                    {/* File/Image display */}
                    {isFile && fileUrl && (
                      <div className="mb-2">
                        {fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <img 
                            src={fileUrl} 
                            alt="Attachment" 
                            className="max-w-full rounded-lg cursor-pointer"
                            onClick={() => window.open(fileUrl, '_blank')}
                          />
                        ) : (
                          <a 
                            href={fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs underline"
                          >
                            📎 Lihat File
                          </a>
                        )}
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
            <div className="flex gap-2 flex-wrap">
              {/* Price offer - only if not agreed yet */}
              {!request.agreed_price && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowPriceDialog(true)}
                >
                  <Banknote className="w-4 h-4 mr-1" />
                  Tawarkan Harga
                </Button>
              )}

              {/* Schedule - only after payment */}
              {canSchedule && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowScheduleDialog(true)}
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Ajukan Jadwal
                </Button>
              )}

              {/* Confirm meeting */}
              {canConfirmMeeting && (
                <Button 
                  size="sm"
                  onClick={() => setShowMeetingDialog(true)}
                >
                  <Camera className="w-4 h-4 mr-1" />
                  Sudah Bertemu
                </Button>
              )}

              {/* Complete */}
              {canComplete && (
                <Button 
                  size="sm"
                  onClick={() => setShowCompleteDialog(true)}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Selesai
                </Button>
              )}
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <input
                ref={chatFileInputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !id) return;
                  
                  setIsSendingFile(true);
                  try {
                    const fileExt = file.name.split('.').pop();
                    const filePath = `face-to-face/${id}/${Date.now()}.${fileExt}`;

                    const { error: uploadError } = await supabase.storage
                      .from('chat-files')
                      .upload(filePath, file);

                    if (uploadError) throw uploadError;

                    const { data: urlData } = supabase.storage
                      .from('chat-files')
                      .getPublicUrl(filePath);

                    const isImage = file.type.startsWith('image/');
                    const content = isImage ? `📷 ${file.name}` : `📎 ${file.name}`;

                    await sendMessage.mutateAsync({
                      requestId: id,
                      content,
                      messageType: "file",
                      fileUrl: urlData.publicUrl,
                    });

                    toast.success("File berhasil dikirim");
                  } catch (error) {
                    toast.error("Gagal mengirim file");
                  } finally {
                    setIsSendingFile(false);
                    if (chatFileInputRef.current) chatFileInputRef.current.value = "";
                  }
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => chatFileInputRef.current?.click()}
                disabled={isSendingFile}
              >
                {isSendingFile ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Paperclip className="w-4 h-4" />
                )}
              </Button>
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

      {/* Price Offer Dialog */}
      <Dialog open={showPriceDialog} onOpenChange={setShowPriceDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Tawarkan Harga</DialogTitle>
            <DialogDescription>
              Tentukan harga untuk konsultasi tatap muka ini
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Harga (Rp)</Label>
              <Input
                type="text"
                placeholder="Contoh: 500000"
                value={priceOffer}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setPriceOffer(value);
                }}
              />
              {priceOffer && (
                <p className="text-xs text-muted-foreground">
                  = {formatCurrency(parseInt(priceOffer) || 0)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Catatan (Opsional)</Label>
              <Textarea
                placeholder="Tambahkan catatan untuk klien..."
                value={priceNote}
                onChange={(e) => setPriceNote(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              onClick={handleSendPriceOffer}
              disabled={!priceOffer || sendMessage.isPending}
              className="w-full"
            >
              Kirim Penawaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* Confirm Meeting Dialog */}
      <Dialog open={showMeetingDialog} onOpenChange={setShowMeetingDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Konfirmasi Pertemuan</DialogTitle>
            <DialogDescription>
              Upload bukti pertemuan dengan klien (foto bersama)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Bukti Pertemuan (Foto)</Label>
              {evidenceUrl ? (
                <div className="relative">
                  <img 
                    src={evidenceUrl} 
                    alt="Bukti pertemuan" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => setEvidenceUrl("")}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-32 border-dashed"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <div className="text-center">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {isUploading ? "Mengunggah..." : "Klik untuk upload foto"}
                    </span>
                  </div>
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label>Catatan (Opsional)</Label>
              <Textarea
                placeholder="Catatan tentang pertemuan..."
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              onClick={handleConfirmMeeting}
              disabled={confirmMeeting.isPending}
              className="w-full"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Konfirmasi Pertemuan
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
              disabled={completeFaceToFace.isPending}
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
