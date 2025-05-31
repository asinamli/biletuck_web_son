import axios from "axios";
import useAuthStore from "@/app/hooks/useAuth";
import { toast } from "react-hot-toast";

// Kullanıcının biletlerini çeken fonksiyon
export const getUserTickets = async (forceRefresh = false) => {
  try {
    // JWT token'ı al
    const { getJwt } = useAuthStore.getState();
    const token = getJwt();

    if (!token) {
      throw new Error("Yetkilendirme hatası! Giriş yapmalısınız.");
    }

    // Biletleri çek
    const response = await axios.get(
      "http://localhost:5000/api/tickets/my-tickets",
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          forceRefresh: forceRefresh ? "true" : "false" // Önbellek yenilemesi için
        }
      }
    );

    if (response.data && response.data.success) {
      // Bu kısma önbelleği temizlemek için kod eklenebilir
      console.log("Biletler başarıyla çekildi:", response.data.tickets.length);
      
      return {
        success: true,
        tickets: response.data.tickets || []
      };
    } else {
      throw new Error("Biletler alınamadı.");
    }
  } catch (error: any) {
    console.error("Biletleri çekerken hata:", error);
    let errorMessage = "Biletleri görüntülerken bir hata oluştu";

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    toast.error(errorMessage);
    return {
      success: false,
      tickets: [],
      error: errorMessage
    };
  }
};