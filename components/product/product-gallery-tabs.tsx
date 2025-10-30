"use client"

import { useState } from "react"
import Image from "next/image"
import { CheckCircle2, ShieldCheck, Truck } from "lucide-react"

type GalleryItem = {
  id: string
  url: string
  alt: string | null
}

type TrustSignal = {
  iconName: "truck" | "shield" | "check"
  title: string
  description: string
}

type ProductGalleryTabsProps = {
  mainImageUrl: string
  mainImageAlt: string
  galleryItems: GalleryItem[]
  productTitle: string
  productDescription: string | null
  productDetails: string | null
  careInstructions: string | null
  categoryName: string | null
  formattedPrice: string
  trustSignals: TrustSignal[]
  categorySlug: string | null
  slug: string
}

const iconMap = {
  truck: Truck,
  shield: ShieldCheck,
  check: CheckCircle2,
}

export function ProductGalleryTabs({
  mainImageUrl,
  mainImageAlt,
  galleryItems,
  productTitle,
  productDescription,
  productDetails,
  careInstructions,
  categoryName,
  formattedPrice,
  trustSignals,
  categorySlug,
  slug,
}: ProductGalleryTabsProps) {
  const [activeImage, setActiveImage] = useState(mainImageUrl)
  const [activeImageAlt, setActiveImageAlt] = useState(mainImageAlt)
  const [activeTab, setActiveTab] = useState<"description" | "details" | "care">("description")

  const allImages = [
    { id: "main", url: mainImageUrl, alt: mainImageAlt },
    ...galleryItems.slice(0, 4),
  ]

  return (
    <>
      {/* Two-Column Layout: Gallery (60%) + Product Info (40%) */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
        {/* Left side - Gallery (60%) */}
        <div className="w-full lg:w-[60%]">
          <div className="flex gap-4">
            {/* Thumbnails - Vertical on Left */}
            {allImages.length > 1 && (
              <div className="flex flex-col gap-3 w-20">
                {allImages.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveImage(item.url)
                      setActiveImageAlt(item.alt ?? productTitle)
                    }}
                    className={`relative aspect-square w-full overflow-hidden rounded-md bg-muted border transition cursor-pointer ${
                      activeImage === item.url
                        ? "border-orange-700 ring-2 ring-orange-700/40"
                        : "border-gray-200 hover:border-orange-700/40"
                    }`}
                  >
                    <Image
                      src={item.url}
                      alt={item.alt ?? productTitle}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="flex-1">
              <div className="relative w-full overflow-hidden rounded-md bg-gray-50">
                <Image
                  src={activeImage}
                  alt={activeImageAlt}
                  width={800}
                  height={800}
                  sizes="(min-width:1024px) 60vw, 100vw"
                  priority
                  className="object-contain w-full h-auto"
                  style={{ aspectRatio: "1/1" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Product Info (40%) */}
        <div className="w-full lg:w-[40%] bg-white p-8 rounded-md shadow-sm border border-gray-100">
          <p className="text-xs uppercase tracking-widest text-orange-700 mb-2">
            {categoryName ?? "Signature Collection"}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
            {productTitle}
          </h1>
          <p className="text-2xl font-semibold text-gray-800 mb-6">
            {formattedPrice}
          </p>

          <div className="flex flex-col gap-3 mb-6">
            <button className="w-full bg-orange-700 text-white py-3.5 rounded-md font-semibold hover:bg-orange-800 transition">
              Add to Cart
            </button>
            <button className="w-full border-2 border-orange-700 text-orange-700 py-3.5 rounded-md font-semibold hover:bg-orange-50 transition">
              Buy it Now
            </button>
          </div>

          <ul className="space-y-3 text-sm text-gray-600">
            {trustSignals.map(({ iconName, title, description }) => {
              const Icon = iconMap[iconName]
              return (
                <li key={title} className="flex items-start gap-3">
                  <Icon className="w-5 h-5 text-orange-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">{title}</p>
                    <p className="text-xs text-gray-600">{description}</p>
                  </div>
                </li>
              )
            })}
          </ul>

          {/* Breadcrumb */}
          <nav className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-500" aria-label="Breadcrumb">
            <div className="flex flex-wrap items-center gap-2">
              <a href="/" className="hover:text-gray-900">Home</a>
              <span>/</span>
              <a href="/products" className="hover:text-gray-900">Products</a>
              {categorySlug && categoryName && (
                <>
                  <span>/</span>
                  <a href={`/category/${categorySlug}`} className="hover:text-gray-900">
                    {categoryName}
                  </a>
                </>
              )}
              <span>/</span>
              <span className="text-gray-900 font-medium">{productTitle}</span>
            </div>
          </nav>
        </div>
      </div>

      {/* Full-Width Description Tabs Below */}
      <div className="mt-10 border-t border-gray-200 pt-8">
        {/* Tab Headers */}
        <div className="flex gap-8 border-b border-gray-200 text-sm font-semibold text-gray-700">
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-3 border-b-2 transition ${
              activeTab === "description"
                ? "border-orange-700 text-orange-700"
                : "border-transparent hover:text-gray-900"
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`pb-3 border-b-2 transition ${
              activeTab === "details"
                ? "border-orange-700 text-orange-700"
                : "border-transparent hover:text-gray-900"
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab("care")}
            className={`pb-3 border-b-2 transition ${
              activeTab === "care"
                ? "border-orange-700 text-orange-700"
                : "border-transparent hover:text-gray-900"
            }`}
          >
            Care
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6 text-gray-700">
          {activeTab === "description" && (
            <div className="space-y-3 max-w-4xl">
              <h3 className="text-xl font-semibold text-gray-900">Product Description</h3>
              <div className="text-base leading-relaxed whitespace-pre-wrap">
                {productDescription || "This premium handmade shawl is crafted with care and attention to detail. Each piece represents the finest tradition of Kashmiri craftsmanship, combining heritage techniques with contemporary design sensibilities."}
              </div>
            </div>
          )}

          {activeTab === "details" && (
            <div className="space-y-3 max-w-4xl">
              <h3 className="text-xl font-semibold text-gray-900">Product Details</h3>
              {productDetails ? (
                <div className="text-base leading-relaxed whitespace-pre-wrap">
                  {productDetails}
                </div>
              ) : (
                <ul className="space-y-2 text-base">
                  <li>• <strong>Material:</strong> Handcrafted with premium pashmina wool</li>
                  <li>• <strong>Dyes:</strong> Natural dyes sourced from organic materials</li>
                  <li>• <strong>Edition:</strong> Limited edition design</li>
                  <li>• <strong>Origin:</strong> Handwoven by artisan cooperatives</li>
                  <li>• <strong>Certification:</strong> Includes authenticity certificate</li>
                  <li>• <strong>Dimensions:</strong> Generous drape suitable for all occasions</li>
                </ul>
              )}
            </div>
          )}

          {activeTab === "care" && (
            <div className="space-y-3 max-w-4xl">
              <h3 className="text-xl font-semibold text-gray-900">Care Instructions</h3>
              {careInstructions ? (
                <div className="text-base leading-relaxed whitespace-pre-wrap">
                  {careInstructions}
                </div>
              ) : (
                <>
                  <p className="text-base leading-relaxed mb-3">
                    To maintain the beauty and longevity of your handmade shawl, please follow these care guidelines:
                  </p>
                  <ul className="space-y-2 text-base">
                    <li>• <strong>Cleaning:</strong> Dry clean only for best results</li>
                    <li>• <strong>Storage:</strong> Store folded in a breathable cotton bag</li>
                    <li>• <strong>Light:</strong> Avoid direct sunlight when storing to prevent fading</li>
                    <li>• <strong>Protection:</strong> Use cedar sachets to prevent moths</li>
                    <li>• <strong>Wrinkles:</strong> Steam gently to remove creases (never iron directly)</li>
                    <li>• <strong>Handling:</strong> Remove jewelry before wearing to avoid snags</li>
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
