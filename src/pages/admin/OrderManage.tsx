import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { orderApi } from '../../api/client';
import type { Order } from '../../types';
import { orderStatusMap } from '../../types';
import { Search, Download, Loader2, Filter, RotateCcw, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format, parseISO } from 'date-fns';

export default function OrderManage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [exporting, setExporting] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const list = await orderApi.getList(statusFilter ? { status: statusFilter } : undefined);
      setOrders(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const filtered = orders.filter((o) =>
    !keyword ||
    o.equipmentName.toLowerCase().includes(keyword.toLowerCase()) ||
    o.orderNo.toLowerCase().includes(keyword.toLowerCase())
  );

  const handleExport = async () => {
    setExporting(true);
    try {
      await orderApi.export();
    } finally {
      setExporting(false);
    }
  };

  const handleReturn = (order: Order) => {
    navigate(`/orders/${order.id}/return`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">订单管理</h1>
            <p className="text-gray-500 mt-1">查看和管理所有租赁订单</p>
          </div>
          <button onClick={handleExport} disabled={exporting} className="btn-secondary">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Download className="w-4 h-4 mr-1" />}
            导出数据
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索订单号或器材名称..."
                className="input-field pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field !py-2 !pr-8"
              >
                <option value="">全部状态</option>
                <option value="renting">租赁中</option>
                <option value="overdue">已逾期</option>
                <option value="completed">已完成</option>
                <option value="pending">待支付</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>
            <button onClick={fetchOrders} className="btn-secondary !py-2 !px-4" title="刷新">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">暂无订单数据</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">订单号</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">器材</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">租期</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">天数</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">金额</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((order) => {
                    const statusInfo = orderStatusMap[order.status];
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono text-sm text-gray-700">{order.orderNo}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{order.equipmentName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div>{order.startDate}</div>
                          <div className="text-gray-400">至 {order.endDate}</div>
                          {order.returnDate && <div className="text-green-600">归还 {order.returnDate}</div>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div>{order.rentalDays} 天</div>
                          {order.overdueDays > 0 && (
                            <div className="text-red-500">逾期 {order.overdueDays} 天</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="font-medium text-gray-900">¥{order.totalAmount}</div>
                          {order.damageFee > 0 && (
                            <div className="text-red-500 text-xs">赔偿 ¥{order.damageFee}</div>
                          )}
                          {order.status === 'completed' && (
                            <div className="text-green-600 text-xs">退押金 ¥{order.refundAmount}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn('badge', statusInfo.color)}>{statusInfo.label}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {format(parseISO(order.createdAt), 'yyyy-MM-dd HH:mm')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {['renting', 'overdue'].includes(order.status) && (
                            <button
                              onClick={() => handleReturn(order)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 text-sm font-medium transition-colors"
                            >
                              归还 <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
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
    </div>
  );
}
