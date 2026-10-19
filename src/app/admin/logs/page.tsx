import { getPool } from "@/lib/db";
import { SectionHeader } from "../_components/ui";

type LogRow = {
  id: string;
  user_email: string;
  action: string;
  details: string;
  created_at: string;
};

export default async function AdminLogsPage() {
  const { rows: logs } = await getPool().query<LogRow>(
    `select id, user_email, action, details, created_at
     from system_logs
     order by created_at desc, id desc
     limit 300`
  );

  return (
    <>
      <SectionHeader
        eyebrow="/ Admin / Logs"
        title="System Logs"
        description="Every category, nominee and role change made from the dashboard, with the admin's email and timestamp."
      />

      <div className="overflow-x-auto border border-admin-border bg-admin-panel">
        <table className="w-full">
          <thead>
            <tr className="border-b border-admin-border bg-admin-panel">
              {["Time", "Admin", "Action", "Details"].map((heading) => (
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
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-admin-border/60 last:border-0">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-admin-muted">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="max-w-[220px] truncate px-4 py-3 font-mono text-xs text-admin-fg/80">
                  {log.user_email}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex border border-admin-border bg-admin-input px-2 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-admin-accent">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-admin-fg/70">{log.details}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-admin-muted">
                  No actions logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
