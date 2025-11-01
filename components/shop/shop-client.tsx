'use client'

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"

import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import type { SerializedCategory, SerializedProduct } from "@/lib/products"

type ShopClientProps = {
  products: SerializedProduct[]
  categories: SerializedCategory[]
}

export function ShopClient({ products, categories }: ShopClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("featured")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.categorySlug === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.description?.toLowerCase().includes(query)
      )
    }

    // Sort products
    const sorted = [...filtered]
    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
        break
      case "price-high":
        sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
        break
      case "name":
        sorted.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "featured":
      default:
        // Keep original order for featured
        break
    }

    return sorted
  }, [products, selectedCategory, sortBy, searchQuery])

  return (
    <div className="mx-auto max-w-[1600px] px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-10">
      {/* Header */}
      <div className="mb-6 sm:mb-8 md:mb-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Shop All Products</h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600">Discover our complete collection of handcrafted Kashmiri shawls</p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 sm:mb-8 flex flex-col gap-3 sm:gap-4 bg-white p-3 sm:p-4 md:p-6 rounded-lg md:rounded-xl shadow-sm border border-gray-100">
        {/* Search */}
        <div className="w-full">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-gray-300 focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 outline-none transition"
          />
        </div>

        {/* Category and Sort Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Category Filter */}
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-gray-300 focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 outline-none transition bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-gray-300 focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 outline-none transition bg-white"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 sm:mb-6">
        <p className="text-xs sm:text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredAndSortedProducts.length}</span> of <span className="font-semibold text-gray-900">{products.length}</span> products
          {selectedCategory !== "all" && (
            <span> in <span className="font-semibold text-amber-700">{categories.find(c => c.slug === selectedCategory)?.name}</span></span>
          )}
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
        {filteredAndSortedProducts.length === 0 ? (
          <div className="col-span-full text-center py-12 sm:py-16 md:py-20">
            <p className="text-base sm:text-lg text-gray-500 mb-3 sm:mb-4">No products found matching your criteria.</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedCategory("all")
                setSearchQuery("")
                setSortBy("featured")
              }}
              className="text-sm sm:text-base"
            >
              Clear filters
            </Button>
          </div>
        ) : (
          filteredAndSortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>

      {/* Category Showcase */}
      <section className="mt-20 space-y-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse by Category</h2>
          <p className="text-gray-600">Explore our curated collections</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group relative overflow-hidden rounded-3xl shadow-lg transition hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="relative h-64 w-full overflow-hidden">
                {category.featuredImageUrl ? (
                  <Image
                    src={category.featuredImageUrl}
                    alt={category.featuredImageAlt ?? `${category.name} collection`}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-amber-600 to-amber-900">
                    <span className="text-white text-2xl font-bold">{category.name}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-xs uppercase tracking-[0.2em] mb-2 opacity-90">
                  {category.productCount} styles
                </p>
                <h3 className="text-2xl font-bold mb-2 group-hover:text-amber-300 transition">
                  {category.name}
                </h3>
                {category.summary && (
                  <p className="text-sm opacity-90 mb-3 line-clamp-2">
                    {category.summary}
                  </p>
                )}
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-amber-300">
                  Shop Collection →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
