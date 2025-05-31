const nodemailer = require("nodemailer");
// Basit yaklaşım - diğer modülleri kaldırıyoruz

// Mail gönderme bilgileri
const EMAIL_USER = "namliasiyee@gmail.com";
const EMAIL_PASS = "lepxvmmhtoatlwev"; // Uygulama şifresi

// Nodemailer transport nesnesi oluştur
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  // TLS güvenlik ayarları
  tls: {
    rejectUnauthorized: false // SSL sertifika hatalarını yoksay (geliştirme için)
  },
  // Debug ayarları
  debug: process.env.NODE_ENV !== 'production', // Sadece geliştirme ortamında
  logger: process.env.NODE_ENV !== 'production' // Sadece geliştirme ortamında
});

/**
 * Bilet satın alım onayı e-postası gönderir
 * @param {string} userEmail - Kullanıcının e-posta adresi
 * @param {Object} eventDetails - Etkinlik detayları
 * @returns {Promise<boolean>} - E-posta başarıyla gönderildi mi?
 */
const sendTicketMail = async (userEmail, eventDetails) => {
  if (!userEmail || !eventDetails) {
    console.error("❌ E-posta gönderimi için gerekli bilgiler eksik!");
    return false;
  }

  // E-posta ayarlarını hazırla
  const mailOptions = {
    from: `"Biletuck" <${EMAIL_USER}>`,
    to: userEmail,
    subject: `Biletiniz: ${eventDetails.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="background-color: #4f46e5; color: white; padding: 15px; text-align: center; border-radius: 5px 5px 0 0;">
          <h2>Bilet Onayı</h2>
        </div>
        
        <div style="padding: 20px;">
          <h2>${eventDetails.name}</h2>
          <p><strong>Tarih:</strong> ${eventDetails.date || 'Belirtilmemiş'}</p>
          <p><strong>Saat:</strong> ${eventDetails.time || 'Belirtilmemiş'}</p>
          <p><strong>Konum:</strong> ${eventDetails.location || 'Belirtilmemiş'}</p>
          
          <p><strong>Bilet QR Kodu:</strong></p>
          ${eventDetails.qrCode ? 
            `<div style="text-align: center; margin: 20px 0;">
              <img src="${eventDetails.qrCode}" alt="Bilet QR Kodu" style="max-width: 200px; height: auto; border: 1px dashed #ccc; padding: 10px;">
            </div>
            <p style="text-align: center; font-size: 12px;">QR kodu etkinlik girişinde görevlilere gösteriniz.</p>` : 
            `<p>QR kod oluşturulamadı.</p>`
          }
        </div>
        
        <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; margin-top: 20px;">
          <p>© ${new Date().getFullYear()} Biletuck. Tüm hakları saklıdır.</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Mail başarıyla gönderildi:", userEmail);
    console.log("📧 Mail ID:", info.messageId);
    return true;
  } catch (err) {
    console.error("❌ Mail gönderme hatası:", err);
    // Hata detaylarını günlüğe kaydet
    console.error("Hata detayları:", {
      userEmail,
      eventName: eventDetails.name,
      timestamp: new Date().toISOString(),
      error: err.message
    });
    return false;
  }
};

/**
 * Test mail göndermek için kullanılır
 * @param {string} testEmail - Test e-posta adresi
 * @returns {Promise<boolean>} - E-posta başarıyla gönderildi mi?
 */
const sendTestMail = async (testEmail) => {
  if (!testEmail) {
    console.error("❌ Test e-posta adresi gerekli!");
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Biletuck Test" <${EMAIL_USER}>`,
      to: testEmail,
      subject: "Biletuck Mail Test",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="background-color: #4f46e5; color: white; padding: 15px; text-align: center; border-radius: 5px 5px 0 0;">
            <h2>Mail Sistemi Test</h2>
          </div>
          
          <div style="padding: 20px;">
            <p>Bu bir test e-postasıdır. Mail sistemi çalışıyor.</p>
            <p>Tarih/Saat: ${new Date().toLocaleString('tr-TR')}</p>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; margin-top: 20px;">
            <p>Test e-postası</p>
          </div>
        </div>
      `,
    });

    console.log("✅ Test maili gönderildi:", testEmail);
    console.log("📧 Test mail ID:", info.messageId);
    return true;
  } catch (err) {
    console.error("❌ Test mail gönderme hatası:", err);
    return false;
  }
};

// Transporter'ın bağlantı durumunu doğrula
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP bağlantı hatası:", error);
  } else {
    console.log("✅ SMTP sunucusu hazır:", success);
  }
});

module.exports = {
  sendTicketMail,
  sendTestMail
};
