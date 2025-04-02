import axios from 'axios';
import { Transaction, Equipment, MaintenanceRecord, Profile, Client, ClientType, Package, Product } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.168.114:3001';
console.log('Configurando API com URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000,
  timeoutErrorMessage: 'Tempo de resposta excedido. Por favor, tente novamente.',
  withCredentials: true
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const requestInfo = {
      url: `${config.baseURL}${config.url}`,
      method: config.method,
      headers: config.headers,
      data: config.data
    };
    console.log('Enviando requisição:', requestInfo);
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error('Erro no interceptor de requisição:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('Resposta recebida:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    const errorInfo = {
      message: error.message,
      code: error.code,
      timeout: error.timeout,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        timeout: error.config?.timeout
      },
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : null
    };
    console.error('Erro na requisição:', errorInfo);
    return Promise.reject(error);
  }
);

// Tipos para as respostas da API
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER' | 'PHOTOGRAPHER';
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

export interface Quote {
  id: string;
  clientId: string;
  client: Client;
  title: string;
  description?: string;
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  validUntil: string;
  items: QuoteItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Funções de autenticação
export const auth = {
  async register(data: { name: string; email: string; password: string }) {
    try {
      console.log('Tentando registrar usuário:', { email: data.email });
      const response = await api.post('/api/auth/register', data);
      console.log('Resposta do registro:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Erro no registro:', error.response?.data || error.message);
      throw error;
    }
  },

  async login(data: { email: string; password: string }) {
    try {
      console.log('Tentando fazer login:', { email: data.email });
      console.log('URL da API:', api.defaults.baseURL);
      const response = await api.post('/api/auth/login', data);
      console.log('Resposta do login:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Erro no login:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        throw new Error('Email ou senha inválidos');
      }
      if (error.response?.status === 0) {
        throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
      }
      throw error;
    }
  }
};

// Funções para gerenciar clientes
export const clients = {
  async list() {
    const response = await api.get<Client[]>('/clients');
    return response.data;
  },

  async get(id: string) {
    const response = await api.get<Client>(`/clients/${id}`);
    return response.data;
  },

  async create(data: Omit<Client, 'id' | 'sessions'>) {
    const response = await api.post<Client>('/clients', data);
    return response.data;
  },

  async update(id: string, data: Partial<Omit<Client, 'id' | 'sessions'>>) {
    const response = await api.put<Client>(`/clients/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    await api.delete(`/clients/${id}`);
  }
};

// Funções para gerenciar sessões
export const sessions = {
  async list() {
    const response = await api.get<Session[]>('/sessions');
    return response.data;
  },

  async get(id: string) {
    const response = await api.get<Session>(`/sessions/${id}`);
    return response.data;
  },

  async create(data: Omit<Session, 'id' | 'photos'>) {
    const response = await api.post<Session>('/sessions', data);
    return response.data;
  },

  async update(id: string, data: Partial<Omit<Session, 'id' | 'photos'>>) {
    const response = await api.put<Session>(`/sessions/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    await api.delete(`/sessions/${id}`);
  },

  async updateStatus(id: string, status: Session['status']) {
    const response = await api.patch<Session>(`/sessions/${id}/status`, { status });
    return response.data;
  }
};

// Funções para gerenciar fotos
export const photos = {
  async list(sessionId: string) {
    const response = await api.get<Photo[]>(`/sessions/${sessionId}/photos`);
    return response.data;
  },

  async upload(sessionId: string, files: File[]) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('photos', file);
    });

    const response = await api.post<Photo[]>(
      `/sessions/${sessionId}/photos`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  },

  async delete(sessionId: string, photoId: string) {
    await api.delete(`/sessions/${sessionId}/photos/${photoId}`);
  },

  getDownloadUrl(sessionId: string, photoId: string) {
    return `${api.defaults.baseURL}/sessions/${sessionId}/photos/${photoId}/download`;
  }
};

// Funções para gerenciar orçamentos
export const quotes = {
  async list() {
    const response = await api.get<Quote[]>('/quotes');
    return response.data;
  },

  async get(id: string) {
    const response = await api.get<Quote>(`/quotes/${id}`);
    return response.data;
  },

  async create(data: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await api.post('/quotes', data);
    return response.data;
  },

  async update(id: string, data: Partial<Quote>) {
    const response = await api.put(`/quotes/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    await api.delete(`/quotes/${id}`);
  },

  async updateStatus(id: string, status: Quote['status']) {
    const response = await api.patch(`/quotes/${id}/status`, { status });
    return response.data;
  },

  async sendByEmail(id: string) {
    const response = await api.post(`/quotes/${id}/send`);
    return response.data;
  },

  addItem: (quoteId: string, data: Omit<QuoteItem, 'id' | 'quoteId' | 'createdAt' | 'updatedAt'>) =>
    api.post<QuoteItem>(`/quotes/${quoteId}/items`, data),

  updateItem: (quoteId: string, itemId: string, data: Partial<QuoteItem>) =>
    api.put<QuoteItem>(`/quotes/${quoteId}/items/${itemId}`, data),

  deleteItem: (quoteId: string, itemId: string) =>
    api.delete(`/quotes/${quoteId}/items/${itemId}`)
};

// Funções de usuário
export const users = {
  async create(data: { name: string; email: string; password: string; role: string }) {
    try {
      const response = await api.post('/users', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.errors) {
        // Erro de validação do Zod
        const messages = error.response.data.errors.map((err: any) => err.message);
        throw new Error(messages.join(', '));
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Erro ao criar usuário');
    }
  },

  async update(id: string, data: { name: string; email: string; role: string }) {
    try {
      const response = await api.put(`/users/${id}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.errors) {
        // Erro de validação do Zod
        const messages = error.response.data.errors.map((err: any) => err.message);
        throw new Error(messages.join(', '));
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Erro ao atualizar usuário');
    }
  },

  async delete(id: string) {
    try {
      await api.delete(`/users/${id}`);
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Erro ao excluir usuário');
    }
  },

  async list() {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Erro ao listar usuários');
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get<User>('/api/users/profile');
      return response.data;
    } catch (error: any) {
      console.error('Erro ao obter usuário atual:', error.response?.data || error.message);
      throw new Error('Erro ao obter usuário atual');
    }
  },

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    try {
      const response = await api.put('/users/change-password', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const messages = error.response.data.errors.map((err: any) => err.message);
        throw new Error(messages.join(', '));
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Erro ao alterar senha');
    }
  },

  async resetPassword(email: string) {
    try {
      const response = await api.post('/auth/reset-password', { email });
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Erro ao solicitar redefinição de senha');
    }
  },

  async confirmResetPassword(data: { token: string; newPassword: string }) {
    try {
      const response = await api.post('/auth/reset-password/confirm', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Erro ao redefinir senha');
    }
  }
};

