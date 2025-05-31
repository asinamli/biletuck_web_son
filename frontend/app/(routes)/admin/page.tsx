"use client"
import React from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BarChart3, Calendar, Building2, Inbox, CheckSquare } from "lucide-react"

function AdminPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Paneli</h1>
          <p className="text-muted-foreground mt-1">Uygulamanızı buradan yönetin</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Kullanıcı Yönetimi Kartı */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <Users className="h-6 w-6 text-blue-700" />
            </div>
            <CardTitle className="text-xl">Kullanıcı Yönetimi</CardTitle>
            <CardDescription>Kullanıcıları ve organizatörleri yönetin</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-gray-500">
            Kullanıcı hesaplarını görüntüleyin, düzenleyin ve yönetin. Rol atamaları yapın ve organizatör başvurularını onaylayın
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-2">
            <Button
              className="w-full flex items-center justify-start gap-2"
              onClick={() => router.push('/admin/users')}
              variant="outline"
            >
              <Users className="h-4 w-4" />
              Kullanıcılar
            </Button>
            <Button
              className="w-full flex items-center justify-start gap-2"
              onClick={() => router.push('/admin/organizers')}
              variant="outline"
            >
              <Building2 className="h-4 w-4" />
              Organizatörler
            </Button>
          </CardFooter>
        </Card>

        {/* Başvuru Yönetimi Kartı */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-2">
              <Inbox className="h-6 w-6 text-amber-700" />
            </div>
            <CardTitle className="text-xl">Başvuru Yönetimi</CardTitle>
            <CardDescription>Organizatör ve etkinlik başvurularını yönetin</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-gray-500">
            Organizatör başvurularını ve etkinlik başvurularını görüntüleyin, onaylayın veya reddedin.
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-2">
            <Button
              className="w-full flex items-center justify-start gap-2"
              onClick={() => router.push('/admin/organizer-requests')}
              variant="outline"
            >
              <CheckSquare className="h-4 w-4" />
              Organizatör Başvuruları
            </Button>
            <Button
              className="w-full flex items-center justify-start gap-2"
              onClick={() => router.push('/admin/event-requests')}
              variant="outline"
            >
              <Calendar className="h-4 w-4" />
              Etkinlik Başvuruları
            </Button>
          </CardFooter>
        </Card>

        {/* Etkinlik Yönetimi Kartı */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
              <Calendar className="h-6 w-6 text-green-700" />
            </div>
            <CardTitle className="text-xl">İçerik Yönetimi</CardTitle>
            <CardDescription>Etkinlikleri ve kategorileri yönetin</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-gray-500">
            Tüm etkinlikleri görüntüleyin, düzenleyin ve onaylayın. Kategori yönetimi ve öne çıkan etkinlikleri belirleyin.
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-2">
            <Button
              className="w-full flex items-center justify-start gap-2"
              onClick={() => router.push('/admin/events')}
              variant="outline"
            >
              <Calendar className="h-4 w-4" />
              Etkinlikler
            </Button>
            <Button
              className="w-full flex items-center justify-start gap-2"
              onClick={() => router.push('/admin/categories')}
              variant="outline"
            >
              <BarChart3 className="h-4 w-4" />
              Kategoriler
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default AdminPage
