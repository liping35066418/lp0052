export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export type EquipmentCondition = '全新' | '9成新' | '8成新' | '7成新' | '较旧';
export type EquipmentStatus = '在库' | '已出租' | '维修中' | '已报损';

export interface Equipment {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  condition: EquipmentCondition;
  stock: number;
  availableStock?: number;
  borrowedCount?: number;
  dailyRate: number;
  deposit: number;
  status: EquipmentStatus;
  imageUrl: string;
  createdAt: string;
}

export type OrderStatus = 'pending' | 'renting' | 'returned' | 'overdue' | 'completed' | 'cancelled';
export type DamageCondition = '完好' | '轻微损耗' | '严重损坏' | '丢失';

export interface Order {
  id: string;
  orderNo: string;
  userId: string;
  equipmentId: string;
  equipmentName: string;
  startDate: string;
  endDate: string;
  returnDate?: string;
  rentalDays: number;
  overdueDays: number;
  baseRent: number;
  overdueFee: number;
  deposit: number;
  damageFee: number;
  totalAmount: number;
  refundAmount: number;
  status: OrderStatus;
  damageCondition?: DamageCondition;
  damageNote?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalEquipment: number;
  totalStock: number;
  totalOrders: number;
  activeOrders: number;
  overdueOrders: number;
  totalRevenue: number;
  topEquipment: Array<{
    id: string;
    name: string;
    stock: number;
    dailyRate: number;
    orderCount: number;
  }>;
  equipmentStockStatus: Array<{
    id: string;
    name: string;
    totalStock: number;
    borrowedCount: number;
    availableStock: number;
  }>;
}

export const orderStatusMap: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: '待支付', color: 'bg-yellow-100 text-yellow-800' },
  renting: { label: '租赁中', color: 'bg-blue-100 text-blue-800' },
  returned: { label: '已归还', color: 'bg-gray-100 text-gray-800' },
  overdue: { label: '已逾期', color: 'bg-red-100 text-red-800' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-800' },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-500' },
};
