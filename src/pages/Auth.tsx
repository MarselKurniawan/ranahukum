import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Scale, Mail, Lock, User, MapPin, Eye, EyeOff, Phone, GraduationCap, Upload, FileText, X, Loader2, Briefcase, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter")
});

const userSignupSchema = z.object({
  fullName: z.string().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter")
});

const lawyerSignupSchema = z.object({
  fullName: z.string().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  whatsapp: z.string().min(10, "Nomor WhatsApp minimal 10 digit").max(15, "Nomor WhatsApp maksimal 15 digit"),
  location: z.string().min(2, "Lokasi wajib diisi"),
  education: z.string().min(2, "Pendidikan wajib diisi"),
  interviewConsent: z.literal(true, { errorMap: () => ({ message: "Anda harus bersedia untuk proses verifikasi" }) })
});

interface DocumentUpload {
  type: string;
  label: string;
  file: File | null;
  uploading: boolean;
}

type RegisterType = 'user' | 'lawyer';

export default function Auth() {
  const navigate = useNavigate();
  const { user, role, signIn, signUp } = useAuth();
  const { toast } = useToast();
  
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerType, setRegisterType] = useState<RegisterType>('user');
  
  const [userSignupData, setUserSignupData] = useState({
    fullName: "",
    email: "",
    password: ""
  });
  
  const [lawyerSignupData, setLawyerSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    whatsapp: "",
    location: "",
    education: "",
    interviewConsent: false
  });
  
  const [documents, setDocuments] = useState<DocumentUpload[]>([
    { type: "ijazah", label: "Ijazah S1 Hukum", file: null, uploading: false },
    { type: "surat_izin", label: "Surat Izin Praktik Advokat", file: null, uploading: false },
    { type: "ktp", label: "KTP", file: null, uploading: false },
    { type: "sertifikat", label: "Sertifikat Profesi (opsional)", file: null, uploading: false }
  ]);
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && role) {
      if (role === 'lawyer') {
        navigate('/lawyer/dashboard');
      } else if (role === 'admin' || role === 'superadmin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [user, role, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const result = loginSchema.safeParse(loginData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const { error, suspended } = await signIn(loginData.email, loginData.password);
    setIsLoading(false);

    if (error) {
      if (suspended) {
        toast({
          title: "Akun Dinonaktifkan",
          description: error.message,
          variant: "destructive",
          duration: 10000
        });
      } else if (error.message.includes("Invalid login credentials")) {
        toast({
          title: "Login Gagal",
          description: "Email atau password salah",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Login Gagal",
          description: error.message,
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Login Berhasil",
        description: "Selamat datang kembali!"
      });
    }
  };

  const handleFileChange = (index: number, file: File | null) => {
    const newDocs = [...documents];
    newDocs[index].file = file;
    setDocuments(newDocs);
  };

  const handleUserSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = userSignupSchema.safeParse(userSignupData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    
    const { error: signUpError } = await signUp(
      userSignupData.email,
      userSignupData.password,
      userSignupData.fullName,
      "user"
    );

    if (signUpError) {
      if (signUpError.message.includes("already registered")) {
        toast({
          title: "Email Sudah Terdaftar",
          description: "Silakan gunakan email lain atau login",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Registrasi Gagal",
          description: signUpError.message,
          variant: "destructive"
        });
      }
      setIsLoading(false);
      return;
    }

    toast({
      title: "Registrasi Berhasil",
      description: "Selamat datang di Legal Connect!"
    });
    
    setIsLoading(false);
  };

  const handleLawyerSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = lawyerSignupSchema.safeParse(lawyerSignupData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // Check required documents
    const requiredDocs = documents.filter(d => d.type !== 'sertifikat');
    const missingDocs = requiredDocs.filter(d => !d.file);
    if (missingDocs.length > 0) {
      toast({
        title: "Dokumen Belum Lengkap",
        description: `Mohon upload: ${missingDocs.map(d => d.label).join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // 1. Register user
      const { error: signUpError } = await signUp(
        lawyerSignupData.email,
        lawyerSignupData.password,
        lawyerSignupData.fullName,
        "lawyer",
        lawyerSignupData.location
      );

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          toast({
            title: "Email Sudah Terdaftar",
            description: "Silakan gunakan email lain atau login",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Registrasi Gagal",
            description: signUpError.message,
            variant: "destructive"
          });
        }
        setIsLoading(false);
        return;
      }

      // 2. Wait for user session to be established
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 3. Get the new lawyer profile
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: "Registrasi Berhasil",
          description: "Silakan login untuk melanjutkan proses pendaftaran"
        });
        setIsLoading(false);
        return;
      }

      // 4. Update lawyer profile with additional info
      const { data: lawyerData } = await supabase
        .from('lawyers')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (lawyerData) {
        await supabase
          .from('lawyers')
          .update({
            education: lawyerSignupData.education,
            interview_consent: lawyerSignupData.interviewConsent
          })
          .eq('id', lawyerData.id);

        // Update profile with whatsapp
        await supabase
          .from('profiles')
          .update({ whatsapp: lawyerSignupData.whatsapp })
          .eq('user_id', session.user.id);

        // 5. Upload documents
        for (const doc of documents) {
          if (doc.file) {
            const fileExt = doc.file.name.split('.').pop();
            const fileName = `${lawyerData.id}/${doc.type}-${Date.now()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
              .from('chat-files')
              .upload(`lawyer-documents/${fileName}`, doc.file);

            if (!uploadError) {
              const { data: urlData } = supabase.storage
                .from('chat-files')
                .getPublicUrl(`lawyer-documents/${fileName}`);

              await supabase
                .from('lawyer_documents')
                .insert({
                  lawyer_id: lawyerData.id,
                  document_type: doc.type,
                  file_url: urlData.publicUrl,
                  file_name: doc.file.name,
                  status: 'pending'
                });
            }
          }
        }

        // 6. Navigate to quiz
        toast({
          title: "Dokumen Berhasil Diupload",
          description: "Silakan lanjutkan ke tahap pertanyaan"
        });
        navigate('/lawyer/quiz');
      }
    } catch (error) {
      toast({
        title: "Terjadi Kesalahan",
        description: "Silakan coba lagi",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  return (
    <MobileLayout showBottomNav={false}>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="gradient-hero p-8 pb-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-card/20 backdrop-blur-sm flex items-center justify-center">
            <Scale className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground">Legal Connect</h1>
          <p className="text-primary-foreground/80 mt-1 text-sm">
            Konsultasi Hukum Online & Pendampingan Hukum Professional
          </p>
        </div>

        {/* Auth Form */}
        <div className="flex-1 px-4 -mt-8">
          <Card className="shadow-elevated">
            <CardContent className="p-4">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="login">Masuk</TabsTrigger>
                  <TabsTrigger value="signup">Daftar</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="email@example.com"
                          className="pl-10"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        />
                      </div>
                      {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
                    </div>

                    <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      {isLoading ? "Loading..." : "Masuk"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  {/* Register Type Selection */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium mb-3 block">Daftar sebagai</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRegisterType('user')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          registerType === 'user'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Users className={`w-8 h-8 mx-auto mb-2 ${
                          registerType === 'user' ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                        <p className={`text-sm font-medium ${
                          registerType === 'user' ? 'text-primary' : 'text-foreground'
                        }`}>Pengguna</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Cari bantuan hukum</p>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setRegisterType('lawyer')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          registerType === 'lawyer'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Briefcase className={`w-8 h-8 mx-auto mb-2 ${
                          registerType === 'lawyer' ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                        <p className={`text-sm font-medium ${
                          registerType === 'lawyer' ? 'text-primary' : 'text-foreground'
                        }`}>Lawyer</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Tawarkan jasa hukum</p>
                      </button>
                    </div>
                  </div>

                  {/* User Registration Form */}
                  {registerType === 'user' && (
                    <form onSubmit={handleUserSignup} className="space-y-4">
                      <div>
                        <Label htmlFor="user-name">Nama Lengkap</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="user-name"
                            type="text"
                            placeholder="Nama lengkap Anda"
                            className="pl-10"
                            value={userSignupData.fullName}
                            onChange={(e) => setUserSignupData({ ...userSignupData, fullName: e.target.value })}
                          />
                        </div>
                        {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
                      </div>

                      <div>
                        <Label htmlFor="user-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="user-email"
                            type="email"
                            placeholder="email@example.com"
                            className="pl-10"
                            value={userSignupData.email}
                            onChange={(e) => setUserSignupData({ ...userSignupData, email: e.target.value })}
                          />
                        </div>
                        {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <Label htmlFor="user-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="user-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Minimal 6 karakter"
                            className="pl-10 pr-10"
                            value={userSignupData.password}
                            onChange={(e) => setUserSignupData({ ...userSignupData, password: e.target.value })}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
                      </div>

                      <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {isLoading ? "Mendaftar..." : "Daftar"}
                      </Button>
                    </form>
                  )}

                  {/* Lawyer Registration Form */}
                  {registerType === 'lawyer' && (
                    <form onSubmit={handleLawyerSignup} className="space-y-4">
                      {/* Basic Info */}
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="lawyer-name">Nama Lengkap</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="lawyer-name"
                              type="text"
                              placeholder="Nama lengkap sesuai ijazah"
                              className="pl-10"
                              value={lawyerSignupData.fullName}
                              onChange={(e) => setLawyerSignupData({ ...lawyerSignupData, fullName: e.target.value })}
                            />
                          </div>
                          {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
                        </div>

                        <div>
                          <Label htmlFor="lawyer-email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="lawyer-email"
                              type="email"
                              placeholder="email@example.com"
                              className="pl-10"
                              value={lawyerSignupData.email}
                              onChange={(e) => setLawyerSignupData({ ...lawyerSignupData, email: e.target.value })}
                            />
                          </div>
                          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                        </div>

                        <div>
                          <Label htmlFor="lawyer-password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="lawyer-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Minimal 6 karakter"
                              className="pl-10 pr-10"
                              value={lawyerSignupData.password}
                              onChange={(e) => setLawyerSignupData({ ...lawyerSignupData, password: e.target.value })}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
                        </div>

                        <div>
                          <Label htmlFor="lawyer-whatsapp">Nomor WhatsApp Aktif</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="lawyer-whatsapp"
                              type="tel"
                              placeholder="08123456789"
                              className="pl-10"
                              value={lawyerSignupData.whatsapp}
                              onChange={(e) => setLawyerSignupData({ ...lawyerSignupData, whatsapp: e.target.value })}
                            />
                          </div>
                          {errors.whatsapp && <p className="text-xs text-destructive mt-1">{errors.whatsapp}</p>}
                        </div>

                        <div>
                          <Label htmlFor="lawyer-location">Lokasi Praktik</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="lawyer-location"
                              type="text"
                              placeholder="Contoh: Jakarta, Semarang"
                              className="pl-10"
                              value={lawyerSignupData.location}
                              onChange={(e) => setLawyerSignupData({ ...lawyerSignupData, location: e.target.value })}
                            />
                          </div>
                          {errors.location && <p className="text-xs text-destructive mt-1">{errors.location}</p>}
                        </div>

                        <div>
                          <Label htmlFor="lawyer-education">Pendidikan Terakhir</Label>
                          <div className="relative">
                            <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="lawyer-education"
                              type="text"
                              placeholder="Contoh: S1 Hukum Universitas Indonesia"
                              className="pl-10"
                              value={lawyerSignupData.education}
                              onChange={(e) => setLawyerSignupData({ ...lawyerSignupData, education: e.target.value })}
                            />
                          </div>
                          {errors.education && <p className="text-xs text-destructive mt-1">{errors.education}</p>}
                        </div>
                      </div>

                      {/* Document Uploads */}
                      <div className="space-y-3 pt-2">
                        <Label className="text-sm font-medium">Upload Dokumen</Label>
                        <p className="text-xs text-muted-foreground -mt-2">
                          Format: PDF, JPG, PNG (Max 5MB)
                        </p>
                        
                        {documents.map((doc, index) => (
                          <div key={doc.type} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs font-medium truncate">{doc.label}</p>
                                  {doc.file && (
                                    <p className="text-[10px] text-muted-foreground truncate">
                                      {doc.file.name}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              {doc.file ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 shrink-0"
                                  onClick={() => handleFileChange(index, null)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              ) : (
                                <label className="shrink-0">
                                  <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        if (file.size > 5 * 1024 * 1024) {
                                          toast({
                                            title: "File Terlalu Besar",
                                            description: "Maksimal 5MB",
                                            variant: "destructive"
                                          });
                                          return;
                                        }
                                        handleFileChange(index, file);
                                      }
                                    }}
                                  />
                                  <div className="h-7 px-2 bg-secondary text-secondary-foreground rounded-md flex items-center gap-1 cursor-pointer hover:bg-secondary/80 text-xs">
                                    <Upload className="w-3 h-3" />
                                    Upload
                                  </div>
                                </label>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Interview Consent */}
                      <div className="flex items-start space-x-3 pt-2">
                        <Checkbox
                          id="interview-consent"
                          checked={lawyerSignupData.interviewConsent}
                          onCheckedChange={(checked) => 
                            setLawyerSignupData({ ...lawyerSignupData, interviewConsent: checked === true })
                          }
                        />
                        <label
                          htmlFor="interview-consent"
                          className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
                        >
                          Saya bersedia untuk menjalani proses verifikasi dan wawancara untuk memastikan kualifikasi sebagai konsultan hukum di Legal Connect
                        </label>
                      </div>
                      {errors.interviewConsent && (
                        <p className="text-xs text-destructive">{errors.interviewConsent}</p>
                      )}

                      <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {isLoading ? "Mendaftar..." : "Daftar"}
                      </Button>
                    </form>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground py-6">
          Dengan melanjutkan, Anda menyetujui Syarat & Ketentuan
        </p>
      </div>
    </MobileLayout>
  );
}
