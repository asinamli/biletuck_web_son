"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import useAuthStore from "@/app/hooks/useAuth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Category {
  _id: string;
  name: string;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  availableTickets: number;
  category: {
    _id: string;
    name: string;
  };
  coverImage?: string;
  sliderImages?: string[];
}

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const { getJwt } = useAuthStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchEventAndCategories = async () => {
      try {
        const token = getJwt();
        if (!token) {
          toast.error("Oturum bilgileriniz bulunamadı");
          return;
        }

        // Fetch event details
        const eventResponse = await axios.get(`http://localhost:5000/api/events/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (eventResponse.data.success) {
          setEvent(eventResponse.data.data);
        }

        // Fetch categories
        const categoriesResponse = await axios.get("http://localhost:5000/api/categories");
        if (categoriesResponse.data.success) {
          setCategories(categoriesResponse.data.data);
        }

      } catch (error) {
        console.error("Veri yüklenirken hata:", error);
        toast.error("Etkinlik bilgileri yüklenemedi");
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndCategories();
  }, [params.id, getJwt]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = getJwt();
      if (!token || !event) return;

      const formData = new FormData(e.currentTarget);
      const updatedEvent = {
        title: formData.get("title"),
        description: formData.get("description"),
        date: formData.get("date"),
        location: formData.get("location"),
        price: Number(formData.get("price")),
        availableTickets: Number(formData.get("availableTickets")),
        category: formData.get("category"),
        coverImage: formData.get("coverImage"),
        sliderImages: formData.get("sliderImages")?.toString().split(",").map(url => url.trim()).filter(Boolean)
      };

      const response = await axios.put(
        `http://localhost:5000/api/events/${params.id}`,
        updatedEvent,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success("Etkinlik başarıyla güncellendi");
        router.push("/admin/events");
      }
    } catch (error: any) {
      console.error("Etkinlik güncellenirken hata:", error);
      toast.error(error.response?.data?.message || "Etkinlik güncellenemedi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Etkinlik Bulunamadı</h1>
        <p className="text-muted-foreground">İstediğiniz etkinlik bulunamadı veya erişim yetkiniz yok.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Etkinliği Düzenle</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium">Başlık</label>
              <Input 
                name="title" 
                defaultValue={event.title} 
                required 
              />
            </div>

            <div>
              <label className="text-sm font-medium">Açıklama</label>
              <Textarea 
                name="description" 
                defaultValue={event.description} 
                required 
              />
            </div>

            <div>
              <label className="text-sm font-medium">Tarih ve Saat</label>
              <Input 
                type="datetime-local" 
                name="date" 
                defaultValue={new Date(event.date).toISOString().slice(0, 16)} 
                required 
              />
            </div>

            <div>
              <label className="text-sm font-medium">Konum</label>
              <Input 
                name="location" 
                defaultValue={event.location} 
                required 
              />
            </div>

            <div>
              <label className="text-sm font-medium">Kategori</label>
              <Select name="category" defaultValue={event.category._id}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Bilet Fiyatı (₺)</label>
              <Input 
                type="number" 
                name="price" 
                defaultValue={event.price} 
                required 
                min="0" 
                step="0.01" 
              />
            </div>

            <div>
              <label className="text-sm font-medium">Toplam Bilet Sayısı</label>
              <Input 
                type="number" 
                name="availableTickets" 
                defaultValue={event.availableTickets} 
                required 
                min="1" 
              />
            </div>

            <div>
              <label className="text-sm font-medium">Kapak Görseli URL</label>
              <Input 
                name="coverImage" 
                defaultValue={event.coverImage} 
                placeholder="https://" 
              />
            </div>

            <div>
              <label className="text-sm font-medium">Slider Görselleri URL (virgülle ayırın)</label>
              <Input 
                name="sliderImages" 
                defaultValue={event.sliderImages?.join(", ")} 
                placeholder="https://resim1.jpg, https://resim2.jpg" 
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
              >
                İptal
              </Button>
              <Button 
                type="submit" 
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  "Kaydet"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}