"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useCartStore from "@/app/hooks/useCart";
import useAuthStore from "@/app/hooks/useAuth";
import { toast } from "react-hot-toast";
import { ShoppingCart, CreditCard, AlertCircle } from "lucide-react";
import Link from "next/link";
import { initiatePayment } from "@/app/actions/payment";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Form doğrulama şeması
const formSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  phone: z
    .string()
    .min(10, "Telefon numarası en az 10 karakter olmalıdır")
    .max(15, "Telefon numarası en fazla 15 karakter olmalıdır")
    .regex(/^\+?[0-9\s-()]+$/, "Geçerli bir telefon numarası giriniz"),
  firstName: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
  lastName: z.string().min(2, "Soyad en az 2 karakter olmalıdır"),
});

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, getServiceFee, getTotalWithFee, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [isClient, setIsClient] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user?.email || "",
      phone: "",
      firstName: "",
      lastName: "",
    },
  });

  // Hydration hatası önlemek için client-side rendering
  useEffect(() => {
    setIsClient(true);
    
    // Kullanıcı giriş yapmamışsa, login sayfasına yönlendir
    if (!isAuthenticated) {
      toast.error("Ödeme yapabilmek için giriş yapmalısınız");
      router.push("/auth/login");
    }
    
    // Sepet boşsa, sepet sayfasına yönlendir
    if (items.length === 0) {
      toast.error("Sepetinizde ürün bulunmamaktadır");
      router.push("/cart");
    }
  }, [isAuthenticated, router, items.length]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (items.length === 0) {
      toast.error("Sepetinizde ürün bulunmamaktadır");
      return;
    }

    setIsProcessing(true);

    try {
      // Ödeme başlat
      const paymentData = {
        cartItems: items,
        userId: user?._id ? user._id.toString() : "",
        contactInfo: values, // Tüm form değerlerini gönder
      };      const result = await initiatePayment(paymentData);

      // Ödeme başarılı ise, ödeme sayfasına yönlendir
      if (result && result.success && result.paymentPageUrl) {
        toast.success("Ödeme sayfasına yönlendiriliyorsunuz...");
        // İyzico ödeme sayfasına yönlendir
        window.location.href = result.paymentPageUrl;
      } else {
        toast.error("Ödeme başlatılamadı");
      }
    } catch (error: any) {
      toast.error(error.message || "Ödeme sırasında bir hata oluştu");
      console.error("Ödeme hatası:", error);
    } finally {
      setIsProcessing(false);
    }
  }

  if (!isClient || !isAuthenticated) {
    return (
      <div className="bg-background min-h-screen py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-foreground">Ödeme</h1>
          <div className="text-center py-10">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Ödeme Bilgileri</h1>

        {items.length === 0 ? (
          <div className="bg-card p-8 rounded-lg border border-border shadow-sm text-center">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-4 text-foreground">
              Sepetinizde ürün bulunmamaktadır
            </h2>
            <p className="text-muted-foreground mb-6">
              Ödeme yapabilmek için sepetinize ürün eklemelisiniz.
            </p>
            <Link href="/events">
              <Button>Etkinliklere Göz At</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-card rounded-lg border border-border shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold mb-6 text-foreground">İletişim Bilgileri</h2>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ad</FormLabel>
                            <FormControl>
                              <Input placeholder="Adınız" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Soyad</FormLabel>
                            <FormControl>
                              <Input placeholder="Soyadınız" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-posta</FormLabel>
                          <FormControl>
                            <Input placeholder="ornek@mail.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefon</FormLabel>
                          <FormControl>
                            <Input placeholder="+90 555 123 4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-6 border-t border-border mt-6">
                      <div className="flex flex-col space-y-4">
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-md mb-2">
                          <h3 className="font-medium text-amber-800 mb-2">Test Kartı Bilgileri</h3>
                          <p className="text-amber-700 text-sm mb-2">
                            Bu bir test uygulamasıdır. Gerçek bir ödeme işlemi yapılmayacaktır.
                          </p>
                          <div className="bg-white p-3 rounded border border-amber-100">
                            <p className="font-mono text-xs mb-1"><span className="font-medium">Kart No:</span> 5528790000000008</p>
                            <p className="font-mono text-xs mb-1"><span className="font-medium">Son Kul. Tar.:</span> 12/2030</p>
                            <p className="font-mono text-xs mb-1"><span className="font-medium">CVC:</span> 123</p>
                            <p className="font-mono text-xs"><span className="font-medium">3D Şifre:</span> 283125</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center bg-amber-50 border border-amber-200 p-4 rounded-md">
                          <AlertCircle className="h-5 w-5 text-amber-600 mr-3 flex-shrink-0" />
                          <p className="text-amber-800 text-sm">
                            Ödeme yapıldığında biletleriniz otomatik olarak oluşturulacak ve biletlerim sayfasında görüntülenecektir.
                          </p>
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={isProcessing}
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          {isProcessing ? "İşlem yapılıyor..." : "İyzico ile Ödemeye Geç"}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </div>
            </div>

            <div>
              <div className="bg-card p-6 rounded-lg border border-border shadow-sm sticky top-24">
                <h2 className="text-xl font-bold mb-6 text-foreground">Sipariş Özeti</h2>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 py-3 border-b border-border">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.eventTitle}</p>
                        <p className="text-xs text-muted-foreground">{item.eventDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.price}₺ x {item.quantity}</p>
                        <p className="text-sm font-medium">{item.price * item.quantity}₺</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Ara Toplam</span>
                    <span>{getTotal()}₺</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Hizmet Bedeli</span>
                    <span>{getServiceFee()}₺</span>
                  </div>
                  <div className="border-t border-border pt-4 flex justify-between font-medium text-foreground">
                    <span>Toplam</span>
                    <span>{getTotalWithFee()}₺</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}