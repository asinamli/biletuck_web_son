import axios from "axios";
import useAuthStore from "@/app/hooks/useAuth";
import { toast } from "react-hot-toast";
import { startSession } from "@/lib/session";

const login = async (email: string, password: string) => {
  try {
    console.log("Login isteği gönderiliyor...");

    // API'den token ve kullanıcı bilgisi al
    const response = await axios.post("http://localhost:5000/api/auth/login", {
      identifier: email, // backend'in beklediği format: identifier
      password,
    });

    // Backend cevabını kontrol et
    const { token, user } = response.data;

    if (!token || !user) {
      console.error("API'den geçersiz yanıt:", response.data);
      throw new Error("Giriş başarısız: API'den geçersiz yanıt");
    }

    console.log("API yanıtı:", { token: token.substring(0, 10) + "...", user: { ...user, id: user._id || user.id } });

    // Session ve store'a kaydet (sıralama önemli)
    startSession(user, token);

    // Auth store'a token ve user verilerini sırayla kaydet
    const authStore = useAuthStore.getState();

    // Önce token'ı ayarla
    authStore.setJwt(token);

    // Sonra kullanıcı bilgilerini ayarla (ve isAuthenticated=true yap)
    authStore.setUser(user);

    // Oturum açıldı olarak işaretle
    authStore.setIsAuthenticated(true);

    console.log("Login başarılı!");

    return {
      success: true,
      user,
      jwt: token
    };

  } catch (error: any) {
    console.error("Login hatası:", error);

    // Hata mesajlarını düzenle
    if (error.response?.status === 401) {
      throw new Error("E-posta veya şifre hatalı");
    } else if (error.response?.status === 403) {
      throw new Error("Hesabınız engellenmiş veya onaylanmamış");
    } else if (error.message === "Network Error") {
      throw new Error("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin");
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error("Giriş yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
  }
};

export default login;
