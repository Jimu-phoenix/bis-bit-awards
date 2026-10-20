"use client";

import { useState } from "react";

type Category = {
  id: string;
  slug: string;
  title: string;
  blurb: string;
  sort_order: number;
};

export default function CategorySelector({ categories }: { categories: Category[] }) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  return (
    <div>
      <label
        htmlFor="category"
        className="block font-mono text-xs uppercase tracking-[0.3em] text-emerald-300 mb-2"
      >
        Category
      </label>
      <select
        name="categoryId"
        id="category"
        required
        onChange={(e) => {
          const cat = categories.find((c) => c.id === e.target.value);
          setSelectedCategory(cat ?? null);
        }}
        className="w-full rounded-none border border-white/20 bg-black/40 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-emerald-300 focus:bg-black/60"
      >
        <option value="" disabled selected>
          Select a category
        </option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.title}
          </option>
        ))}
      </select>

      {selectedCategory && selectedCategory.blurb && (
        <p className="mt-3 text-sm text-white/60 italic">{selectedCategory.blurb}</p>
      )}
    </div>
  );
}