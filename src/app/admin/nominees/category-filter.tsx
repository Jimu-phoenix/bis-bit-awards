"use client";

import { useState } from "react";

type Category = { id: string; title: string };

interface CategoryFilterProps {
  categories: Category[];
  onChange: (categoryId: string) => void;
  selectedCategoryId: string;
}

export default function CategoryFilter({
  categories,
  onChange,
  selectedCategoryId,
}: CategoryFilterProps) {
  return (
    <div className="mb-6">
      <label
        htmlFor="category-filter"
        className="block font-mono text-xs uppercase tracking-[0.3em] text-emerald-300 mb-2"
      >
        Filter by Category
      </label>
      <select
        id="category-filter"
        value={selectedCategoryId}
        onChange={(e) => onChange(e.target.value)}
        className="w-full max-w-xs rounded-none border border-white/20 bg-black/40 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-emerald-300 focus:bg-black/60"
      >
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.title}
          </option>
        ))}
      </select>
    </div>
  );
}