"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/app/hooks/useAuth";
import { toast } from "react-hot-toast";
import { Calendar, Clock, MapPin, Ticket, RefreshCw } from "lucide-react";
import { getUserTickets } from "@/app/actions/tickets";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface Ticket {
  _id: string;
  eventId: {
    _id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    coverImage: string;
  };
  purchaseDate: string;
  price: number;
  isPaid: boolean;
  qrCode: string;
  isUsed: boolean;
  status: string;
}

export default function TicketsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const searchParams = useSearchParams();
  const fromPayment = searchParams.get("fromPayment") === "true";

  // Hydration hatası önlemek için client-side rendering
  useEffect(() => {
    setIsClient(true);
    

    const loadTickets = async () => {
      setIsLoading(true);
      try {
        // Ödeme sonrası geldiyse forceRefresh=true ile önbelleği temizleyerek biletleri çek
        const result = await getUserTickets(fromPayment);
        
        if (result.success) {
          setTickets(result.tickets);
          
          if (fromPayment) {
            toast.success("Ödeme sonrası biletleriniz listeleniyor");
          }
        } else if (fromPayment) {
          // Ödeme sonrası hala bilet görünmüyorsa tekrar dene
          setTimeout(async () => {
            const retryResult = await getUserTickets(true);
            if (retryResult.success) {
              setTickets(retryResult.tickets);
            }
          }, 2000);
        }
      } catch (error) {
        console.error("Bilet yükleme hatası:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadTickets();
    }
  }, [isAuthenticated, router, fromPayment]);

  // Biletleri yenileme fonksiyonu
  const handleRefreshTickets = async () => {
    setIsLoading(true);
    toast.loading("Biletleriniz yenileniyor...", { id: "refreshTickets" });
    
    try {
      const result = await getUserTickets(true); // true ile önbelleği temizle
      
      if (result.success) {
        setTickets(result.tickets);
        toast.success("Biletleriniz yenilendi", { id: "refreshTickets" });
      } else {
        toast.error("Biletler yenilenirken bir hata oluştu", { id: "refreshTickets" });
      }
    } catch (error) {
      toast.error("Biletler yenilenirken bir hata oluştu", { id: "refreshTickets" });
    } finally {
      setIsLoading(false);
    }
  };

  // Tarih formatı düzenleme
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Date(date).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (!isClient || !isAuthenticated) {
    return (
      <div className="bg-background min-h-screen py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-foreground">Biletlerim</h1>
          <div className="text-center py-10">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Biletlerim</h1>
          
          <Button 
            variant="outline" 
            onClick={handleRefreshTickets} 
            disabled={isLoading}
            className="flex items-center"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        </div>        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Biletleriniz yükleniyor...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-card p-8 rounded-lg border border-border shadow-sm text-center">
            <Ticket className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
            <h2 className="text-xl font-medium mb-4 text-foreground">
              Henüz bir biletiniz bulunmamaktadır
            </h2>
            <p className="text-muted-foreground mb-6">
              Etkinliklerimize bilet almak için etkinlikler sayfasını ziyaret edebilirsiniz.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link href="/events">
                <Button className="px-6">Etkinliklere Göz At</Button>
              </Link>
              <Link href="/cart">
                <Button variant="outline">Sepete Git</Button>
              </Link>
            </div>
          </div>
        ) : (<div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {tickets.map((ticket) => (
              <div
                key={ticket._id}
                className="bg-card rounded-lg border border-border shadow-sm overflow-hidden hover:border-primary/50 transition-colors"
              ><div className="relative h-48 bg-muted">
                  {ticket.eventId?.coverImage ? (
                    <Image
                      src={ticket.eventId.coverImage}
                      alt={ticket.eventId.title}
                      width={500}
                      height={280}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
                      <Ticket className="h-12 w-12 text-primary/50" />
                    </div>
                  )}
                  
                  <div className="absolute top-2 right-2">
                    <Badge className={`
                      ${ticket.status === 'confirmed' ? 'bg-green-500' : ''}
                      ${ticket.status === 'pending' ? 'bg-amber-500' : ''}
                      ${ticket.status === 'cancelled' ? 'bg-red-500' : ''}
                      ${ticket.isUsed ? 'bg-gray-500' : ''}
                    `}>
                      {ticket.isUsed ? 'Kullanıldı' : ticket.status === 'confirmed' ? 'Onaylandı' : ticket.status === 'pending' ? 'Beklemede' : 'İptal Edildi'}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-6">                  <h3 className="text-lg font-semibold mb-2 line-clamp-1">
                    {ticket.eventId?.title || "Bilet #" + ticket._id.substring(0, 6)}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-primary flex-shrink-0" />
                      <span className="line-clamp-1">
                        {ticket.eventId?.date ? formatDate(ticket.eventId.date) : "Tarih bilgisi yok"}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-primary flex-shrink-0" />
                      <span className="line-clamp-1">
                        {ticket.eventId?.time || "Saat bilgisi yok"}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4 text-primary flex-shrink-0" />
                      <span className="line-clamp-1">
                        {ticket.eventId?.location || "Konum bilgisi yok"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div>
                      <span className="text-xs text-muted-foreground">Satın Alınma:</span>
                      <div className="text-sm">{formatDate(ticket.purchaseDate)}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">Fiyat:</span>
                      <div className="text-lg font-semibold">{ticket.price} ₺</div>
                    </div>
                  </div>
                  
                  <div className="mt-4">                    {ticket.qrCode && (
                      <div className="border border-border rounded-md p-3 bg-accent/20 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">QR Kod</div>
                          <div className="bg-white p-2 w-24 h-24 mx-auto flex items-center justify-center">
                            <Image
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`ticket-${ticket._id}-event-${ticket.eventId?._id}`)}`}
                              alt="Bilet QR Kodu"
                              width={90}
                              height={90}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => router.push(`/events/${ticket.eventId?._id}`)}
                    >
                      Etkinlik Detaylarını Gör
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}