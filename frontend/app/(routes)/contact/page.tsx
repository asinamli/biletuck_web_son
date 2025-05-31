import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container max-w-4xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">İletişim</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Bize Ulaşın</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 mt-0.5" />
                <div>
                  <h3 className="font-medium">E-posta</h3>
                  <p className="text-muted-foreground">destek@biletiniz.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 mt-0.5" />
                <div>
                  <h3 className="font-medium">Telefon</h3>
                  <p className="text-muted-foreground">0850 123 45 67</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 mt-0.5" />
                <div>
                  <h3 className="font-medium">Adres</h3>
                  <p className="text-muted-foreground">
                    Örnek Mahallesi, Teknoloji Caddesi No: 123
                    <br />
                    34000 İstanbul, Türkiye
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Çalışma Saatleri</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Pazartesi - Cuma</span>
                <span className="text-muted-foreground">09:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Cumartesi</span>
                <span className="text-muted-foreground">10:00 - 14:00</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Pazar</span>
                <span className="text-muted-foreground">Kapalı</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium mb-2">Not</h3>
              <p className="text-sm text-muted-foreground">
                Resmi tatillerde müşteri hizmetlerimiz sadece e-posta üzerinden hizmet vermektedir.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
