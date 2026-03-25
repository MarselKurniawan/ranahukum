import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, Video, UserX, CheckCircle, MoreHorizontal, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DbLawyer } from "@/hooks/useLawyers";
import { ConsultationWithDetails } from "@/hooks/useSuperAdmin";

interface AdminLawyersTabProps {
  approvedLawyers: DbLawyer[];
  allConsultations: ConsultationWithDetails[];
  onOpenInterview: (lawyer: any) => void;
  onSuspendLawyer: (lawyer: any) => void;
  onUnsuspendLawyer: (lawyerId: string) => void;
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}jt`;
  return `Rp ${value.toLocaleString('id-ID')}`;
};

export function AdminLawyersTab({ approvedLawyers, allConsultations, onOpenInterview, onSuspendLawyer, onUnsuspendLawyer }: AdminLawyersTabProps) {
  const navigate = useNavigate();
  const [searchLawyer, setSearchLawyer] = useState("");

  const filteredLawyers = approvedLawyers.filter(l =>
    l.name.toLowerCase().includes(searchLawyer.toLowerCase()) ||
    l.location?.toLowerCase().includes(searchLawyer.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cari lawyer berdasarkan nama atau lokasi..." value={searchLawyer} onChange={(e) => setSearchLawyer(e.target.value)} className="pl-9" />
        </div>
        <p className="text-sm text-muted-foreground">{filteredLawyers.length} dari {approvedLawyers.length} lawyer</p>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lawyer</TableHead>
              <TableHead className="hidden md:table-cell">Lokasi</TableHead>
              <TableHead className="hidden lg:table-cell">Spesialisasi</TableHead>
              <TableHead className="text-center">Rating</TableHead>
              <TableHead className="text-center">Konsultasi</TableHead>
              <TableHead className="text-right hidden md:table-cell">Revenue</TableHead>
              <TableHead className="text-center w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLawyers.map((lawyer) => {
              const lawyerConsultations = allConsultations.filter(c => c.lawyer_id === lawyer.id && c.status === 'completed');
              const revenue = lawyerConsultations.reduce((sum, c) => sum + c.price, 0);
              return (
                <TableRow key={lawyer.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={lawyer.image_url || undefined} />
                        <AvatarFallback>{lawyer.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{lawyer.name}</p>
                        <p className="text-sm text-muted-foreground md:hidden">{lawyer.location}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{lawyer.location}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(lawyer.specialization || []).slice(0, 2).map((spec) => (
                        <Badge key={spec} variant="secondary" className="text-xs">{spec}</Badge>
                      ))}
                      {(lawyer.specialization || []).length > 2 && (
                        <Badge variant="outline" className="text-xs">+{(lawyer.specialization || []).length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-medium">{lawyer.rating || 0}</span>
                    <span className="text-muted-foreground text-sm"> ({lawyer.review_count || 0})</span>
                  </TableCell>
                  <TableCell className="text-center">{lawyerConsultations.length}</TableCell>
                  <TableCell className="text-right hidden md:table-cell font-medium">{formatCurrency(revenue)}</TableCell>
                  <TableCell className="text-center">
                    {lawyer.is_suspended ? (
                      <Badge variant="destructive" className="text-xs">Suspended</Badge>
                    ) : (
                      <Badge variant="success" className="text-xs">Aktif</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/admin/lawyer/${lawyer.id}`)}>
                          <Eye className="w-4 h-4 mr-2" />Lihat Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onOpenInterview(lawyer)}>
                          <Video className="w-4 h-4 mr-2" />Interview
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {lawyer.is_suspended ? (
                          <DropdownMenuItem className="text-success" onClick={() => onUnsuspendLawyer(lawyer.id)}>
                            <CheckCircle className="w-4 h-4 mr-2" />Aktifkan Kembali
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-destructive" onClick={() => onSuspendLawyer(lawyer)}>
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

      {filteredLawyers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Tidak ada lawyer ditemukan</p>
        </div>
      )}
    </div>
  );
}
