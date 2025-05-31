import { User } from "@/app/constans/type";

/**
 * Kullanıcı oturumu başlatır ve token/user bilgilerini kaydeder
 */
export const startSession = (user: User, jwt: string) => {
  try {
    if (!user || !jwt) {
      console.error("Session başlatılamadı: Geçersiz kullanıcı veya token");
      return;
    }

    // Güvenli bir şekilde localStorage'a kaydet
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem("jwt", jwt);

    console.log("Session başlatıldı:", {
      userId: user._id || user._id,
      role: user.role || user.role
    });
  } catch (err) {
    console.error("Session başlatılırken hata:", err);
  }
}

/**
 * Kullanıcı oturumunu sonlandırır ve tüm oturum verilerini temizler
 */
export const endSession = () => {
  try {
    localStorage.removeItem('user');
    localStorage.removeItem("jwt");
    console.log("Session sonlandırıldı");
  } catch (err) {
    console.error("Session sonlandırılırken hata:", err);
  }
}

/**
 * Geçerli bir oturum olup olmadığını kontrol eder
 */
export const hasValidSession = (): boolean => {
  try {
    const jwt = localStorage.getItem("jwt");
    const user = localStorage.getItem("user");

    return !!(jwt && user);
  } catch (err) {
    console.error("Session kontrolü sırasında hata:", err);
    return false;
  }
}
