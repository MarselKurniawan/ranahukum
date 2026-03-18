import { AlertTriangle, FileX, PenOff, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { HeldEarningDetail } from "@/hooks/useLawyerWithdrawal";

interface HeldBalanceCardProps {
  heldAmount: number;
  heldDetails: HeldEarningDetail[];
}

export function HeldBalanceCard({ heldAmount, heldDetails }: HeldBalanceCardProps) {
  const navigate = useNavigate();

  if (heldAmount <= 0 || heldDetails.length === 0) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className="border-warning/30 bg-warning/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2 text-warning">
          <AlertTriangle className="h-4 w-4" />
          Saldo Tertahan: {formatCurrency(heldAmount)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Dana berikut ditahan karena dokumen pendampingan belum lengkap. Upload bukti pertemuan dan tanda tangan untuk mencairkan.
        </p>

        {heldDetails.map((detail) => (
          <div
            key={detail.earningId}
            className="flex items-start justify-between p-3 rounded-lg bg-card border border-border"
          >
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px]">
                  {detail.displayId || 'Pendampingan'}
                </Badge>
                {detail.caseType && (
                  <Badge variant="secondary" className="text-[10px]">
                    {detail.caseType}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Klien: {detail.clientName || 'Tidak diketahui'}
              </p>
              <div className="flex items-center gap-3 mt-1">
                {detail.missingEvidence && (
                  <span className="flex items-center gap-1 text-[10px] text-destructive">
                    <FileX className="h-3 w-3" />
                    Bukti Pertemuan
                  </span>
                )}
                {detail.missingSignature && (
                  <span className="flex items-center gap-1 text-[10px] text-destructive">
                    <PenOff className="h-3 w-3" />
                    Tanda Tangan
                  </span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0 ml-2">
              <p className="text-sm font-semibold text-warning">
                {formatCurrency(detail.amount)}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
