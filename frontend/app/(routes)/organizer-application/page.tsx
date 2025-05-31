"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import useAuthStore from "@/app/hooks/useAuth";
import axios from "axios";

interface OrganizerApplication {
  _id: string;
  title: string;
  description: string;
  userId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export default function OrganizerApplicationPage() {
  const router = useRouter();
  const { user, isAuthenticated, refreshUserData } = useAuthStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPendingApplication, setHasPendingApplication] = useState(false);
  const [applications, setApplications] = useState<OrganizerApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Bu sayfaya erişmek için giriş yapmalısınız.");
      router.push("/auth/login");
    }
  }, [isAuthenticated, router]);

  // Zaten organizatör ise ana sayfaya yönlendir
  useEffect(() => {
    if (user?.role === "organizer") {
      toast.success("Zaten organizatör rolüne sahipsiniz. Organizatör panelinize yönlendiriliyorsunuz.");
      router.push("/organizer");
    }
  }, [user, router]);

  // Kullanıcının mevcut başvurularını kontrol et
  useEffect(() => {
    const checkApplications = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        const token = useAuthStore.getState().getJwt();

        if (!token) {
          console.error("Token bulunamadı");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:5000/api/organizer-requests/my-requests", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setApplications(response.data.data);

          // Bekleyen başvuru var mı kontrol et
          const pending = response.data.data.some(app => app.status === "pending");
          setHasPendingApplication(pending);

          // Onaylanmış başvuru var mı kontrol et
          const approved = response.data.data.some(app => app.status === "approved");

          if (approved && user?.role !== "organizer") {
            // Eğer onaylanmış başvuru varsa ve rol hala organizatör değilse,
            // kullanıcı bilgilerini yenile
            await refreshUserData();
            toast.success("Organizatör başvurunuz onaylanmış! Rolünüz güncelleniyor...");
          }
        }
      } catch (error) {
        console.error("Başvuru bilgileri alınamadı:", error);
      } finally {
        setLoading(false);
      }
    };

    checkApplications();

    // Periyodik olarak başvuru durumunu kontrol et (her 30 saniyede bir)
    const interval = setInterval(async () => {
      await refreshUserData();  // Kullanıcı bilgilerini periyodik olarak yenile
      await checkApplications();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshUserData, user?.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description) {
      toast.error("Lütfen tüm alanları doldurun.");
      return;
    }

    setIsSubmitting(true);

    try {
      // JWT token al
      const token = useAuthStore.getState().getJwt();

      if (!token) {
        throw new Error("Oturum bilgilerinize ulaşılamadı, lütfen tekrar giriş yapın.");
      }

      // API isteği gönder
      const response = await fetch("http://localhost:5000/api/organizer-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, description })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Başvuru gönderilirken bir hata oluştu.");
      }

      console.log("Organizatör başvurusu başarıyla gönderildi:", data);

      // Başvuru listesini güncelle
      setHasPendingApplication(true);
      setApplications([...applications, data.data]);

      toast.success("Başvurunuz başarıyla gönderildi. İncelendikten sonra size bilgi verilecektir.");

      // Formu temizle
      setTitle("");
      setDescription("");
    } catch (error: any) {
      console.error("Başvuru hatası:", error);
      toast.error(error.message || "Başvuru gönderilirken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Başvuru durumunu kullanıcı dostu şekilde göster
  const renderStatus = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="text-yellow-500 font-medium">Beklemede</span>;
      case "approved":
        return <span className="text-green-500 font-medium">Onaylandı</span>;
      case "rejected":
        return <span className="text-red-500 font-medium">Reddedildi</span>;
      default:
        return <span className="text-gray-500">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Organizatör Başvurusu</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Başvuru bilgileri yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Organizatör Başvurusu</h1>

      {applications.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-medium mb-4">Başvuru Geçmişiniz</h2>
          <div className="bg-muted/50 rounded-lg p-4">
            {applications.map((app, index) => (
              <div key={index} className="border-b border-muted-foreground/20 py-3 last:border-0 last:pb-0 first:pt-0">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">{app.title}</h3>
                  {renderStatus(app.status)}
                </div>
                <p className="text-sm text-muted-foreground">{app.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Başvuru tarihi: {new Date(app.createdAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!hasPendingApplication ? (
        <>
          <p className="mb-6 text-muted-foreground">
            Organizatör olmak için lütfen aşağıdaki formu doldurun. Başvurunuz incelendikten sonra size bilgi verilecektir.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Başvuru Başlığı</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Konser Organizatörü Olmak İstiyorum"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Başvuru Açıklaması</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Neden organizatör olmak istediğinizi ve tecrübelerinizi anlatın..."
                rows={6}
                required
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Gönderiliyor..." : "Başvuruyu Gönder"}
            </Button>
          </form>
        </>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-amber-800">
            Zaten bekleyen bir başvurunuz bulunmaktadır. Başvurunuz incelendikten sonra size bilgi verilecektir.
          </p>
          <p className="text-sm text-amber-700 mt-2">
            Yeni bir başvuru oluşturmak için mevcut başvurunuzun sonuçlanmasını bekleyin.
          </p>
        </div>
      )}
    </div>
  );
}