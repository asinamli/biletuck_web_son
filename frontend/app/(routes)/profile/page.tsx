"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import useAuthStore from "@/app/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { hasValidSession } from "@/lib/session";
import { toast } from "react-hot-toast";

const profileFormSchema = z.object({
  username: z.string().min(2, { message: "Kullanıcı adı en az 2 karakter olmalıdır." }),
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz." }),
});

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, refreshUserData } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Sadece sayfa ilk yüklendiğinde ve token var ancak auth durumu belirsizse kontrol et
  useEffect(() => {
    // Sayfa yüklendiğinde session kontrolü yap
    const checkSession = async () => {
      setPageLoading(true);

      // Local storage'da session varsa ama store'da yoksa yenile
      if (hasValidSession() && !isAuthenticated) {
        try {
          await refreshUserData();
        } catch (err) {
          console.error("Kullanıcı verileri yenilenemedi:", err);
          // Başarısız olursa login'e yönlendir
          router.replace("/auth/login");
        }
      }

      // Doğrulanmış oturum yoksa login'e yönlendir
      if (!isAuthenticated && !isLoading) {
        toast.error("Bu sayfayı görüntülemek için giriş yapmalısınız");
        router.replace("/auth/login");
        return;
      }

      setPageLoading(false);
    };

    checkSession();
  }, [isAuthenticated, isLoading, router, refreshUserData]);

  const { register, handleSubmit, reset } = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
    },
  });

  // User bilgileri değiştiğinde form değerlerini güncelle
  useEffect(() => {
    if (user) {
      reset({
        username: user.username || "",
        email: user.email || "",
      });
    }
  }, [user, reset]);

  // Yükleniyor durumu
  if (pageLoading || isLoading || !user) {
    return (
      <div className="container max-w-2xl mx-auto py-10">
        <div className="bg-card p-8 rounded-lg border border-border shadow-sm">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-1/3 bg-muted rounded"></div>
            <div className="h-4 w-full bg-muted rounded"></div>
            <div className="h-4 w-2/3 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Profil sayfası içeriği
  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Profil Ayarları</h1>

        <form className="space-y-6 bg-card p-6 rounded-lg border border-border shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Kullanıcı Adı</label>
              {!isEditing ? (
                <div className="py-2">{user?.username || "Kullanıcı adı yok"}</div>
              ) : (
                <Input {...register("username")} />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">E-Posta</label>
              {!isEditing ? (
                <div className="py-2">{user?.email || "E-posta yok"}</div>
              ) : (
                <Input {...register("email")} type="email" />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Rol</label>
              <div className="py-2">{user.role || user.role || "Rol bilgisi yok"}</div>
            </div>
          </div>

          {!isEditing ? (
            <Button
              type="button"
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto"
            >
              Profili Düzenle
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button type="submit" className="w-full sm:w-auto">
                Kaydet
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="w-full sm:w-auto"
              >
                İptal
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
