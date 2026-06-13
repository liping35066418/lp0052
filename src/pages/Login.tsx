import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Dumbbell, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authApi } from '../api/client';
import { useAuthStore } from '../store/auth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login({ username, password });
      setAuth(res.user, res.token);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 hero-gradient relative overflow-hidden">
        <div className="grain-overlay absolute inset-0" />
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Dumbbell className="w-7 h-7" />
            </div>
            <div>
              <div className="font-display text-3xl font-bold">SPORT RENT</div>
              <div className="text-white/70">运动器材共享租赁平台</div>
            </div>
          </div>
          <h1 className="font-display text-5xl font-bold leading-tight mb-6">
            释放运动激情<br />
            <span className="text-primary-300">共享专业装备</span>
          </h1>
          <p className="text-white/80 text-lg leading-relaxed max-w-md">
            从篮球到滑雪板，从瑜伽垫到公路自行车，
            一站式租赁各类运动器材。低成本享受高品质运动体验。
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-accent-gold">10+</div>
              <div className="text-sm text-white/60 mt-1">器材品类</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-accent-gold">100+</div>
              <div className="text-sm text-white/60 mt-1">库存数量</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-accent-gold">¥8</div>
              <div className="text-sm text-white/60 mt-1">起租/天</div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">欢迎回来</h2>
          <p className="text-gray-500 mb-8">请登录您的账号继续使用</p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="请输入用户名"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-12"
                  placeholder="请输入密码"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '登 录'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-center text-gray-500 text-sm">
              还没有账号？{' '}
              <Link to="/register" className="text-primary-600 font-medium hover:underline">
                立即注册
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="text-xs text-gray-500 mb-2">演示账号</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white rounded-lg p-2.5 border border-gray-100">
                <div className="font-medium text-gray-700">普通用户</div>
                <div className="text-gray-500 mt-0.5">user / user123</div>
              </div>
              <div className="bg-white rounded-lg p-2.5 border border-gray-100">
                <div className="font-medium text-gray-700">管理员</div>
                <div className="text-gray-500 mt-0.5">admin / admin123</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
