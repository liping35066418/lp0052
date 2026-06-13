import type { Request, Response } from 'express';
import { orders, equipment } from '../data/store.js';
import type { DamageCondition, Order } from '../types/index.js';
import {
  calculateBaseRent,
  calculateDamageFee,
  calculateOverdueDays,
  calculateOverdueFee,
  calculateRentalDays,
  generateId,
  generateOrderNo,
  getAvailableStock,
} from '../utils/index.js';
import { getCurrentUser } from '../middleware/auth.js';
import { parseISO, format } from 'date-fns';

function syncOrderStatus(order: Order): Order {
  if (order.status === 'renting' || order.status === 'overdue') {
    const overdueDays = calculateOverdueDays(order.endDate);
    if (overdueDays > 0) {
      order.status = 'overdue';
      order.overdueDays = overdueDays;
      order.overdueFee = calculateOverdueFee(overdueDays, order.baseRent / order.rentalDays);
      order.totalAmount = order.baseRent + order.overdueFee + order.deposit;
    }
  }
  return order;
}

export function getOrderList(req: Request, res: Response) {
  const currentUser = getCurrentUser(req);
  if (!currentUser) {
    res.status(401).json({ error: '未登录' });
    return;
  }

  const { status } = req.query as { status?: string };
  let result = orders.map(syncOrderStatus);

  if (currentUser.role === 'user') {
    result = result.filter((o) => o.userId === currentUser.userId);
  }

  if (status) {
    result = result.filter((o) => o.status === status);
  }

  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(result);
}

export function getOrderDetail(req: Request, res: Response) {
  const currentUser = getCurrentUser(req);
  if (!currentUser) {
    res.status(401).json({ error: '未登录' });
    return;
  }

  const { id } = req.params;
  const order = orders.find((o) => o.id === id);
  if (!order) {
    res.status(404).json({ error: '订单不存在' });
    return;
  }

  if (currentUser.role === 'user' && order.userId !== currentUser.userId) {
    res.status(403).json({ error: '无权查看此订单' });
    return;
  }

  res.json(syncOrderStatus(order));
}

export function createOrder(req: Request, res: Response) {
  const currentUser = getCurrentUser(req);
  if (!currentUser) {
    res.status(401).json({ error: '未登录' });
    return;
  }

  const { equipmentId, startDate, endDate } = req.body as {
    equipmentId: string;
    startDate: string;
    endDate: string;
  };

  if (!equipmentId || !startDate || !endDate) {
    res.status(400).json({ error: '请选择器材和租期' });
    return;
  }

  const eq = equipment.find((e) => e.id === equipmentId);
  if (!eq) {
    res.status(404).json({ error: '器材不存在' });
    return;
  }

  if (parseISO(startDate) > parseISO(endDate)) {
    res.status(400).json({ error: '结束日期不能早于开始日期' });
    return;
  }

  const availableStock = getAvailableStock(equipment, orders, equipmentId, startDate, endDate);
  if (availableStock <= 0) {
    res.status(400).json({ error: '所选时段库存不足' });
    return;
  }

  const rentalDays = calculateRentalDays(startDate, endDate);
  const baseRent = calculateBaseRent(rentalDays, eq.dailyRate);

  const order: Order = {
    id: generateId('order'),
    orderNo: generateOrderNo(),
    userId: currentUser.userId,
    equipmentId,
    equipmentName: eq.name,
    startDate,
    endDate,
    rentalDays,
    overdueDays: 0,
    baseRent,
    overdueFee: 0,
    deposit: eq.deposit,
    damageFee: 0,
    totalAmount: baseRent + eq.deposit,
    refundAmount: 0,
    status: 'renting',
    createdAt: new Date().toISOString(),
  };

  orders.push(order);
  res.status(201).json(order);
}

