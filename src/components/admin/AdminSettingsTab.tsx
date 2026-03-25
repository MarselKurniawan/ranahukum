import { useState } from "react";
import { TrendingUp, Plus, HelpCircle, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAllSpecializationTypes, useCreateSpecializationType, useUpdateSpecializationType, useDeleteSpecializationType } from "@/hooks/useSpecializationTypes";
import { useAllQuizQuestions, useCreateQuizQuestion, useUpdateQuizQuestion, useDeleteQuizQuestion, useQuizCategories, type QuizQuestion } from "@/hooks/useLawyerQuiz";
import { QuizQuestionForm } from "@/components/QuizQuestionForm";
import { PlatformFeeSettingsCard } from "@/components/PlatformFeeSettingsCard";
import { ChatPriceSettingsCard } from "@/components/ChatPriceSettingsCard";
import { CallFeeSettingsCard } from "@/components/CallFeeSettingsCard";
import { AnonymousFeeSettingsCard } from "@/components/AnonymousFeeSettingsCard";
import { DbLawyer } from "@/hooks/useLawyers";
import { ConsultationWithDetails } from "@/hooks/useSuperAdmin";

interface AdminSettingsTabProps {
  allLawyers: DbLawyer[];
  approvedLawyers: DbLawyer[];
  pendingLawyers: DbLawyer[];
  clients: any[];
  allConsultations: ConsultationWithDetails[];
  totalRevenue: number;
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}jt`;
  return `Rp ${value.toLocaleString('id-ID')}`;
};

export function AdminSettingsTab({ allLawyers, approvedLawyers, pendingLawyers, clients, allConsultations, totalRevenue }: AdminSettingsTabProps) {
  const { toast } = useToast();
  const { data: specializationTypes = [] } = useAllSpecializationTypes();
  const createSpecType = useCreateSpecializationType();
  const updateSpecType = useUpdateSpecializationType();
  const deleteSpecType = useDeleteSpecializationType();
  const { data: quizQuestions = [] } = useAllQuizQuestions();
  const { data: quizCategories = [] } = useQuizCategories();
  const createQuizQuestion = useCreateQuizQuestion();
  const updateQuizQuestion = useUpdateQuizQuestion();
  const deleteQuizQuestion = useDeleteQuizQuestion();

  const [newSpecName, setNewSpecName] = useState("");
  const [newSpecDesc, setNewSpecDesc] = useState("");
  const [addSpecOpen, setAddSpecOpen] = useState(false);
  const [deleteSpecOpen, setDeleteSpecOpen] = useState(false);
  const [deletingSpecId, setDeletingSpecId] = useState<string | null>(null);
  const [addQuizOpen, setAddQuizOpen] = useState(false);
  const [editQuizOpen, setEditQuizOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [deleteQuizOpen, setDeleteQuizOpen] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);

  const handleAddSpecialization = async () => {
    if (!newSpecName.trim()) return;
    try {
      await createSpecType.mutateAsync({ name: newSpecName, description: newSpecDesc || undefined });
      toast({ title: "Jenis konsultasi berhasil ditambahkan" });
      setNewSpecName(""); setNewSpecDesc(""); setAddSpecOpen(false);
    } catch { toast({ title: "Gagal", description: "Jenis konsultasi sudah ada", variant: "destructive" }); }
  };

  const handleDeleteSpecialization = async () => {
    if (!deletingSpecId) return;
    try {
      await deleteSpecType.mutateAsync(deletingSpecId);
      toast({ title: "Jenis konsultasi berhasil dihapus" });
      setDeletingSpecId(null); setDeleteSpecOpen(false);
    } catch { toast({ title: "Gagal", variant: "destructive" }); }
  };

  const handleAddQuizQuestion = async (data: any) => {
    try {
      await createQuizQuestion.mutateAsync({ question: data.question, question_type: data.question_type, category: data.category || undefined, options: data.options });
      toast({ title: "Pertanyaan quiz berhasil ditambahkan" });
      setAddQuizOpen(false);
    } catch { toast({ title: "Gagal", variant: "destructive" }); }
  };

  const handleUpdateQuizQuestion = async (data: any) => {
    if (!editingQuestion) return;
    try {
      await updateQuizQuestion.mutateAsync({ id: editingQuestion.id, question: data.question, question_type: data.question_type, category: data.category || null, options: data.options });
      toast({ title: "Pertanyaan berhasil diperbarui" });
      setEditingQuestion(null); setEditQuizOpen(false);
    } catch { toast({ title: "Gagal", variant: "destructive" }); }
  };

  const handleDeleteQuizQuestion = async () => {
    if (!deletingQuestionId) return;
    try {
      await deleteQuizQuestion.mutateAsync(deletingQuestionId);
      toast({ title: "Pertanyaan berhasil dihapus" });
      setDeletingQuestionId(null); setDeleteQuizOpen(false);
    } catch { toast({ title: "Gagal", variant: "destructive" }); }
  };

  const handleToggleQuizActive = async (id: string, currentActive: boolean) => {
    try {
      await updateQuizQuestion.mutateAsync({ id, is_active: !currentActive });
      toast({ title: currentActive ? "Pertanyaan dinonaktifkan" : "Pertanyaan diaktifkan" });
    } catch { toast({ title: "Gagal", variant: "destructive" }); }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChatPriceSettingsCard />
        <CallFeeSettingsCard />
        <AnonymousFeeSettingsCard />
        <PlatformFeeSettingsCard settingKey="platform_fee_chat" title="Biaya Platform Chat" description="Biaya platform untuk konsultasi chat (masuk ke admin)" />
        <PlatformFeeSettingsCard settingKey="platform_fee_pendampingan" title="Biaya Platform Pendampingan" description="Biaya platform untuk pendampingan hukum (masuk ke admin)" />

        {/* Specialization Types */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Jenis Konsultasi</CardTitle>
              <Dialog open={addSpecOpen} onOpenChange={setAddSpecOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-1" />Tambah</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Tambah Jenis Konsultasi</DialogTitle></DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Nama</Label>
                      <Input value={newSpecName} onChange={(e) => setNewSpecName(e.target.value)} placeholder="Contoh: Hukum Konsumen" />
                    </div>
                    <div className="space-y-2">
                      <Label>Deskripsi (Opsional)</Label>
                      <Input value={newSpecDesc} onChange={(e) => setNewSpecDesc(e.target.value)} placeholder="Deskripsi singkat" />
                    </div>
                    <Button className="w-full" onClick={handleAddSpecialization} disabled={createSpecType.isPending}>Simpan</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {specializationTypes.map((spec) => (
                <div key={spec.id} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge variant={spec.is_active ? "secondary" : "outline"}>{spec.name}</Badge>
                    {spec.description && <span className="text-xs text-muted-foreground">{spec.description}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={spec.is_active} onCheckedChange={() => updateSpecType.mutate({ id: spec.id, is_active: !spec.is_active })} />
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => { setDeletingSpecId(spec.id); setDeleteSpecOpen(true); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">Toggle untuk aktifkan/nonaktifkan. Hapus untuk menghapus permanen.</p>
          </CardContent>
        </Card>

        {/* Platform Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-5 h-5" />Statistik Platform</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-muted-foreground">Total Lawyer</span><span className="font-medium">{allLawyers.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Lawyer Aktif</span><span className="font-medium">{approvedLawyers.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Menunggu Approval</span><span className="font-medium">{pendingLawyers.length}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Total Client</span><span className="font-medium">{clients.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Total Konsultasi</span><span className="font-medium">{allConsultations.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Konsultasi Selesai</span><span className="font-medium">{allConsultations.filter(c => c.status === 'completed').length}</span></div>
            <Separator />
            <div className="flex justify-between text-lg"><span className="font-medium">Total Revenue</span><span className="font-bold text-primary">{formatCurrency(totalRevenue)}</span></div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Questions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />Pertanyaan Quiz Lawyer<Badge variant="secondary">{quizQuestions.length}</Badge>
            </CardTitle>
            <Dialog open={addQuizOpen} onOpenChange={setAddQuizOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-1" />Tambah</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Tambah Pertanyaan Quiz</DialogTitle></DialogHeader>
                <QuizQuestionForm onSubmit={handleAddQuizQuestion} isPending={createQuizQuestion.isPending} categories={quizCategories} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quizQuestions.length > 0 ? quizQuestions.map((q, index) => (
              <div key={q.id} className={`p-4 border rounded-lg ${!q.is_active ? 'opacity-50 bg-muted/50' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-medium text-primary">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {q.category && <Badge variant="outline" className="text-xs mb-1 mr-1">{q.category}</Badge>}
                    <Badge variant={q.question_type === 'multiple_choice' ? 'default' : 'secondary'} className="text-xs mb-1">
                      {q.question_type === 'multiple_choice' ? 'Pilihan Ganda' : 'Essay'}
                    </Badge>
                    <p className="text-sm line-clamp-2 mt-1">{q.question}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-2">
                        <Switch checked={q.is_active} onCheckedChange={() => handleToggleQuizActive(q.id, q.is_active)} />
                        <span className="text-xs text-muted-foreground">{q.is_active ? 'Aktif' : 'Nonaktif'}</span>
                      </div>
                      <div className="flex gap-1 ml-auto">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditingQuestion(q); setEditQuizOpen(true); }}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => { setDeletingQuestionId(q.id); setDeleteQuizOpen(true); }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-8">
                <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">Belum ada pertanyaan quiz</p>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-4">Pertanyaan quiz akan ditampilkan kepada lawyer saat mendaftar</p>
        </CardContent>
      </Card>

      {/* Edit Quiz Dialog */}
      <Dialog open={editQuizOpen} onOpenChange={setEditQuizOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Pertanyaan Quiz</DialogTitle></DialogHeader>
          {editingQuestion && <QuizQuestionForm initialData={editingQuestion} onSubmit={handleUpdateQuizQuestion} isPending={updateQuizQuestion.isPending} categories={quizCategories} />}
        </DialogContent>
      </Dialog>

      {/* Delete Quiz */}
      <AlertDialog open={deleteQuizOpen} onOpenChange={setDeleteQuizOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pertanyaan?</AlertDialogTitle>
            <AlertDialogDescription>Pertanyaan ini akan dihapus secara permanen.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteQuizQuestion} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Specialization */}
      <AlertDialog open={deleteSpecOpen} onOpenChange={setDeleteSpecOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Jenis Konsultasi?</AlertDialogTitle>
            <AlertDialogDescription>Jenis konsultasi ini akan dihapus secara permanen.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSpecialization} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
