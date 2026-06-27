export default function Loading() {
  return (
    <div className="px-5 pt-6 pb-6 lg:max-w-3xl lg:mx-auto lg:px-8 lg:py-8 space-y-3 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-[20px] p-5"
          style={{ background: 'var(--card)', border: '1px solid var(--line)', height: 96 }}>
          <div className="flex items-center gap-3">
            <div className="rounded-full shrink-0" style={{ width: 48, height: 48, background: 'var(--blush-soft)' }} />
            <div className="flex-1 space-y-2">
              <div className="rounded-full" style={{ height: 14, width: '55%', background: 'var(--blush-soft)' }} />
              <div className="rounded-full" style={{ height: 12, width: '35%', background: 'var(--blush-tint)' }} />
            </div>
            <div className="rounded-full shrink-0" style={{ width: 70, height: 22, background: 'var(--blush-tint)' }} />
          </div>
        </div>
      ))}
    </div>
  )
}
