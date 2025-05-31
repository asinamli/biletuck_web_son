import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "../constans/type";
import axios from "axios";
import Cookies from 'js-cookie';
import { toast } from "react-hot-toast";
import { startSession, endSession } from "@/lib/session";
import {
  auth,
  signInWithGoogle,
  loginWithEmailAndPassword,
  registerWithEmailAndPassword,
  resetPassword,
  logoutUser
} from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

// Hata gösterme durumunu kontrol eden değişken
let isErrorShown = false;

// Auth hata mesajları için tost ID'si
const AUTH_TOAST_ID = "auth-error";

interface AuthState {
  jwt: string;
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setJwt: (jwt: string) => void;
  setUser: (userData: any) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  logout: () => void;
  error: string | null;
  getJwt: () => string | null;
  refreshUserData: () => Promise<User | null>;
  checkAdminRole: () => boolean;
  // Firebase Authentication metodları
  loginWithFirebase: (email: string, password: string) => Promise<void>;
  registerWithFirebase: (email: string, password: string, userData: any) => Promise<void>;
  loginWithGoogleFirebase: () => Promise<void>;
  resetPasswordFirebase: (email: string) => Promise<boolean>;
  syncUserWithFirebase: (firebaseUser: FirebaseUser) => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      jwt: "",
      user: null,
      firebaseUser: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setJwt: (jwt: string) => {
        if (!jwt) {
          console.warn("Token boş olamaz");
          return;
        }

        // Token'ı hem store'da hem cookie'de sakla
        try {
          localStorage.setItem("jwt", jwt);
          Cookies.set('jwt', jwt, { expires: 7, path: '/' });
          console.log("Token kaydedildi:", jwt.substring(0, 10) + "...");
          set({ jwt });
        } catch (err) {
          console.error("Token kaydedilirken hata:", err);
        }
      },

      setUser: (userData: any) => {
        if (!userData) {
          console.warn("Kullanıcı verisi boş");
          set({ user: null, isAuthenticated: false });
          return;
        }

        // Backend'den gelen user verisini normalize et
        const formattedUser = {
          ...userData,
          id: userData._id || userData.id,
          role: userData.role || userData.rol,
          username: userData.username || userData.name || "",
          email: userData.email || ""
        };

        // User bilgilerini güncelle
        set({ user: formattedUser, isAuthenticated: true });

        // User bilgilerini localStorage'a da kaydet
        try {
          localStorage.setItem('user', JSON.stringify(formattedUser));
        } catch (err) {
          console.error("Kullanıcı bilgileri kaydedilirken hata:", err);
        }
      },

      setIsAuthenticated: (isAuthenticated: boolean) => {
        set({ isAuthenticated });
      },

      setIsLoading: (isLoading: boolean) => set({ isLoading }),

      // Firebase ile entegre logout
      logout: async () => {
        console.log("Oturum kapatılıyor");
        set({ isLoading: true });

        try {
          // Firebase'den çıkış yap
          await logoutUser();

          // Backend'den çıkış yap
          const token = get().getJwt();
          if (token) {
            await axios.post("http://localhost:5000/api/auth/logout", {}, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
              }
            }).catch(err => console.warn("Backend logout hatası:", err));
          }

          // Oturum verilerini temizle
          endSession();

