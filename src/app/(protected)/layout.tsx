import { AppShell } from "@/components/app-shell";
import { getCurrentUserAndProfile } from "@/lib/auth";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getCurrentUserAndProfile();

  return (
    <AppShell role={profile?.role ?? "employee"} profile={profile}>
      {children}
    </AppShell>
  );
}
