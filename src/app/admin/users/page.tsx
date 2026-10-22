import { getPool } from "@/lib/db";
import { grantAdmin, revokeAdmin, deleteUser } from "../actions";
import {
  Field,
  Notice,
  SectionHeader,
  dangerButtonClass,
  inputClass,
  primaryButtonClass,
} from "../_components/ui";

type AdminRow = { id: number; email: string; fullname: string };

type UserRow = { id: string; email: string; created_at: string; role: string };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { error, saved } = await searchParams;
  const pool = getPool();

  const { rows: admins } = await pool.query<AdminRow>(
    "select id, email, fullname from admins order by fullname, email"
  );

  const { rows: users } = await pool.query<UserRow>(`
    SELECT u.id, u.email, u.created_at as created_at,
           CASE WHEN a.id IS NOT NULL THEN 'admin' ELSE 'student' END as role
    FROM users u
    LEFT JOIN admins a ON lower(trim(a.email)) = lower(u.email)
    ORDER BY u.created_at DESC
  `);

  return (
    <>
      <SectionHeader
        eyebrow="/ Admin / Users"
        title="Users and Roles"
        description="Anyone can register as a normal user. Dashboard access is granted only to emails listed below."
      />

      <Notice error={error} saved={saved} />

      <section className="mb-10 border border-admin-border bg-admin-panel p-6">
        <h2 className="mb-4 text-lg font-black uppercase tracking-tight text-admin-fg">
          Grant Dashboard Access
        </h2>
        <form action={grantAdmin} className="grid gap-4 md:grid-cols-[3fr_3fr_auto] md:items-end">
          <Field label="Email">
            <input
              name="email"
              type="email"
              required
              placeholder="bis22-admin@mubas.ac.mw"
              className={inputClass}
            />
          </Field>
          <Field label="Full name">
            <input name="fullname" placeholder="Optional" className={inputClass} />
          </Field>
          <button type="submit" className={primaryButtonClass}>
            Grant access
          </button>
        </form>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-admin-muted">
          Dashboard Access ({admins.length})
        </h2>
        <div className="overflow-x-auto border border-admin-border bg-admin-panel">
          <table className="w-full">
            <thead>
              <tr className="border-b border-admin-border bg-admin-panel">
                {["Email", "Full name", ""].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-admin-muted"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} className="border-b border-admin-border/60 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-admin-fg/80">{admin.email}</td>
                  <td className="px-4 py-3 text-sm text-admin-fg/70">{admin.fullname}</td>
                  <td className="px-4 py-3 text-right">
                    <form action={revokeAdmin}>
                      <input type="hidden" name="email" value={admin.email} />
                      <button type="submit" className={dangerButtonClass}>
                        Revoke
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-sm text-admin-muted">
                    No dashboard access granted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-admin-muted">
          Registered Users ({users.length})
        </h2>
        <div className="overflow-x-auto border border-admin-border bg-admin-panel">
          <table className="w-full">
            <thead>
              <tr className="border-b border-admin-border bg-admin-panel">
                {["Email", "Role", "Registered", ""].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-admin-muted"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-admin-border/60 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-admin-fg/80">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] ${
                        user.role === "admin"
                          ? "border-admin-accent/30 bg-admin-accent/20 text-admin-accent"
                          : "border-admin-border bg-admin-input text-admin-muted"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-admin-muted">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {user.role === "admin" ? (
                      <form action={revokeAdmin}>
                        <input type="hidden" name="email" value={user.email} />
                        <button type="submit" className={dangerButtonClass}>
                          Revoke
                        </button>
                      </form>
                    ) : (
                      <>
                        <form action={grantAdmin}>
                          <input type="hidden" name="email" value={user.email} />
                          <input type="hidden" name="fullname" value="" />
                          <button type="submit" className={primaryButtonClass}>
                            Make admin
                          </button>
                        </form>
                        <form action={deleteUser}>
                          <input type="hidden" name="email" value={user.email} />
                          <button type="submit" className={dangerButtonClass}>
                            Delete user
                          </button>
                        </form>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-admin-muted">
                    No registered users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
