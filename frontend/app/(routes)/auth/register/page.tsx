"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import useAuthStore from "@/app/hooks/useAuth";
import { registerWithEmailAndPassword, signInWithGoogle, auth } from "@/lib/firebase";
import { updateProfile, sendEmailVerification, User as FirebaseUser } from "firebase/auth";
import axios from "axios";

// Form şeması
const formSchema = z.object({
  username: z.string().min(2, "Kullanıcı adı en az 2 karakter olmalıdır").max(50),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  confirmPassword: z.string().min(6, "Şifre tekrarı en az 6 karakter olmalıdır"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const { isLoading, setIsLoading, setUser, setJwt, user, setIsAuthenticated } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Kullanıcı zaten giriş yapmışsa ana sayfaya yönlendir
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  // E-posta doğrulama e-postası gönderme
  const sendVerificationEmail = async (user: FirebaseUser) => {
    try {
      await sendEmailVerification(user);
      setVerificationSent(true);
      toast.success("Doğrulama e-postası gönderildi. Lütfen e-postanızı kontrol edin.");
    } catch (err: any) {
      console.error("Doğrulama e-postası gönderme hatası:", err);
      toast.error("Doğrulama e-postası gönderilemedi.");
    }
  };

  // Firebase kullanıcısını MongoDB'ye kaydetme
  const syncUserWithMongoDB = async (firebaseUser: FirebaseUser, userData: any) => {
    try {
      // Firebase ID token alınıyor
      const idToken = await firebaseUser.getIdToken();

      // MongoDB'ye kullanıcı kaydı
      const response = await axios.post(
        "http://localhost:5000/api/auth/firebase-signup",
        {
          idToken,
          username: userData.username,
          email: userData.email,
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          firebaseUid: firebaseUser.uid
        },
        {
          headers: {
            "Authorization": `Bearer ${idToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.success) {
        console.log("Kullanıcı MongoDB'ye kaydedildi:", response.data.user);
        // JWT token'ı kaydet
        setJwt(response.data.token);
        // MongoDB'den gelen kullanıcı bilgilerini kaydet
        setUser(response.data.user);
        return true;
      } else {
        console.error("MongoDB kayıt hatası:", response.data);
        return false;
      }
    } catch (error) {
      console.error("MongoDB senkronizasyon hatası:", error);
      return false;
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError("");
    setIsLoading(true);
    try {
      // Firebase ile kullanıcı kaydı
      const result = await registerWithEmailAndPassword(values.email, values.password);

      // Kullanıcı adını Firebase kullanıcısına ayarla
      await updateProfile(result.user, {
        displayName: values.username
      });

      // Doğrulama e-postası gönder
      await sendVerificationEmail(result.user);

      // MongoDB ile senkronize et
      const mongoDbSync = await syncUserWithMongoDB(result.user, {
        username: values.username,
        email: values.email
      });

      if (!mongoDbSync) {
        // MongoDB senkronizasyonu başarısız olsa da kullanıcı bilgilerini lokalde tut
        setUser({
          id: result.user.uid,
          email: result.user.email as string,
          username: values.username,
        });
        setJwt(await result.user.getIdToken());
      }

      setIsAuthenticated(true);
      toast.success("Kayıt başarılı! Lütfen e-postanızı doğrulayın.");
    } catch (err: any) {
      console.error("Kayıt hatası:", err);
      let errorMsg = "Kayıt sırasında bir hata oluştu";

      // Firebase hata kodlarına göre özel mesajlar
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMsg = "Bu e-posta adresi zaten kullanımda. Lütfen başka bir e-posta adresi deneyin.";
          break;
        case 'auth/invalid-email':
          errorMsg = "Geçersiz e-posta adresi formatı.";
          break;
        case 'auth/operation-not-allowed':
          errorMsg = "E-posta/şifre kayıtları devre dışı bırakılmış.";
          break;
        case 'auth/weak-password':
          errorMsg = "Şifre çok zayıf. Lütfen daha güçlü bir şifre seçin.";
          break;
        default:
          if (err.message) {
            errorMsg = err.message;
          }
      }

      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }

  // Google ile kayıt
  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();

      // MongoDB ile senkronize et
      const mongoDbSync = await syncUserWithMongoDB(result.user, {
        username: result.user.displayName || result.user.email?.split('@')[0],
        email: result.user.email,
        firstName: result.user.displayName?.split(' ')[0] || "",
        lastName: result.user.displayName?.split(' ').slice(1).join(' ') || "",
        photoURL: result.user.photoURL
      });

      if (!mongoDbSync) {
        // MongoDB senkronizasyonu başarısız olsa da kullanıcı bilgilerini lokalde tut
        setUser({
          id: result.user.uid,
          email: result.user.email as string,
          username: result.user.displayName || result.user.email as string,
        });
        setJwt(await result.user.getIdToken());
      }

      setIsAuthenticated(true);
      toast.success("Google ile kayıt başarılı!");
      router.push("/");
    } catch (err: any) {
      console.error("Google ile kayıt hatası:", err);
      let errorMsg = "Google ile kayıt sırasında bir hata oluştu";
      if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
          Yeni Hesap Oluştur
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Veya{" "}
          <Link
            href="/auth/login"
            className="font-medium text-primary hover:text-primary/90"
          >
            mevcut hesabınıza giriş yapın
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-border">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive text-destructive text-sm rounded">
              {error}
            </div>
          )}

          {verificationSent ? (
            <div className="p-4 border border-green-300 bg-green-50 rounded mb-4">
              <p className="text-green-700 text-sm mb-2">
                E-posta adresinize bir doğrulama bağlantısı gönderdik. Lütfen hesabınızı doğrulamak için e-postanızı kontrol edin.
              </p>
              <p className="text-green-700 text-sm mb-4">
                Doğrulama e-postasını almadıysanız, lütfen spam klasörünüzü kontrol edin.
              </p>
              <Button
                onClick={() => router.push('/auth/login')}
                className="w-full"
              >
                Giriş Sayfasına Git
              </Button>
            </div>
          ) : (
            <>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kullanıcı Adı</FormLabel>
                        <FormControl>
                          <Input placeholder="Kullanıcı Adı" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-posta Adresi</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="ornek@mail.com" {...field} />
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
                            <Input type={showPassword ? "text" : "password"} placeholder="********" {...field} />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                            >
                              {showPassword ? "Gizle" : "Göster"}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Şifre Tekrar</FormLabel>
                        <FormControl>
                          <Input type={showPassword ? "text" : "password"} placeholder="********" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full cursor-pointer"
                    disabled={isLoading}
                  >
                    {isLoading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
                  </Button>
                </form>
              </Form>

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
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      className="h-5 w-5"
                    >
                      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                    </svg>
                    <span>Google ile Kayıt Ol</span>
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
