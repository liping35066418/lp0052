import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Calendar, AlertTriangle, Clock, Loader2, ChevronRight } from 'lucide-react';
import { orderApi } from '../api/client';
import type { Order } from '../types';
import { orderStatusMap } from '../types';
import { format, differenceInDays, parseISO } from 'date-fns';
import { cn } from '../lib/utils';

const statusTabs: Array<{ key: string; label: string }> = [
  { key: '', label: '全部订单' },
  { key: 'renting', label: '租赁中' },
  { key: 'overdue', label: '已逾期' },
  { key: 'completed', label: '已完成' },
];

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');

  const fetchOrders = async (status?: string) => {
    setLoading(true);
    try {
      const list = await orderApi.getList({ status, mineOnly: true });
      setOrders(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab]);

  const getDaysRemaining = (order: Order) => {
    if (!['renting', 'overdue'].includes(order.status)) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = parseISO(order.endDate);
    return differenceInDays(end, today);
  };

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">我的订单</h1>
        <p className="text-gray-500 text-sm mt-1">查看和管理您的租赁订单</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-5 py-2 rounded-full font-medium transition-all text-sm',
              activeTab === tab.key
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="card p-16 text-center">
          <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">暂无订单记录</p>
          <Link to="/" className="btn-primary">去租借器材</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const daysRemaining = getDaysRemaining(order);
            const isUrgent = daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 2;
            const statusInfo = orderStatusMap[order.status];

            return (
              <div key={order.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 truncate">{order.equipmentName}</h3>
                      <span className={cn('badge shrink-0', statusInfo.color)}>{statusInfo.label}</span>
                      {order.status === 'overdue' && (
                        <span className="badge bg-red-500 text-white shrink-0 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          逾期 {order.overdueDays} 天
                        </span>
                      )}
                      {isUrgent && order.status === 'renting' && (
                        <span className="badge bg-amber-100 text-amber-700 shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {daysRemaining === 0 ? '今日到期' : `还剩 ${daysRemaining} 天`}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <div className="flex flex-wrap gap-x-6 gap-y-1">
                        <span>订单号：{order.orderNo}</span>
                        <span>创建时间：{format(parseISO(order.createdAt), 'yyyy-MM-dd HH:mm')}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap gap-x-6">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>租期：{order.startDate} 至 {order.endDate}（{order.rentalDays} 天）</span>
                        {order.returnDate && <span>归还日期：{order.returnDate}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">订单金额</div>
                    <div className="text-xl font-display font-bold text-primary-600">¥{order.totalAmount}</div>
                    {order.status === 'completed' && (
                      <div className="text-xs text-green-600 mt-1">退还押金 ¥{order.refundAmount}</div>
                    )}
                  </div>
                </div>

                {(order.status === 'renting' || order.status === 'overdue') && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={() => navigate(`/orders/${order.id}/return`)}
                      className="btn-primary text-sm py-2 px-5 flex items-center gap-1"
                    >
                      归还登记 <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {order.damageCondition && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-sm">
                      <span className="text-gray-500">归还状态：</span>
                      <span className={cn(
                        'font-medium',
                        order.damageCondition === '完好' ? 'text-green-600' :
                        order.damageCondition === '轻微损耗' ? 'text-amber-600' :
                        'text-red-600'
                      )}>
                        {order.damageCondition}
                      </span>
                      {order.damageNote && (
                        <span className="text-gray-500 ml-2">（{order.damageNote}）</span>
                      )}
                      {order.damageFee > 0 && (
                        <span className="ml-2 text-red-600">扣除赔偿 ¥{order.damageFee}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
