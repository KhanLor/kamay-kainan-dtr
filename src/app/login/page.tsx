import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen px-4 py-8 sm:px-8 sm:py-12">
      <div className="absolute inset-0 bg-[radial-gradient(50rem_25rem_at_10%_0%,#f7d49b_0%,transparent_75%),radial-gradient(40rem_30rem_at_95%_100%,#b8d9d1_0%,transparent_65%)]" />
      <section className="relative mx-auto grid max-w-5xl gap-5 sm:grid-cols-[1fr_26rem]">
        <article className="rounded-2xl border border-line bg-white/80 p-6 backdrop-blur sm:p-8">
          <h2 className="text-3xl font-black text-[#2f2318]">Daily Time Record, now digital.</h2>
          <p className="mt-3 max-w-xl text-sm text-[#5f4f40] sm:text-base">
            Use Google OAuth for the fastest login, or email/password as alternative. Role-based tabs are applied after sign-in.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-[#4e4034]">
            <li>1. Employees can view and submit only their own records.</li>
            <li>2. Admins can review, edit, approve, reject, and export.</li>
            <li>3. Submission is blocked until AM, Break, and PM signatures are complete.</li>
          </ul>
        </article>
        <LoginForm />
      </section>
    </main>
  );
}
