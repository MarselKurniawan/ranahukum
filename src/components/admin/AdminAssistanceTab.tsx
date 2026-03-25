import { useNavigate } from "react-router-dom";
import { Gavel } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAllAssistanceRequests } from "@/hooks/useLegalAssistance";

export function AdminAssistanceTab() {
  const navigate = useNavigate();
  const { data: allAssistanceRequests = [] } = useAllAssistanceRequests();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Gavel className="w-5 h-5" />
              Pendampingan Hukum
              <Badge variant="secondary">{allAssistanceRequests.length}</Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {allAssistanceRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Lawyer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Akun</TableHead>
                  <TableHead>Tahap</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allAssistanceRequests.map((req) => (
                  <TableRow key={req.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/admin/assistance/${req.id}`)}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={req.client?.avatar_url || undefined} />
                          <AvatarFallback>{req.client?.full_name?.[0] || 'C'}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{req.client?.full_name || 'Client'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={req.lawyer?.image_url || undefined} />
                          <AvatarFallback>{req.lawyer?.name?.[0] || 'L'}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{req.lawyer?.name || 'Lawyer'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        req.status === 'completed' ? 'secondary' :
                        req.status === 'in_progress' ? 'default' :
                        req.status === 'agreed' ? 'success' :
                        req.status === 'negotiating' ? 'accent' :
                        req.status === 'cancelled' || req.status === 'rejected' ? 'destructive' : 'warning'
                      }>{req.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{req.current_stage || '-'}</TableCell>
                    <TableCell className="text-sm font-medium">{req.agreed_price ? `Rp ${req.agreed_price.toLocaleString('id-ID')}` : '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(req.created_at).toLocaleDateString('id-ID')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Gavel className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">Belum ada pendampingan hukum</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
