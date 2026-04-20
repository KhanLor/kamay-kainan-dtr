import { AdminQueue } from "@/components/admin-queue";
import { requireRole } from "@/lib/auth";

export default async function AdminPage() {
  await requireRole(["admin"]);

  return (
    <section className="space-y-4">
      <AdminQueue />
    </section>
  );
}
