"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, ShoppingCart } from "lucide-react";
import axios from "axios";
import useCartStore from "@/app/hooks/useCart";
import useAuthStore from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: number;
  category: {
    _id: string;
    name: string;
  } | string;
  coverImage: string;
}

export function FeaturedEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem, isInCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // API endpoint'den sadece öne çıkan (featured) 4 etkinliği çek
        const response = await axios.get('http://localhost:5000/api/events?limit=4');
        setEvents(response.data.data);
        console.log("Etkinlikler:", response.data);
      } catch (err) {
        setError("Etkinlikler yüklenirken bir hata oluştu.");
        console.error("Etkinlikler yüklenemedi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleAddToCart = (event: Event, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error("Bilet alabilmek için giriş yapmalısınız");
      router.push("/auth/login");
      return;
    }

    if (isInCart(event._id)) {
      toast.error("Bu etkinlik zaten sepetinizde bulunuyor");
      router.push("/cart");
      return;
    }

    try {
      const cartItem = {
        id: event._id,
        eventId: event._id,
        eventTitle: event.title,
        eventImage: event.coverImage || "/placeholder.jpg",
        eventDate: new Date(event.date).toLocaleDateString("tr-TR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        eventTime: new Date(event.date).toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        eventLocation: event.location,
        ticketType: "Standart",
        price: event.price,
        quantity: 1
      };

      addItem(cartItem);
      toast.success("Etkinlik sepete eklendi");
      router.push("/cart");
    } catch (error) {
      console.error("Sepete eklenirken hata:", error);
      toast.error("Etkinlik sepete eklenirken bir hata oluştu");
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12">Etkinlikler yükleniyor...</div>;
  }

  if (error) {
    return <div className="flex justify-center py-12 text-red-500">{error}</div>;
  }

  if (events.length === 0) {
    return <div className="flex justify-center py-12">Henüz öne çıkan etkinlik bulunmamaktadır.</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {events.map((event) => (
        <div
          key={event._id}
          className="flex flex-col rounded-lg overflow-hidden border border-border bg-card transition-all duration-200 hover:border-primary hover:shadow-md"
        >
          <div className="relative h-48 bg-muted">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${event.coverImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                {typeof event.category === 'object' ? event.category.name : event.category}
              </span>
            </div>
          </div>
          <div className="flex-1 p-6 flex flex-col">
            <h3 className="text-lg font-medium text-foreground">{event.title}</h3>
            <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </div>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                {new Date(event.date).toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                {event.time}
              </div>
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                {event.location}
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div className="text-lg font-semibold text-foreground">
                {event.price} ₺
              </div>
              <Button 
                size="sm"
                onClick={(e) => handleAddToCart(event, e)}
              >
                <ShoppingCart className="mr-1 h-4 w-4" />
                Sepete Ekle
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}