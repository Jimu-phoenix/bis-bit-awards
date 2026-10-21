import { getPool } from "@/lib/db";
import { createNominee, deleteNominee, updateNominee } from "../actions";
import {
  Field,
  Notice,
  SectionHeader,
  dangerButtonClass,
  inputClass,
  primaryButtonClass,
} from "../_components/ui";

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

      <div className="flex flex-col gap-4">
        {categories.map((category) => {
          const categoryNominees = nominees.filter((n) => n.category_id === category.id);
          return (
            <section key={category.id} className="space-y-4">
              <h3 className="text-lg font-black uppercase tracking-tight text-admin-fg border-b border-admin-border pb-2">
                {category.title}
              </h3>
              {categoryNominees.length === 0 ? (
                <p className="border border-admin-border bg-admin-panel p-6 text-sm text-admin-muted">
                  No nominees in this category.
                </p>
              ) : (
                categoryNominees.map((nominee) => (
                  <form
                    key={nominee.id}
                    action={updateNominee}
                    className="border border-admin-border bg-admin-panel p-6"
                  >
                    <input type="hidden" name="id" value={nominee.id} />

                    <div className="grid gap-4 md:grid-cols-4 md:items-end mb-4">
                      <Field label="Name">
                        <input name="name" required defaultValue={nominee.name} className={inputClass} />
                      </Field>
                      <Field label="Category">
                        <select
                          name="category_id"
                          required
                          defaultValue={nominee.category_id}
                          className={inputClass}
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id} className="bg-admin-bg text-admin-fg">
                              {cat.title}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Blurb">
                        <input name="blurb" defaultValue={nominee.blurb} className={`${inputClass} w-48`} />
                      </Field>
                      <Field label="Seed" className="w-20">
                        <input
                          name="seed"
                          type="number"
                          defaultValue={nominee.seed}
                          min={0}
                          className={inputClass}
                        />
                      </Field>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-end gap-2">
                        <button type="submit" className={primaryButtonClass}>
                          Save
                        </button>
                        <button
                          type="submit"
                          formAction={deleteNominee}
                          className={dangerButtonClass}
                          title="Deletes the nominee and its votes"
                        >
                          Delete
                        </button>
                      </div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-admin-muted">
                        {nominee.category_title} &middot; {nominee.votes} vote
                        {nominee.votes === 1 ? "" : "s"} &middot; Seed: {nominee.seed}
                      </p>
                    </div>
                  </form>
                ))
              )}
            </section>
          );
        })}
        {nominees.length === 0 && (
          <p className="border border-admin-border bg-admin-panel p-6 text-sm text-admin-muted">
            No nominees yet.
          </p>
        )}
      </div>
    </>
  );
}
