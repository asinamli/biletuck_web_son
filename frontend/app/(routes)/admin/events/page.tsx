"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Calendar, MapPin, Users, CheckCircle, XCircle, Edit, Eye, Plus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import useAuthStore from "@/app/hooks/useAuth";
import Link from "next/link";

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  availableTickets: number;
  status: "active" | "cancelled" | "completed";
  category: {
    _id: string;
    name: string;
  };
  organizerId: {
    _id: string;
    username: string;
  };
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { getJwt } = useAuthStore();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = getJwt();
      const response = await axios.get("http://localhost:5000/api/events/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setEvents(response.data.data);
      }
    } catch (error) {
      console.error("Etkinlikler yüklenirken hata:", error);
      toast.error("Etkinlikler yüklenemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const updateEventStatus = async (eventId: string, newStatus: string) => {
    try {
      setActionLoading(eventId); // İşlem yapılan event ID'sini kaydet
      const token = getJwt();
      
      const response = await axios.put(
        `http://localhost:5000/api/events/${eventId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(
          newStatus === "active" 
            ? "Etkinlik başarıyla aktifleştirildi" 
            : "Etkinlik başarıyla iptal edildi"
        );
        fetchEvents(); // Listeyi güncelle
      }
    } catch (error: any) {
      console.error("Etkinlik durumu güncellenirken hata:", error);
      toast.error(
        error.response?.data?.message || "Etkinlik durumu güncellenemedi"
      );
    } finally {
      setActionLoading(null); // Loading durumunu sıfırla
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Aktif</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">İptal Edildi</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Tamamlandı</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Etkinlikler</h1>
        <div className="text-center py-10">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Etkinlikler</h1>
          <p className="text-muted-foreground">
            Sistemdeki tüm etkinlikleri yönetin
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/events/create">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Etkinlik Oluştur
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => (
          <Card key={event._id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>
                    Organizatör: {event.organizerId?.username || "Bilinmiyor"}
                  </CardDescription>
                </div>
                <div>{getStatusBadge(event.status)}</div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{event.description}</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Kalan Bilet: {event.availableTickets}</span>
                </div>
              </div>
            </CardContent>
            <div className="flex justify-between items-center p-6 bg-muted/30">
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-green-50 text-green-600 hover:bg-green-100"
                  onClick={() => updateEventStatus(event._id, "active")}
                  disabled={event.status === "active" || actionLoading === event._id}
                >
                  {actionLoading === event._id ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  )}
                  Aktifleştir
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-red-50 text-red-600 hover:bg-red-100"
                  onClick={() => updateEventStatus(event._id, "cancelled")}
                  disabled={event.status === "cancelled" || actionLoading === event._id}
                >
                  {actionLoading === event._id ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-1" />
                  )}
                  İptal Et
                </Button>
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link href={`/admin/events/${event._id}/edit`}>
                    <Edit className="w-4 h-4 mr-1" />
                    Düzenle
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link href={`/events/${event._id}`} target="_blank">
                    <Eye className="w-4 h-4 mr-1" />
                    Görüntüle
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}