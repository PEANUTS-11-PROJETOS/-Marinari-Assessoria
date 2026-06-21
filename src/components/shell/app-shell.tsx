import { Toaster } from '@/components/ui/sonner'
import { DesktopSidebar } from './desktop-sidebar'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Mobile: gradiente + container centralizado 440px */}
      <div
        className="md:hidden min-h-[100dvh]"
        style={{
          background:
            'radial-gradient(120% 80% at 50% -10%, #F3D9CE 0%, transparent 55%), linear-gradient(160deg, #EFE0D6 0%, #E7D2C7 100%)',
        }}
      >
        <div
          className="relative mx-auto flex min-h-[100dvh] w-full max-w-[440px] flex-col shadow-[0_0_60px_rgba(120,55,40,0.14)]"
          style={{ background: 'var(--cream)' }}
        >
          {children}
        </div>
      </div>

      {/* Desktop: sidebar fixa + área de conteúdo */}
      <div className="hidden md:flex md:h-screen md:overflow-hidden" style={{ background: '#FBF4EF' }}>
        <DesktopSidebar />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
      <Toaster richColors position="top-center" />
    </>
  )
}
