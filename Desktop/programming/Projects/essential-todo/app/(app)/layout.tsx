import ClientShell from "@/components/ClientShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <ClientShell>{children}</ClientShell>;
}
