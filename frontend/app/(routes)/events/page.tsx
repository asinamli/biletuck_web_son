"use client";

import { EventList } from "@/app/components/events/event-list";
import { EventFilters } from "@/app/components/events/event-filters";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

interface Category {
  _id: string;
  name: string;
}

export default function EventsPage() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category');
  const [categoryName, setCategoryName] = useState<string>("");

  useEffect(() => {
    const fetchCategoryName = async () => {
      if (categoryId) {
        try {
          const response = await axios.get(`http://localhost:5000/api/categories/${categoryId}`);
          if (response.data && response.data.data) {
            setCategoryName(response.data.data.name);
          }
        } catch (error) {
          console.error("Kategori bilgisi alınamadı:", error);
        }
      }
    };

    fetchCategoryName();
  }, [categoryId]);

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 flex-shrink-0">
            <EventFilters />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-foreground">
                {categoryName ? `${categoryName} Etkinlikleri` : 'Tüm Etkinlikler'}
              </h1>
            </div>
            <EventList />
          </div>
        </div>
      </div>
    </div>
  );
}