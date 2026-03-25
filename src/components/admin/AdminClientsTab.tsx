import { useState } from "react";
import { Search, Users, UserX, CheckCircle, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConsultationWithDetails } from "@/hooks/useSuperAdmin";

interface AdminClientsTabProps {
  clients: any[];
  allConsultations: ConsultationWithDetails[];
  onSuspendClient: (client: any) => void;
  onUnsuspendClient: (profileId: string) => void;
}

export function AdminClientsTab({ clients, allConsultations, onSuspendClient, onUnsuspendClient }: AdminClientsTabProps) {
  const [searchClient, setSearchClient] = useState("");

  const filteredClients = clients.filter(c =>
    c.full_name?.toLowerCase().includes(searchClient.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchClient.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cari client berdasarkan nama atau email..." value={searchClient} onChange={(e) => setSearchClient(e.target.value)} className="pl-9" />
        </div>
        <p className="text-sm text-muted-foreground">{filteredClients.length} dari {clients.length} client</p>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="text-center">Konsultasi</TableHead>
              <TableHead className="text-center">Akun</TableHead>
              <TableHead className="text-right">Bergabung</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => {
              const clientConsultations = allConsultations.filter(c => c.client_id === client.user_id);
              return (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={client.avatar_url || undefined} />
                        <AvatarFallback>{client.full_name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{client.full_name || 'Anonim'}</p>
                        <p className="text-sm text-muted-foreground md:hidden">{client.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{client.email}</TableCell>
                  <TableCell className="text-center">{clientConsultations.length}</TableCell>
                  <TableCell className="text-center">
                    {client.is_suspended ? (
                      <Badge variant="destructive" className="text-xs">Suspended</Badge>
                    ) : (
                      <Badge variant="success" className="text-xs">Aktif</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(client.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {client.is_suspended ? (
                          <DropdownMenuItem className="text-success" onClick={() => onUnsuspendClient(client.id)}>
                            <CheckCircle className="w-4 h-4 mr-2" />Aktifkan Kembali
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-destructive" onClick={() => onSuspendClient(client)}>
                            <UserX className="w-4 h-4 mr-2" />Suspend Akun
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Tidak ada client ditemukan</p>
        </div>
      )}
    </div>
  );
}
