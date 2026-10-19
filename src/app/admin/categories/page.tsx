import { getPool } from "@/lib/db";
import { createCategory, deleteCategory, updateCategory } from "../actions";
import {
  Field,
  Notice,
  SectionHeader,
  dangerButtonClass,
  inputClass,
  primaryButtonClass,
} from "../_components/ui";

type CategoryRow = {
  id: string;
  slug: string;
  title: string;
  blurb: string;
  sort_order: number;
  nominees: number;
};

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { error, saved } = await searchParams;

  const { rows: categories } = await getPool().query<CategoryRow>(`
    SELECT c.id, c.slug, c.title, c.blurb, c.sort_order,
           (SELECT COUNT(*)::int FROM nominees n WHERE n.category_id = c.id) as nominees
    FROM categories c
    ORDER BY c.sort_order, c.id
  `);

  return (
    <>
      <SectionHeader
        eyebrow="/ Admin / Categories"
        title="Categories"
        description="Create, rename, reorder or remove award categories. Deleting a category also removes its nominees and votes."
      />

      <Notice error={error} saved={saved} />

      <section className="mb-10 border border-admin-border bg-admin-panel p-6">
        <h2 className="mb-4 text-lg font-black uppercase tracking-tight text-admin-fg">
          Add a Category
        </h2>
        <form action={createCategory} className="grid gap-4 md:grid-cols-[2fr_3fr_auto_auto] md:items-end">
          <Field label="Title">
            <input name="title" required placeholder="Best Dressed" className={inputClass} />
          </Field>
          <Field label="Blurb">
            <input name="blurb" placeholder="Optional short description" className={inputClass} />
          </Field>
          <Field label="Order">
            <input
              name="sort_order"
              type="number"
              defaultValue={0}
              className={`${inputClass} w-24`}
            />
          </Field>
          <button type="submit" className={primaryButtonClass}>
            Add category
          </button>
        </form>
      </section>

      <div className="flex flex-col gap-4">
        {categories.map((category) => (
          <form
            key={category.id}
            action={updateCategory}
            className="grid gap-4 border border-admin-border bg-admin-panel p-6 md:grid-cols-[2fr_3fr_auto_auto] md:items-end"
          >
            <input type="hidden" name="id" value={category.id} />

            <Field label={`Title · ${category.slug}`}>
              <input name="title" required defaultValue={category.title} className={inputClass} />
            </Field>
            <Field label="Blurb">
              <input name="blurb" defaultValue={category.blurb} className={inputClass} />
            </Field>
            <Field label="Order">
              <input
                name="sort_order"
                type="number"
                defaultValue={category.sort_order}
                className={`${inputClass} w-24`}
              />
            </Field>

            <div className="flex items-center gap-2">
              <button type="submit" className={primaryButtonClass}>
                Save
              </button>
              <button
                type="submit"
                formAction={deleteCategory}
                className={dangerButtonClass}
                title="Deletes the category, its nominees and their votes"
              >
                Delete
              </button>
            </div>

            <p className="md:col-span-4 font-mono text-[10px] uppercase tracking-[0.2em] text-admin-muted">
              {category.nominees} nominee{category.nominees === 1 ? "" : "s"}
            </p>
          </form>
        ))}
        {categories.length === 0 && (
          <p className="border border-admin-border bg-admin-panel p-6 text-sm text-admin-muted">
            No categories yet.
          </p>
        )}
      </div>
    </>
  );
}
