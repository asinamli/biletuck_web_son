"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import useAuthStore from "@/app/hooks/useAuth";

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  organizerId: string;
  status: "active" | "cancelled" | "completed";
  createdAt: string;
  updatedAt: string;
}

export default function OrganizerEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { getJwt } = useAuthStore();

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const token = getJwt();
        if (!token) {
          toast.error("Oturum bilgileriniz bulunamadı.");
          return;
        }

        const response = await axios.get("http://localhost:5000/api/events/my-events", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setEvents(response.data.data);
        }
      } catch (error) {
        console.error("Etkinlik verileri alınamadı:", error);
        toast.error("Etkinlik verileri yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [getJwt]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {events.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">Henüz etkinliğiniz bulunmuyor</h3>
          <p className="text-muted-foreground mb-6">
            Yeni etkinlik oluşturmak için aşağıdaki butona tıklayın
          </p>
          <Button asChild>
            <Link href="/organizer/events/create">Yeni Etkinlik Oluştur</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event._id} className="border rounded-lg p-6 bg-card shadow-sm">
              <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
              <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{event.description}</p>

              <div className="flex items-center text-sm mb-2">
                <span className="font-medium">Tarih:</span>
                <span className="ml-2 text-muted-foreground">
                  {new Date(event.date).toLocaleDateString("tr-TR")}
                </span>
              </div>

              <div className="flex items-center text-sm mb-4">
                <span className="font-medium">Konum:</span>
                <span className="ml-2 text-muted-foreground">{event.location}</span>
              </div>

              <div className="flex justify-between items-center mt-4">
                <span className={`text-xs px-2 py-1 rounded-full ${event.status === "active" ? "bg-green-100 text-green-800" :
                    event.status === "cancelled" ? "bg-red-100 text-red-800" :
                      "bg-blue-100 text-blue-800"
                  }`}>
                  {event.status === "active" ? "Aktif" :
                    event.status === "cancelled" ? "İptal Edildi" : "Tamamlandı"}
                </span>

                <Button variant="outline" size="sm" asChild>
                  <Link href={`/organizer/events/${event._id}`}>
                    Detaylar
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}