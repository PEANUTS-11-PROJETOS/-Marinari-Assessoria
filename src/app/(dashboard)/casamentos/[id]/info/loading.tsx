export default function Loading() {
  return (
    <div className="animate-pulse space-y-4 px-5 pt-5 lg:px-0">
      {/* Hero card */}
      <div className="rounded-[22px] mx-0" style={{ height: 180, background: 'var(--blush-soft)' }} />

      {/* Stats 2×2 */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-[18px]" style={{ height: 90, background: 'var(--blush-tint)', border: '1px solid var(--line)' }} />
        ))}
      </div>

      {/* Info lines */}
      <div className="rounded-[18px] p-4 space-y-3" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3 items-center">
            <div className="rounded-full shrink-0" style={{ width: 32, height: 32, background: 'var(--blush-soft)' }} />
            <div className="flex-1 space-y-1.5">
              <div className="rounded-full" style={{ height: 11, width: '30%', background: 'var(--blush-tint)' }} />
              <div className="rounded-full" style={{ height: 14, width: '60%', background: 'var(--blush-soft)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
