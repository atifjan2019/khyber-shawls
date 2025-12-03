'use client'

import Image from "next/image"
import { ProductCard } from "@/components/product-card"
import type { SerializedProduct, SerializedCategory } from "@/lib/products"

type CategoryViewProps = {
  category: SerializedCategory
  products: SerializedProduct[]
}

export function CategoryView({ category, products }: CategoryViewProps) {
  const gridCols = category.uiConfig?.gridColumns || { mobile: 2, tablet: 3, desktop: 4 }
  
  // Extract first section to show before products
  const firstSection = category.sections && category.sections.length > 0 ? category.sections[0] : null
  const remainingSections = category.sections && category.sections.length > 1 ? category.sections.slice(1) : []

  return (
    <div className="min-h-screen">
      {/* Category Header - Shows which category user is viewing */}
      <section className="border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-amber-700 mb-2">
              Explore Our Collection
            </p>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {category.name}
            </h1>
            {category.summary && (
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                {category.summary}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Section 1 - Before Products - Text Left, Image Right */}
      {firstSection && firstSection.title && firstSection.description && (
        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            {/* Text Content on Left */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {firstSection.title}
              </h2>
              <p className="text-lg leading-relaxed text-gray-600">
                {firstSection.description}
              </p>
            </div>

            {/* Image on Right */}
            {firstSection.image?.url && (
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image
                  src={firstSection.image.url}
                  alt={firstSection.image.alt || firstSection.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Products Grid Section */}
      <section className="mx-auto max-w-7xl px-0 py-12">
        <div className="mb-8 flex items-center justify-between px-2 sm:px-0">
          <h2 className="text-2xl font-semibold text-gray-900">
            {category.name}
          </h2>
          <p className="text-sm text-gray-600">
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-600">No products available in this category yet.</p>
          </div>
        ) : (
          <div 
            className="grid gap-1 sm:gap-4 md:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Sections 2 & 3 - Below Products */}
      {remainingSections.length > 0 && (
        <div className="py-16">
          {remainingSections.map((section, index) => {
            // Skip incomplete sections
            if (!section.title || !section.description) return null;

            // Section 2 (index 0): Image Left, Text Right
            // Section 3 (index 1): Image Right, Text Left
            const imageOnRight = index % 2 === 1;

            return (
              <section 
                key={index + 1}
                className={`mx-auto max-w-7xl px-6 ${index > 0 ? 'mt-20' : ''}`}
              >
                <div className={`grid gap-8 lg:grid-cols-2 lg:gap-12 items-center ${imageOnRight ? 'lg:grid-flow-dense' : ''}`}>
                  {/* Image */}
                  {section.image?.url && (
                    <div className={`relative aspect-[4/3] overflow-hidden rounded-2xl ${imageOnRight ? 'lg:col-start-2' : ''}`}>
                      <Image
                        src={section.image.url}
                        alt={section.image.alt || section.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Text Content */}
                  <div className={`space-y-4 ${imageOnRight ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                      {section.title}
                    </h2>
                    <p className="text-lg leading-relaxed text-gray-600">
                      {section.description}
                    </p>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  )
}
