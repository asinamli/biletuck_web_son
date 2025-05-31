"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Loader2, X, Plus, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useAuthStore from "@/app/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";

// Formu doğrulamak için schema
const formSchema = z.object({
  title: z.string().min(5, "Başlık en az 5 karakter olmalıdır"),
  description: z.string().min(20, "Açıklama en az 20 karakter olmalıdır"),
  category: z.string().min(1, "Kategori seçilmelidir"),
  organizerId: z.string().min(1, "Organizatör seçilmelidir"),
  date: z.string().min(1, "Tarih girilmelidir"),
  location: z.string().min(3, "Konum en az 3 karakter olmalıdır"),
  price: z.string(),
  availableTickets: z.string(),
  coverImage: z.string().optional(),
  sliderImages: z.array(z.string()).optional(),
});

interface Category {
  _id: string;
  name: string;
}

interface Organizer {
  _id: string;
  username: string;
  email: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const { getJwt } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Resim URL'leri için state'ler
  const [coverImageUrl, setCoverImageUrl] = useState<string>("");
  const [sliderImageUrls, setSliderImageUrls] = useState<string[]>([]);
  const [newSliderImageUrl, setNewSliderImageUrl] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      organizerId: "",
      date: "",
      location: "",
      price: "0",
      availableTickets: "0",
      coverImage: "",
      sliderImages: [],
    },
  });

  // Kategorileri ve organizatörleri yükle
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getJwt();
        if (!token) {
          toast.error("Oturum bilgilerinize ulaşılamadı");
          router.push("/auth/login");
          return;
        }

        // Kategorileri getir
        const categoryResponse = await axios.get("http://localhost:5000/api/categories");
        if (categoryResponse.data.success) {
          setCategories(categoryResponse.data.data);
        }

        // Organizatörleri getir
        const organizerResponse = await axios.get(
          "http://localhost:5000/api/users?role=organizer",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (organizerResponse.data.success) {
          setOrganizers(organizerResponse.data.data);
        }
      } catch (error) {
        console.error("Veriler yüklenirken hata:", error);
        toast.error("Veriler yüklenirken bir hata oluştu");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [getJwt, router]);

  // Kapak resmi URL'sini ekle
  const handleCoverImageUrlChange = (url: string) => {
    setCoverImageUrl(url);
    form.setValue("coverImage", url);
  };

  // Slider resmi URL'sini listeye ekle
  const addSliderImageUrl = () => {
    if (!newSliderImageUrl || newSliderImageUrl.trim() === "") {
      toast.error("Lütfen bir resim URL'si girin");
      return;
    }

    const updatedUrls = [...sliderImageUrls, newSliderImageUrl];
    setSliderImageUrls(updatedUrls);
    form.setValue("sliderImages", updatedUrls);
    setNewSliderImageUrl(""); // Input'u temizle
    toast.success("Resim URL'si başarıyla eklendi");
  };

  // Slider resmi URL'sini listeden kaldır
  const removeSliderImageUrl = (index: number) => {
    const updatedUrls = sliderImageUrls.filter((_, i) => i !== index);
    setSliderImageUrls(updatedUrls);
    form.setValue("sliderImages", updatedUrls);
  };

  // Formu gönderme işlemi
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    try {
      const token = getJwt();

      if (!token) {
        toast.error("Oturum bilgilerinize ulaşılamadı");
        router.push("/auth/login");
        return;
      }

      // API'ye gönderilecek veriyi hazırla
      const eventData = {
        title: values.title,
        description: values.description,
        category: values.category,
        organizerId: values.organizerId,
        date: values.date,
        location: values.location,
        price: parseFloat(values.price),
        availableTickets: parseInt(values.availableTickets),
        coverImage: coverImageUrl,
        sliderImages: sliderImageUrls,
      };

      // Etkinliği oluştur
      const response = await axios.post(
        "http://localhost:5000/api/events",
        eventData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Etkinlik başarıyla oluşturuldu");
        router.push("/admin/events");
      }
    } catch (error: any) {
      console.error("Etkinlik oluşturma hatası:", error);
      toast.error(error.response?.data?.message || "Etkinlik oluşturulurken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-card p-6 rounded-lg border">
      <h2 className="text-2xl font-bold mb-6">Yeni Etkinlik Oluştur</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Etkinlik Başlığı</FormLabel>
                <FormControl>
                  <Input placeholder="Etkinlik başlığını girin" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Etkinlik Açıklaması</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Etkinlik detaylarını girin"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organizerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organizatör</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Organizatör seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {organizers.map((organizer) => (
                        <SelectItem key={organizer._id} value={organizer._id}>
                          {organizer.username} ({organizer.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Etkinlik Tarihi</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Konum</FormLabel>
                <FormControl>
                  <Input placeholder="Etkinlik konumunu girin" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bilet Fiyatı (TL)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="availableTickets"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Toplam Bilet Sayısı</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Kapak Resmi URL Alanı */}
          <div className="space-y-3">
            <FormLabel>Kapak Resmi URL</FormLabel>
            <div className="flex space-x-2">
              <Input
                type="url"
                placeholder="Kapak resmi URL'si girin"
                value={coverImageUrl}
                onChange={(e) => handleCoverImageUrlChange(e.target.value)}
              />
            </div>
            {coverImageUrl && (
              <div className="p-3 bg-muted/30 rounded-md flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm truncate flex-1">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{coverImageUrl}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCoverImageUrlChange("")}
                  className="h-8 px-2 text-red-500 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Slider Resmi URL'leri Alanı */}
          <div className="space-y-3">
            <FormLabel>Slider Resmi URL'leri</FormLabel>

            {/* URL Ekleme Alanı */}
            <div className="flex space-x-2">
              <Input
                type="url"
                placeholder="Slider resmi URL'si girin"
                value={newSliderImageUrl}
                onChange={(e) => setNewSliderImageUrl(e.target.value)}
              />
              <Button
                type="button"
                onClick={addSliderImageUrl}
                className="flex-shrink-0"
              >
                <Plus className="h-4 w-4 mr-1" /> Ekle
              </Button>
            </div>

            {/* Eklenmiş URL'ler Listesi */}
            {sliderImageUrls.length > 0 ? (
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {sliderImageUrls.map((url, index) => (
                      <div key={index} className="p-3 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm truncate flex-1">
                          <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{url}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSliderImageUrl(index)}
                          className="h-8 px-2 text-red-500 flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center text-muted-foreground p-4 bg-muted/30 rounded-md">
                <p>Henüz slider resmi URL'si eklenmedi</p>
                <p className="text-xs mt-1">Bir URL eklemek için yukarıdaki alana URL'yi yazıp "Ekle" butonuna tıklayın</p>
              </div>
            )}

            {sliderImageUrls.length > 0 && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Toplam {sliderImageUrls.length} resim URL'si</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSliderImageUrls([]);
                    form.setValue("sliderImages", []);
                  }}
                  className="h-8 px-2"
                >
                  <X className="h-4 w-4 mr-1" /> Tümünü Temizle
                </Button>
              </div>
            )}
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              "Etkinlik Oluştur"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}