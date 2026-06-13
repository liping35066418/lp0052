import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ClipboardList, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/admin/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { to: '/admin/equipment', label: '器材管理', icon: Package },
  { to: '/admin/orders', label: '订单管理', icon: ClipboardList },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <aside className="w-64 shrink-0 bg-secondary-500 min-h-screen flex flex-col">
      <div className="p-5 border-b border-white/10">
        <div className="text-white font-display text-xl font-bold">SPORT RENT</div>
        <div className="text-white/60 text-xs mt-0.5">管理后台</div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all',
                isActive && 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10">
        <div className="px-4 py-3 rounded-xl bg-white/5 mb-2">
          <div className="text-white text-sm font-medium">{user?.username}</div>
          <div className="text-white/50 text-xs">管理员</div>
        </div>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>退出登录</span>
        </button>
      </div>
    </aside>
  );
}
