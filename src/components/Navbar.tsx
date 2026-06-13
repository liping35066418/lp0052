import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell, ShoppingCart, UserCircle, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store/auth';
import { cn } from '../lib/utils';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="container max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-display text-xl font-bold text-secondary-500 leading-tight">SPORT RENT</div>
              <div className="text-xs text-gray-500 leading-tight">运动器材共享平台</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors">
              器材商城
            </Link>
            {isAuthenticated && (
              <Link to="/orders" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors">
                我的订单
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin/dashboard" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors">
                管理后台
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">
                  登录
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  注册
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50">
                  <UserCircle className="w-5 h-5 text-primary-500" />
                  <span className="text-sm font-medium text-gray-700">{user?.username}</span>
                  {user?.role === 'admin' && (
                    <span className="badge bg-accent-gold/20 text-amber-700">管理员</span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-red-500 transition-colors"
                  title="退出登录"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className={cn('md:hidden border-t border-gray-100 overflow-hidden transition-all duration-300', mobileOpen ? 'max-h-96' : 'max-h-0')}>
        <div className="container py-3 space-y-1">
          <Link to="/" className="block px-4 py-2.5 rounded-lg hover:bg-gray-50 font-medium" onClick={() => setMobileOpen(false)}>
            器材商城
          </Link>
          {isAuthenticated && (
            <Link to="/orders" className="flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-gray-50 font-medium" onClick={() => setMobileOpen(false)}>
              <ShoppingCart className="w-4 h-4" /> 我的订单
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin/dashboard" className="flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-gray-50 font-medium" onClick={() => setMobileOpen(false)}>
              <LayoutDashboard className="w-4 h-4" /> 管理后台
            </Link>
          )}
          <div className="pt-2 border-t border-gray-100">
            {!isAuthenticated ? (
              <div className="flex flex-col gap-2 px-2">
                <Link to="/login" className="btn-secondary justify-center" onClick={() => setMobileOpen(false)}>登录</Link>
                <Link to="/register" className="btn-primary justify-center" onClick={() => setMobileOpen(false)}>注册</Link>
              </div>
            ) : (
              <div className="px-4 py-2 space-y-2">
                <div className="flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-primary-500" />
                  <span className="font-medium">{user?.username}</span>
                </div>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="text-red-500 text-sm">退出登录</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
