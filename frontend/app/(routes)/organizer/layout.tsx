"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/app/hooks/useAuth";
import { toast } from "react-hot-toast";

// Sabit yükleme durumu komponenti
const LoadingComponent = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h2 className="text-xl font-semibold mb-2">Yetki kontrol ediliyor...</h2>
      <p className="text-muted-foreground">Lütfen bekleyin</p>
    </div>
  </div>
);

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { refreshUserData, getJwt, user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  // Yönlendirme yapmadan önce client-side olduğundan emin olalım
  const [mounted, setMounted] = useState(false);

  // Client tarafında mount olduğunu işaretle
  useEffect(() => {
    setMounted(true);

    // Client tarafında storage ve token bilgilerini kontrol et
    const checkInitialAuth = () => {
      const token = localStorage.getItem("jwt");
      const userData = localStorage.getItem("user");

      if (!token) {
        console.log("Initial check: JWT bulunamadı");
        return false;
      }

      if (userData) {
        try {
          const user = JSON.parse(userData);
          const role = user.role;
          if (role === "organizer" || role === "admin") {
            console.log("Initial check: Organizatör/Admin rolü doğrulandı");
            return true;
          }
        } catch (error) {
          console.error("User verisi parse edilemedi:", error);
        }
      }

      return false;
    };

    // Başlangıçta yerel verilere göre yetki kontrolü yap
    if (checkInitialAuth()) {
      setAuthorized(true);
      setLoading(false);
    }
  }, []);

  // Ana yetkilendirme kontrolü
  useEffect(() => {
    // Component unmount olduğunda işlemi iptal etmek için
    let isMounted = true;

    // Client tarafında değilsek API çağrısı yapmayı atla
    if (!mounted) return;

    const verifyOrganizer = async () => {
      try {
        // Zaten yetkili ise tekrar kontrol etme
        if (authorized) return;

        setLoading(true);

        // Token kontrolü
        const token = getJwt();
        if (!token) {
          console.log("Organizatör token bulunamadı");
          if (isMounted) {
            setLoading(false);
            return;
          }
        }

        // Kullanıcı bilgilerini yenile - backend'den güncel bilgileri al
        const userData = await refreshUserData();

        // Component unmount olduysa işlemi durdur
        if (!isMounted) return;

        if (!userData) {
          console.log("Organizatör kullanıcı bilgileri alınamadı");
          setLoading(false);
          return;
        }

        // Organizatör rolünü kontrol et
        const userRole = userData.role;

        if (userRole === "organizer" || userRole === "admin") {
          console.log("Organizatör/Admin rolü doğrulandı");
          setAuthorized(true);
          setLoading(false);
        } else {
          console.log("Organizatör rolü doğrulanamadı:", userRole);

          if (mounted) {
            toast.error("Bu sayfaya erişim yetkiniz bulunmamaktadır.");
            router.push("/");
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error("Yetkilendirme kontrolü hatası:", error);
          setLoading(false);
        }
      }
    };

    verifyOrganizer();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [mounted, user, authorized, refreshUserData, getJwt, router]);

  // Client tarafında değilsek veya yükleme durumunda sabit bir düzen göster
  if (!mounted || loading) {
    return <LoadingComponent />;
  }

  // Yetkisiz ise hiçbir şey gösterme
  if (!authorized) {
    return null;
  }

  // Yetkili ise içeriği göster
  return (
    <div className="organizer-layout">
      {children}
    </div>
  );
}