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

export default function VerifyCodePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams?.get("email");
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // Email parametre olarak gönderilmemişse kullanıcıyı şifre sıfırlama başlangıç sayfasına yönlendir
      toast.error("Doğrulama için e-posta adresi gereklidir");
      router.push("/auth/forgot-password");
    }
  }, [searchParams, router]);

  const formSchema = z.object({
    code: z.string()
      .min(6, "Doğrulama kodu 6 haneli olmalıdır")
      .max(6, "Doğrulama kodu 6 haneli olmalıdır")
      .regex(/^\d+$/, "Doğrulama kodu sadece rakamlardan oluşmalıdır"),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!email) {
      setError("E-posta adresi eksik, lütfen şifre sıfırlama işlemini baştan başlatın");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Doğrulama kodunu API'ye gönder
      const response = await axios.post("http://localhost:5000/api/auth/verify-reset-code", {
        email,
        code: values.code,
      });

      setSuccess(true);
      toast.success("Kod başarıyla doğrulandı");

      // Yeni şifre belirleme sayfasına yönlendir
      setTimeout(() => {
        router.push(`/auth/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(values.code)}`);
      }, 1500);

    } catch (err: any) {
      console.error("Kod doğrulama hatası:", err);
      setError(
        err?.response?.data?.message ||
        "Doğrulama kodu geçersiz veya süresi dolmuş"
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleResendCode() {
    if (!email) {
      setError("E-posta adresi eksik, lütfen şifre sıfırlama işlemini baştan başlatın");
      return;
    }

    setIsLoading(true);
    setError("");

    // Yeni kod gönderimi için API isteği
    axios.post("http://localhost:5000/api/auth/forgot-password", { email })
      .then(() => {
        toast.success("Yeni doğrulama kodu gönderildi");
      })
      .catch((err) => {
        console.error("Kod gönderme hatası:", err);
        setError(
          err?.response?.data?.message ||
          "Yeni kod gönderilirken bir hata oluştu"
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
          Doğrulama Kodu
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          E-posta adresinize gönderilen 6 haneli kodu girin
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
              <p>Doğrulama kodu onaylandı!</p>
              <p className="mt-2">Yeni şifre belirleme sayfasına yönlendiriliyorsunuz...</p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="text-sm text-muted-foreground mb-4 text-center">
                  <p>Doğrulama kodu <span className="font-medium text-foreground">{email}</span> adresine gönderildi</p>
                </div>

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doğrulama Kodu</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="6 haneli kod"
                          maxLength={6}
                          className="text-center tracking-widest text-lg"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Doğrulanıyor..." : "Doğrula"}
                </Button>

                <div className="flex justify-between items-center mt-4 text-sm">
                  <Link href="/auth/forgot-password" className="text-primary hover:text-primary/70">
                    Farklı e-posta kullan
                  </Link>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-primary hover:text-primary/70"
                    disabled={isLoading}
                  >
                    Kodu yeniden gönder
                  </button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}