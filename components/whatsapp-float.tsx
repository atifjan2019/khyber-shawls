import Link from "next/link"
import { MessageCircle } from "lucide-react"

const whatsappHref = "https://wa.me/9230187868666?text=Salaam%20Khyber%20Shawls%20team"

export function WhatsAppFloat() {
  return (
    <Link
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-4 z-50 flex items-center gap-3 rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-xl transition hover:bg-emerald-400 sm:bottom-8 sm:right-8"
    >
      <MessageCircle className="h-5 w-5" />
      WhatsApp us
    </Link>
  )
}
