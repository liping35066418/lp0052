import axios from 'axios';
import type {
  User,
  Category,
  Equipment,
  Order,
  DashboardStats,
  DamageCondition,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: (data: LoginData) => api.post<AuthResponse>('/auth/login', data).then((r) => r.data),
  register: (data: RegisterData) => api.post<AuthResponse>('/auth/register', data).then((r) => r.data),
  me: () => api.get<{ user: User }>('/auth/me').then((r) => r.data.user),
};

export const equipmentApi = {
  getCategories: () => api.get<Category[]>('/equipment/categories').then((r) => r.data),
  getList: (params?: { categoryId?: string; keyword?: string; startDate?: string; endDate?: string }) =>
    api.get<Equipment[]>('/equipment', { params }).then((r) => r.data),
  getDetail: (id: string) => api.get<Equipment>(`/equipment/${id}`).then((r) => r.data),
  create: (data: Partial<Equipment>) => api.post<Equipment>('/equipment', data).then((r) => r.data),
  update: (id: string, data: Partial<Equipment>) =>
    api.put<Equipment>(`/equipment/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/equipment/${id}`).then((r) => r.data),
  adjustStock: (id: string, data: { afterStock: number; changeReason: string }) =>
    api.post(`/equipment/${id}/stock`, data).then((r) => r.data),
};

export const orderApi = {
  getList: (params?: { status?: string; mineOnly?: boolean }) =>
    api.get<Order[]>('/orders', { params }).then((r) => r.data),
  getDetail: (id: string) => api.get<Order>(`/orders/${id}`).then((r) => r.data),
  create: (data: { equipmentId: string; startDate: string; endDate: string }) =>
    api.post<Order>('/orders', data).then((r) => r.data),
  returnOrder: (id: string, data: { damageCondition: DamageCondition; damageNote?: string }) =>
    api.post<Order>(`/orders/${id}/return`, data).then((r) => r.data),
  export: () =>
    api.get('/orders/export', { responseType: 'blob' }).then((r) => {
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }),
};

export const dashboardApi = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats').then((r) => r.data),
};

export default api;
