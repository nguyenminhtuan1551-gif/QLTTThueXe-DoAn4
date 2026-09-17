import React from 'react';

interface BadgeProps {
  label: string;
}

export const Badge: React.FC<BadgeProps> = ({ label }) => {
  let style = 'bg-slate-100 text-slate-700 border-slate-200';

  if (['Sẵn sàng', 'Đã hoàn thành', 'Đang hoạt động', 'Còn hạn'].includes(label)) {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['Đang thuê', 'Đang hiệu lực'].includes(label)) {
    style = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (['Chờ xác nhận', 'Bảo trì', 'Đang bảo trì', 'Sắp hết hạn'].includes(label)) {
    style = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (['Đã hủy', 'Tạm khóa', 'Hết hạn'].includes(label)) {
    style = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}
    >
      {label}
    </span>
  );
};
