import { useState } from "react";
import { Plus, Bell, Gift, Megaphone, Info, Pencil, Trash2, X, CheckCircle, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAllNotifications, useCreateNotification, useUpdateNotification, useDeleteNotification, type Notification } from "@/hooks/useNotifications";

const getNotifTypeIcon = (type: string) => {
  switch (type) {
    case "promo": return <Gift className="w-4 h-4" />;
    case "announcement": return <Megaphone className="w-4 h-4" />;
    default: return <Info className="w-4 h-4" />;
  }
};

const getNotifTypeLabel = (type: string) => {
  switch (type) {
    case "promo": return "Promo";
    case "announcement": return "Pengumuman";
    default: return "Info";
  }
};

export function AdminNotificationsTab() {
  const { toast } = useToast();
  const { data: allNotifications = [] } = useAllNotifications();
  const createNotification = useCreateNotification();
  const updateNotification = useUpdateNotification();
  const deleteNotification = useDeleteNotification();

  const [addNotifOpen, setAddNotifOpen] = useState(false);
  const [editNotifOpen, setEditNotifOpen] = useState(false);
  const [deleteNotifOpen, setDeleteNotifOpen] = useState(false);
  const [editingNotif, setEditingNotif] = useState<Notification | null>(null);
  const [deletingNotifId, setDeletingNotifId] = useState<string | null>(null);
  const [newNotif, setNewNotif] = useState({
    title: "", description: "", type: "info", image_url: "", promo_code: "", valid_until: "", target_audience: "all"
  });

  const handleCreateNotification = async () => {
    if (!newNotif.title.trim() || !newNotif.description.trim()) return;
    try {
      await createNotification.mutateAsync({
        title: newNotif.title, description: newNotif.description, type: newNotif.type,
        image_url: newNotif.image_url || undefined, promo_code: newNotif.promo_code || undefined,
        valid_until: newNotif.valid_until || undefined, target_audience: newNotif.target_audience
      });
      toast({ title: "Notifikasi berhasil dibuat" });
      setNewNotif({ title: "", description: "", type: "info", image_url: "", promo_code: "", valid_until: "", target_audience: "all" });
      setAddNotifOpen(false);
    } catch { toast({ title: "Gagal", variant: "destructive" }); }
  };

  const handleUpdateNotification = async () => {
    if (!editingNotif || !editingNotif.title.trim()) return;
    try {
      await updateNotification.mutateAsync({
        id: editingNotif.id, title: editingNotif.title, description: editingNotif.description,
        type: editingNotif.type, image_url: editingNotif.image_url, promo_code: editingNotif.promo_code,
        valid_until: editingNotif.valid_until, is_active: editingNotif.is_active, target_audience: editingNotif.target_audience
      });
      toast({ title: "Notifikasi berhasil diperbarui" });
      setEditingNotif(null); setEditNotifOpen(false);
    } catch { toast({ title: "Gagal", variant: "destructive" }); }
  };

  const handleDeleteNotification = async () => {
    if (!deletingNotifId) return;
    try {
      await deleteNotification.mutateAsync(deletingNotifId);
      toast({ title: "Notifikasi berhasil dihapus" });
      setDeletingNotifId(null); setDeleteNotifOpen(false);
    } catch { toast({ title: "Gagal", variant: "destructive" }); }
  };

  const handleToggleNotifActive = async (notif: Notification) => {
    try {
      await updateNotification.mutateAsync({ id: notif.id, is_active: !notif.is_active });
      toast({ title: notif.is_active ? "Notifikasi dinonaktifkan" : "Notifikasi diaktifkan" });
    } catch { toast({ title: "Gagal", variant: "destructive" }); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Kelola Notifikasi</h3>
          <p className="text-sm text-muted-foreground">Buat promo, pengumuman, atau info untuk pengguna</p>
        </div>
        <Dialog open={addNotifOpen} onOpenChange={setAddNotifOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Buat Notifikasi</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Buat Notifikasi Baru</DialogTitle>
              <DialogDescription>Notifikasi akan dikirim ke semua pengguna sesuai target audience</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipe</Label>
                  <Select value={newNotif.type} onValueChange={(v) => setNewNotif({...newNotif, type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info"><div className="flex items-center gap-2"><Info className="w-4 h-4" />Info</div></SelectItem>
                      <SelectItem value="promo"><div className="flex items-center gap-2"><Gift className="w-4 h-4" />Promo</div></SelectItem>
                      <SelectItem value="announcement"><div className="flex items-center gap-2"><Megaphone className="w-4 h-4" />Pengumuman</div></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target</Label>
                  <Select value={newNotif.target_audience} onValueChange={(v) => setNewNotif({...newNotif, target_audience: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Pengguna</SelectItem>
                      <SelectItem value="clients">Client Only</SelectItem>
                      <SelectItem value="lawyers">Lawyer Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Judul *</Label>
                <Input value={newNotif.title} onChange={(e) => setNewNotif({...newNotif, title: e.target.value})} placeholder="Contoh: Diskon 50% Konsultasi Pertama!" />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi *</Label>
                <Textarea value={newNotif.description} onChange={(e) => setNewNotif({...newNotif, description: e.target.value})} placeholder="Deskripsi lengkap notifikasi..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>URL Gambar (Opsional)</Label>
                <Input value={newNotif.image_url} onChange={(e) => setNewNotif({...newNotif, image_url: e.target.value})} placeholder="https://example.com/image.jpg" />
              </div>
              {newNotif.type === 'promo' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kode Promo</Label>
                    <Input value={newNotif.promo_code} onChange={(e) => setNewNotif({...newNotif, promo_code: e.target.value})} placeholder="NEWUSER50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Berlaku Sampai</Label>
                    <Input type="date" value={newNotif.valid_until} onChange={(e) => setNewNotif({...newNotif, valid_until: e.target.value})} />
                  </div>
                </div>
              )}
              <Button className="w-full" onClick={handleCreateNotification} disabled={createNotification.isPending || !newNotif.title.trim() || !newNotif.description.trim()}>
                Buat Notifikasi
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {allNotifications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allNotifications.map((notif) => (
            <Card key={notif.id} className={`${!notif.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      notif.type === 'promo' ? 'bg-green-500/10 text-green-600' :
                      notif.type === 'announcement' ? 'bg-blue-500/10 text-blue-600' :
                      'bg-gray-500/10 text-gray-600'
                    }`}>{getNotifTypeIcon(notif.type)}</div>
                    <Badge variant="outline" className="text-xs">{getNotifTypeLabel(notif.type)}</Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditingNotif(notif); setEditNotifOpen(true); }}>
                        <Pencil className="w-4 h-4 mr-2" />Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleNotifActive(notif)}>
                        {notif.is_active ? <><X className="w-4 h-4 mr-2" />Nonaktifkan</> : <><CheckCircle className="w-4 h-4 mr-2" />Aktifkan</>}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => { setDeletingNotifId(notif.id); setDeleteNotifOpen(true); }}>
                        <Trash2 className="w-4 h-4 mr-2" />Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h4 className="font-semibold mb-1 line-clamp-1">{notif.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{notif.description}</p>
                {notif.image_url && (
                  <div className="mb-3 rounded-lg overflow-hidden h-24 bg-muted">
                    <img src={notif.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                {notif.promo_code && (
                  <div className="mb-2 p-2 bg-primary/10 rounded-lg text-center">
                    <span className="text-xs text-muted-foreground">Kode: </span>
                    <span className="font-bold text-primary">{notif.promo_code}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="capitalize">{notif.target_audience === 'all' ? 'Semua' : notif.target_audience}</span>
                  <span>{new Date(notif.created_at).toLocaleDateString('id-ID')}</span>
                </div>
                {!notif.is_active && <Badge variant="secondary" className="mt-2">Nonaktif</Badge>}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Belum ada notifikasi</p>
          <p className="text-sm text-muted-foreground">Buat notifikasi pertama untuk pengguna</p>
        </div>
      )}

      {/* Edit Notification Dialog */}
      <Dialog open={editNotifOpen} onOpenChange={setEditNotifOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Notifikasi</DialogTitle></DialogHeader>
          {editingNotif && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipe</Label>
                  <Select value={editingNotif.type} onValueChange={(v) => setEditingNotif({...editingNotif, type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="promo">Promo</SelectItem>
                      <SelectItem value="announcement">Pengumuman</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target</Label>
                  <Select value={editingNotif.target_audience} onValueChange={(v) => setEditingNotif({...editingNotif, target_audience: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Pengguna</SelectItem>
                      <SelectItem value="clients">Client Only</SelectItem>
                      <SelectItem value="lawyers">Lawyer Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Judul</Label>
                <Input value={editingNotif.title} onChange={(e) => setEditingNotif({...editingNotif, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea value={editingNotif.description} onChange={(e) => setEditingNotif({...editingNotif, description: e.target.value})} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>URL Gambar</Label>
                <Input value={editingNotif.image_url || ''} onChange={(e) => setEditingNotif({...editingNotif, image_url: e.target.value})} placeholder="https://example.com/image.jpg" />
              </div>
              {editingNotif.type === 'promo' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kode Promo</Label>
                    <Input value={editingNotif.promo_code || ''} onChange={(e) => setEditingNotif({...editingNotif, promo_code: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Berlaku Sampai</Label>
                    <Input type="date" value={editingNotif.valid_until?.split('T')[0] || ''} onChange={(e) => setEditingNotif({...editingNotif, valid_until: e.target.value})} />
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Switch checked={editingNotif.is_active} onCheckedChange={(v) => setEditingNotif({...editingNotif, is_active: v})} />
                <Label>Notifikasi Aktif</Label>
              </div>
              <Button className="w-full" onClick={handleUpdateNotification} disabled={updateNotification.isPending || !editingNotif.title.trim()}>
                Simpan Perubahan
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Notification */}
      <AlertDialog open={deleteNotifOpen} onOpenChange={setDeleteNotifOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Notifikasi?</AlertDialogTitle>
            <AlertDialogDescription>Notifikasi ini akan dihapus secara permanen.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNotification} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
