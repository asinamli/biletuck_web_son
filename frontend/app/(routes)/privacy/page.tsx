import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Gizlilik Politikası</h1>
      
      <Card>
        <CardContent className="p-6 prose prose-sm dark:prose-invert max-w-none">
          <p className="text-sm text-muted-foreground mb-6">
            Son güncellenme: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Veri Toplama</h2>
            <p className="mb-4">
              Platformumuz üzerinden hizmet verirken aşağıdaki bilgileri topluyoruz:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Ad ve soyadı</li>
              <li>E-posta adresi</li>
              <li>Telefon numarası</li>
              <li>Fatura bilgileri</li>
              <li>Etkinlik tercihleri ve satın alma geçmişi</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Veri Kullanımı</h2>
            <p className="mb-4">
              Topladığımız bilgileri aşağıdaki amaçlarla kullanıyoruz:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Bilet satın alma işlemlerinin gerçekleştirilmesi</li>
              <li>Müşteri hizmetleri desteği</li>
              <li>Pazarlama iletişimi (izniniz dahilinde)</li>
              <li>Platform güvenliğinin sağlanması</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Veri Güvenliği</h2>
            <p className="mb-4">
              Verilerinizin güvenliği bizim için önemlidir. Bu nedenle:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>SSL şifreleme kullanıyoruz</li>
              <li>Düzenli güvenlik güncellemeleri yapıyoruz</li>
              <li>Veri erişimini sınırlı tutuyoruz</li>
              <li>Düzenli yedekleme yapıyoruz</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Çerezler</h2>
            <p className="mb-4">
              Platformumuzda çerezler kullanılmaktadır. Bu çerezler:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Oturum yönetimi</li>
              <li>Kullanıcı tercihlerinin hatırlanması</li>
              <li>Platform performansının iyileştirilmesi</li>
              <li>Güvenliğin sağlanması</li>
              amaçlarıyla kullanılmaktadır.
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Haklarınız</h2>
            <p className="mb-4">
              KVKK kapsamında aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Verilerinize erişim hakkı</li>
              <li>Verilerinizin düzeltilmesini talep etme hakkı</li>
              <li>Verilerinizin silinmesini talep etme hakkı</li>
              <li>Veri işlemeye itiraz etme hakkı</li>
              <li>Veri taşınabilirliği hakkı</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. İletişim</h2>
            <p>
              Gizlilik politikamız hakkında sorularınız için{" "}
              <a href="mailto:privacy@biletiniz.com" className="text-primary hover:underline">
                privacy@biletiniz.com
              </a>{" "}
              adresinden bize ulaşabilirsiniz.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
