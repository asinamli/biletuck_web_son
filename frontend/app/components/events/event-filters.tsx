"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";

// MongoDB Category tipi
interface Category {
  _id: string;
  name: string;
  description: string;
}

export function EventFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // URL parametrelerinden filtreleri al
  const selectedCategoryParam = searchParams.get('category');
  const selectedDateParam = searchParams.get('date');
  const minPriceParam = searchParams.get('minPrice');
  const maxPriceParam = searchParams.get('maxPrice');
  const selectedLocationParam = searchParams.get('location');

  const [selectedCategory, setSelectedCategory] = useState<string | null>(selectedCategoryParam);
  const [selectedDate, setSelectedDate] = useState<string | null>(selectedDateParam);
  const [minPrice, setMinPrice] = useState<string>(minPriceParam || '');
  const [maxPrice, setMaxPrice] = useState<string>(maxPriceParam || '');
  const [selectedLocation, setSelectedLocation] = useState<string>(selectedLocationParam || '');

  // Kategorileri MongoDB API'den getir
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories');
        if (response.data && response.data.data) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error("Kategoriler yüklenirken hata:", error);
        toast.error("Kategoriler yüklenemedi");
      }
    };

    // Benzersiz konumları getir
    const fetchLocations = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events');
        if (response.data && response.data.data) {
          // Benzersiz konumları çıkart
          const uniqueLocations = [...new Set(
            response.data.data
              .map((event: any) => event.location)
              .filter(Boolean)
          )] as string[];
          setLocations(uniqueLocations);
        }
      } catch (error) {
        console.error("Konumlar yüklenirken hata:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
    fetchLocations();
  }, []);

  // Filtre değiştiğinde URL güncelle ve etkinlikleri filtrele
  const updateFilters = () => {
    const params = new URLSearchParams();

    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedDate) params.set('date', selectedDate);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (selectedLocation) params.set('location', selectedLocation);

    router.push(`/events?${params.toString()}`);
  };

  const handleCategoryChange = (categoryId: string) => {
    const newCategory = categoryId === selectedCategory ? null : categoryId;
    setSelectedCategory(newCategory);
    setTimeout(updateFilters, 0);
  };

  const handleDateChange = (date: string) => {
    const newDate = date === selectedDate ? null : date;
    setSelectedDate(newDate);
    setTimeout(updateFilters, 0);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocation(e.target.value);
    setTimeout(updateFilters, 0);
  };

  const handlePriceChange = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const applyPriceFilter = () => {
    updateFilters();
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedDate(null);
    setMinPrice('');
    setMaxPrice('');
    setSelectedLocation('');
    router.push('/events');
  };

  const dates = [
    { label: "Bugün", value: "today" },
    { label: "Bu Hafta", value: "this-week" },
    { label: "Bu Ay", value: "this-month" },
    { label: "Gelecek Ay", value: "next-month" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 border border-border rounded-md bg-card animate-pulse">
        <div className="h-6 bg-muted rounded-md w-1/2 mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 bg-muted rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 border border-border rounded-md bg-card">
      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">Kategoriler</h3>
        <div className="space-y-2">
          <button
            onClick={() => handleCategoryChange("")}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${!selectedCategory
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-accent"
              }`}
          >
            Tüm Kategoriler
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleCategoryChange(String(category._id))}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedCategory === String(category._id)
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent"
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">Tarih</h3>
        <div className="space-y-2">
          {dates.map((date) => (
            <button
              key={date.value}
              onClick={() => handleDateChange(date.value)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center ${selectedDate === date.value
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent"
                }`}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {date.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">Fiyat Aralığı</h3>
        <div className="px-3">
          <div className="flex items-center space-x-4">
            <div className="relative rounded-md shadow-sm flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-muted-foreground sm:text-sm">₺</span>
              </div>
              <input
                type="number"
                name="min"
                id="min"
                value={minPrice}
                onChange={(e) => handlePriceChange(e.target.value, maxPrice)}
                className="block w-full pl-7 pr-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Min"
              />
            </div>
            <span className="text-muted-foreground">-</span>
            <div className="relative rounded-md shadow-sm flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-muted-foreground sm:text-sm">₺</span>
              </div>
              <input
                type="number"
                name="max"
                id="max"
                value={maxPrice}
                onChange={(e) => handlePriceChange(minPrice, e.target.value)}
                className="block w-full pl-7 pr-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Max"
              />
            </div>
          </div>
          <Button
            onClick={applyPriceFilter}
            variant="secondary"
            className="w-full mt-3"
            disabled={!minPrice && !maxPrice}
          >
            Fiyat Filtrele
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">Konum</h3>
        <div className="px-3">
          <select
            id="location"
            name="location"
            value={selectedLocation}
            onChange={handleLocationChange}
            className="block w-full py-2 px-3 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
            aria-label="Konum seçin"
          >
            <option value="">Tüm Konumlar</option>
            {locations.length > 0 ? (
              locations.map((location, index) => (
                <option key={index} value={location}>
                  {location}
                </option>
              ))
            ) : (
              <option disabled>Konum bulunamadı</option>
            )}
          </select>
        </div>
      </div>

      <div className="pt-4">
        <Button
          onClick={clearFilters}
          variant="outline"
          className="w-full"
          disabled={!selectedCategory && !selectedDate && !minPrice && !maxPrice && !selectedLocation}
        >
          Filtreleri Temizle
        </Button>
      </div>
    </div>
  );
}

