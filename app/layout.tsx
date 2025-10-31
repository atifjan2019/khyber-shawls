import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { CartProvider } from "@/components/providers/cart-provider"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { SpeedInsights } from "@vercel/speed-insights/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export async function generateMetadata(): Promise<Metadata> {
  // Try to fetch settings, but don't fail the build if database is unavailable
  let settings = null;
  try {
    settings = await prisma.settings.findFirst()
    console.log("Settings from generateMetadata:", settings);
  } catch (error) {
    console.log("Could not fetch settings during build:", error);
  }

  const defaultDescription = "Discover authentic, handcrafted shawls from the historic Khyber region. Each piece tells a story of tradition and artistry.";

  return {
    metadataBase: new URL(
      process.env.NODE_ENV === "production" ? "https://khybershawls.store" : "http://localhost:3000"
    ),
    title: {
      default: settings?.websiteName || "Khyber Shawls",
      template: `%s | ${settings?.websiteName || "Khyber Shawls"}`,
    },
    description: defaultDescription,
    openGraph: {
      title: settings?.websiteName || "Khyber Shawls",
      description: defaultDescription,
      url: "/",
      siteName: settings?.websiteName || "Khyber Shawls",
      images: [
        {
          url: settings?.websiteLogoUrl || "/logo.png",
          width: 1200,
          height: 630,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: settings?.websiteName || "Khyber Shawls",
      description: defaultDescription,
      images: [settings?.websiteLogoUrl || "/logo.png"],
    },
    icons: {
      icon: settings?.websiteFaviconUrl || "/favicon.ico",
      shortcut: settings?.websiteFaviconUrl || "/favicon.ico",
      apple: settings?.websiteFaviconUrl || "/favicon.ico",
    },
  }
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
            <div className="mx-auto px-6 pb-12">{children}</div>
          </main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  )
}
