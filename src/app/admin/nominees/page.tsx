import { getPool } from "@/lib/db";
import { createNominee } from "../actions";
import {
  Field,
  Notice,
  SectionHeader,
  dangerButtonClass,
  inputClass,
  primaryButtonClass,
} from "../_components/ui";
import NomineesList from "./nominees-list";

type Category = { id: string; title: string };

type NomineeRow = {
  id: string;
  name: string;
  blurb: string;
  sort_order: number;
  seed: number;
  category_id: string;
  category_title: string;
  votes: number;
};

export default async function AdminNomineesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { error, saved } = await searchParams;
  const pool = getPool();

  const { rows: categories } = await pool.query<Category>(
    "select id, title from categories order by sort_order, id"
  );

  const { rows: nominees } = await pool.query<NomineeRow>(`
    SELECT n.id, n.name, n.blurb, n.sort_order, n.seed, n.category_id,
           c.title as category_title,
           (SELECT COUNT(*)::int FROM votes v WHERE v.nominee_id = n.id) as votes
    FROM nominees n
    JOIN categories c ON c.id = n.category_id
    ORDER BY c.sort_order, n.sort_order, n.id
  `);

  return (
    <>
      <SectionHeader
        eyebrow="/ Admin / Nominees"
        title="Nominees"
        description="Add nominees to a category and edit or remove existing ones. Deleting a nominee also removes its votes."
      />

      <Notice error={error} saved={saved} />

      <section className="mb-10 border border-admin-border bg-admin-panel p-6">
        <h2 className="mb-4 text-lg font-black uppercase tracking-tight text-admin-fg">
          Add a Nominee
        </h2>
        <form action={createNominee} className="border border-admin-border bg-admin-panel p-6">
          <div className="grid gap-4 md:grid-cols-4 md:items-end mb-4">
            <Field label="Name">
              <input name="name" required placeholder="Jane Doe" className={inputClass} />
            </Field>
            <Field label="Category">
              <select name="category_id" required defaultValue="" className={inputClass}>
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id} className="bg-admin-bg text-admin-fg">
                    {category.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Blurb">
              <input name="blurb" placeholder="Optional" className={`${inputClass} w-48`} />
            </Field>
            <Field label="Seed" className="w-20">
              <input name="seed" type="number" defaultValue={0} min={0} className={inputClass} />
            </Field>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-end gap-2">
              <button type="submit" className={primaryButtonClass}>
                Add
              </button>
            </div>
          </div>
        </form>
      </section>

      <NomineesList categories={categories} nominees={nominees} />
    </>
  );
}
