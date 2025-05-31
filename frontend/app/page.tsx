"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FeaturedEvents } from "@/app/components/events/featured-events";
import { useEffect, useState } from "react";
import axios from "axios";

// Kategori tipi
interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories');
        if (response.data && response.data.data) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error("Kategoriler yüklenirken hata oluştu:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case "konser":
        return (props: any) => (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        );
      case "spor":
        return (props: any) => (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      default:
        return (props: any) => (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-background py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              <span className="block">Etkinliklere Bilet Almanın</span>
              <span className="block text-primary">En Kolay Yolu</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-muted-foreground sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Konserler, tiyatrolar, spor etkinlikleri ve daha fazlası için biletlerinizi hemen alın.
              Tüm etkinlikler tek bir platformda!
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link href="/events">
                  <Button size="lg" className="w-full">
                    Etkinlikleri Keşfet
                  </Button>
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link href="/auth/register">
                  <Button variant="outline" size="lg" className="w-full">
                    Kayıt Ol
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-12 bg-accent/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            Öne Çıkan Etkinlikler
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-muted-foreground">
            Kaçırmamanız gereken en popüler etkinlikler
          </p>
          <div className="mt-10">
            <FeaturedEvents />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            Kategoriler
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-muted-foreground">
            İlgi alanınıza göre etkinlikleri keşfedin
          </p>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              <div className="col-span-full text-center">
                <p>Kategoriler yükleniyor...</p>
              </div>
            ) : categories.length > 0 ? (
              categories.map((category) => (
                <Link 
                  key={category._id} 
                  href={`/events?category=${category._id}`}
                  className="block"
                >
                  <div className="relative bg-card p-6 flex items-center space-x-3 rounded-lg border border-border hover:border-primary transition-all cursor-pointer shadow-sm">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {getCategoryIcon(category.name)({ className: "h-6 w-6 text-primary" })}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-foreground">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{category.description}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center">
                <p>Henüz kategori bulunmuyor.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
