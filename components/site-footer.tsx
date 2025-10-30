'use client'

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Mail, Phone, MapPin, Send } from "lucide-react"

export function SiteFooter() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage("")

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Thank you for subscribing!")
        setEmail("")
      } else {
        setMessage(data.error || "Failed to subscribe. Please try again.")
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200">
      <div className="mx-auto max-w-[1600px] px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/logo.png"
                alt="Khyber Shawls"
                width={160}
                height={50}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              Each piece is handcrafted in small batches. We honor the artisans of the Khyber region through ethical sourcing and slow fashion.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-700" />
                <span>Peshawar, Pakistan</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0 text-amber-700" />
                <a href="tel:+923001234567" className="hover:text-amber-700 transition">
                  +92 300 1234567
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0 text-amber-700" />
                <a href="mailto:info@khybershawls.com" className="hover:text-amber-700 transition">
                  info@khybershawls.com
                </a>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-900 mb-3">Follow Us</p>
              <div className="flex items-center gap-3">
                <a
                  href="https://facebook.com/khybershawls"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-amber-700 text-white flex items-center justify-center hover:bg-amber-800 transition"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://instagram.com/khybershawls"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-amber-700 text-white flex items-center justify-center hover:bg-amber-800 transition"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://wa.me/923001234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-amber-700 text-white flex items-center justify-center hover:bg-amber-800 transition"
                  aria-label="WhatsApp"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
                <a
                  href="https://pinterest.com/khybershawls"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-amber-700 text-white flex items-center justify-center hover:bg-amber-800 transition"
                  aria-label="Pinterest"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0a12 12 0 00-4.37 23.17c-.18-1.67-.03-3.68.43-5.5l3.23-13.66s-.79-1.58-.79-3.92c0-3.67 2.13-6.41 4.78-6.41 2.25 0 3.34 1.69 3.34 3.72 0 2.27-1.45 5.66-2.19 8.8-.62 2.63 1.32 4.77 3.92 4.77 4.7 0 7.86-6.03 7.86-13.17 0-5.42-3.66-9.48-10.32-9.48-7.51 0-12.11 5.6-12.11 11.83 0 2.15.63 3.66 1.63 4.83.45.53.52.74.35 1.35-.11.45-.38 1.49-.49 1.91-.15.57-.62.78-1.14.57-3.18-1.3-4.66-4.78-4.66-8.7 0-6.46 5.45-14.2 16.23-14.2 8.64 0 14.31 6.25 14.31 12.99 0 8.87-4.93 15.56-12.19 15.56-2.45 0-4.75-1.32-5.54-2.82l-1.39 5.46c-.5 1.92-1.5 3.85-2.39 5.32A12 12 0 0012 24a12 12 0 000-24z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Shop</h3>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li>
                <Link href="/shop" className="hover:text-amber-700 transition">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/category/men-shawls" className="hover:text-amber-700 transition">
                  Men Shawls
                </Link>
              </li>
              <li>
                <Link href="/category/women-shawls" className="hover:text-amber-700 transition">
                  Women Shawls
                </Link>
              </li>
              <li>
                <Link href="/category/kids-shawls" className="hover:text-amber-700 transition">
                  Kids Shawls
                </Link>
              </li>
              <li>
                <Link href="/collections" className="hover:text-amber-700 transition">
                  Collections
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Customer Service</h3>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li>
                <Link href="/track-order" className="hover:text-amber-700 transition">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-amber-700 transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" className="hover:text-amber-700 transition">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/returns" className="hover:text-amber-700 transition">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-700 transition">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* About & Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">About & Legal</h3>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li>
                <Link href="/about" className="hover:text-amber-700 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/journal" className="hover:text-amber-700 transition">
                  Journal
                </Link>
              </li>
              <li>
                <Link href="/policies/privacy" className="hover:text-amber-700 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/terms" className="hover:text-amber-700 transition">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-300 pt-8 mb-8">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Subscribe to Our Newsletter
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Get updates on new arrivals, exclusive offers, and artisan stories
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition disabled:bg-gray-100"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-amber-700 text-white rounded-lg font-semibold hover:bg-amber-800 disabled:bg-gray-400 transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Subscribe
                  </>
                )}
              </button>
            </form>
            {message && (
              <p className={`mt-3 text-sm ${message.includes("Thank you") ? "text-green-600" : "text-red-600"}`}>
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-300 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <p className="text-center md:text-left">
            &copy; {new Date().getFullYear()} Khyber Shawls. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span>Crafted with love in Pakistan</span>
            <span className="hidden md:inline">•</span>
            <span>100% Handmade</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
