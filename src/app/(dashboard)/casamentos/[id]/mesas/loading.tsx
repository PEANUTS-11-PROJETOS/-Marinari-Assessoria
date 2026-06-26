export default function Loading() {
  return (
    <div className="animate-pulse flex flex-col items-center pt-8 px-5 gap-6">
      {/* Mesas em círculo */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-full mx-auto"
            style={{ width: 120, height: 120, background: 'var(--blush-soft)', border: '2px solid var(--blush-soft)' }} />
        ))}
      </div>
      {/* Pool de convidados */}
      <div className="w-full rounded-[18px] p-4" style={{ background: 'var(--blush-tint)' }}>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-full shrink-0" style={{ width: 42, height: 42, background: 'var(--blush-soft)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}
