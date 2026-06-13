import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Loader2, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { orderApi } from '../api/client';
import type { DamageCondition, Order } from '../types';
import { useAuthStore } from '../store/auth';
import { cn } from '../lib/utils';

const damageOptions: Array<{ value: DamageCondition; label: string; desc: string; feeRate: string }> = [
  { value: '完好', label: '完好无损', desc: '器材状态良好，无任何损坏', feeRate: '全额退还押金' },
  { value: '轻微损耗', label: '轻微损耗', desc: '有轻微使用痕迹，不影响正常使用', feeRate: '扣除押金 20%' },
  { value: '严重损坏', label: '严重损坏', desc: '主要部件损坏，影响正常使用', feeRate: '扣除押金 80%' },
  { value: '丢失', label: '器材丢失', desc: '器材遗失无法归还', feeRate: '扣除全部押金' },
];

export default function ReturnOrder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [damageCondition, setDamageCondition] = useState<DamageCondition>('完好');
  const [damageNote, setDamageNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    orderApi.getDetail(id).then((data) => {
      if (user?.role === 'user' && data.userId !== user.id) {
        navigate('/orders');
        return;
      }
      setOrder(data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [id, navigate, user]);

  const calculateDamageFee = () => {
    if (!order) return 0;
    switch (damageCondition) {
      case '完好': return 0;
      case '轻微损耗': return Math.round(order.deposit * 0.2);
      case '严重损坏': return Math.round(order.deposit * 0.8);
      case '丢失': return order.deposit;
      default: return 0;
    }
  };

  const damageFee = calculateDamageFee();
  const refundAmount = order ? Math.max(0, order.deposit - damageFee - order.overdueFee) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError('');
    setSubmitting(true);
    try {
      await orderApi.returnOrder(id, { damageCondition, damageNote: damageNote || undefined });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || '归还登记失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-2xl py-16 flex justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container max-w-2xl py-16 text-center">
        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">订单不存在</p>
        <button onClick={() => navigate('/orders')} className="btn-secondary">返回订单列表</button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container max-w-2xl py-16">
        <div className="card p-12 text-center">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">归还登记成功</h2>
          <p className="text-gray-500 mb-6">感谢您使用我们的服务，期待下次再见</p>
          <div className="bg-gray-50 rounded-xl p-6 mb-8 max-w-sm mx-auto text-left">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-500">器材</span>
              <span className="font-medium">{order.equipmentName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-500">押金</span>
              <span className="font-medium">¥{order.deposit}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-500">损坏赔偿</span>
              <span className={cn('font-medium', damageFee > 0 ? 'text-red-600' : '')}>-¥{damageFee}</span>
            </div>
            {order.overdueFee > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-500">逾期费用</span>
                <span className="font-medium text-red-600">-¥{order.overdueFee}</span>
              </div>
            )}
            <div className="flex justify-between py-3 pt-4">
              <span className="text-gray-700 font-medium">应退还押金</span>
              <span className="text-xl font-display font-bold text-green-600">¥{refundAmount}</span>
            </div>
          </div>
          <button onClick={() => navigate('/orders')} className="btn-primary">
            查看我的订单
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      <button
        onClick={() => navigate('/orders')}
        className="inline-flex items-center gap-1 text-gray-600 hover:text-primary-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> 返回订单列表
      </button>

      <div className="card p-6 mb-6">
        <h2 className="text-xl font-display font-bold text-gray-900 mb-4">归还确认</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 rounded-xl bg-gray-50">
            <div className="text-xs text-gray-500">器材名称</div>
            <div className="font-medium text-gray-800 mt-0.5">{order.equipmentName}</div>
          </div>
          <div className="p-3 rounded-xl bg-gray-50">
            <div className="text-xs text-gray-500">订单号</div>
            <div className="font-medium text-gray-800 mt-0.5">{order.orderNo}</div>
          </div>
          <div className="p-3 rounded-xl bg-gray-50">
            <div className="text-xs text-gray-500">租期</div>
            <div className="font-medium text-gray-800 mt-0.5">
              {order.startDate} ~ {order.endDate}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-gray-50">
            <div className="text-xs text-gray-500">押金金额</div>
            <div className="font-medium text-primary-600 mt-0.5">¥{order.deposit}</div>
          </div>
        </div>
        {order.overdueFee > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200">
            <div className="flex items-center gap-2 text-red-700 font-medium">
              <AlertCircle className="w-5 h-5" />
              该订单已逾期 {order.overdueDays} 天
            </div>
            <div className="text-sm text-red-600 mt-1">
              逾期费用：¥{order.overdueFee}（{order.overdueDays} 天 × 1.5倍日租金）
            </div>
            <div className="text-xs text-red-500 mt-1">
              逾期费用将从押金中额外扣除
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="card p-6">
        <h2 className="text-xl font-display font-bold text-gray-900 mb-4">器材状态检查</h2>
        <p className="text-gray-500 text-sm mb-6">请如实登记器材归还时的状态</p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-3 mb-6">
          {damageOptions.map((opt) => (
            <label
              key={opt.value}
              className={cn(
                'p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4',
                damageCondition === opt.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <input
                type="radio"
                name="damage"
                value={opt.value}
                checked={damageCondition === opt.value}
                onChange={() => setDamageCondition(opt.value)}
                className="mt-1 accent-primary-500"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{opt.label}</span>
                  <span className={cn(
                    'text-sm font-medium',
                    opt.value === '完好' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {opt.feeRate}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">备注说明（可选）</label>
          <textarea
            value={damageNote}
            onChange={(e) => setDamageNote(e.target.value)}
            rows={3}
            className="input-field resize-none"
            placeholder="请描述器材具体情况，如有损坏请说明部位和程度..."
          />
        </div>

        <div className="bg-gray-50 rounded-xl p-5 mb-6">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-500">押金金额</span>
            <span className="font-medium">¥{order.deposit}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-500">损坏赔偿</span>
            <span className={cn('font-medium', damageFee > 0 ? 'text-red-600' : '')}>-¥{damageFee}</span>
          </div>
          {order.overdueFee > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-500">逾期费用</span>
              <span className="font-medium text-red-600">-¥{order.overdueFee}</span>
            </div>
          )}
          <div className="flex justify-between py-3 pt-4">
            <span className="text-gray-700 font-medium">应退还押金</span>
            <span className="text-2xl font-display font-bold text-green-600">¥{refundAmount}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full py-3.5 text-base"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : '确认归还'}
        </button>
      </form>
    </div>
  );
}
