"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Form, FormLabel, FormItem, FormField, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import useAuthStore from "@/app/hooks/useAuth";
import { loginWithEmailAndPassword, signInWithGoogle, resetPassword } from "@/lib/firebase";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const { isLoading, setIsLoading, isAuthenticated, setUser, setIsAuthenticated } = useAuthStore();
  const formSchema = z.object({
    email: z
      .string()
      .min(1, "E-posta adresi gereklidir")
      .email("Geçerli bir e-posta adresi giriniz")
      .refine((email) => email.trim() === email, "E-posta adresinde boşluk olamaz"),
    password: z
      .string()
      .min(6, "Şifre en az 6 karakter olmalıdır")
      .max(50, "Şifre çok uzun")
      .refine((pass) => pass.trim() === pass, "Şifrede başta veya sonda boşluk olamaz"),
  });

  // Kullanıcı zaten giriş yapmışsa ana sayfaya yönlendir
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      setError("");

      // Form validation
      if (!values.email || !values.password) {
        throw new Error("Email ve şifre gereklidir");
      }

      // Firebase ile giriş işlemi
      const result = await loginWithEmailAndPassword(values.email, values.password);
      
      if (!result || !result.user) {
        throw new Error("Giriş başarısız");
      }

      // Firebase kullanıcı bilgisini al
      const firebaseToken = await result.user.getIdToken();

      try {
        // MongoDB'deki kullanıcı bilgilerini getir
        const response = await axios.post("http://localhost:5000/api/auth/firebase-login", {
          idToken: firebaseToken,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL
        });

        if (response.data.success) {
          // MongoDB'den gelen kullanıcı bilgilerini kaydet
          setUser(response.data.user);
          // JWT token'ı kaydet
          useAuthStore.getState().setJwt(response.data.token);
        } else {
          setUser({
            id: result.user.uid,
            email: result.user.email as string,
            username: result.user.displayName || result.user.email?.split('@')[0] as string,
          });
        }
      } catch (err) {
        console.error("MongoDB bağlantı hatası:", err);
        // Sadece Firebase auth bilgileri ile devam et
        setUser({
          id: result.user.uid,
          email: result.user.email as string,
          username: result.user.displayName || result.user.email?.split('@')[0] as string,
        });
      }

      setIsAuthenticated(true);
      toast.success("Giriş başarılı, ana sayfaya yönlendiriliyorsunuz!");
      router.replace("/");    } catch (err: any) {
      console.error("Giriş hatası:", err);
      let errorMessage = "Giriş sırasında bir hata oluştu";

      // Firebase hata kodlarına göre özelleştirilmiş mesajlar
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        errorMessage = "Email veya şifre hatalı";
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = "Bu email adresi ile kayıtlı bir kullanıcı bulunamadı";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Geçersiz email adresi formatı";
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = "Bu hesap devre dışı bırakılmıştır";
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin";
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  // Google ile giriş yapma işlemi
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await signInWithGoogle();
      const firebaseToken = await result.user.getIdToken();

      try {
        // MongoDB'deki kullanıcı bilgilerini getir
        const response = await axios.post("http://localhost:5000/api/auth/firebase-login", {
          idToken: firebaseToken,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL
        });

        if (response.data.success) {
          // MongoDB'den gelen kullanıcı bilgilerini kaydet
          setUser(response.data.user);
          // JWT token'ı kaydet
          useAuthStore.getState().setJwt(response.data.token);
        } else {
          setUser({
            id: result.user.uid,
            email: result.user.email as string,
            username: result.user.displayName || result.user.email?.split('@')[0] as string,
          });
        }
      } catch (err) {
        console.error("MongoDB bağlantı hatası:", err);
        // Sadece Firebase auth bilgileri ile devam et
        setUser({
          id: result.user.uid,
          email: result.user.email as string,
          username: result.user.displayName || result.user.email?.split('@')[0] as string,
        });
      }

      setIsAuthenticated(true);
      toast.success("Google ile giriş başarılı!");
      router.replace("/");
    } catch (err: any) {
      console.error("Google ile giriş hatası:", err);
      const errorMessage = err.message || "Google ile giriş yapılırken bir hata oluştu";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Şifre sıfırlama e-postası gönderme
  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast.error("Lütfen şifre sıfırlama için e-posta adresinizi girin");
      return;
    }

    setIsLoading(true);
    try {
      // Firebase şifre sıfırlama
      await resetPassword(resetEmail);

      // MongoDB'ye de bildirim gönder (opsiyonel)
      try {
        await axios.post("http://localhost:5000/api/auth/forgot-password", {
          email: resetEmail
        });
      } catch (err) {
        console.warn("MongoDB şifre sıfırlama bildirimi gönderilemedi:", err);
      }

      setResetEmailSent(true);
      setShowResetForm(false);
      toast.success("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi");
    } catch (err: any) {
      console.error("Şifre sıfırlama hatası:", err);
      let errorMessage = "Şifre sıfırlama bağlantısı gönderilemedi";

      if (err.code === 'auth/user-not-found') {
        errorMessage = "Bu e-posta adresi ile kayıtlı bir hesap bulunamadı";
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
          Hesabınıza giriş yapın
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Veya {" "}
          <Link href="/auth/register" className="font-medium text-primary hover:text-primary/70">
            Yeni bir hesap oluşturun
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-border">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          {resetEmailSent ? (
            <div className="p-4 border border-green-300 bg-green-50 rounded mb-4">
              <p className="text-green-700 text-sm mb-2">
                Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.
              </p>
              <p className="text-green-700 text-sm mb-4">
                E-posta almadıysanız, spam klasörünü kontrol edin veya birkaç dakika bekleyin.
              </p>
              <Button
                className="mt-3 w-full"
                onClick={() => setResetEmailSent(false)}
                variant="outline"
              >
                Giriş formuna dön
              </Button>
            </div>
          ) : (
            <>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-posta</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Şifre</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type={showPassword ? "text" : "password"} {...field} />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                            >
                              {showPassword ? "Gizle" : "Göster"}
                            </button>
                          </div>
                        </FormControl>
                        <div className="text-sm text-right mt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setResetEmail(form.getValues().email);
                              setShowResetForm(true);
                            }}
                            className="text-primary hover:text-primary/70"
                          >
                            Şifrenizi mi unuttunuz?
                          </button>
                        </div>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
                  </Button>
                </form>
              </Form>

              {showResetForm && (
                <div className="mt-4 p-4 border rounded border-border">
                  <h3 className="text-sm font-medium mb-2">Şifre Sıfırlama</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    E-posta adresinize bir şifre sıfırlama bağlantısı göndereceğiz.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="E-posta adresinizi girin"
                    />
                    <Button onClick={handleResetPassword} disabled={isLoading} variant="outline">
                      Gönder
                    </Button>
                  </div>
                  <div className="text-right mt-2">
                    <button
                      type="button"
                      onClick={() => setShowResetForm(false)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-card px-2 text-muted-foreground">
                      Veya şununla devam et
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={handleGoogleSignIn}
                    type="button"
                    className="w-full flex justify-center"
                    variant="outline"
                    disabled={isLoading}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      className="h-5 w-5 mr-2"
                    >
                      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                    </svg>
                    Google ile Giriş Yap
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
