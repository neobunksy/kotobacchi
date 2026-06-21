'use client';

type StarCounterProps = {
  stars: number;
  className?: string;
};

export default function StarCounter({ stars, className = '' }: StarCounterProps) {
  return (
    <div
      className={`flex items-center gap-1.5 bg-yellow-bright rounded-full px-4 py-2 shadow-md animate-gentlePulse ${className}`}
      style={{ backgroundColor: '#FFE66D' }}
    >
      <span className="text-xl" role="img" aria-label="ほし">⭐</span>
      <span
        className="text-lg font-bold"
        style={{ color: '#4A4A4A', fontFamily: '"Hiragino Kaku Gothic ProN", sans-serif' }}
      >
        {stars.toLocaleString()}
      </span>
    </div>
  );
}
