// Client-side API işlemleri

import axios from "axios";
import useAuthStore from "../hooks/useAuth";
import useUsers from "../hooks/useUsers";

// Kullanıcı listesini getir
export async function getUsersList() {
  try {
    const { getJwt } = useAuthStore.getState();
    const token = getJwt();

    if (!token) {
      throw new Error("Yetkilendirme hatası! Giriş yapmalısın.");
    }

    const response = await axios.get("http://localhost:5000/api/users", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const users = response.data.data;
    const { setUsers } = useUsers.getState();
    setUsers(users);

    return users;
  } catch (error: any) {
    console.error("Kullanıcı listesi alınırken hata:", error);
    throw new Error(error.message || "Kullanıcı listesi alınamadı.");
  }
}

// Kullanıcı bilgilerini getir
export async function getUserById(id: string) {
  try {
    // JWT token'ı al
    const { getJwt } = useAuthStore.getState();
    const token = getJwt();

    if (!token) {
      throw new Error("Yetkilendirme hatası! Giriş yapmalısın.");
    }

    // Kullanıcı bilgilerini al
    const response = await axios.get(`http://localhost:5000/api/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data.data;
  } catch (error: any) {
    console.error("Kullanıcı bilgileri alınırken hata:", error);
    throw new Error(error.message || "Kullanıcı bilgileri alınamadı.");
  }
}

// Kullanıcı rolünü güncelle
export async function updateUserRole(userId: string, newRole: string) {
  try {
    const { getJwt } = useAuthStore.getState();
    const token = getJwt();

    if (!token) {
      throw new Error("Yetkilendirme hatası! Giriş yapmalısın.");
    }

    const response = await axios.put(
      `http://localhost:5000/api/users/${userId}/role`,
      { role: newRole },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Kullanıcı rolü güncellenirken hata:", error);
    throw error;
  }
}