// Serviços do módulo financeiro
export const financial = {
  async listTransactions() {
    const response = await api.get<Transaction[]>('/transactions');
    return response.data;
  },

  async getTransaction(id: string) {
    const response = await api.get<Transaction>(`/transactions/${id}`);
    return response.data;
  },

  async createTransaction(data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await api.post<Transaction>('/transactions', data);
    return response.data;
  },

  async updateTransaction(id: string, data: Partial<Transaction>) {
    const response = await api.put<Transaction>(`/transactions/${id}`, data);
    return response.data;
  },

  async deleteTransaction(id: string) {
    await api.delete(`/transactions/${id}`);
  },

  async getTransactionStats() {
    const response = await api.get('/transactions/stats');
    return response.data;
  }
};

// Serviços do módulo de estoque
export const inventory = {
  async listEquipments() {
    const response = await api.get<Equipment[]>('/equipments');
    return response.data;
  },

  async getEquipment(id: string) {
    const response = await api.get<Equipment>(`/equipments/${id}`);
    return response.data;
  },

  async createEquipment(data: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await api.post<Equipment>('/equipments', data);
    return response.data;
  },

  async updateEquipment(id: string, data: Partial<Equipment>) {
    const response = await api.put<Equipment>(`/equipments/${id}`, data);
    return response.data;
  },

  async deleteEquipment(id: string) {
    await api.delete(`/equipments/${id}`);
  },

  async createMaintenanceRecord(data: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await api.post<MaintenanceRecord>('/maintenance', data);
    return response.data;
  },

  async updateMaintenanceRecord(id: string, data: Partial<MaintenanceRecord>) {
    const response = await api.put<MaintenanceRecord>(`/maintenance/${id}`, data);
    return response.data;
  },

  async deleteMaintenanceRecord(id: string) {
    await api.delete(`/maintenance/${id}`);
  },

  async getInventoryStats() {
    const response = await api.get('/equipments/stats');
    return response.data;
  }
};

// Serviços do módulo de perfil
export const profile = {
  async getProfile() {
    const response = await api.get<Profile>('/profile');
    return response.data;
  },

  async updateProfile(data: Partial<Omit<Profile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) {
    const response = await api.put<Profile>('/profile', data);
    return response.data;
  },

  async updateAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.put<Profile>(
      '/profile/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  },

  async updatePreferences(preferences: Profile['preferences']) {
    const response = await api.put<Profile>('/profile/preferences', preferences);
    return response.data;
  }
};

export const clientTypes = {
  list: () => api.get<ClientType[]>('/client-types'),
  create: (data: Omit<ClientType, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<ClientType>('/client-types', data),
  update: (id: string, data: Partial<ClientType>) =>
    api.put<ClientType>(`/client-types/${id}`, data),
  delete: (id: string) => api.delete(`/client-types/${id}`),
};

export const packages = {
  list: () => api.get<Package[]>('/packages'),
  create: (data: Omit<Package, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<Package>('/packages', data),
  update: (id: string, data: Partial<Package>) =>
    api.put<Package>(`/packages/${id}`, data),
  delete: (id: string) => api.delete(`/packages/${id}`),
};

export const transactions = {
  list: () => api.get<Transaction[]>('/transactions'),
  create: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<Transaction>('/transactions', data),
  update: (id: string, data: Partial<Transaction>) =>
    api.put<Transaction>(`/transactions/${id}`, data),
  delete: (id: string) => api.delete(`/transactions/${id}`),
};

export const products = {
  list: () => api.get<Product[]>('/products'),
  create: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<Product>('/products', data),
  update: (id: string, data: Partial<Product>) =>
    api.put<Product>(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

export const system = {
  listConfigs: async (): Promise<ApiResponse<SystemConfig[]>> => {
    const response = await api.get('/system/configs');
    return response.data;
  },
  getConfig: async (key: string): Promise<ApiResponse<SystemConfig>> => {
    const response = await api.get(`/system/configs/${key}`);
    return response.data;
  },
  createConfig: async (data: Omit<SystemConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<SystemConfig>> => {
    const response = await api.post('/system/configs', data);
    return response.data;
  },
  updateConfig: async (key: string, data: Omit<SystemConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<SystemConfig>> => {
    const response = await api.put(`/system/configs/${key}`, data);
    return response.data;
  },
  deleteConfig: async (key: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/system/configs/${key}`);
    return response.data;
  },
};

export { api }; 