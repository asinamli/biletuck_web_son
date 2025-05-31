"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
    
  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center max-w-md mx-auto p-6">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Sayfa Bulunamadı</h2>
        <p className="text-muted-foreground mb-8">
          Aradığınız sayfa bulunamadı veya bu sayfaya erişim yetkiniz bulunmuyor.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/" className="flex items-center gap-2">
              <Home size={16} />
              Ana Sayfa
            </Link>
          </Button>
          <Button onClick={handleGoBack} className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Geri Dön
          </Button>
        </div>
      </div>
    </div>
  );
}