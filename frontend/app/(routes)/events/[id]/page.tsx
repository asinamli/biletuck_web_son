"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ShoppingCart,
  Info,
  Tag,
  ArrowLeft,
  Share2 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import useCartStore from "@/app/hooks/useCart";
import useAuthStore from "@/app/hooks/useAuth";
import { toast } from "react-hot-toast";
import axios from "axios";

// Bilet türü arayüzü
interface TicketType {
  id: string;
  name: string;
  price: number;
  description: string;
  availableCount: number;
  maxPerPurchase: number;
}

// Etkinlik arayüzü
interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  availableTickets: number;
  coverImage: string;
  sliderImages: string[];
  category: {
    _id: string;
    name: string;
  };
  organizerId: {
    _id: string;
    username: string;
    email: string;
  };
  status: 'active' | 'cancelled' | 'completed';
  isApproved: boolean;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const { addItem, isInCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Sepete ekle butonuna tıklanınca tetiklenir
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Bilet satın almak için giriş yapmalısınız");
      router.push("/auth/login");
      return;
    }

    if (!event) {
      toast.error("Etkinlik bilgileri yüklenemedi");
      return;
    }
    
    if (isInCart(event._id)) {
      toast.error("Bu etkinlik için bilet zaten sepetinizde");
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
      toast.success("Bilet sepete eklendi");
      router.push("/cart");
    } catch (error) {
      console.error("Sepete eklenirken hata:", error);
      toast.error("Bilet sepete eklenirken bir hata oluştu");
    }
  };
  
  // Etkinlik verilerini çek
  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/events/${eventId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          setEvent(response.data.data);
        } else {
          toast.error("Etkinlik bulunamadı");
        }
      } catch (error: any) {
        console.error("Etkinlik detayları alınırken hata:", error);
        toast.error(error.response?.data?.message || "Etkinlik detayları yüklenirken bir sorun oluştu");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);
  
  // Yükleme durumu
  if (isLoading) {
    return (
      <div className="bg-background min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center pt-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Etkinlik bulunamadı
  if (!event) {
    return (
      <div className="bg-background min-h-screen py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Etkinlik Bulunamadı</h1>
          <p className="text-muted-foreground mb-8">İstediğiniz etkinlik bulunamadı veya kaldırılmış olabilir.</p>
          <Button onClick={() => router.push("/events")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Etkinliklere Dön
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-background min-h-screen py-12">
      <div className="container mx-auto px-4">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => router.push("/events")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Etkinliklere Dön
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Kolon - Etkinlik Detayları */}
          <div className="lg:col-span-2">
            <div className="relative w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden mb-6">
              <Image
                src={event.coverImage || "/placeholder.jpg"}
                alt={event.title}
                fill
                className="object-cover"
              />
            </div>
            
            <h1 className="text-3xl font-bold mb-4 text-foreground">{event.title}</h1>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="outline" className="bg-primary/10">
                {event.category.name}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Tarih</p>
                      <p className="text-muted-foreground">
                        {new Date(event.date).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Saat</p>
                      <p className="text-muted-foreground">
                        {new Date(event.date).toLocaleTimeString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Konum</p>
                      <p className="text-muted-foreground">{event.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="description" className="mb-10">
              <TabsList className="mb-4">
                <TabsTrigger value="description">Açıklama</TabsTrigger>
                <TabsTrigger value="details">Detaylar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="prose dark:prose-invert max-w-none">
                <p>{event.description}</p>
              </TabsContent>
              
              <TabsContent value="details">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Organizatör</p>
                      <p className="text-muted-foreground">{event.organizerId.username}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Tag className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Kategori</p>
                      <p className="text-muted-foreground">{event.category.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Users className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Katılımcı Kapasitesi</p>
                      <p className="text-muted-foreground">{event.availableTickets} kişi</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sağ Kolon - Bilet Satın Alma */}
          <div>
            <div className="bg-card p-6 rounded-lg border border-border shadow-sm sticky top-24">
              <h2 className="text-xl font-bold mb-6 text-foreground">Bilet</h2>
              
              <div className="border border-border rounded-lg p-4 transition-all hover:border-primary">
                <div className="flex justify-between mb-4">
                  <h3 className="font-medium">Standart Bilet</h3>
                  <p className="font-bold">{event.price}₺</p>
                </div>
                
                <div className="flex justify-end items-center">
                  <Button
                    onClick={handleAddToCart}
                    disabled={isInCart(event._id)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {isInCart(event._id) ? "Sepette" : "Sepete Ekle"}
                  </Button>
                </div>
              </div>
              
              <Button className="w-full mt-6" onClick={() => router.push("/cart")}>
                Sepete Git
              </Button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}