          // Local storage ve cookie temizliği
          localStorage.removeItem("jwt");
          localStorage.removeItem("user");
          Cookies.remove('jwt', { path: '/' });
        } catch (err) {
          console.error("Oturum kapatma hatası:", err);
        } finally {
          // State'i sıfırla
          set({ jwt: "", user: null, firebaseUser: null, isAuthenticated: false, isLoading: false });
          isErrorShown = false;
        }
      },

      getJwt: () => {
        // Önce store'dan kontrol et
        const storeJwt = get().jwt;
        if (storeJwt && storeJwt.length > 10) {
          return storeJwt;
        }

        // Store'da yoksa localStorage veya cookie'den al
        try {
          // localStorage'dan kontrol et
          const localJwt = localStorage.getItem("jwt");
          if (localJwt && localJwt.length > 10) {
            // Store'a kaydet ve döndür
            set({ jwt: localJwt });
            return localJwt;
          }

          // Cookie'den kontrol et
          const cookieJwt = Cookies.get('jwt');
          if (cookieJwt && cookieJwt.length > 10) {
            // Store'a kaydet ve döndür
            set({ jwt: cookieJwt });
            return cookieJwt;
          }
        } catch (err) {
          console.error("Token alınırken hata:", err);
        }

        console.warn("getJwt: Geçerli token bulunamadı");
        return null;
      },

      checkAdminRole: () => {
        const { user } = get();
        if (!user) return false;

        // Backend'den gelen response'da bazen role, bazen rol olarak geliyor
        const userRole = user.role || user.role;
        console.log("Kullanıcı rolü kontrolü:", user, "Rol:", userRole);

        // Admin rolünü kontrol et
        return userRole === "admin";
      },

      refreshUserData: async () => {
        const { getJwt, syncUserWithFirebase } = get();
        const token = getJwt();
        const currentFirebaseUser = auth.currentUser;

        // Token yoksa sessiz bir şekilde çık
        if (!token) {
          console.warn("refreshUserData: Token bulunamadı");
          if (!currentFirebaseUser) {
            get().logout();
          } else {
            // Firebase kullanıcısı var ama token yok, token yenile
            await syncUserWithFirebase(currentFirebaseUser);
          }
          return null;
        }

        set({ isLoading: true });

        try {
          console.log("refreshUserData: API isteği yapılıyor");

          // API isteği yap - token'ı Bearer olarak gönder
          const response = await axios.get("http://localhost:5000/api/users/me", {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });

          console.log("API yanıtı:", response.data);

          // Başarılı yanıt durumu
          if (response?.data?.success && response?.data?.user) {
            // User bilgilerini güncelle
            get().setUser(response.data.user);
            set({ isLoading: false, isAuthenticated: true });
            isErrorShown = false; // Başarılı istek, hata bayrağını sıfırla
            return response.data.user;
          } else {
            console.warn("API yanıtında beklenen user verisi bulunamadı:", response.data);
            throw new Error("Geçersiz API yanıtı");
          }
        } catch (error: any) {
          console.error("Kullanıcı verisi yenileme hatası:", error);

          // Hata detaylarını kaydet
          if (error.response) {
            console.error("Hata yanıtı:", {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data
            });
          }

          // 401 veya 403 hataları - token süresi dolmuş veya geçersiz
          if (error.response?.status === 401 || error.response?.status === 403) {
            if (currentFirebaseUser) {
              // Firebase kullanıcısı hala varsa, yeni token almayı dene
              console.log("Firebase kullanıcısı hala aktif, token yenilemeye çalışılıyor");
              try {
                await syncUserWithFirebase(currentFirebaseUser);
                return get().user;
              } catch (syncError) {
                console.error("Token yenileme hatası:", syncError);
                get().logout();
              }
            } else {
              console.warn("Yetki hatası (401/403) - logout yapılıyor");
              get().logout();

              // Sadece bir kez hata göster
              if (!isErrorShown) {
                isErrorShown = true;
                toast.error("Oturum süreniz doldu, lütfen tekrar giriş yapın", {
                  id: AUTH_TOAST_ID,
                  duration: 4000
                });
              }
            }
          }

          set({ isLoading: false });
          return null;
        }
      },

      // Firebase ile giriş yap
      loginWithFirebase: async (email: string, password: string) => {
        try {
          set({ isLoading: true });

          // Firebase ile email/şifre girişi
          const result = await loginWithEmailAndPassword(email, password);
          const firebaseUser = result.user;

          // Firebase kullanıcısını kaydet
          set({ firebaseUser });

          // MongoDB ile senkronize et
          await get().syncUserWithFirebase(firebaseUser);

          toast.success("Giriş başarılı!");
        } catch (error: any) {
          console.error("Firebase giriş hatası:", error);

          // Firebase hata kodlarını daha kullanıcı dostu mesajlara çevir
          let errorMessage = "Giriş yapılamadı. Lütfen tekrar deneyin.";

          if (error.code === "auth/user-not-found") {
            errorMessage = "Bu e-posta adresine ait bir hesap bulunamadı.";
          } else if (error.code === "auth/wrong-password") {
            errorMessage = "Hatalı şifre girdiniz.";
          } else if (error.code === "auth/invalid-email") {
            errorMessage = "Geçersiz e-posta adresi.";
          } else if (error.code === "auth/too-many-requests") {
            errorMessage = "Çok fazla başarısız giriş denemesi yaptınız. Lütfen daha sonra tekrar deneyin.";
          }

          toast.error(errorMessage);
          set({ isLoading: false });
          throw error;
        }
      },

      // Firebase ile kaydol
      registerWithFirebase: async (email: string, password: string, userData: any) => {
        try {
          set({ isLoading: true });

          // Firebase ile kayıt ol
          const result = await registerWithEmailAndPassword(email, password);
          const firebaseUser = result.user;

          // Firebase kullanıcısını kaydet
          set({ firebaseUser });

          // Kullanıcı verilerini MongoDB'ye kaydet
          const userToCreate = {
            email,
            username: userData.username || email.split('@')[0],
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            firebaseUid: firebaseUser.uid,
            // Diğer gerekli alanlar...
          };

          // Backend'e kullanıcı kaydı isteği
          const idToken = await firebaseUser.getIdToken();

          const response = await axios.post(
            "http://localhost:5000/api/auth/firebase-signup",
            userToCreate,
            {
              headers: {
                "Authorization": `Bearer ${idToken}`,
                "Content-Type": "application/json"
              }
            }
          );

          if (response.data?.success) {
            // Backend'den gelen JWT token'ı kaydet
            get().setJwt(response.data.token);

            // Kullanıcı bilgilerini güncelle
            get().setUser(response.data.user);

            // Session başlat
            startSession(response.data.user, response.data.token);

            toast.success("Kayıt başarılı!");
          } else {
            throw new Error("Kullanıcı MongoDB'ye kaydedilemedi");
          }

        } catch (error: any) {
          console.error("Firebase kayıt hatası:", error);

          let errorMessage = "Kayıt yapılamadı. Lütfen tekrar deneyin.";

          if (error.code === "auth/email-already-in-use") {
            errorMessage = "Bu e-posta adresi zaten kullanımda.";
          } else if (error.code === "auth/invalid-email") {
            errorMessage = "Geçersiz e-posta adresi.";
          } else if (error.code === "auth/weak-password") {
            errorMessage = "Şifre çok zayıf. Daha güçlü bir şifre belirleyin.";
          }

          toast.error(errorMessage);

          // Hata durumunda Firebase kullanıcısını temizle
          await logoutUser().catch(console.error);
          set({ isLoading: false, firebaseUser: null });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Google ile giriş
      loginWithGoogleFirebase: async () => {
        try {
          set({ isLoading: true });

          // Google ile giriş yap
          const result = await signInWithGoogle();
          const firebaseUser = result.user;

          // Firebase kullanıcısını kaydet
          set({ firebaseUser });

          // MongoDB ile senkronize et
          await get().syncUserWithFirebase(firebaseUser);

          toast.success("Google ile giriş başarılı!");
        } catch (error: any) {
          console.error("Google giriş hatası:", error);

          let errorMessage = "Google ile giriş yapılamadı.";

          if (error.code === "auth/popup-closed-by-user") {
            errorMessage = "Giriş penceresi kapatıldı. İşlem iptal edildi.";
          } else if (error.code === "auth/cancelled-popup-request") {
            errorMessage = "İşlem iptal edildi. Lütfen tekrar deneyin.";
          }

          toast.error(errorMessage);
          set({ isLoading: false });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Şifre sıfırlama
      resetPasswordFirebase: async (email: string) => {
        try {
          set({ isLoading: true });
          await resetPassword(email);
          toast.success("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
          return true;
        } catch (error: any) {
          console.error("Şifre sıfırlama hatası:", error);

          let errorMessage = "Şifre sıfırlama işlemi yapılamadı.";

          if (error.code === "auth/user-not-found") {
            errorMessage = "Bu e-posta adresine ait bir hesap bulunamadı.";
          } else if (error.code === "auth/invalid-email") {
            errorMessage = "Geçersiz e-posta adresi.";
          }

          toast.error(errorMessage);
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // Firebase kullanıcısını MongoDB ile senkronize et
      syncUserWithFirebase: async (firebaseUser: FirebaseUser) => {
        try {
          console.log("Firebase kullanıcısı ile MongoDB senkronizasyonu başlıyor");

          if (!firebaseUser) {
            throw new Error("Firebase kullanıcısı bulunamadı");
          }

          // Firebase ID token al
          const idToken = await firebaseUser.getIdToken(true);

          // Backend'e token doğrulama isteği gönder
          const response = await axios.post(
            "http://localhost:5000/api/auth/firebase-login",
            {
              idToken,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL
            },
            {
              headers: {
                "Content-Type": "application/json"
              }
            }
          );

          console.log("Firebase doğrulama yanıtı:", response.data);

          if (response.data?.success) {
            // Backend'den gelen JWT token'ı kaydet
            get().setJwt(response.data.token);

            // Kullanıcı bilgilerini güncelle
            get().setUser(response.data.user);

            // Oturum başlat
            startSession(response.data.user, response.data.token);

            // Oturum durumunu güncelle
            set({ isAuthenticated: true, isLoading: false });
          } else {
            throw new Error("Kullanıcı doğrulanamadı");
          }
        } catch (error: any) {
          console.error("Firebase senkronizasyon hatası:", error);

          // Senkronizasyon başarısız oldu, oturumu temizle
          get().logout();
          throw error;
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: "auth-storage",
      // Sadece gerekli alanları sakla
      partialize: (state) => ({
        jwt: state.jwt,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);

// Firebase auth state değişikliklerini dinle
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, async (firebaseUser) => {
    console.log("Firebase auth durumu değişti:", firebaseUser);

    if (firebaseUser) {
      // Kullanıcı giriş yaptı
      const store = useAuthStore.getState();

      if (!store.isAuthenticated || !store.user) {
        try {
          console.log("Kullanıcı otomatik senkronize ediliyor");
          await store.syncUserWithFirebase(firebaseUser);
        } catch (error) {
          console.error("Otomatik senkronizasyon hatası:", error);
        }
      }
    } else {
      // Kullanıcı çıkış yaptı
      const store = useAuthStore.getState();
      if (store.isAuthenticated) {
        console.log("Firebase çıkışı algılandı, oturum kapatılıyor");
        store.logout();
      }
    }
  });
}

export default useAuthStore;
