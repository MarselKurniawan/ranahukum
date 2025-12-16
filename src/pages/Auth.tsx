import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Scale, Mail, Lock, User, MapPin, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter")
});

const signupSchema = z.object({
  fullName: z.string().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["user", "lawyer"]),
  location: z.string().optional()
});

export default function Auth() {
  const navigate = useNavigate();
  const { user, role, signIn, signUp, signInAnonymously } = useAuth();
  const { toast } = useToast();
  
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "user" as "user" | "lawyer",
    location: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      if (role === 'lawyer') {
        navigate('/lawyer/dashboard');
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
    const { error } = await signIn(loginData.email, loginData.password);
    setIsLoading(false);

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signupSchema.safeParse(signupData);
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

    if (signupData.role === "lawyer" && !signupData.location) {
      setErrors({ location: "Lokasi wajib diisi untuk lawyer" });
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(
      signupData.email,
      signupData.password,
      signupData.fullName,
      signupData.role,
      signupData.location
    );
    setIsLoading(false);

    if (error) {
      if (error.message.includes("already registered")) {
        toast({
          title: "Email Sudah Terdaftar",
          description: "Silakan gunakan email lain atau login",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Registrasi Gagal",
          description: error.message,
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Registrasi Berhasil",
        description: "Akun berhasil dibuat!"
      });
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    const { error } = await signInAnonymously();
    setIsLoading(false);

    if (error) {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive"
      });
    } else {
      navigate('/');
    }
  };

  return (
    <MobileLayout showBottomNav={false}>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="gradient-hero p-8 pb-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-card/20 backdrop-blur-sm flex items-center justify-center">
            <Scale className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground">HukumKu</h1>
          <p className="text-primary-foreground/80 mt-1">Konsultasi Hukum Online</p>
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
                      {isLoading ? "Loading..." : "Masuk"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                      <Label htmlFor="signup-name">Nama Lengkap</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Nama lengkap"
                          className="pl-10"
                          value={signupData.fullName}
                          onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                        />
                      </div>
                      {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
                    </div>

                    <div>
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="email@example.com"
                          className="pl-10"
                          value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        />
                      </div>
                      {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Minimal 6 karakter"
                          className="pl-10 pr-10"
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
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
                      <Label>Daftar Sebagai</Label>
                      <RadioGroup
                        value={signupData.role}
                        onValueChange={(value) => setSignupData({ ...signupData, role: value as "user" | "lawyer" })}
                        className="flex gap-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="user" id="role-user" />
                          <Label htmlFor="role-user" className="font-normal cursor-pointer">Pengguna</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="lawyer" id="role-lawyer" />
                          <Label htmlFor="role-lawyer" className="font-normal cursor-pointer">Lawyer</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {signupData.role === "lawyer" && (
                      <div className="animate-fade-in">
                        <Label htmlFor="signup-location">Lokasi Praktik</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-location"
                            type="text"
                            placeholder="Contoh: Jakarta, Semarang"
                            className="pl-10"
                            value={signupData.location}
                            onChange={(e) => setSignupData({ ...signupData, location: e.target.value })}
                          />
                        </div>
                        {errors.location && <p className="text-xs text-destructive mt-1">{errors.location}</p>}
                      </div>
                    )}

                    <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
                      {isLoading ? "Loading..." : "Daftar"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Anonymous Option */}
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-center text-sm text-muted-foreground mb-3">
                  Atau lanjutkan tanpa akun
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleAnonymous}
                  disabled={isLoading}
                >
                  Lanjutkan sebagai Anonim
                </Button>
              </div>
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
