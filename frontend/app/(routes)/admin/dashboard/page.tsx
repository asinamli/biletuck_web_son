"use client";

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Plus, Trash2, Clock } from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface EventFormData {
  title: string;
  description: string;
  date: Date | undefined;
  location: string;
  imageLinks: string[];
  price: string;
  capacity: string;
  category: string;
}

const AdminDashboard = () => {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: undefined,
    location: '',
    imageLinks: [''],
    price: '',
    capacity: '',
    category: ''
  });
  const [time, setTime] = useState<string>('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addImageLink = () => {
    setFormData(prev => ({
      ...prev,
      imageLinks: [...prev.imageLinks, '']
    }));
  }

  const removeImageLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imageLinks: prev.imageLinks.filter((_, i) => i !== index)
    }));
  }

  const handleImageLinkChange = (index: number, value: string) => {
    const newLinks = [...formData.imageLinks];
    newLinks[index] = value;
    setFormData(prev => ({
      ...prev,
      imageLinks: newLinks
    }));
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const currentDate = formData.date || new Date();
      selectedDate.setHours(currentDate.getHours());
      selectedDate.setMinutes(currentDate.getMinutes());
      setFormData(prev => ({
        ...prev,
        date: selectedDate
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        date: undefined
      }));
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);

    if (formData.date) {
      const [hours, minutes] = newTime.split(':');
      const newDate = new Date(formData.date);
      newDate.setHours(parseInt(hours), parseInt(minutes));
      setFormData(prev => ({
        ...prev,
        date: newDate
      }));
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Etkinlik Verileri:', formData);
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Yeni Etkinlik Ekle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit}>
            {/* Başlık */}
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium">Etkinlik Başlığı</label>
              <Input
                name="title"
                placeholder="Etkinlik başlığını giriniz"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Açıklama */}
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium">Etkinlik Açıklaması</label>
              <Textarea
                name="description"
                placeholder="Etkinlik açıklamasını giriniz"
                className="min-h-[120px]"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Tarih ve Saat */}
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium">Etkinlik Tarihi ve Saati</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                      
                      </Button>
                    </PopoverTrigger>
                   
                  </Popover>
                </div>

                <div className="relative">
                  <Input
                    type="time"
                    value={time}
                    onChange={handleTimeChange}
                    className="w-full"
                    step="300"
                    required
                  />
                  <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>

            {/* Lokasyon */}
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium">Etkinlik Lokasyonu</label>
              <Input
                name="location"
                placeholder="Etkinlik lokasyonunu giriniz"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Resim Linkleri */}
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium">Etkinlik Görselleri</label>
              <div className="space-y-3">
                {formData.imageLinks.map((link, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Görsel linkini giriniz"
                      value={link}
                      onChange={(e) => handleImageLinkChange(index, e.target.value)}
                      required={index === 0}
                    />
                    {formData.imageLinks.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeImageLink(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={addImageLink}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Görsel Ekle
                </Button>
              </div>
            </div>

            {/* Fiyat */}
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium">Etkinlik Fiyatı</label>
              <Input
                type="number"
                name="price"
                placeholder="Fiyat giriniz"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
              />
            </div>

            {/* Kapasite */}
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium">Etkinlik Kapasitesi</label>
              <Input
                type="number"
                name="capacity"
                placeholder="Kapasite giriniz"
                value={formData.capacity}
                onChange={handleInputChange}
                required
                min="1"
              />
            </div>

            {/* Kategori Seçimi */}
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium">Etkinlik Kategorisi</label>
              <select
                name="category"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Kategori seçiniz</option>
                {/* Kategoriler veritabanından gelecek */}
                <option value="konser">Konser</option>
                <option value="tiyatro">Tiyatro</option>
                <option value="festival">Festival</option>
                <option value="workshop">Workshop</option>
                <option value="seminer">Seminer</option>
              </select>
            </div>

            {/* Kaydet Butonu */}
            <Button type="submit" className="w-full">
              Etkinlik Oluştur
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminDashboard
