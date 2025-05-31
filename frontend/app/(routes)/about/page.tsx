import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container max-w-4xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Hakkımızda</h1>
      
      <Card className="mb-8">
        <CardContent className="p-6 prose prose-sm dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">Biz Kimiz?</h2>
          <p className="mb-4">
            Biz, etkinlik dünyasını daha erişilebilir ve keyifli hale getirmeyi amaçlayan bir
            platformuz. Müzikten spora, tiyatrodan konferanslara kadar çeşitli etkinlikleri
            sizlerle buluşturuyoruz.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Misyonumuz</h2>
          <p className="mb-4">
            Etkinlik biletleme sürecini hem organizatörler hem de katılımcılar için
            kolaylaştırmak ve herkesin sevdiği etkinliklere kolayca ulaşmasını sağlamak.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Vizyonumuz</h2>
          <p className="mb-4">
            Türkiye&apos;nin en güvenilir ve kullanıcı dostu etkinlik biletleme platformu
            olmak ve kültür-sanat dünyasına değer katmak.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Değerlerimiz</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Güvenilirlik ve Şeffaflık</li>
            <li>Kullanıcı Odaklı Hizmet</li>
            <li>Yenilikçilik</li>
            <li>Kaliteli Müşteri Deneyimi</li>
            <li>Sosyal Sorumluluk</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
