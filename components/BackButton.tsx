'use client';

import { useRouter } from 'next/navigation';

type BackButtonProps = {
  href?: string;
  label?: string;
  className?: string;
};

export default function BackButton({ href = '/', label = 'もどる', className = '' }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 font-bold shadow-md transition-transform active:scale-95 ${className}`}
      style={{
        backgroundColor: 'rgba(255,255,255,0.85)',
        color: '#4A4A4A',
        minHeight: '48px',
        border: '2px solid rgba(255,255,255,0.6)',
        fontSize: '1rem',
      }}
      aria-label={label}
    >
      <span className="text-lg">←</span>
      <span>{label}</span>
    </button>
  );
}
