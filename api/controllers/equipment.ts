import type { Request, Response } from 'express';
import { categories, equipment, stockLogs, orders } from '../data/store.js';
import type { Equipment, EquipmentCondition, EquipmentStatus } from '../types/index.js';
import { generateId, getAvailableStock } from '../utils/index.js';
import { getCurrentUser } from '../middleware/auth.js';
import { format } from 'date-fns';

export function getCategories(_req: Request, res: Response) {
  res.json(categories);
}

export function getEquipmentList(req: Request, res: Response) {
  const { categoryId, keyword, startDate, endDate } = req.query as {
    categoryId?: string;
    keyword?: string;
    startDate?: string;
    endDate?: string;
  };

  let result = [...equipment];

  if (categoryId) {
    result = result.filter((eq) => eq.categoryId === categoryId);
  }
  if (keyword) {
    const kw = keyword.toLowerCase();
    result = result.filter((eq) => eq.name.toLowerCase().includes(kw));
  }

  const today = format(new Date(), 'yyyy-MM-dd');
  const sd = startDate || today;
  const ed = endDate || today;

  const enriched = result.map((eq) => {
    const availableStock = getAvailableStock(equipment, orders, eq.id, sd, ed);
    const borrowedCount = eq.stock - availableStock;
    return { ...eq, availableStock, borrowedCount };
  });

  res.json(enriched);
}

export function getEquipmentDetail(req: Request, res: Response) {
  const { id } = req.params;
  const { startDate, endDate } = req.query as {
    startDate?: string;
    endDate?: string;
  };

  const eq = equipment.find((e) => e.id === id);
  if (!eq) {
    res.status(404).json({ error: '器材不存在' });
    return;
  }

  const today = format(new Date(), 'yyyy-MM-dd');
  const sd = startDate || today;
  const ed = endDate || today;
  const availableStock = getAvailableStock(equipment, orders, eq.id, sd, ed);
  const borrowedCount = eq.stock - availableStock;

  res.json({ ...eq, availableStock, borrowedCount });
}

export function createEquipment(req: Request, res: Response) {
  const {
    name,
    categoryId,
    description,
    condition,
    stock,
    dailyRate,
    deposit,
    imageUrl,
  } = req.body as {
    name: string;
    categoryId: string;
    description: string;
    condition: EquipmentCondition;
    stock: number;
    dailyRate: number;
    deposit: number;
    imageUrl: string;
  };

  if (!name || !categoryId || stock == null || !dailyRate || !deposit) {
    res.status(400).json({ error: '请填写必填字段' });
    return;
  }

  if (!categories.find((c) => c.id === categoryId)) {
    res.status(400).json({ error: '分类不存在' });
    return;
  }

  const newEq: Equipment = {
    id: generateId('eq'),
    name,
    categoryId,
    description: description || '',
    condition: condition || '9成新',
    stock: Number(stock),
    dailyRate: Number(dailyRate),
    deposit: Number(deposit),
    status: '在库',
    imageUrl: imageUrl || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sports%20equipment%20icon&image_size=square',
    createdAt: new Date().toISOString(),
  };

  equipment.push(newEq);
  res.status(201).json(newEq);
}

export function updateEquipment(req: Request, res: Response) {
  const { id } = req.params;
  const idx = equipment.findIndex((e) => e.id === id);
  if (idx === -1) {
    res.status(404).json({ error: '器材不存在' });
    return;
  }

  const updates = req.body as Partial<Equipment>;
  equipment[idx] = { ...equipment[idx], ...updates };
  res.json(equipment[idx]);
}

export function deleteEquipment(req: Request, res: Response) {
  const { id } = req.params;
  const idx = equipment.findIndex((e) => e.id === id);
  if (idx === -1) {
    res.status(404).json({ error: '器材不存在' });
    return;
  }

  equipment.splice(idx, 1);
  res.json({ success: true });
}

export function adjustStock(req: Request, res: Response) {
  const { id } = req.params;
  const currentUser = getCurrentUser(req);
  const { afterStock, changeReason } = req.body as {
    afterStock: number;
    changeReason: string;
  };

  const idx = equipment.findIndex((e) => e.id === id);
  if (idx === -1) {
    res.status(404).json({ error: '器材不存在' });
    return;
  }

  const beforeStock = equipment[idx].stock;
  equipment[idx].stock = Number(afterStock);

  if (equipment[idx].stock === 0) {
    equipment[idx].status = '已出租' as EquipmentStatus;
  } else if (equipment[idx].status === '已出租' && equipment[idx].stock > 0) {
    equipment[idx].status = '在库';
  }

  stockLogs.push({
    id: generateId('log'),
    equipmentId: id,
    beforeStock,
    afterStock: Number(afterStock),
    changeReason: changeReason || '盘点调整',
    operatorId: currentUser?.userId || 'system',
    createdAt: new Date().toISOString(),
  });

  res.json({ equipment: equipment[idx], stockLog: stockLogs[stockLogs.length - 1] });
}
