import { AlertTriangle, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDistanceToNow, isPast } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface SuspensionBannerProps {
  suspendedUntil: string;
  suspendReason?: string | null;
  userType?: 'lawyer' | 'client';
}

export function SuspensionBanner({ 
  suspendedUntil, 
  suspendReason,
  userType = 'client'
}: SuspensionBannerProps) {
  const suspendDate = new Date(suspendedUntil);
  const isExpired = isPast(suspendDate);

  if (isExpired) return null;

  const timeRemaining = formatDistanceToNow(suspendDate, { 
    locale: idLocale,
    addSuffix: true 
  });

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="font-semibold">Akun Anda Ditangguhkan</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">
          Akun Anda sementara ditangguhkan dan akan berakhir {timeRemaining}.
        </p>
        {suspendReason && (
          <p className="text-sm opacity-90">
            <span className="font-medium">Alasan:</span> {suspendReason}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2 text-sm opacity-90">
          <Clock className="w-4 h-4" />
          <span>
            Berakhir: {suspendDate.toLocaleString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        {userType === 'lawyer' && (
          <p className="text-sm mt-2 opacity-90">
            Anda masih dapat mengakses fitur penarikan saldo selama masa penangguhan.
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}
