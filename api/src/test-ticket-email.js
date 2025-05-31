/**
 * Test script for ticket purchase and email functionality
 * Run this script to simulate a ticket purchase and email sending
 */

const { sendTicketMail } = require('./utils/mailService');

// Test edilecek e-posta adresi
const TEST_EMAIL = "namliasiyee@gmail.com";

async function runTicketPurchaseTest() {
  console.log('🎫 Bilet satın alım senaryosu test ediliyor...');
  
  // Gerçek satın alım işlemini simüle ediyoruz
  const mockEventDetails = {
    name: "Yazılım Geliştirme Konferansı 2025",
    date: "15 Haziran 2025",
    time: "13:00 - 18:00",
    location: "Hayal Tech Merkezi, İstanbul",
    // QR kod API ile oluşturulmuş URL
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent("ticket-123-event-456-user-789")}`
  };
  
  try {
    console.log('📧 Bilet onay e-postası gönderiliyor...');
    const result = await sendTicketMail(TEST_EMAIL, mockEventDetails);
    
    if (result) {
      console.log('✅ Başarılı! Bilet onay e-postası gönderildi.');
      console.log(`📮 Alıcı: ${TEST_EMAIL}`);
      console.log('📋 Etkinlik bilgileri:');
      console.log(`   📌 Etkinlik: ${mockEventDetails.name}`);
      console.log(`   📌 Tarih: ${mockEventDetails.date}`);
      console.log(`   📌 Saat: ${mockEventDetails.time}`);
      console.log(`   📌 Konum: ${mockEventDetails.location}`);
    } else {
      console.error('❌ Başarısız! Bilet onay e-postası gönderilemedi.');
    }
  } catch (error) {
    console.error('❌ Test sırasında hata oluştu:', error);
  }
}

// Testi çalıştır
runTicketPurchaseTest();
