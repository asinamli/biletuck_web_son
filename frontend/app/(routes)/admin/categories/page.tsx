"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import useAuthStore from "@/app/hooks/useAuth";

interface Category {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { getJwt } = useAuthStore();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/categories");
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Kategoriler yüklenirken hata:", error);
      toast.error("Kategoriler yüklenemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const createCategory = async () => {
    try {
      const token = getJwt();
      const response = await axios.post(
        "http://localhost:5000/api/categories",
        newCategory,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Kategori başarıyla oluşturuldu");
        setNewCategory({ name: "", description: "" });
        fetchCategories();
      }
    } catch (error) {
      console.error("Kategori oluşturulurken hata:", error);
      toast.error("Kategori oluşturulamadı");
    }
  };

  const updateCategory = async (id: string) => {
    if (!editingCategory) return;

    try {
      const token = getJwt();
      const response = await axios.put(
        `http://localhost:5000/api/categories/${id}`,
        {
          name: editingCategory.name,
          description: editingCategory.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Kategori başarıyla güncellendi");
        setEditingCategory(null);
        fetchCategories();
      }
    } catch (error) {
      console.error("Kategori güncellenirken hata:", error);
      toast.error("Kategori güncellenemedi");
    }
  };

  const deleteCategory = async (id: string) => {
    if (!window.confirm("Bu kategoriyi silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const token = getJwt();
      const response = await axios.delete(
        `http://localhost:5000/api/categories/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Kategori başarıyla silindi");
        fetchCategories();
      }
    } catch (error) {
      console.error("Kategori silinirken hata:", error);
      toast.error("Kategori silinemedi");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Kategoriler</h1>
        <div className="text-center py-10">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kategoriler</h1>
      </div>

      {/* Yeni Kategori Oluşturma Formu */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Yeni Kategori</CardTitle>
          <CardDescription>Yeni bir kategori oluşturun</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              placeholder="Kategori adı"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
            />
          </div>
          <div>
            <Input
              placeholder="Açıklama (opsiyonel)"
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory({ ...newCategory, description: e.target.value })
              }
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={createCategory}
            disabled={!newCategory.name}
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Kategori Oluştur
          </Button>
        </CardFooter>
      </Card>

      {/* Kategoriler Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category._id}>
            <CardHeader>
              <CardTitle>
                {editingCategory?._id === category._id ? (
                  <Input
                    value={editingCategory.name}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        name: e.target.value,
                      })
                    }
                  />
                ) : (
                  category.name
                )}
              </CardTitle>
              {category.description && (
                <CardDescription>
                  {editingCategory?._id === category._id ? (
                    <Input
                      value={editingCategory.description || ""}
                      onChange={(e) =>
                        setEditingCategory({
                          ...editingCategory,
                          description: e.target.value,
                        })
                      }
                    />
                  ) : (
                    category.description
                  )}
                </CardDescription>
              )}
            </CardHeader>
            <CardFooter className="flex justify-between">
              {editingCategory?._id === category._id ? (
                <Button
                  variant="outline"
                  onClick={() => updateCategory(category._id)}
                >
                  Kaydet
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setEditingCategory(category)}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Düzenle
                </Button>
              )}
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => deleteCategory(category._id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Sil
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}