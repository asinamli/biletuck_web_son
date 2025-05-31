import axios from "axios";
import { toast } from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || `http://localhost:5000`;

export const register = async (username: string, email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      username,
      email,
      password
    });

    // Backend'den gelen yanıtı kontrol et
    const { token, user } = response.data;

    if (!token || !user) {
      throw new Error("Kayıt başarılı ancak giriş yapılamadı");
    }

    return {
      user,
      jwt: token
    };

  } catch (error: any) {
    console.error("Kayıt hatası:", error);

    if (error.response?.status === 409) {
      throw new Error("Bu e-posta adresi zaten kullanılıyor");
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data.message || "Geçersiz kayıt bilgileri");
    } else if (error.message === "Network Error") {
      throw new Error("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin");
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error("Kayıt sırasında bir hata oluştu");
  }
};

