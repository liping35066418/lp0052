import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { equipmentApi } from '../../api/client';
import type { Category, Equipment, EquipmentCondition } from '../../types';
import { Plus, Edit2, Trash2, Layers, Loader2, Search, X, Save } from 'lucide-react';
import { cn } from '../../lib/utils';

const conditions: EquipmentCondition[] = ['全新', '9成新', '8成新', '7成新', '较旧'];

interface FormState {
  id?: string;
  name: string;
  categoryId: string;
  description: string;
  condition: EquipmentCondition;
  stock: number;
  dailyRate: number;
  deposit: number;
  imageUrl: string;
}

const emptyForm: FormState = {
  name: '',
  categoryId: '',
  description: '',
  condition: '9成新',
  stock: 0,
  dailyRate: 0,
  deposit: 0,
  imageUrl: '',
};

export default function EquipmentManage() {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [stockModal, setStockModal] = useState<{ id: string; name: string; current: number } | null>(null);
  const [newStock, setNewStock] = useState(0);
  const [stockReason, setStockReason] = useState('');
  const [stockSubmitting, setStockSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cats, eqs] = await Promise.all([
        equipmentApi.getCategories(),
        equipmentApi.getList(),
      ]);
      setCategories(cats);
      setEquipmentList(eqs);
      if (cats.length > 0) {
        emptyForm.categoryId = cats[0].id;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = equipmentList.filter((eq) =>
    !keyword || eq.name.toLowerCase().includes(keyword.toLowerCase())
  );

  const openAddModal = () => {
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEditModal = (eq: Equipment) => {
    setForm({
      id: eq.id,
      name: eq.name,
      categoryId: eq.categoryId,
      description: eq.description,
      condition: eq.condition,
      stock: eq.stock,
      dailyRate: eq.dailyRate,
      deposit: eq.deposit,
      imageUrl: eq.imageUrl,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (form.id) {
        await equipmentApi.update(form.id, form);
      } else {
        await equipmentApi.create(form);
      }
      setShowModal(false);
      fetchData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除该器材吗？')) return;
    await equipmentApi.delete(id);
    fetchData();
  };

  const openStockModal = (eq: Equipment) => {
    setStockModal({ id: eq.id, name: eq.name, current: eq.stock });
    setNewStock(eq.stock);
    setStockReason('');
  };

  const handleStockAdjust = async () => {
    if (!stockModal) return;
    setStockSubmitting(true);
    try {
      await equipmentApi.adjustStock(stockModal.id, {
        afterStock: newStock,
        changeReason: stockReason || '盘点调整',
      });
      setStockModal(null);
      fetchData();
    } finally {
      setStockSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">器材管理</h1>
            <p className="text-gray-500 mt-1">管理平台所有运动器材信息</p>
          </div>
          <button onClick={openAddModal} className="btn-primary">
            <Plus className="w-4 h-4 mr-1" /> 新增器材
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索器材名称..."
                className="input-field pl-9"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">器材</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">分类</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">成色</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">库存</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">日租金</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">押金</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((eq) => {
                    const cat = categories.find((c) => c.id === eq.categoryId);
                    return (
                      <tr key={eq.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={eq.imageUrl} alt={eq.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                            <div className="font-medium text-gray-900">{eq.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {cat ? `${cat.icon} ${cat.name}` : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="badge bg-gray-100 text-gray-700">{eq.condition}</span>
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => openStockModal(eq)} className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
                            <Layers className="w-3.5 h-3.5" /> {eq.stock}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">¥{eq.dailyRate}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">¥{eq.deposit}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            'badge',
                            eq.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          )}>
                            {eq.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex gap-1">
                            <button
                              onClick={() => openEditModal(eq)}
                              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                              title="编辑"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(eq.id)}
                              className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold">{form.id ? '编辑器材' : '新增器材'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">器材名称</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">分类</label>
                  <select
                    required
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="input-field"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">成色</label>
                  <select
                    value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value as EquipmentCondition })}
                    className="input-field"
                  >
                    {conditions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">库存数量</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">日租金 (元)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    required
                    value={form.dailyRate}
                    onChange={(e) => setForm({ ...form, dailyRate: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">押金 (元)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={form.deposit}
                    onChange={(e) => setForm({ ...form, deposit: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">图片链接</label>
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="input-field"
                    placeholder="https://..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">描述</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="input-field resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  取消
                </button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1" /> 保存</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {stockModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold">库存盘点</h2>
              <button onClick={() => setStockModal(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-gray-50">
                <div className="text-sm text-gray-500">器材</div>
                <div className="font-medium text-gray-900 mt-0.5">{stockModal.name}</div>
                <div className="text-sm text-gray-500 mt-2">当前库存</div>
                <div className="text-2xl font-display font-bold text-primary-600 mt-0.5">{stockModal.current} 件</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">调整后库存</label>
                <input
                  type="number"
                  min={0}
                  value={newStock}
                  onChange={(e) => setNewStock(Number(e.target.value))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">调整原因</label>
                <input
                  type="text"
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  className="input-field"
                  placeholder="例如：盘点调整、报损、入库..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStockModal(null)} className="btn-secondary flex-1">取消</button>
                <button onClick={handleStockAdjust} disabled={stockSubmitting} className="btn-primary flex-1">
                  {stockSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : '确认调整'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
