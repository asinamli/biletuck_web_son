export type User = {
  _id: string; // MongoDB ObjectId string
  username: string;
  email: string;
  role: "user" | "organizer" | "admin";
  provider?: string;
  blocked?: boolean;
  confirmed?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // publishedAt ve documentId genellikle MongoDB'de kullanılmaz, kaldırıldı
  firstName?: string;
  lastName?: string;
  avatar?: string;
  tickets?: Ticket[];
  organizer?: Organizer;
  description?: string;
};

export type Organizer = {
  id: string; // MongoDB ObjectId string
  companyName: string;
  taxNumber: string;
  description: string;
  logo?: string; // Sadece url string
  approved: boolean;
  user: User;
  events?: Event[];
};

export type Event = {
  id: string; // MongoDB ObjectId string
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  availableTickets: number;
  image?: string;
  category: Category;
  organizerId: User;
  isApproved: boolean;
  createdAt?: string;
  tickets?: Ticket[];
};

export type Category = {
  id: string; // MongoDB ObjectId string
  name: string;
  description?: string;
  image?: string;
  createdAt?: string;
};

export type Ticket = {
  id: string; // MongoDB ObjectId string
  userId: User;
  eventId: Event;
  purchaseDate: string;
  price: number;
  isPaid: boolean;
  qrCode?: string;
  isUsed: boolean;
  status: "pending" | "confirmed" | "cancelled";
};

export type Payment = {
  id: string; // MongoDB ObjectId string
  paymentCode: string;
  amount: number;
  paymentMethod: "credit_card" | "paypal" | "bank_transfer";
  status: "pending" | "completed" | "failed";
  transactionId: string;
  user: User;
  tickets: Ticket[];
};
