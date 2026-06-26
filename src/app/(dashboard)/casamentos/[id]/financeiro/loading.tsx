export default function Loading() {
  return (
    <div className="animate-pulse space-y-6 px-5 md:px-0">
      {/* Hero financeiro */}
      <div className="rounded-[22px]" style={{ height: 120, background: 'var(--blush-soft)' }} />

      {/* Serviços */}
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-[18px] p-4 space-y-3"
            style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
            <div className="flex justify-between items-center">
              <div className="rounded-full" style={{ height: 14, width: '40%', background: 'var(--blush-soft)' }} />
              <div className="rounded-full" style={{ height: 14, width: '20%', background: 'var(--blush-tint)' }} />
            </div>
            <div className="rounded-full" style={{ height: 6, background: 'var(--blush-tint)' }}>
              <div className="rounded-full h-full" style={{ width: `${30 + i * 20}%`, background: 'var(--blush-soft)' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Cronograma */}
      <div className="rounded-[20px] p-5" style={{ border: '1px solid var(--line)', background: 'var(--card)' }}>
        <div className="flex justify-between mb-4">
          <div className="space-y-1.5">
            <div className="rounded-full" style={{ height: 14, width: 140, background: 'var(--blush-soft)' }} />
            <div className="rounded-full" style={{ height: 11, width: 90, background: 'var(--blush-tint)' }} />
          </div>
          <div className="rounded-[10px]" style={{ width: 90, height: 32, background: 'var(--blush-tint)' }} />
        </div>
        {[1, 2].map(i => (
          <div key={i} className="rounded-[18px] mb-3 overflow-hidden" style={{ border: '1px solid var(--line)' }}>
            <div style={{ height: 52, background: 'var(--blush-tint)' }} />
            {[1, 2].map(j => (
              <div key={j} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--line)' }}>
                <div className="rounded-full shrink-0" style={{ width: 20, height: 20, background: 'var(--blush-soft)' }} />
                <div className="flex-1 rounded-full" style={{ height: 12, background: 'var(--blush-tint)' }} />
                <div className="rounded-full shrink-0" style={{ width: 60, height: 14, background: 'var(--blush-soft)' }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