export function returnOrder(req: Request, res: Response) {
  const currentUser = getCurrentUser(req);
  if (!currentUser) {
    res.status(401).json({ error: '未登录' });
    return;
  }

  const { id } = req.params;
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) {
    res.status(404).json({ error: '订单不存在' });
    return;
  }

  const order = orders[idx];
  if (currentUser.role === 'user' && order.userId !== currentUser.userId) {
    res.status(403).json({ error: '无权操作此订单' });
    return;
  }

  if (!['renting', 'overdue'].includes(order.status)) {
    res.status(400).json({ error: '当前订单状态不可归还' });
    return;
  }

  const { damageCondition, damageNote } = req.body as {
    damageCondition: DamageCondition;
    damageNote?: string;
  };

  if (!damageCondition) {
    res.status(400).json({ error: '请选择器材状态' });
    return;
  }

  syncOrderStatus(order);

  const today = format(new Date(), 'yyyy-MM-dd');
  const damageFee = calculateDamageFee(damageCondition, order.deposit);

  orders[idx] = {
    ...order,
    returnDate: today,
    damageCondition,
    damageNote,
    damageFee,
    refundAmount: Math.max(0, order.deposit - damageFee),
    status: 'completed',
  };

  res.json(orders[idx]);
}

export function exportOrders(req: Request, res: Response) {
  const currentUser = getCurrentUser(req);
  if (!currentUser || currentUser.role !== 'admin') {
    res.status(403).json({ error: '权限不足' });
    return;
  }

  const syncedOrders = orders.map(syncOrderStatus);
  const headers = [
    '订单号',
    '用户ID',
    '器材名称',
    '开始日期',
    '结束日期',
    '归还日期',
    '租用天数',
    '逾期天数',
    '基础租金',
    '逾期费',
    '押金',
    '损坏赔偿',
    '总金额',
    '退还押金',
    '状态',
    '损坏情况',
    '备注',
    '创建时间',
  ];

  const statusMap: Record<string, string> = {
    pending: '待支付',
    renting: '租赁中',
    returned: '已归还',
    overdue: '已逾期',
    completed: '已完成',
    cancelled: '已取消',
  };

  const rows = syncedOrders.map((o) => [
    o.orderNo,
    o.userId,
    o.equipmentName,
    o.startDate,
    o.endDate,
    o.returnDate || '',
    o.rentalDays,
    o.overdueDays,
    o.baseRent,
    o.overdueFee,
    o.deposit,
    o.damageFee,
    o.totalAmount,
    o.refundAmount,
    statusMap[o.status] || o.status,
    o.damageCondition || '',
    (o.damageNote || '').replace(/,/g, '，'),
    o.createdAt,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const bom = '\uFEFF';

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="orders_${Date.now()}.csv"`);
  res.send(bom + csv);
}

export function getDashboardStats(_req: Request, res: Response) {
  const syncedOrders = orders.map(syncOrderStatus);
  const totalEquipment = equipment.length;
  const totalStock = equipment.reduce((sum, e) => sum + e.stock, 0);
  const totalOrders = syncedOrders.length;
  const activeOrders = syncedOrders.filter((o) => ['renting', 'overdue'].includes(o.status)).length;
  const overdueOrders = syncedOrders.filter((o) => o.status === 'overdue').length;
  const totalRevenue = syncedOrders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.baseRent + o.overdueFee + o.damageFee, 0);

  const categoryStats = equipment.map((eq) => {
    const catOrderCount = syncedOrders.filter((o) => o.equipmentId === eq.id).length;
    return {
      id: eq.id,
      name: eq.name,
      stock: eq.stock,
      dailyRate: eq.dailyRate,
      orderCount: catOrderCount,
    };
  }).sort((a, b) => b.orderCount - a.orderCount).slice(0, 5);

  res.json({
    totalEquipment,
    totalStock,
    totalOrders,
    activeOrders,
    overdueOrders,
    totalRevenue,
    topEquipment: categoryStats,
  });
}
