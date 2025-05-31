import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="container max-w-4xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Kullanım Şartları</h1>
      
      <Card>
        <CardContent className="p-6 prose prose-sm dark:prose-invert max-w-none">
          <p className="text-sm text-muted-foreground mb-6">
            Son güncellenme: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Genel Hükümler</h2>
            <p className="mb-4">
              Bu web sitesini kullanarak, aşağıdaki kullanım şartlarını kabul etmiş olursunuz.
              Bu şartları kabul etmiyorsanız, lütfen sitemizi kullanmayın.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Hizmet Kullanım Şartları</h2>
            <p className="mb-4">
              Platformumuz üzerinden bilet alırken:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Doğru ve güncel bilgiler sağlamayı</li>
              <li>Hesap güvenliğinizi korumayı</li>
              <li>Platform kurallarına uymayı</li>
              <li>Başkalarının haklarına saygı göstermeyi</li>
              kabul etmiş olursunuz.
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Ödeme ve İade Politikası</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Tüm ödemeler güvenli ödeme altyapısı üzerinden yapılır</li>
              <li>İade koşulları etkinliğe göre değişiklik gösterebilir</li>
              <li>İptal edilen etkinliklerin bilet bedelleri otomatik iade edilir</li>
              <li>İade süreci en geç 7 iş günü içinde tamamlanır</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Fikri Mülkiyet Hakları</h2>
            <p className="mb-4">
              Platform üzerindeki tüm içerik, tasarım, logo ve materyaller şirketimizin
              fikri mülkiyeti altındadır. İzinsiz kullanımı yasaktır.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Sorumluluk Reddi</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Etkinlik içeriğinden organizatörler sorumludur</li>
              <li>Platform teknik aksaklıklardan dolayı oluşabilecek gecikmelerden sorumlu değildir</li>
              <li>Mücbir sebeplerden kaynaklanan aksaklıklardan platform sorumlu tutulamaz</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Hesap Güvenliği</h2>
            <p className="mb-4">
              Kullanıcılar:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Hesap bilgilerini gizli tutmakla</li>
              <li>Şüpheli aktiviteleri bildirmekle</li>
              <li>Hesap güvenliği için gerekli önlemleri almakla</li>
              yükümlüdür.
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Değişiklikler</h2>
            <p className="mb-4">
              Platform, bu kullanım şartlarını önceden haber vermeksizin değiştirme
              hakkını saklı tutar. Değişiklikler sitemizde yayınlandığı andan
              itibaren geçerli olur.
            </p>
            <p>
              Kullanım şartları hakkında sorularınız için{" "}
              <a href="mailto:legal@biletiniz.com" className="text-primary hover:underline">
                legal@biletiniz.com
              </a>{" "}
              adresinden bize ulaşabilirsiniz.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
