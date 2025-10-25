import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { CartProvider } from "@/components/providers/cart-provider"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { getCurrentUser } from "@/lib/auth"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://khybershawls.com"),
  title: {
    default: "Khyber Shawls | Luxury Kashmiri Shawls Online",
    template: "%s | Khyber Shawls",
  },
  description:
    "Shop handcrafted Kashmiri shawls, scarves, and wraps made from the finest Pashmina for discerning customers worldwide.",
  keywords: [
    "Kashmiri shawls",
    "Pashmina",
    "luxury shawls",
    "Khyber Shawls",
    "handcrafted textiles",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://khybershawls.com",
    title: "Khyber Shawls | Luxury Kashmiri Shawls Online",
    description:
      "Discover heirloom-quality Kashmiri shawls and wraps, sustainably sourced from artisans in the Khyber region.",
    images: [
      {
        url: "/hero-shawl.svg",
        width: 1200,
        height: 630,
        alt: "Khyber Shawls hero imagery featuring handcrafted textiles",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Khyber Shawls | Luxury Kashmiri Shawls Online",
    description:
      "Elevate your wardrobe with premium handcrafted shawls sourced from Khyber artisans.",
    images: ["/hero-shawl.svg"],
  },
  alternates: {
    canonical: "/",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser()

  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col bg-background antialiased`}
      >
        <CartProvider>
          <SiteHeader user={user} />
          <main className="flex-1">
            <div className="mx-auto max-w-6xl px-6 pb-12">{children}</div>
          </main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
