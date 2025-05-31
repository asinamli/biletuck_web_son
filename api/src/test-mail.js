/**
 * Test script for email functionality
 * Run this script to test if the email service is working correctly
 */

const { sendTestMail } = require('./utils/mailService');

// Hangi e-posta adresine test maili göndermek istediğinizi buraya girin
const TEST_EMAIL = "namliasiyee@gmail.com"; // Kendi e-posta adresinizle değiştirin

async function runTest() {
  console.log('📧 Mail servisi test ediliyor...');
  
  try {
    const result = await sendTestMail(TEST_EMAIL);
    
    if (result) {
      console.log('✅ Test başarılı! E-posta gönderildi.');
      console.log(`📮 Alıcı: ${TEST_EMAIL}`);
    } else {
      console.error('❌ Test başarısız! E-posta gönderilemedi.');
    }
  } catch (error) {
    console.error('❌ Test sırasında hata oluştu:', error);
  }
}

// Test'i çalıştır
runTest();
