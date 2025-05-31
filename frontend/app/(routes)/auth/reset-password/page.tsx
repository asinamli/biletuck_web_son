"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Form, FormLabel, FormItem, FormField, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams?.get("email");
    const codeParam = searchParams?.get("code");

    if (emailParam && codeParam) {
      setEmail(emailParam);
      setCode(codeParam);
    } else {
      // Gerekli parametreler yoksa şifre sıfırlama başlangıç sayfasına yönlendir
      toast.error("E-posta veya doğrulama kodu eksik");
      router.push("/auth/forgot-password");
    }
  }, [searchParams, router]);

  const formSchema = z.object({
    newPassword: z.string()
      .min(8, "Şifre en az 8 karakter olmalıdır")
      .regex(/[A-Z]/, "Şifrede en az bir büyük harf olmalıdır")
      .regex(/[a-z]/, "Şifrede en az bir küçük harf olmalıdır")
      .regex(/[0-9]/, "Şifrede en az bir rakam olmalıdır"),
    confirmPassword: z.string(),
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!email || !code) {
      setError("E-posta veya doğrulama kodu eksik");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Yeni şifreyi API'ye gönder
      const response = await axios.post("http://localhost:5000/api/auth/reset-password", {
        email,
        code,
        newPassword: values.newPassword,
      });

      setSuccess(true);
      toast.success("Şifreniz başarıyla değiştirildi");

      // 2 saniye sonra giriş sayfasına yönlendir
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);

    } catch (err: any) {
      console.error("Şifre sıfırlama hatası:", err);
      setError(
        err?.response?.data?.message ||
        "Şifre değiştirme işlemi sırasında bir hata oluştu"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
          Yeni Şifre Belirleyin
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Hesabınız için güçlü bir şifre belirleyin
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-border">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          {success ? (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 text-sm rounded">
              <p>Şifreniz başarıyla değiştirildi!</p>
              <p className="mt-2">Giriş sayfasına yönlendiriliyorsunuz...</p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yeni Şifre</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                          >
                            {showPassword ? "Gizle" : "Göster"}
                          </button>
                        </div>
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        Şifreniz en az 8 karakter uzunluğunda olmalı, büyük ve küçük harf ile rakam içermelidir.
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Şifreyi Tekrar Girin</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                          >
                            {showConfirmPassword ? "Gizle" : "Göster"}
                          </button>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "İşleniyor..." : "Şifreyi Değiştir"}
                </Button>

                <div className="text-sm text-center mt-4">
                  <Link href="/auth/login" className="text-primary hover:text-primary/70">
                    Giriş sayfasına dön
                  </Link>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}