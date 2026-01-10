import { AlertCircle, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLawyerProfileCompletion } from "@/hooks/useLawyerProfile";

interface LawyerProfileAlertProps {
  onComplete: () => void;
}

export function LawyerProfileAlert({ onComplete }: LawyerProfileAlertProps) {
  const completion = useLawyerProfileCompletion();

  if (!completion || completion.isComplete) {
    return null;
  }

  const percentage = Math.round((completion.completedFields / completion.totalFields) * 100);

  return (
    <Card className="border-warning/50 bg-warning/10">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-warning" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">Lengkapi Profil Anda</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Anda harus melengkapi profil sebelum dapat menerima klien
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {completion.completedFields}/{completion.totalFields} data lengkap
            </span>
            <span className="font-medium text-warning">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Data yang belum lengkap:</p>
          <div className="flex flex-wrap gap-1.5">
            {completion.missingFields.map((field) => (
              <span 
                key={field} 
                className="inline-flex items-center text-xs bg-warning/20 text-warning-foreground px-2 py-0.5 rounded-full"
              >
                {field}
              </span>
            ))}
          </div>
        </div>

        <Button 
          variant="warning" 
          size="sm" 
          className="w-full"
          onClick={onComplete}
        >
          Lengkapi Sekarang
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
