"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  BarChart3,
  Ticket,
  PlusCircle,
  Settings,
  Edit,
  Trash2,
  ArrowUpRight,
  Filter
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  ticketsSold: number;
  totalTickets: number;
  revenue: number;
  status: "active" | "draft" | "completed" | "cancelled";
  image: string;
}

export default function OrganizerDashboard() {
  // Gerçek uygulamada bu veri API'den gelecektir
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "Duman Konseri",
      date: "15 Aralık 2023",
      time: "20:00",
      location: "Volkswagen Arena, İstanbul",
      ticketsSold: 750,
      totalTickets: 1000,
      revenue: 750000,
      status: "active",
      image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
    },
    {
      id: "2",
      title: "MFÖ Konseri",
      date: "22 Aralık 2023",
      time: "21:00",
      location: "Zorlu PSM, İstanbul",
      ticketsSold: 450,
      totalTickets: 800,
      revenue: 360000,
      status: "active",
      image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
    },
    {
      id: "3",
      title: "İstanbul Coffee Festival",
      date: "10 Ekim 2023",
      time: "12:00",
      location: "KüçükÇiftlik Park, İstanbul",
      ticketsSold: 2500,
      totalTickets: 2500,
      revenue: 375000,
      status: "completed",
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
    },
    {
      id: "4",
      title: "Manga Konseri",
      date: "5 Ocak 2024",
      time: "20:30",
      location: "IF Performance Hall, Ankara",
      ticketsSold: 0,
      totalTickets: 500,
      revenue: 0,
      status: "draft",
      image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
    }
  ]);

  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "draft" | "completed" | "cancelled">("all");

  const filteredEvents = events.filter(event => {
    if (activeFilter === "all") return true;
    return event.status === activeFilter;
  });

  const totalRevenue = events.reduce((sum, event) => sum + event.revenue, 0);
  const totalTicketsSold = events.reduce((sum, event) => sum + event.ticketsSold, 0);
  const activeEvents = events.filter(event => event.status === "active").length;

  const getStatusBadgeClass = (status: Event["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400";
    }
  };

  const getStatusText = (status: Event["status"]) => {
    switch (status) {
      case "active":
        return "Aktif";
      case "draft":
        return "Taslak";
      case "completed":
        return "Tamamlandı";
      case "cancelled":
        return "İptal Edildi";
      default:
        return status;
    }
  };

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Organizatör Paneli</h1>
            <p className="text-muted-foreground mt-1">Etkinliklerinizi yönetin ve satışları takip edin</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/organizer/events/create">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Yeni Etkinlik Oluştur
              </Button>
            </Link>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-primary/10 mr-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Toplam Gelir</p>
                <h3 className="text-2xl font-bold text-foreground">{totalRevenue.toLocaleString()}₺</h3>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-primary/10 mr-4">
                <Ticket className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Satılan Biletler</p>
                <h3 className="text-2xl font-bold text-foreground">{totalTicketsSold}</h3>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-primary/10 mr-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aktif Etkinlikler</p>
                <h3 className="text-2xl font-bold text-foreground">{activeEvents}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Etkinlik Filtreleri */}
        <div className="mb-8 flex flex-wrap gap-2 items-center">
          <Filter className="h-5 w-5 text-muted-foreground mr-2" />
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            onClick={() => setActiveFilter("all")}
          >
            Tümü
          </Button>
          <Button
            variant={activeFilter === "active" ? "default" : "outline"}
            onClick={() => setActiveFilter("active")}
          >
            Aktif
          </Button>
          <Button
            variant={activeFilter === "draft" ? "default" : "outline"}
            onClick={() => setActiveFilter("draft")}
          >
            Taslak
          </Button>
          <Button
            variant={activeFilter === "completed" ? "default" : "outline"}
            onClick={() => setActiveFilter("completed")}
          >
            Tamamlandı
          </Button>
          <Button
            variant={activeFilter === "cancelled" ? "default" : "outline"}
            onClick={() => setActiveFilter("cancelled")}
          >
            İptal Edildi
          </Button>
        </div>

        {/* Etkinlik Listesi */}
        <div className="grid grid-cols-1 gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-4">
                <div className="relative h-48 md:h-auto">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(event.status)}`}>
                      {getStatusText(event.status)}
                    </span>
                  </div>
                </div>

                <div className="p-6 md:col-span-3">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{event.title}</h2>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          <span>{event.ticketsSold} / {event.totalTickets} bilet satıldı</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="text-sm font-medium text-foreground">
                          Gelir: {event.revenue.toLocaleString()}₺
                        </div>
                        <div className="mt-2 w-full bg-muted rounded-full h-2.5">
                          <div
                            className="bg-primary h-2.5 rounded-full"
                            style={{ width: `${(event.ticketsSold / event.totalTickets) * 100}%` }}
                          ></div>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {Math.round((event.ticketsSold / event.totalTickets) * 100)}% doluluk
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 md:mt-0 flex flex-col space-y-2">
                      <Link href={`/organizer/events/${event.id}`}>
                        <Button variant="outline" className="w-full justify-start">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Detaylar
                        </Button>
                      </Link>
                      <Link href={`/organizer/events/${event.id}/edit`}>
                        <Button variant="outline" className="w-full justify-start">
                          <Edit className="h-4 w-4 mr-2" />
                          Düzenle
                        </Button>
                      </Link>
                      <Link href={`/events/${event.id}`} target="_blank">
                        <Button variant="outline" className="w-full justify-start">
                          <ArrowUpRight className="h-4 w-4 mr-2" />
                          Görüntüle
                        </Button>
                      </Link>
                      {event.status === "draft" && (
                        <Button variant="destructive" className="w-full justify-start">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Sil
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="bg-card p-8 rounded-lg border border-border shadow-sm text-center">
            <h2 className="text-xl font-medium mb-4 text-foreground">Etkinlik bulunamadı</h2>
            <p className="text-muted-foreground mb-6">Seçilen filtreye uygun etkinlik bulunmamaktadır.</p>
            <Link href="/organizer/events/create">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Yeni Etkinlik Oluştur
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 