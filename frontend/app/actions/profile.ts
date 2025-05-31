import axios from "axios";
import useAuthStore from "@/app/hooks/useAuth";

interface ProfileUpdateData {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export const updateProfile = async (data: ProfileUpdateData) => {
  try {
    const { jwt } = useAuthStore.getState();

    const response = await axios.put(
      "http://localhost:5000/api/users/profile",
      data,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    console.log("Profil güncelleme başarılı:", response.data);
    return response.data;
  } catch (error) {
    console.error("Profil güncelleme hatası:", error);
    throw error;
  }
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  try {
    const { jwt } = useAuthStore.getState();

    const response = await axios.put(
      "http://localhost:5000/api/auth/update-password",
      {
        currentPassword,
        newPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    console.log("Şifre değiştirme başarılı:", response.data);
    return response.data;
  } catch (error) {
    console.error("Şifre değiştirme hatası:", error);
    throw error;
  }
};

// Dosya yükleme işlemi için daha sonra implement edilecek
// MongoDB API'de henüz profil resmi yükleme endpoint'i oluşturulmadı
/* 
export const uploadProfileImage = async (file: File) => {
  try {
    const { jwt } = useAuthStore.getState();

    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(
      "http://localhost:5000/api/users/upload-avatar",
      formData,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log("Profil resmi güncelleme başarılı:", response.data);
    return response.data;
  } catch (error) {
    console.error("Profil resmi güncelleme hatası:", error);
    throw error;
  }
};
*/