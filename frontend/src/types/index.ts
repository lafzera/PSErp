export interface Client {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  address: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  type: ClientType;
  package: Package;
  packageId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientType {
  id: string;
  name: string;
  description?: string;
  products: Product[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Package {
  id: string;
  name: string;
  description?: string;
  price: number;
  products: Product[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  subGenre: ProductSubGenre;
  subGenreId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductSubGenre {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  clientId: string;
  date: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  type: 'WEDDING' | 'BIRTHDAY' | 'FAMILY' | 'PORTRAIT' | 'EVENT';
  notes?: string;
  photos: Photo[];
}

export interface Photo {
  id: string;
  url: string;
  filename: string;
  sessionId: string;
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  productId?: string;
  product?: Product;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quote {
  id: string;
  clientId: string;
  client: Client;
  title: string;
  description?: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  validUntil: string;
  items: QuoteItem[];
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'PHOTOGRAPHER' | 'ASSISTANT';
  createdAt: string;
  updatedAt: string;
}

// Módulo Financeiro
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  date: Date;
  clientId?: string;
  client?: Client;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionCategory {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  description?: string;
}

// Módulo de Estoque
export interface Equipment {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  category: 'CAMERA' | 'LENS' | 'LIGHTING' | 'SUPPORT' | 'ACCESSORY';
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'LOW_STOCK';
  quantity: number;
  minQuantity: number;
  location?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  supplier?: string;
  warranty?: {
    start: string;
    end: string;
  };
  maintenanceHistory?: MaintenanceRecord[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  date: string;
  type: 'PREVENTIVE' | 'CORRECTIVE';
  description: string;
  cost?: number;
  provider?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Módulo de Perfil
export interface Profile {
  id: string;
  userId: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  address?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    website?: string;
  };
  preferences?: {
    notifications: boolean;
    theme: 'light' | 'dark';
    language: 'pt-BR' | 'en-US';
  };
  createdAt: string;
  updatedAt: string;
} 