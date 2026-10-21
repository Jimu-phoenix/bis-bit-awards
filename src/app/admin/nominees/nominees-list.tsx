"use client";

import { useState, useMemo, useEffect } from "react";
import { updateNominee, deleteNominee, bulkUpdateNominees } from "../actions";
import {
  Field,
  dangerButtonClass,
  inputClass,
  primaryButtonClass,
  ghostButtonClass,
} from "../_components/ui";
import CategoryFilter from "./category-filter";

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

type NomineeFormData = {
  id: string;
  name: string;
  blurb: string;
  seed: number;
  category_id: string;
  category_title: string;
  votes: number;
};

interface NomineesListProps {
  categories: Category[];
  nominees: NomineeRow[];
}

export default function NomineesList({ categories, nominees: initialNominees }: NomineesListProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [formData, setFormData] = useState<Record<string, NomineeFormData>>({});
  const [savingCategory, setSavingCategory] = useState<string | null>(null);

  // Initialize form data from initial nominees
  useEffect(() => {
    const initial: Record<string, NomineeFormData> = {};
    initialNominees.forEach((n) => {
      initial[n.id] = {
        id: n.id,
        name: n.name,
        blurb: n.blurb ?? "",
        seed: n.seed ?? 0,
        category_id: n.category_id,
        category_title: n.category_title,
        votes: n.votes,
      };
    });
    setFormData(initial);
  }, [initialNominees]);

  const filteredNominees = useMemo(() => {
    if (!selectedCategoryId) return initialNominees;
    return initialNominees.filter((n) => n.category_id === selectedCategoryId);
  }, [initialNominees, selectedCategoryId]);

  const categoriesWithNominees = useMemo(() => {
    const filtered = filteredNominees;
    return categories.map((category) => ({
      ...category,
      nominees: filtered.filter((n) => n.category_id === category.id),
    }));
  }, [categories, filteredNominees]);

  const handleChange = (nomineeId: string, field: keyof NomineeFormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [nomineeId]: { ...prev[nomineeId], [field]: value },
    }));
  };

  const handleSaveCategory = async (categoryId: string) => {
    const categoryNominees = formData[categoryId] ? [formData[categoryId]] : [];
    // Actually get all nominees for this category
    const nomineesToSave = initialNominees
      .filter((n) => n.category_id === categoryId)
      .map((n) => ({
        id: n.id,
        name: formData[n.id]?.name ?? n.name,
        blurb: formData[n.id]?.blurb ?? n.blurb ?? "",
        seed: formData[n.id]?.seed ?? n.seed ?? 0,
        category_id: n.category_id,
      }));

    if (nomineesToSave.length === 0) return;

    setSavingCategory(categoryId);
    try {
      const formData_ = new FormData();
      formData_.append("category_id", categoryId);
      formData_.append("nominees", JSON.stringify(nomineesToSave));
      await bulkUpdateNominees(formData_);
    } finally {
      setSavingCategory(null);
    }
  };

  const handleIndividualSave = async (nomineeId: string) => {
    const data = formData[nomineeId];
    if (!data) return;

    const formData_ = new FormData();
    formData_.append("id", data.id);
    formData_.append("name", data.name);
    formData_.append("category_id", data.category_id);
    formData_.append("blurb", data.blurb);
    formData_.append("seed", String(data.seed));

    await updateNominee(formData_);
  };

  return (
    <div className="flex flex-col gap-4">
      <CategoryFilter
        categories={categories}
        onChange={setSelectedCategoryId}
        selectedCategoryId={selectedCategoryId}
      />

      {categoriesWithNominees.map((category) => {
        const categoryNominees = category.nominees;
        if (categoryNominees.length === 0 && selectedCategoryId && selectedCategoryId !== category.id) {
          return null;
        }
        return (
          <section key={category.id} className="space-y-4">
            {selectedCategoryId === "" || selectedCategoryId === category.id ? (
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black uppercase tracking-tight text-admin-fg border-b border-admin-border pb-2 flex-1">
                  {category.title}
                </h3>
{categoryNominees.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleSaveCategory(category.id)}
                  disabled={savingCategory === category.id}
                  className={ghostButtonClass}
                >
                  {savingCategory === category.id ? "Saving..." : "Save Category"}
                </button>
              )}
              </div>
            ) : null}
            {categoryNominees.length === 0 ? (
              <p className="border border-admin-border bg-admin-panel p-6 text-sm text-admin-muted">
                No nominees in this category.
              </p>
            ) : (
              categoryNominees.map((nominee) => {
                const data = formData[nominee.id] || {
                  id: nominee.id,
                  name: nominee.name,
                  blurb: nominee.blurb ?? "",
                  seed: nominee.seed ?? 0,
                  category_id: nominee.category_id,
                  category_title: nominee.category_title,
                  votes: nominee.votes,
                };
                return (
                  <form
                    key={nominee.id}
                    action={async (fd: FormData) => {
                      // Individual save handled by handleIndividualSave
                      fd.append("id", nominee.id);
                      fd.append("name", data.name);
                      fd.append("category_id", data.category_id);
                      fd.append("blurb", data.blurb);
                      fd.append("seed", String(data.seed));
                      await updateNominee(fd);
                    }}
                    className="border border-admin-border bg-admin-panel p-6"
                  >
                    <input type="hidden" name="id" value={nominee.id} />

                    <div className="grid gap-4 md:grid-cols-4 md:items-end mb-4">
                      <Field label="Name">
                        <input
                          name="name"
                          required
                          value={data.name}
                          onChange={(e) => handleChange(nominee.id, "name", e.target.value)}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Category">
                        <select
                          name="category_id"
                          required
                          value={data.category_id}
                          onChange={(e) => handleChange(nominee.id, "category_id", e.target.value)}
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
                        <input
                          name="blurb"
                          value={data.blurb}
                          onChange={(e) => handleChange(nominee.id, "blurb", e.target.value)}
                          className={`${inputClass} w-48`}
                        />
                      </Field>
                      <Field label="Seed" className="w-20">
                        <input
                          name="seed"
                          type="number"
                          value={data.seed}
                          onChange={(e) => handleChange(nominee.id, "seed", parseInt(e.target.value) || 0)}
                          min={0}
                          className={inputClass}
                        />
                      </Field>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-end gap-2">
                        <button type="button" onClick={() => handleIndividualSave(nominee.id)} className={primaryButtonClass}>
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
                        {data.category_title} &middot; {data.votes} vote
                        {data.votes === 1 ? "" : "s"} &middot; Seed: {data.seed}
                      </p>
                    </div>
                  </form>
                );
              })
            )}
          </section>
        );
      })}

      {initialNominees.length === 0 && (
        <p className="border border-admin-border bg-admin-panel p-6 text-sm text-admin-muted">
          No nominees yet.
        </p>
      )}
    </div>
  );
}