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
import { CheckCircle, XCircle, Clock, Calendar, MapPin } from "lucide-react";
import { toast } from "react-hot-toast";
import useAuthStore from "@/app/hooks/useAuth";

interface EventRequest {
  _id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  price: number;
  availableTickets: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  organizerId: {
    _id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  category: {
    _id: string;
    name: string;
  };
  adminComment?: string;
  coverImage?: string;
  sliderImages?: string[];
}

export default function EventRequestsPage() {
  const [requests, setRequests] = useState<EventRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { jwt } = useAuthStore();

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/event-requests",
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      if (response.data && response.data.data) {
        setRequests(response.data.data);
      }
    } catch (error) {
      console.error("Etkinlik başvuruları yüklenirken hata:", error);
      toast.error("Etkinlik başvuruları yüklenemedi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [jwt]);

  // Statü değişikliğini işle
  const handleStatusChange = async (id: string, newStatus: string, adminComment: string = "") => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/event-requests/${id}`,
        {
          status: newStatus,
          adminComment: adminComment
        },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      if (response.data.success) {
        let message = "";
        if (newStatus === "approved") {
          message = "Başvuru onaylandı ve etkinlik oluşturuldu!";
        } else if (newStatus === "rejected") {
          message = "Başvuru reddedildi";
        } else {
          message = "Başvuru durumu güncellendi";
        }

        toast.success(message);
        fetchRequests(); // Listeyi yenile
      }
    } catch (error) {
      console.error("Başvuru durumu güncellenirken hata:", error);
      toast.error("Başvuru durumu güncellenemedi");
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
        <h1 className="text-2xl font-bold mb-6">Etkinlik Başvuruları</h1>
        <div className="text-center py-10">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Etkinlik Başvuruları</h1>

      {requests.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Henüz bekleyen etkinlik başvurusu bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((request) => (
            <Card key={request._id} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{request.title}</CardTitle>
                    <CardDescription>
                      Başvuran: {request.organizerId.username}
                    </CardDescription>
                  </div>
                  <div>{getStatusBadge(request.status)}</div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{request.description}</p>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{formatDate(request.date)}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>{request.location}</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  Başvuru Tarihi: {formatDate(request.createdAt)}
                </p>
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
                      <CheckCircle className="w-4 h-4 mr-1" /> Onayla ve Etkinlik Oluştur
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-red-50 text-red-600 hover:bg-red-100"
                      onClick={() => {
                        const comment = prompt("Reddetme sebebini yazın (organizatöre iletilecek):");
                        if (comment !== null) {
                          handleStatusChange(request._id, "rejected", comment);
                        }
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Reddet
                    </Button>
                  </>
                )}
                {request.status === "approved" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-amber-50 text-amber-600 hover:bg-amber-100 w-full"
                    onClick={() => handleStatusChange(request._id, "pending")}
                  >
                    <Clock className="w-4 h-4 mr-1" /> Beklemede Olarak İşaretle
                  </Button>
                )}
                {request.status === "rejected" && (
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