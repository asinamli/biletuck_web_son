import axios from "axios";
import useAuthStore from "../hooks/useAuth";

export const getOrganizers = async () => {
  // JWT token'ı al
  const { getJwt } = useAuthStore.getState();
  const token = getJwt();

  if (!token) {
    console.error("Yetkilendirme token'ı bulunamadı");
    throw new Error("Token bulunamadı");
  }

  try {
    // MongoDB API'den organizatör rolündeki kullanıcıları getir
    // API'niz rol filtresi özelliği eklemek gerekirse, backend'i güncelleyebilir
    // veya tüm kullanıcıları alıp client-side filtreleme yapabilirsiniz.
    const response = await axios.get("http://localhost:5000/api/users", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    });

    // Sadece organizatör rolündeki kullanıcıları filtrele
    const organizers = response.data.data.filter(
      (user: any) => user.role === 'organizer'
    );

    return organizers;
  } catch (error) {
    console.error("Organizatörler getirilirken hata oluştu:", error);
    throw error;
  }
};
