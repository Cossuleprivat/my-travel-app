import { TopNav } from "./TopNav";
import { Container } from "./Container";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />
      <main>
        <Container className="py-8">{children}</Container>
      </main>
    </div>
  );
}
