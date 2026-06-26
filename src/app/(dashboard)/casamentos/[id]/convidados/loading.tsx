export default function Loading() {
  return (
    <div className="animate-pulse px-5 pt-5 md:px-0 space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-[16px]" style={{ height: 68, background: 'var(--blush-tint)', border: '1px solid var(--line)' }} />
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {[80, 110, 90, 100].map((w, i) => (
          <div key={i} className="rounded-full shrink-0" style={{ width: w, height: 34, background: 'var(--blush-tint)' }} />
        ))}
      </div>

      {/* Linhas */}
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="flex items-center gap-3 py-2">
          <div className="rounded-full shrink-0" style={{ width: 42, height: 42, background: 'var(--blush-soft)' }} />
          <div className="flex-1 space-y-1.5">
            <div className="rounded-full" style={{ height: 13, width: `${40 + (i * 7) % 35}%`, background: 'var(--blush-soft)' }} />
            <div className="rounded-full" style={{ height: 11, width: `${25 + (i * 5) % 20}%`, background: 'var(--blush-tint)' }} />
          </div>
          <div className="rounded-full shrink-0" style={{ width: 80, height: 22, background: 'var(--blush-tint)' }} />
        </div>
      ))}
    </div>
  )
}
