import axios from "axios";
import useAuthStore from "../hooks/useAuth";

export const userDelete = async (id: string) => {
  try {
    const { getJwt } = useAuthStore.getState();
    const token = getJwt();

    if (!token) {
      throw new Error("Yetkilendirme hatası! Giriş yapmalısın.");
    }

    const response = await axios.delete(`http://localhost:1337/api/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Kullanıcı silinirken hata:", error);

    // Hata detaylarını göster
    if (error.response && error.response.data) {
      console.error("API Hata detayları:", error.response.data);
    }

    throw new Error(error.message || "Kullanıcı silinemedi.");
  }
}

