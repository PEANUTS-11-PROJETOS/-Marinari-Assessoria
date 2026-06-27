import { Toaster } from '@/components/ui/sonner'
import { DesktopSidebar } from './desktop-sidebar'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Mobile + tablet: até 1023px */}
      <div
        className="lg:hidden min-h-[100dvh]"
        style={{
          background:
            'radial-gradient(120% 80% at 50% -10%, #F3D9CE 0%, transparent 55%), linear-gradient(160deg, #EFE0D6 0%, #E7D2C7 100%)',
        }}
      >
        {/* Celular: container 440px centralizado com sombra
            Tablet (sm+): largura total, sem sombra */}
        <div
          className="relative mx-auto flex min-h-[100dvh] w-full flex-col
                     max-w-[440px] shadow-[0_0_60px_rgba(120,55,40,0.14)]
                     sm:max-w-full sm:shadow-none"
          style={{ background: 'var(--cream)' }}
        >
          {children}
        </div>
      </div>

      {/* Desktop: sidebar fixa + área de conteúdo (≥ 1024px) */}
      <div className="hidden lg:flex lg:h-screen lg:overflow-hidden" style={{ background: '#FBF4EF' }}>
        <DesktopSidebar />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>

      <Toaster richColors position="top-center" />
    </>
  )
}
