"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Form, FormLabel, FormItem, FormField, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const formSchema = z.object({
    email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await axios.post("http://localhost:5000/api/auth/forgot-password", {
        email: values.email,
      });

      setSuccess(true);
      toast.success("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi");

      // Kod doğrulama sayfasına yönlendirme
      setTimeout(() => {
        router.push(`/auth/verify-code?email=${encodeURIComponent(values.email)}`);
      }, 2000);

    } catch (err: any) {
      console.error("Şifre sıfırlama hatası:", err);
      setError(
        err?.response?.data?.message ||
        "Şifre sıfırlama talebi oluşturulurken bir hata meydana geldi"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
          Şifrenizi sıfırlayın
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          E-posta adresinizi girin, size şifre sıfırlama kodu göndereceğiz
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
              <p>Şifre sıfırlama kodu e-posta adresinize gönderildi.</p>
              <p className="mt-2">Lütfen gelen kutunuzu kontrol edin ve doğrulama sayfasına yönlendirme için bekleyin.</p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-posta</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="ornek@email.com" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Gönderiliyor..." : "Şifre Sıfırlama Kodu Gönder"}
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