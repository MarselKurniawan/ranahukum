import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ConsultationWithDetails } from "@/hooks/useSuperAdmin";

interface AdminConsultationsTabProps {
  allConsultations: ConsultationWithDetails[];
  loadingConsultations: boolean;
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}jt`;
  return `Rp ${value.toLocaleString('id-ID')}`;
};

export function AdminConsultationsTab({ allConsultations, loadingConsultations }: AdminConsultationsTabProps) {
  const navigate = useNavigate();
  const [searchConsultation, setSearchConsultation] = useState("");

  const filteredConsultations = allConsultations.filter(c =>
    c.topic?.toLowerCase().includes(searchConsultation.toLowerCase()) ||
    c.client_profile?.full_name?.toLowerCase().includes(searchConsultation.toLowerCase()) ||
    c.lawyer?.name?.toLowerCase().includes(searchConsultation.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cari berdasarkan topik, client, atau lawyer..." value={searchConsultation} onChange={(e) => setSearchConsultation(e.target.value)} className="pl-9" />
        </div>
        <p className="text-sm text-muted-foreground">{filteredConsultations.length} dari {allConsultations.length} konsultasi</p>
      </div>

      {loadingConsultations ? <Skeleton className="h-24 w-full" /> : filteredConsultations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConsultations.slice(0, 30).map((consultation) => (
            <Card key={consultation.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/admin/consultation/${consultation.id}`)}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{consultation.client_profile?.full_name || 'Anonim'}</p>
                    <p className="text-sm text-muted-foreground truncate">→ {consultation.lawyer?.name || 'Unknown'}</p>
                  </div>
                  <Badge variant={
                    consultation.status === 'completed' ? 'success' :
                    consultation.status === 'active' ? 'accent' :
                    consultation.status === 'pending' ? 'warning' : 'secondary'
                  } className="shrink-0">{consultation.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{consultation.topic}</p>
                <Separator className="my-3" />
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">{formatCurrency(consultation.price)}</span>
                  <span className="text-muted-foreground">{new Date(consultation.created_at).toLocaleDateString('id-ID')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Tidak ada konsultasi ditemukan</p>
        </div>
      )}
    </div>
  );
}
