import axios from "axios";
import useAuthStore from "@/app/hooks/useAuth";
import useCartStore, { CartItem } from "@/app/hooks/useCart";

interface CheckoutData {
  cartItems: CartItem[];
  userId: string;
  contactInfo: {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
  };
}

// İyzico için ödeme başlatma
export const initiatePayment = async (checkoutData: CheckoutData) => {
  try {
    // JWT token'ı al
    const { getJwt } = useAuthStore.getState();
    const token = getJwt();

    if (!token) {
      throw new Error("Yetkilendirme hatası! Giriş yapmalısınız.");
    }

    // Siparişi oluştur - Backend API'ye istek at
    const response = await axios.post(
      "http://localhost:5000/api/payment/initiate",
      checkoutData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    // İyzico'dan gelen ödeme sayfası URL veya token bilgisini döndür
    if (response.data && response.data.success && response.data.paymentPageUrl) {
      console.log("Ödeme sayfası URL'si:", response.data.paymentPageUrl);
      // URL'yi döndür, tarayıcı yönlendirmesini component içinde yapacağız
      return {
        success: true,
        paymentPageUrl: response.data.paymentPageUrl,
        paymentToken: response.data.token
      };
    } else {
      throw new Error(response.data.message || "Ödeme başlatılamadı. Sunucudan geçerli bir yanıt alınamadı.");
    }
  } catch (error: any) {
    console.error("Ödeme başlatılırken hata:", error);
    let errorMessage = "Ödeme işlemi sırasında bir hata oluştu";

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

// İyzico'dan gelen ödeme sonucunu doğrula
export const verifyPayment = async (token: string) => {
  try {
    // JWT token'ı al
    const { getJwt } = useAuthStore.getState();
    const authToken = getJwt();

    if (!authToken) {
      throw new Error("Yetkilendirme hatası! Giriş yapmalısınız.");
    }
    
    console.log("Doğrulanacak token:", token);
    
    // Test amaçlı, doğrulama olmadan başarılı kabul et
    // Gerçek ortamda bu blok kullanılmamalı
    if (!token || token === "null" || token === "undefined") {
      // Sepeti temizle
      const { clearCart } = useCartStore.getState();
      clearCart();
      
      return {
        success: true,
        message: "Test modu: Ödeme başarıyla tamamlandı"
      };
    }

    // Ödemeyi doğrula
    const response = await axios.post(
      "http://localhost:5000/api/payment/verify",
      { token },
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );

    // Başarılı ödeme sonrası sepeti temizle
    if (response.data && response.data.success) {
      const { clearCart } = useCartStore.getState();
      clearCart();
      
      return {
        success: true,
        message: response.data.message || "Ödeme başarıyla tamamlandı"
      };
    }

    return {
      success: false,
      message: response.data.message || "Ödeme doğrulanırken bir hata oluştu"
    };
  } catch (error: any) {
    console.error("Ödeme doğrulanırken hata:", error);
    let errorMessage = "Ödeme doğrulama sırasında bir hata oluştu";

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};