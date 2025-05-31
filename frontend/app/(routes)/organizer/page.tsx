"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import useAuthStore from "@/app/hooks/useAuth";

export default function OrganizerDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalTickets: 0,
    totalSales: 0
  });

  useEffect(() => {
    // Burada API çağrısı yapılabilir
    // const fetchStats = async () => {
    //   const response = await fetch("/api/organizer/stats");
    //   const data = await response.json();
    //   setStats(data);
    // };
    // fetchStats();

    // Şimdilik örnek veriler
    setStats({
      totalEvents: 0,
      activeEvents: 0,
      totalTickets: 0,
      totalSales: 0
    });
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Organizatör Paneli</h1>
          <p className="text-muted-foreground mt-1">Hoş geldiniz, {user?.username || "Organizatör"}</p>
        </div>
        <Button asChild>
          <Link href="/organizer/events/create">
            Yeni Etkinlik Oluştur
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Etkinlik</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalEvents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aktif Etkinlikler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeEvents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Satılan Biletler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalTickets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Satış (₺)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₺{stats.totalSales.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Etkinliklerim</CardTitle>
            <CardDescription>Organizatör olarak oluşturduğunuz etkinlikler</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.totalEvents === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Henüz oluşturduğunuz bir etkinlik bulunmamaktadır.
              </div>
            ) : (
              <div>
                {/* Etkinlik listesi buraya gelecek */}
                <p>Etkinlik listesini görüntülemek için etkinlikler sayfasını ziyaret edin.</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/organizer/events">
                Tüm Etkinlikleri Görüntüle
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hızlı İşlemler</CardTitle>
            <CardDescription>Sık kullanılan organizatör işlemleri</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/organizer/events/create">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Yeni Etkinlik Oluştur
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/organizer/tickets">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M2 12h4M14 12h8" />
                  <circle cx="10" cy="12" r="2" />
                </svg>
                Bilet Yönetimi
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/organizer/profile">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Organizatör Profili
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/organizer/reports">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z" />
                </svg>
                Raporlar ve Analizler
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}