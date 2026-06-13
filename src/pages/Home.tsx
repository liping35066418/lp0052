import { useEffect, useState } from 'react';
import { Search, Filter, Sparkles } from 'lucide-react';
import { equipmentApi } from '../api/client';
import type { Category, Equipment } from '../types';
import EquipmentCard from '../components/EquipmentCard';

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, eqs] = await Promise.all([
          equipmentApi.getCategories(),
          equipmentApi.getList(),
        ]);
        setCategories(cats);
        setEquipmentList(eqs);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const list = await equipmentApi.getList({
        categoryId: selectedCategory || undefined,
        keyword: keyword || undefined,
      });
      setEquipmentList(list);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = async (catId: string) => {
    const newCat = catId === selectedCategory ? '' : catId;
    setSelectedCategory(newCat);
    setLoading(true);
    try {
      const list = await equipmentApi.getList({
        categoryId: newCat || undefined,
        keyword: keyword || undefined,
      });
      setEquipmentList(list);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="hero-gradient relative overflow-hidden">
        <div className="grain-overlay absolute inset-0" />
        <div className="container max-w-7xl relative z-10 py-16 sm:py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white/90 text-sm mb-6">
              <Sparkles className="w-4 h-4 text-accent-gold" />
              专业器材 · 灵活租赁 · 安心保障
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              共享运动器材
              <br />
              <span className="text-primary-300">解锁无限可能</span>
            </h1>
            <p className="mt-6 text-lg text-white/80 max-w-xl leading-relaxed">
              无需购买昂贵器材，按天灵活租赁。从入门到专业，覆盖全品类运动装备，
              让每一次运动都得心应手。
            </p>
          </div>

          <div className="mt-10 max-w-2xl">
            <div className="flex flex-col sm:flex-row gap-3 p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-xl bg-white">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="搜索器材名称..."
                  className="flex-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
                />
              </div>
              <button onClick={handleSearch} className="btn-primary px-8 py-3 justify-center">
                搜索器材
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="container max-w-7xl py-10">
        <div className="flex items-center gap-3 mb-6">
          <Filter className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-800">按分类浏览</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryClick('')}
            className={`px-5 py-2 rounded-full font-medium transition-all ${
              !selectedCategory
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'
            }`}
          >
            全部器材
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`px-5 py-2 rounded-full font-medium transition-all inline-flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      <section className="container max-w-7xl pb-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-900">精选器材</h2>
            <p className="text-gray-500 text-sm mt-1">
              {equipmentList.length} 款器材可供租赁
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-100" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-100 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : equipmentList.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500">暂无符合条件的器材</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {equipmentList.map((eq) => (
              <EquipmentCard key={eq.id} equipment={eq} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
