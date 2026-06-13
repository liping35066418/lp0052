import { Link } from 'react-router-dom';
import type { Equipment } from '../types';
import { CalendarDays } from 'lucide-react';

interface Props {
  equipment: Equipment;
}

export default function EquipmentCard({ equipment }: Props) {
  const stockClass = (equipment.availableStock ?? equipment.stock) > 0
    ? 'bg-green-100 text-green-700'
    : 'bg-red-100 text-red-700';

  return (
    <Link
      to={`/equipment/${equipment.id}`}
      className="card group overflow-hidden flex flex-col h-full"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={equipment.imageUrl}
          alt={equipment.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={cn('badge', stockClass)}>
            {(equipment.availableStock ?? equipment.stock) > 0 ? `库存 ${equipment.availableStock ?? equipment.stock}` : '暂无库存'}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="badge bg-white/90 text-secondary-600 backdrop-blur">
            {equipment.condition}
          </span>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
          {equipment.name}
        </h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2 min-h-[40px]">
          {equipment.description}
        </p>
        <div className="mt-auto pt-3 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-display font-bold text-primary-600">¥{equipment.dailyRate}</span>
              <span className="text-sm text-gray-500">/天</span>
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <CalendarDays className="w-3 h-3" />
              押金 ¥{equipment.deposit}
            </div>
          </div>
          <span className="text-sm text-primary-600 font-medium group-hover:translate-x-1 transition-transform">
            查看详情 →
          </span>
        </div>
      </div>
    </Link>
  );
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
