import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { Calendar, ShieldCheck, CreditCard, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { equipmentApi, orderApi } from '../api/client';
import type { Equipment } from '../types';
import { useAuthStore } from '../store/auth';
import { cn } from '../lib/utils';

export default function EquipmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 2), 'yyyy-MM-dd'));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!id) return;
    equipmentApi.getDetail(id).then((data) => {
      setEquipment(data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [id]);

  const rentalDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff + 1);
  }, [startDate, endDate]);

  const baseRent = (equipment?.dailyRate || 0) * rentalDays;
  const totalAmount = baseRent + (equipment?.deposit || 0);

  const handleRent = async () => {
    if (!equipment) return;
    setError('');
    setSuccess('');

    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/equipment/${id}` } });
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('结束日期不能早于开始日期');
      return;
    }

    setSubmitting(true);
    try {
      await orderApi.create({
        equipmentId: equipment.id,
        startDate,
        endDate,
      });
      setSuccess('租赁成功！请前往"我的订单"查看详情');
      setTimeout(() => navigate('/orders'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || '下单失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-7xl py-16">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="container max-w-7xl py-16 text-center">
        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">器材不存在或已下架</p>
      </div>
    );
  }

  const minEndDate = startDate;

  return (
    <div className="container max-w-7xl py-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <div className="card overflow-hidden p-0">
            <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
              <img
                src={equipment.imageUrl}
                alt={equipment.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="card mt-6 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">器材详情</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-3 rounded-xl bg-gray-50">
                <div className="text-xs text-gray-500">成色</div>
                <div className="font-semibold text-gray-800 mt-1">{equipment.condition}</div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50">
                <div className="text-xs text-gray-500">库存</div>
                <div className="font-semibold text-gray-800 mt-1">{equipment.availableStock ?? equipment.stock} 件</div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50">
                <div className="text-xs text-gray-500">日租金</div>
                <div className="font-semibold text-primary-600 mt-1">¥{equipment.dailyRate}</div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50">
                <div className="text-xs text-gray-500">押金</div>
                <div className="font-semibold text-gray-800 mt-1">¥{equipment.deposit}</div>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">{equipment.description}</p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card p-6 lg:sticky lg:top-24">
            <h1 className="text-2xl font-display font-bold text-gray-900">{equipment.name}</h1>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-display font-bold text-primary-600">¥{equipment.dailyRate}</span>
              <span className="text-gray-500">/天</span>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="mt-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {success}
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> 开始日期
                </label>
                <input
                  type="date"
                  value={startDate}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> 结束日期
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={minEndDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">租期</span>
                <span className="font-medium text-gray-800">{rentalDays} 天</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">租金 ({rentalDays} × ¥{equipment.dailyRate})</span>
                <span className="font-medium text-gray-800">¥{baseRent}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> 押金（归还后退还）
                </span>
                <span className="font-medium text-gray-800">¥{equipment.deposit}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-gray-700 font-medium">应付金额</span>
                <span className="text-2xl font-display font-bold text-primary-600">¥{totalAmount}</span>
              </div>
            </div>

            <button
              onClick={handleRent}
              disabled={submitting || (equipment.availableStock ?? equipment.stock) <= 0}
              className={cn(
                'w-full mt-6 py-3.5 rounded-xl text-white font-semibold text-lg transition-all',
                (equipment.availableStock ?? equipment.stock) <= 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
              )}
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (equipment.availableStock ?? equipment.stock) <= 0 ? (
                '暂无库存'
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  立即租赁
                </span>
              )}
            </button>

            {!isAuthenticated && (
              <p className="mt-3 text-center text-xs text-gray-500">
                登录后即可下单，未登录将跳转至登录页
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
