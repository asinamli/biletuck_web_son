"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Info } from "lucide-react";
import Link from "next/link";
import useAuthStore from "@/app/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EventRequest {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: {
    _id: string;
    name: string;
  };
  userId: string;
  status: "pending" | "approved" | "rejected";
  ticketPrice: number;
  totalTickets: number;
  adminComment?: string;
  createdAt: string;
  updatedAt: string;
}

export default function EventRequestsPage() {
  const [requests, setRequests] = useState<EventRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { getJwt } = useAuthStore();

  useEffect(() => {
    const loadEventRequests = async () => {
      try {
        const token = getJwt();
        if (!token) {
          toast.error("Oturum bilgileriniz bulunamadı.");
          return;
        }

        const response = await axios.get("http://localhost:5000/api/event-requests/my-requests", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setRequests(response.data.data);
        }
      } catch (error) {
        console.error("Etkinlik başvuruları alınamadı:", error);
        toast.error("Etkinlik başvuruları yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    loadEventRequests();
  }, [getJwt]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500">İnceleniyor</Badge>;
      case "approved":
        return <Badge variant="outline" className="text-green-500 border-green-500">Onaylandı</Badge>;
      case "rejected":
        return <Badge variant="outline" className="text-red-500 border-red-500">Reddedildi</Badge>;
      default:
        return <Badge variant="outline">Bilinmiyor</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold">Etkinlik Başvurularım</h2>
          <p className="text-muted-foreground">
            Oluşturduğunuz etkinlik başvurularını ve durumlarını burada görebilirsiniz
          </p>
        </div>
        <Button asChild>
          <Link href="/organizer/events/create">Yeni Etkinlik Başvurusu</Link>
        </Button>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <h3 className="text-xl font-medium mb-2">Henüz başvuru bulunmuyor</h3>
          <p className="text-muted-foreground mb-6">
            Yeni etkinlik başvurusu oluşturmak için yukarıdaki butona tıklayın
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((request) => (
            <Card key={request._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{request.title}</CardTitle>
                    <CardDescription>{formatDate(request.date)}</CardDescription>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {request.description}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Konum:</span> {request.location}
                  </div>
                  <div>
                    <span className="font-medium">Kategori:</span> {request.category?.name || "Belirtilmemiş"}
                  </div>
                  <div>
                    <span className="font-medium">Bilet Fiyatı:</span> {request.ticketPrice} ₺
                  </div>
                  <div>
                    <span className="font-medium">Toplam Bilet:</span> {request.totalTickets}
                  </div>
                </div>
                {request.adminComment && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-md">
                    <p className="text-sm font-medium mb-1">Yönetici Yorumu:</p>
                    <p className="text-sm text-muted-foreground">{request.adminComment}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="text-xs text-muted-foreground">
                  Oluşturulma: {formatDate(request.createdAt)}
                </p>
                {request.status === "rejected" && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/organizer/events/create?clone=${request._id}`}>
                            <Info className="h-4 w-4 mr-1" /> Düzenle ve Yeniden Gönder
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Başvuruyu düzenleyip yeniden göndermek için tıklayın</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}