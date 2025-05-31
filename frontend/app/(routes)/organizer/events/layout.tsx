"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Etkinlik Yönetimi</h1>
        <p className="text-muted-foreground">
          Etkinliklerinizi yönetin, yeni etkinlik oluşturun ve başvurularınızı takip edin
        </p>
      </div>

      <Tabs defaultValue="list" className="mb-8">
        <TabsList className="grid grid-cols-3 w-[400px]">
          <TabsTrigger value="list" asChild>
            <Link href="/organizer/events">Etkinliklerim</Link>
          </TabsTrigger>
          <TabsTrigger value="create" asChild>
            <Link href="/organizer/events/create">Etkinlik Oluştur</Link>
          </TabsTrigger>
          <TabsTrigger value="requests" asChild>
            <Link href="/organizer/events/requests">Başvurularım</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {children}
    </div>
  );
}