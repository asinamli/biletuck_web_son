  "use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trash2, CreditCard, Calendar, ShoppingCart } from "lucide-react";
import axios from "axios";
import useCartStore from "@/app/hooks/useCart";
import { useRouter } from "next/navigation";
import useAuthStore from "@/app/hooks/useAuth";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// PaymentForm tipi için gerekli tanımlama
interface PaymentForm {
  cardNumber: string;
  cardHolderName: string;
  expiryDate: string;
  cvc: string;
  amount: number;
}

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, getTotal, getServiceFee, getTotalWithFee, clearCart } = useCartStore();
  const { isAuthenticated, user, getJwt } = useAuthStore();
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvc: '',
    amount: 0
  });

  // Hydration hatası önlemek için client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Kullanıcı giriş yapmış ve admin rolünde ise yönlendir
  useEffect(() => {
    if (isClient) {
      // Admin kontrolü - admin ise ana sayfaya yönlendir
      if (isAuthenticated && user?.role === "admin") {
        toast.error("Admin kullanıcılar sepet özelliğini kullanamaz");
        router.push("/");
        return;
      }
    }
  }, [isClient, isAuthenticated, user, router]);

  // Ödeme formunu güncelleyen handler
  const handlePaymentFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Kart numarası için özel format (4 hanede bir boşluk)
    if (name === 'cardNumber') {
      const formattedValue = value
        .replace(/\s/g, '') // Tüm boşlukları kaldır
        .replace(/\D/g, '') // Sadece rakamlar kalsın
        .slice(0, 16); // Maximum 16 rakam

      // 4 hanede bir boşluk ekle
      const formattedCardNumber = formattedValue
        .replace(/(.{4})/g, '$1 ')
        .trim();

      setPaymentForm(prev => ({ ...prev, cardNumber: formattedCardNumber }));
      return;
    }

    // CVC için özel format (sadece 3-4 rakam)
    if (name === 'cvc') {
      const formattedValue = value
        .replace(/\D/g, '') // Sadece rakamlar kalsın
        .slice(0, 4); // Maximum 4 rakam

      setPaymentForm(prev => ({ ...prev, cvc: formattedValue }));
      return;
    }

    // Son kullanma tarihi için özel format (AA/YY)
    if (name === 'expiryDate') {
      const formattedValue = value
        .replace(/\D/g, '') // Sadece rakamlar kalsın
        .slice(0, 4); // Maximum 4 rakam

      if (formattedValue.length > 2) {
        const month = formattedValue.slice(0, 2);
        const year = formattedValue.slice(2);
        setPaymentForm(prev => ({ ...prev, expiryDate: `${month}/${year}` }));
      } else {
        setPaymentForm(prev => ({ ...prev, expiryDate: formattedValue }));
      }
      return;
    }

    // Diğer alanlar için normal güncelleme
    setPaymentForm(prev => ({ ...prev, [name]: value }));
  };

  // Sepetten öğe kaldırma
  const handleRemoveItem = (id: string) => {
    removeItem(id);
    toast.success("Bilet sepetten kaldırıldı");
  };

  // Ödeme işlemi başlatma fonksiyonu
  const handleCheckout = async () => {
    try {
      // Sepette ürün var mı kontrolü
      if (items.length === 0) {
        toast.error("Sepetinizde bilet bulunmuyor");
        return;
      }

      // Kullanıcı giriş yapmış mı kontrolü
      if (!isAuthenticated) {
        toast.error("Ödeme yapmak için giriş yapmalısınız");
        router.push('/auth/login');
        return;
      }

      // Ödeme formunu göster ve toplam tutarı ayarla
      setPaymentForm(prev => ({ ...prev, amount: getTotalWithFee() }));
      setShowPaymentModal(true);
    } catch (error: any) {
      console.error("Ödeme hazırlığı sırasında hata:", error);
      toast.error("Ödemeye hazırlanırken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  // Ödeme işlemini tamamla
  const completePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Form validasyonu
      if (!paymentForm.cardNumber || !paymentForm.cardHolderName || !paymentForm.expiryDate || !paymentForm.cvc) {
        toast.error("Lütfen tüm kart bilgilerini eksiksiz doldurunuz");
        setLoading(false);
        return;
      }

      // Kart numarası formatını düzelt (boşlukları kaldır)
      const cardNumber = paymentForm.cardNumber.replace(/\s/g, '');

      // API'ye gönderilecek veriyi hazırla
      const token = getJwt();

      if (!token) {
        toast.error("Oturum bilgilerinize ulaşılamadı, lütfen tekrar giriş yapın");
        router.push('/auth/login');
        return;
      }

      // API'ye ödeme isteği gönder
      const response = await axios.post(
        'http://localhost:5000/api/tickets/checkout',
        {
          items: items.map(item => ({
            eventId: item.eventId,
            quantity: item.quantity,
            price: item.price
          })),
          cardDetails: {
            cardNumber: cardNumber,
            cardHolderName: paymentForm.cardHolderName,
            expiryDate: paymentForm.expiryDate,
            cvc: paymentForm.cvc
          }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Başarılı ödeme
        toast.success("Ödeme işlemi başarıyla tamamlandı!");

        // Modal'ı kapat
        setShowPaymentModal(false);

        // Sepeti temizle
        clearCart();

        // Biletler sayfasına yönlendir
        router.push('/tickets');
      } else {
        toast.error(response.data.message || "Ödeme işlemi sırasında bir hata oluştu");
      }
    } catch (error: any) {
      console.error("Ödeme işlemi sırasında hata:", error);
      toast.error(error?.response?.data?.message || "Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) {
    return (
      <div className="bg-background min-h-screen py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-foreground">Sepetim</h1>
          <div className="bg-card p-8 rounded-lg border border-border shadow-sm">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
            <p className="text-center mt-4 text-muted-foreground">Sepet bilgileri yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Sepetim</h1>

        {items.length === 0 ? (
          <div className="bg-card p-8 rounded-lg border border-border shadow-sm text-center">
            <div className="flex justify-center mb-6">
              <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-medium mb-4 text-foreground">Sepetiniz boş</h2>
            <p className="text-muted-foreground mb-6">Sepetinizde hiç etkinlik bulunmamaktadır.</p>
            <Link href="/events">
              <Button>Etkinliklere Göz At</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h2 className="text-xl font-bold text-foreground">Sepet Öğeleri ({items.length})</h2>
                </div>

                {items.map((item) => (
                  <div key={item.id} className="p-6 border-b border-border">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative w-full sm:w-32 h-24 rounded-md overflow-hidden">
                        <Image
                          src={item.eventImage}
                          alt={item.eventTitle}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <Link href={`/events/${item.eventId}`}>
                            <h3 className="font-medium text-foreground hover:text-primary">{item.eventTitle}</h3>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                        <div className="flex items-center mt-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span className="mr-3">{item.eventDate}</span>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                          <div>
                            <span className="text-sm text-muted-foreground">Bilet:</span>
                            <span className="ml-2">{item.quantity} adet</span>
                          </div>
                          <div className="font-medium text-foreground">
                            {item.price}₺
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="bg-card p-6 rounded-lg border border-border shadow-sm sticky top-24">
                <h2 className="text-xl font-bold mb-6 text-foreground">Sipariş Özeti</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Ara Toplam</span>
                    <span>{getTotal()}₺</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Hizmet Bedeli (%5)</span>
                    <span>{getServiceFee()}₺</span>
                  </div>
                  <div className="border-t border-border pt-4 flex justify-between font-medium text-foreground">
                    <span>Toplam</span>
                    <span>{getTotalWithFee()}₺</span>
                  </div>
                </div>

                <Button 
                  className="w-full mb-4"
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {loading ? "İşleniyor..." : "Ödemeye Geç"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Ödemeye geçerek, <Link href="/terms" className="text-primary hover:underline">Kullanım Şartları</Link> ve <Link href="/privacy" className="text-primary hover:underline">Gizlilik Politikası</Link>'nı kabul etmiş olursunuz.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ödeme Dialog Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ödeme Bilgileri</DialogTitle>
            <DialogDescription>
              Bilet satın almak için kart bilgilerinizi giriniz.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={completePayment}>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="cardNumber" className="text-right">
                  Kart Numarası
                </Label>
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  value={paymentForm.cardNumber}
                  onChange={handlePaymentFormChange}
                  placeholder="1234 5678 9012 3456"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="cardHolderName" className="text-right">
                  Kart Sahibinin Adı
                </Label>
                <Input
                  id="cardHolderName"
                  name="cardHolderName"
                  value={paymentForm.cardHolderName}
                  onChange={handlePaymentFormChange}
                  placeholder="Adı Soyadı"
                  className="mt-1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate" className="text-right">
                    Son Kullanma
                  </Label>
                  <Input
                    id="expiryDate"
                    name="expiryDate"
                    value={paymentForm.expiryDate}
                    onChange={handlePaymentFormChange}
                    placeholder="AA/YY"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cvc" className="text-right">
                    CVC
                  </Label>
                  <Input
                    id="cvc"
                    name="cvc"
                    value={paymentForm.cvc}
                    onChange={handlePaymentFormChange}
                    placeholder="123"
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-border pt-4 mt-2">
                <span className="font-medium">Toplam Tutar:</span>
                <span className="font-bold text-lg">{paymentForm.amount} ₺</span>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowPaymentModal(false)}>
                İptal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "İşleniyor..." : "Ödemeyi Tamamla"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
