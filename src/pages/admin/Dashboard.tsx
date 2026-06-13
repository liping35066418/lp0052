import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { dashboardApi } from '../../api/client';
import type { DashboardStats } from '../../types';
import { Package, Boxes, ShoppingCart, AlertTriangle, DollarSign, TrendingUp, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats().then((data) => {
      setStats(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: '器材种类', value: stats.totalEquipment, icon: Package, color: 'from-blue-500 to-blue-600', suffix: '种' },
    { label: '总库存数', value: stats.totalStock, icon: Boxes, color: 'from-emerald-500 to-emerald-600', suffix: '件' },
    { label: '总订单数', value: stats.totalOrders, icon: ShoppingCart, color: 'from-primary-500 to-primary-600', suffix: '单' },
    { label: '进行中订单', value: stats.activeOrders, icon: TrendingUp, color: 'from-purple-500 to-purple-600', suffix: '单' },
    { label: '逾期订单', value: stats.overdueOrders, icon: AlertTriangle, color: 'from-red-500 to-red-600', suffix: '单' },
    { label: '累计收入', value: stats.totalRevenue, icon: DollarSign, color: 'from-amber-500 to-amber-600', suffix: '元' },
  ] : [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold text-gray-900">运营概览</h1>
          <p className="text-gray-500 mt-1">查看平台整体运营数据</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {statCards.map((card, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-gray-500 text-sm">{card.label}</div>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-3xl font-display font-bold text-gray-900">{card.value}</span>
                        <span className="text-gray-400 text-sm">{card.suffix}</span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">热门器材排行</h2>
              {stats?.topEquipment.length === 0 ? (
                <p className="text-gray-400 text-center py-8">暂无数据</p>
              ) : (
                <div className="space-y-3">
                  {stats?.topEquipment.map((eq, i) => (
                    <div key={eq.id} className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        i === 0 ? 'bg-amber-100 text-amber-700' :
                        i === 1 ? 'bg-gray-200 text-gray-700' :
                        i === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 truncate">{eq.name}</div>
                        <div className="text-xs text-gray-500">库存 {eq.stock} 件 · ¥{eq.dailyRate}/天</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-primary-600">{eq.orderCount}</div>
                        <div className="text-xs text-gray-400">租赁次数</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
