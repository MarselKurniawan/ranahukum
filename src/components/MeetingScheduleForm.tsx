import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, MapPin, CheckCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface MeetingScheduleFormProps {
  onSubmit: (data: MeetingData) => Promise<void>;
  initialData?: Partial<MeetingData>;
  isSubmitting?: boolean;
  isScheduled?: boolean;
  isLawyer?: boolean;
}

export interface MeetingData {
  meeting_date: string;
  meeting_time: string;
  meeting_location: string;
  meeting_notes?: string;
}

export function MeetingScheduleForm({ 
  onSubmit, 
  initialData, 
  isSubmitting = false,
  isScheduled = false,
  isLawyer = false
}: MeetingScheduleFormProps) {
  const [formData, setFormData] = useState<MeetingData>({
    meeting_date: initialData?.meeting_date || "",
    meeting_time: initialData?.meeting_time || "",
    meeting_location: initialData?.meeting_location || "",
    meeting_notes: initialData?.meeting_notes || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.meeting_date) {
      return;
    }
    if (!formData.meeting_time) {
      return;
    }
    if (!formData.meeting_location.trim()) {
      return;
    }

    await onSubmit(formData);
  };

  if (isScheduled && initialData?.meeting_date) {
    const meetingDate = new Date(initialData.meeting_date);
    
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Jadwal Pertemuan</p>
              <p className="text-xs text-muted-foreground">
                Pertemuan tatap muka dengan lawyer
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {format(meetingDate, "EEEE, dd MMMM yyyy", { locale: idLocale })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{initialData.meeting_time} WIB</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <span className="text-sm">{initialData.meeting_location}</span>
            </div>
            {initialData.meeting_notes && (
              <div className="bg-muted/50 rounded-lg p-3 mt-2">
                <p className="text-xs text-muted-foreground mb-1">Catatan:</p>
                <p className="text-sm">{initialData.meeting_notes}</p>
              </div>
            )}
          </div>

          <div className="mt-4 bg-warning/10 border border-warning/20 rounded-lg p-3 flex gap-2">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <p className="text-xs text-warning">
              Jangan lupa bawa KTP asli dan dokumen yang diperlukan saat pertemuan.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isLawyer) {
    return (
      <Card className="border-muted">
        <CardContent className="p-4 text-center">
          <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Menunggu lawyer menjadwalkan pertemuan
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <CardTitle className="text-base">Jadwalkan Pertemuan</CardTitle>
        </div>
        <CardDescription>
          Atur jadwal pertemuan tatap muka dengan client
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="meeting_date">Tanggal *</Label>
              <Input
                id="meeting_date"
                type="date"
                value={formData.meeting_date}
                onChange={(e) => setFormData(prev => ({ ...prev, meeting_date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meeting_time">Waktu *</Label>
              <Input
                id="meeting_time"
                type="time"
                value={formData.meeting_time}
                onChange={(e) => setFormData(prev => ({ ...prev, meeting_time: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting_location">Lokasi Pertemuan *</Label>
            <Input
              id="meeting_location"
              value={formData.meeting_location}
              onChange={(e) => setFormData(prev => ({ ...prev, meeting_location: e.target.value }))}
              placeholder="Kantor Pengacara, Jl. Contoh No. 123"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting_notes">Catatan (opsional)</Label>
            <Textarea
              id="meeting_notes"
              value={formData.meeting_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, meeting_notes: e.target.value }))}
              placeholder="Hal-hal yang perlu dibawa, instruksi khusus, dll."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            variant="gradient"
            disabled={isSubmitting}
          >
            <Calendar className="w-4 h-4 mr-2" />
            {isSubmitting ? "Menjadwalkan..." : "Jadwalkan Pertemuan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
