"use client";

import { getUsersList, updateUserRole } from "@/app/actions/usersList";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import axios from "axios";
import { toast } from "react-hot-toast";
import useAuthStore from "@/app/hooks/useAuth";
import { userDelete } from "@/app/actions/userDelete";
import useUsers from "@/app/hooks/useUsers";

export default function UsersListPage() {
  const { users, setUsers } = useUsers();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { user: currentUser, isAuthenticated, refreshUserData } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Kullanıcının admin olup olmadığını kontrol et
  const isAdmin = currentUser?.role === "admin"; // rol yerine role kullan

  useEffect(() => {
    if (isClient && isAuthenticated) {
      refreshUserData().catch(console.error);
    }
  }, [isClient, isAuthenticated, refreshUserData]);

  const refreshUsersList = async () => {
    setIsLoading(true);
    try {
      const response = await getUsersList();
      if (response) {
        setUsers(response);
      } else {
        setError("Kullanıcı listesi alınamadı.");
      }
    } catch (error: any) {
      console.error("Kullanıcı listesi alınırken hata:", error);
      setError(error.message || "Bilinmeyen bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isClient && isAuthenticated && isAdmin) {
      refreshUsersList();
    }
  }, [isClient, isAuthenticated, isAdmin]);

  const findUser = async (id: string) => {
    try {
      const { getJwt } = useAuthStore.getState();
      const token = getJwt();

      if (!token) {
        console.error("Yetkilendirme token'ı bulunamadı");
        toast.error("Yetkilendirme hatası! Giriş yapmalısın.");
        return;
      }

      toast.loading("Kullanıcı bilgileri alınıyor...", { id: "userInfo" });

      const response = await axios.get(`http://localhost:1337/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const userData = response.data;

      // Kullanıcı bilgilerini daha düzgün bir şekilde göster
      toast.success(
        <div>
          <p><strong>Kullanıcı Adı:</strong> {userData.username}</p>
          <p><strong>E-posta:</strong> {userData.email}</p>
          <p><strong>Rol:</strong> {userData.rol || "Rol atanmamış"}</p>
          <p><strong>Açıklama:</strong> {userData.Description || "Açıklama yok"}</p>
          <p><strong>Oluşturulma:</strong> {new Date(userData.createdAt).toLocaleString()}</p>
        </div>,
        { id: "userInfo", duration: 5000 }
      );
    } catch (error: any) {
      console.error("Kullanıcı bilgileri alınamadı:", error);
      toast.error(error.message || "Kullanıcı bilgileri alınamadı.", { id: "userInfo" });
    }
  }

  // Rol değiştirme fonksiyonu
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      // Kullanıcının kendi rolünü değiştirmesini engelle
      if (userId === currentUser?._id?.toString()) {
        toast.error("Kendi rolünüzü değiştiremezsiniz!", { id: "roleUpdate" });
        return;
      }

      console.log("user id", userId);
      console.log("current user id", currentUser?._id);
      console.log("new role", newRole);

      toast.loading("Rol güncelleniyor...", { id: "roleUpdate" });

      await updateUserRole(userId, newRole);

      // Başarılı olduğunda toast'u güncelle
      toast.success(`Kullanıcı rolü "${newRole}" olarak güncellendi.`, { id: "roleUpdate" });

      // Kullanıcı listesini yeniden yükle
      await refreshUsersList();
    } catch (error: any) {
      console.error("Rol güncellenemedi:", error);

      // Hata mesajını daha açıklayıcı hale getir
      let errorMessage = "Rol güncellenemedi.";

      if (error.response) {
        if (error.response.status === 500) {
          errorMessage = "Sunucu hatası: Rol güncellenemedi. Lütfen daha sonra tekrar deneyin.";
        } else if (error.response.data && error.response.data.error) {
          errorMessage = `Hata: ${error.response.data.error.message || error.response.data.error}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, { id: "roleUpdate" });
    }
  };

  // Kullanıcı silme işlemi
  const handleDeleteUser = async (userId: string) => {
    try {
      // Kullanıcının kendisini silmesini engelle
      if (userId === currentUser?._id?.toString()) {
        toast.error("Kendinizi silemezsiniz!");
        return;
      }

      toast.loading("Kullanıcı siliniyor...", { id: "userDelete" });

      await userDelete(userId);

      toast.success("Kullanıcı başarıyla silindi", { id: "userDelete" });

      // Kullanıcı listesini yeniden yükle
      await refreshUsersList();
    } catch (error: any) {
      console.error("Kullanıcı silinemedi:", error);
      toast.error(error.message || "Kullanıcı silinemedi", { id: "userDelete" });
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return null; // Yetkisiz kullanıcılar için içerik gösterme
  }

  if (isLoading) return <p>Yükleniyor...</p>;
  if (error) return <p>Hata: {error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Kullanıcılar</h1>
      <div className="flex flex-col gap-4">
        {users.length > 0 ? (
          users.map((user: any) => (
            <div key={user.id} className="p-4 border rounded shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-4">
                  {/* Kullanıcı bilgileri */}
                  <div className="cursor-pointer" onClick={() => findUser(user.id)}>
                    <h2 className="font-semibold">{user.username || "Bilinmeyen Kullanıcı"}</h2>
                    <p className="text-gray-600">{user.email || "E-posta bulunamadı"}</p>
                    {user.id === currentUser?._id && (
                      <span className="text-xs text-primary font-medium">(Bu sizsiniz)</span>
                    )}
                  </div>
                </div>

                {/* Rol ve tarih bilgileri */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Rol: </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className={`${user.role === "admin" ? "bg-blue-100 text-blue-700" :
                        user.role === "organizer" ? "bg-green-100 text-green-700" :
                          user.role === "user" ? "bg-gray-100 text-gray-700" :
                            "bg-red-50 text-red-500"
                        }`}>
                        {user.role || "Rol atanmamış"}
                      </Button>
                    </DropdownMenuTrigger>

                    {user.id !== currentUser?._id && (
                      <DropdownMenuContent>
                        {["user", "admin", "organizer"].map((role) => (
                          <DropdownMenuItem
                            key={role}
                            onClick={() => handleRoleChange(user.id, role)}
                            className={`${role === "admin" ? "text-blue-700" :
                              role === "organizer" ? "text-green-700" :
                                "text-gray-700"
                              }`}
                          >
                            {role}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    )}
                  </DropdownMenu>

                  <p className="text-xs text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString() || "Oluşturulma tarihi bulunamadı"}
                  </p>

                  {user?.role !== "admin" && (
                    <Button
                      onClick={() => handleDeleteUser(user.id)}
                      variant="destructive"
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Sil
                    </Button>
                  )}

                </div>
              </div>
            </div>
          ))
        ) : (
          <p>Kullanıcı bulunamadı.</p>
        )}
      </div>
    </div>
  );
}
