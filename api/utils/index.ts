import { differenceInDays, parseISO } from 'date-fns';
import type { DamageCondition, Equipment, Order } from '../types/index.js';

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function generateOrderNo(): string {
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `SR${dateStr}${random}`;
}

export function calculateRentalDays(startDate: string, endDate: string): number {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const days = differenceInDays(end, start);
  return Math.max(1, days + 1);
}

export function calculateOverdueDays(endDate: string): number {
  const end = parseISO(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = differenceInDays(today, end);
  return Math.max(0, days);
}

export function calculateBaseRent(rentalDays: number, dailyRate: number): number {
  return rentalDays * dailyRate;
}

export function calculateOverdueFee(overdueDays: number, dailyRate: number): number {
  return overdueDays * dailyRate * 1.5;
}

export function calculateDamageFee(damageCondition: DamageCondition, deposit: number): number {
  switch (damageCondition) {
    case '完好':
      return 0;
    case '轻微损耗':
      return Math.round(deposit * 0.2);
    case '严重损坏':
      return Math.round(deposit * 0.8);
    case '丢失':
      return deposit;
    default:
      return 0;
  }
}

export function getAvailableStock(
  equipmentList: Equipment[],
  orderList: Order[],
  equipmentId: string,
  startDate: string,
  endDate: string
): number {
  const eq = equipmentList.find((e) => e.id === equipmentId);
  if (!eq) return 0;

  const start = parseISO(startDate);
  const end = parseISO(endDate);

  const conflictingOrders = orderList.filter((order) => {
    if (order.equipmentId !== equipmentId) return false;
    if (['cancelled', 'completed'].includes(order.status)) return false;

    const orderStart = parseISO(order.startDate);
    const orderEnd = order.returnDate ? parseISO(order.returnDate) : parseISO(order.endDate);

    return !(end < orderStart || start > orderEnd);
  });

  const rentedCount = conflictingOrders.length;
  return Math.max(0, eq.stock - rentedCount);
}

export function toPublicUser(user: { id: string; username: string; email: string; role: string; createdAt: string }) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}
