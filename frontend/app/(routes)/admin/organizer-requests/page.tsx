"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "react-hot-toast";
import useAuthStore from "@/app/hooks/useAuth";

// MongoDB formatına uygun interface
interface OrganizerRequest {
  _id: string;
  userId: {
    _id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export default function OrganizerRequestsPage() {
  const [requests, setRequests] = useState<OrganizerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getJwt } = useAuthStore();

  const fetchRequests = async () => {
    try {
      setIsLoading(true);

      // JWT token al
      const token = getJwt();
      if (!token) {
        toast.error("Oturum bilgilerinize ulaşılamadı, lütfen tekrar giriş yapın.");
        return;
      }

      console.log("Organizatör başvuruları getiriliyor...");
      const response = await axios.get(
        "http://localhost:5000/api/organizer-requests",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("Gelen veri:", response.data);

      if (response.data?.success && response.data?.data) {
        setRequests(response.data.data);
      } else {
        console.warn("API yanıtı beklenen formatta değil:", response.data);
        toast.error("Veri formatı beklenenden farklı");
      }
    } catch (error: any) {
      console.error("Organizatör başvuruları yüklenirken hata:", error);
      if (error.response?.status === 403) {
        toast.error("Bu sayfayı görüntülemek için gereken yetkiniz yok.");
      } else {
        toast.error("Organizatör başvuruları yüklenemedi");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      // JWT token al
      const token = getJwt();
      if (!token) {
        toast.error("Oturum bilgilerinize ulaşılamadı, lütfen tekrar giriş yapın.");
        return;
      }

      console.log(`Başvuru durumu güncelleniyor. ID: ${id}, Yeni Durum: ${newStatus}`);

      const response = await axios.put(
        `http://localhost:5000/api/organizer-requests/${id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );

      console.log("Güncelleme yanıtı:", response.data);

      if (response.data?.success) {
        toast.success(`Başvuru ${newStatus === "approved" ? "onaylandı" : newStatus === "rejected" ? "reddedildi" : "beklemeye alındı"}.`);
        fetchRequests(); // Listeyi yenile
      } else {
        toast.error("Güncelleme başarısız oldu");
      }
    } catch (error: any) {
      console.error("Başvuru durumu güncellenirken hata:", error);
      toast.error(error.response?.data?.message || "Başvuru durumu güncellenemedi");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <div className="flex items-center text-amber-500">
            <Clock className="w-4 h-4 mr-1" />
            <span>Bekliyor</span>
          </div>
        );
      case "approved":
        return (
          <div className="flex items-center text-green-500">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span>Onaylandı</span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center text-red-500">
            <XCircle className="w-4 h-4 mr-1" />
            <span>Reddedildi</span>
          </div>
        );
      default:
        return <span>{status}</span>;
    }
  };

  // Tarihi formatla
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Organizatör Başvuruları</h1>
        <div className="text-center py-10">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Organizatör Başvuruları</h1>

      {requests.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Henüz bekleyen başvuru bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <Card key={request._id} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{request.title}</CardTitle>
                    <CardDescription>
                      Başvuran: {request.userId.username || request.userId.firstName} ({request.userId.email})
                    </CardDescription>
                  </div>
                  <div>{getStatusBadge(request.status)}</div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {request.description}
                </p>
                <p className="text-xs text-muted-foreground mt-3">
                  Başvuru Tarihi: {formatDate(request.createdAt)}
                </p>
                {request.reviewedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    İncelenme Tarihi: {formatDate(request.reviewedAt)}
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex justify-between bg-muted/30 p-4">
                {request.status === "pending" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-green-50 text-green-600 hover:bg-green-100"
                      onClick={() => handleStatusChange(request._id, "approved")}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" /> Onayla
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-red-50 text-red-600 hover:bg-red-100"
                      onClick={() => handleStatusChange(request._id, "rejected")}
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Reddet
                    </Button>
                  </>
                )}
                {request.status !== "pending" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-amber-50 text-amber-600 hover:bg-amber-100 w-full"
                    onClick={() => handleStatusChange(request._id, "pending")}
                  >
                    <Clock className="w-4 h-4 mr-1" /> Beklemede Olarak İşaretle
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}