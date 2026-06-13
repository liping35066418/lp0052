export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
}

export interface PublicUser {
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

export interface StockLog {
  id: string;
  equipmentId: string;
  beforeStock: number;
  afterStock: number;
  changeReason: string;
  operatorId: string;
  createdAt: string;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
  username: string;
}
