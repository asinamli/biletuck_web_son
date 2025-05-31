"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, ShoppingCart, Check } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import useCartStore from "@/app/hooks/useCart";
import useAuthStore from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";
import Image from "next/image";

// MongoDB Event tipini tanımlıyoruz
interface Event {
  _id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  price: number;
  image: string;
  category: {
    _id: string;
    name: string;
  };
  organizerId: string;
}

export function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const { addItem, isInCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  // URL'den filtre parametrelerini al
  const categoryId = searchParams.get('category');
  const dateFilter = searchParams.get('date');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const location = searchParams.get('location');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');

        // MongoDB API için sorgu parametreleri oluştur
        let queryParams: any = {};

        // Kategori filtresi
        if (categoryId) {
          queryParams.category = categoryId;
        }

        // Fiyat filtresi
        if (minPrice) queryParams.minPrice = Number(minPrice);
        if (maxPrice) queryParams.maxPrice = Number(maxPrice);

        // Konum filtresi - MongoDB API'niz location araması destekliyorsa
        if (location) {
          queryParams.location = location;
        }

        // Tarih filtresi
        if (dateFilter) {
          queryParams.dateFilter = dateFilter;
        }

        // MongoDB API'ye sorgu yap
        const response = await axios.get('http://localhost:5000/api/events', { 
          params: queryParams,
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data && response.data.data) {
          setEvents(response.data.data);
        }
      } catch (error) {
        console.error("Etkinlikler yüklenirken hata:", error);
        toast.error("Etkinlikler yüklenemedi");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [categoryId, dateFilter, minPrice, maxPrice, location]);

  // Tarih formatlayıcı fonksiyon
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Sabit bir varsayılan resim URL'i
  const defaultImageUrl = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="flex flex-col rounded-lg overflow-hidden border border-border bg-card animate-pulse">
              <div className="h-48 bg-muted"></div>
              <div className="flex-1 p-6">
                <div className="h-6 bg-muted rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-muted rounded mb-4 w-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <div className="h-6 bg-muted rounded w-1/4"></div>
                  <div className="h-8 bg-muted rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Event'i sepete ekle
  const handleAddToCart = (event: Event, e: React.MouseEvent) => {
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
        eventImage: event.image || defaultImageUrl,
        eventDate: formatDate(event.date),
        eventTime: new Date(event.date).toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit"
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

  // Sepete yönlendirme
  const navigateToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/cart");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Link
            href={`/events/${event._id}`}
            key={event._id}
            className="bg-card rounded-lg border border-border overflow-hidden hover:border-primary transition-colors"
          >
            <div className="relative h-48">
              <Image
                src={event.image || defaultImageUrl}
                alt={event.title}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {event.category.name}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(event.date)}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {event.location}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">{event.price}₺</span>
                <Button
                  onClick={(e) => handleAddToCart(event, e)}
                  disabled={isInCart(event._id)}
                >
                  {isInCart(event._id) ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Sepette
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Satın Al
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {events.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-card rounded-lg border border-border p-8">
          <h3 className="text-lg font-medium text-foreground">Etkinlik bulunamadı</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Seçtiğiniz filtrelere uygun etkinlik bulunmamaktadır. Lütfen farklı filtreler ile tekrar deneyin.
          </p>
          <Button
            onClick={() => window.location.href = '/events'}
            variant="outline"
            className="mt-6"
          >
            Tüm Etkinlikleri Göster
          </Button>
        </div>
      )}
    </div>
  );
}