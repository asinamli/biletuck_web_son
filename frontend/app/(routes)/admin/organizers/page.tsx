"use client"
import React, { useEffect, useState } from 'react'
import { getOrganizers } from '@/app/actions/userRoleList'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, ChevronDown, MoreHorizontal, UserPlus, CalendarRange, Mail, Phone, Building, MapPin, CheckCircle, XCircle } from 'lucide-react'

// Organizatör tipi tanımı
type Organizer = {
  _id: string
  username: string
  email: string
  role: string
  firstName?: string
  lastName?: string
  avatar?: string
  profileImage?: string
  createdAt: string
}

function OrganizerPage() {
  // State'ler
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [filteredOrganizers, setFilteredOrganizers] = useState<Organizer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedOrganizer, setSelectedOrganizer] = useState<Organizer | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Organizatörleri getir
  useEffect(() => {
    const fetchOrganizers = async () => {
      setIsLoading(true);
      try {
        const organizersData = await getOrganizers();
        setOrganizers(organizersData);
        setFilteredOrganizers(organizersData);
      } catch (error) {
        console.error("Organizatörler getirilirken hata oluştu:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrganizers();
  }, []);

  // Arama ve filtreleme
  useEffect(() => {
    let result = [...organizers];
    
    // Metne göre filtrele
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(org => 
        org.username?.toLowerCase().includes(query) || 
        org.email?.toLowerCase().includes(query) ||
        org.firstName?.toLowerCase().includes(query) ||
        org.lastName?.toLowerCase().includes(query)
      );
    }
    
    // Tab'a göre filtrele (örnek - gerçek filtreleme mantığı uygulanabilir)
    if (activeTab === "new") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      result = result.filter(org => 
        new Date(org.createdAt) > oneWeekAgo
      );
    }
    // Diğer tab filtrelemeler eklenebilir
    
    setFilteredOrganizers(result);
  }, [searchQuery, activeTab, organizers]);

  // Organizatör detaylarını göster
  const handleShowDetails = (organizer: Organizer) => {
    setSelectedOrganizer(organizer);
    setShowDetailsDialog(true);
  };

  // Organizatör adını formatla
  const formatName = (organizer: Organizer) => {
    if (organizer.firstName && organizer.lastName) {
      return `${organizer.firstName} ${organizer.lastName}`;
    }
    return organizer.username;
  };

  // Avatar fallback için baş harflerini al
  const getInitials = (organizer: Organizer) => {
    if (organizer.firstName && organizer.lastName) {
      return `${organizer.firstName.charAt(0)}${organizer.lastName.charAt(0)}`;
    }
    return organizer.username.charAt(0).toUpperCase();
  };

  // Organizatör kayıt tarihini formatla
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Başlık ve Arama Bölümü */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizatörler</h1>
          <p className="text-muted-foreground mt-1">
            Sistemdeki organizatörleri görüntüleyin ve yönetin.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Organizatör ara..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Yeni Ekle
          </Button>
        </div>
      </div>

      <Separator />

      {/* Filtreler */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">Tüm Organizatörler</TabsTrigger>
            <TabsTrigger value="new">Yeni Eklenenler</TabsTrigger>
            <TabsTrigger value="active">Aktif</TabsTrigger>
          </TabsList>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Sırala
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>İsme Göre (A-Z)</DropdownMenuItem>
              <DropdownMenuItem>İsme Göre (Z-A)</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Eskiden Yeniye</DropdownMenuItem>
              <DropdownMenuItem>Yeniden Eskiye</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Tabs>

      {/* Yükleniyor Göstergesi */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-10 w-10 rounded-full border-4 border-muted-foreground/20 border-t-primary animate-spin" />
          <p className="mt-2 text-sm text-muted-foreground">Organizatörler yükleniyor...</p>
        </div>
      ) : filteredOrganizers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Organizatör bulunamadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrganizers.map((organizer) => (
            <Card key={organizer._id} className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      {organizer.profileImage || organizer.avatar ? (
                        <AvatarImage src={organizer.profileImage || organizer.avatar} alt={organizer.username} />
                      ) : (
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(organizer)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{formatName(organizer)}</CardTitle>
                      <CardDescription className="mt-1 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {organizer.email}
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleShowDetails(organizer)}>Detaylar</DropdownMenuItem>
                      <DropdownMenuItem>Düzenle</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Kaldır</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <CalendarRange className="h-3.5 w-3.5 mr-1" />
                      Kayıt Tarihi
                    </span>
                    <span className="font-medium">
                      {organizer.createdAt ? formatDate(organizer.createdAt) : 'Bilinmiyor'}
                    </span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-2">
                <div className="flex justify-between items-center w-full">
                  <Badge variant="outline" className="bg-primary/10">Organizatör</Badge>
                  <Button variant="outline" size="sm" onClick={() => handleShowDetails(organizer)}>
                    Detayları Gör
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Organizatör Detayları Dialog */}
      {selectedOrganizer && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Organizatör Detayları</DialogTitle>
              <DialogDescription>
                Organizatör bilgileri ve istatistikleri
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {selectedOrganizer.profileImage || selectedOrganizer.avatar ? (
                    <AvatarImage src={selectedOrganizer.profileImage || selectedOrganizer.avatar} alt={selectedOrganizer.username} />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {getInitials(selectedOrganizer)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{formatName(selectedOrganizer)}</h3>
                  <p className="text-muted-foreground">{selectedOrganizer.email}</p>
                  <div className="mt-1">
                    <Badge variant="outline" className="bg-primary/10">Organizatör</Badge>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-start gap-2">
                  <CalendarRange className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Kayıt Tarihi</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrganizer.createdAt ? formatDate(selectedOrganizer.createdAt) : 'Bilinmiyor'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Kullanıcı Adı</p>
                    <p className="text-sm text-muted-foreground">
                      @{selectedOrganizer.username}
                    </p>
                  </div>
                </div>

                {/* Buraya daha fazla bilgi eklenebilir */}
              </div>
            </div>
            
            <DialogFooter className="flex justify-between sm:justify-between">
              <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                Kapat
              </Button>
              <div className="flex gap-2">
                <Button variant="outline">Düzenle</Button>
                <Button variant="destructive">Kaldır</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default OrganizerPage;
