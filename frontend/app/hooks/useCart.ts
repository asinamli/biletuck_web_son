import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-hot-toast";
import useAuthStore from "./useAuth";

export interface CartItem {
  id: string;
  eventId: string;
  eventTitle: string;
  eventImage: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  ticketType: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getServiceFee: () => number;
  getTotalWithFee: () => number;
  isInCart: (eventId: string) => boolean;
  getItemsCount: () => number;
}

// Kullanıcıya özel sepet storage anahtarı oluşturma fonksiyonu
const getCartStorageName = (): string => {
  // İstemci tarafında mı kontrol et
  if (typeof window === 'undefined') {
    return "cart-storage";
  }

  // Auth store'dan kullanıcı bilgisini al
  const authState = useAuthStore.getState();
  const user = authState.user;
  
  // Kullanıcı giriş yapmışsa userId'ye göre, yapmamışsa "guest" olarak sepet oluştur
  return user && user._id ? `cart-storage-${user._id}` : "cart-storage-guest";
};

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item: CartItem) => {
        const { items } = get();
        const existingItem = items.find(i => i.eventId === item.eventId);
        
        if (existingItem) {
          // Eğer etkinlik zaten sepette varsa, uyarı göster ve ekleme yapma
          toast.error("Bu etkinlik için zaten bir bilet aldınız!");
          return;
        } else {
          // Etkinlik sepette yoksa ekle
          set({ items: [...items, { ...item, quantity: item.quantity }] });
        }
      },
      
      removeItem: (id: string) => {
        const { items } = get();
        set({ items: items.filter(item => item.id !== id) });
      },
      
      updateQuantity: (id: string, quantity: number) => {
        const { items } = get();
        set({
          items: items.map(item =>
            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
          )
        });
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      getServiceFee: () => {
        return Math.round(get().getTotal() * 0.05); // %5 hizmet bedeli
      },
      
      getTotalWithFee: () => {
        return get().getTotal() + get().getServiceFee();
      },
      
      isInCart: (eventId: string) => {
        const { items } = get();
        return items.some(item => item.eventId === eventId);
      },
      
      getItemsCount: () => {
        const { items } = get();
        return items.length;
      }    }),
    {
      name: getCartStorageName(),
      storage: {
        getItem: (name: string) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          return JSON.parse(str);
        },
        setItem: (name: string, value: any) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name: string) => {
          localStorage.removeItem(name);
        },
      },
      onRehydrateStorage: () => {
        // Auth store'daki değişiklikleri dinle ve kullanıcı değiştiğinde sepeti temizle
        useAuthStore.subscribe((state, prevState) => {
          if (state.user?._id !== prevState.user?._id) {
            useCartStore.getState().clearCart();
          }
        });
        return (state) => {
          // Rehydrate işlemi tamamlandıktan sonra çalışacak
          console.log('Cart rehydrated:', state);
        };
      }
    }
  )
);

export default useCartStore;