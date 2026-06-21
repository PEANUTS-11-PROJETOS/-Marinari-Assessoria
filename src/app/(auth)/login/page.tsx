import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-5"
      style={{
        background:
          'radial-gradient(120% 80% at 50% -10%, #F3D9CE 0%, transparent 55%), linear-gradient(160deg, #EFE0D6 0%, #E7D2C7 100%)',
      }}
    >
      <div
        className="w-full rounded-[28px] p-8"
        style={{
          maxWidth: 420,
          background: 'var(--cream)',
          boxShadow: '0 20px 60px rgba(120,55,40,0.15)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-[14px] text-white"
            style={{
              background: 'linear-gradient(145deg, var(--blush) 0%, var(--rose) 100%)',
              fontSize: 20,
              lineHeight: 1,
              fontFamily: 'var(--font-serif)',
            }}
          >
            ♡
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold" style={{ color: 'var(--ink)' }}>Marinari Assessoria</span>
            <span style={{ fontSize: 10.5, color: 'var(--muted-foreground)' }}>by Peanuts Labs</span>
          </div>
        </div>

        {/* Headline */}
        <p className="eyebrow mb-3">Bem-vinda ✦</p>
        <h1 className="font-serif-display leading-[1.05]" style={{ fontSize: 38, color: 'var(--ink)' }}>
          Cada casamento, <i>no detalhe</i>.
        </h1>
        <p className="mt-3 leading-relaxed" style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>
          Entre para gerenciar convidados, mesas e fornecedores dos seus eventos.
        </p>

        <div className="mt-8">
          <LoginForm />
        </div>

        <p className="mt-6 text-center" style={{ fontSize: 11.5, color: 'var(--muted-foreground)' }}>
          © {new Date().getFullYear()} Peanuts Labs
        </p>
      </div>
    </div>
  )
}
