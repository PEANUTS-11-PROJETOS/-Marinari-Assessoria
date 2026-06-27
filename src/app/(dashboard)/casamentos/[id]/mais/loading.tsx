export default function Loading() {
  return (
    <div className="animate-pulse pb-6 space-y-5 px-5 lg:px-0">
      {[1, 2, 3].map(section => (
        <div key={section}>
          {/* Section header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-[9px] shrink-0" style={{ width: 28, height: 28, background: 'var(--blush-soft)' }} />
            <div className="rounded-full" style={{ height: 11, width: 80, background: 'var(--blush-tint)' }} />
          </div>
          {/* Fields */}
          <div className="rounded-[20px] overflow-hidden" style={{ border: '1px solid var(--line)' }}>
            {[1, 2].map(field => (
              <div key={field} className="px-4 py-3" style={{ borderTop: field === 1 ? 'none' : '1px solid var(--line)' }}>
                <div className="rounded-full mb-1.5" style={{ height: 10, width: 60, background: 'var(--blush-tint)' }} />
                <div className="rounded-full" style={{ height: 14, width: '70%', background: 'var(--blush-soft)' }} />
              </div>
            ))}
          </div>
        </div>
      ))}
      {/* Botão salvar */}
      <div className="rounded-[14px]" style={{ height: 52, background: 'var(--blush-soft)' }} />
    </div>
  )
}
