import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8 border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm shadow-2xl">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-heading font-bold tracking-tight">Inshort</h2>
          <p className="text-sm font-mono text-muted-foreground">TERMINAL ACCESS REQUIRED</p>
        </div>
        <LoginForm />
        <div className="text-center text-xs text-muted-foreground/50 font-mono">
          SECURE CONNECTION ESTABLISHED
        </div>
      </div>
    </div>
  )
}

