
import Image from "next/image"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-24 relative overflow-hidden">
      {/* Decorative background pattern */}

      <div className="relative w-full max-w-lg flex flex-col items-center">
        <Image
          src="/hero-shawl.svg"
          alt="Lost in the shawls"
          width={340}
          height={340}
          className="mx-auto drop-shadow-2xl animate-float"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[7rem] font-extrabold select-none bg-gradient-to-br from-amber-400 via-yellow-100 to-amber-700 bg-clip-text text-transparent drop-shadow-[0_2px_16px_rgba(251,191,36,0.18)]" style={{ WebkitTextStroke: '2px #fffbe6' }}>404</span>
        </div>
      </div>
      <h1 className="mt-10 text-5xl sm:text-6xl font-extrabold text-amber-900 drop-shadow-lg text-center tracking-tight">Page Not Found</h1>
      <p className="mt-6 max-w-2xl text-center text-xl text-gray-700/80 font-medium">
        Oops! The page you’re looking for doesn’t exist or has been moved.<br />
        Let’s get you back to something beautiful.
      </p>
      <Link
        href="/"
        className="mt-10 inline-block rounded-full bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-400 px-10 py-4 text-xl font-bold text-white shadow-xl ring-2 ring-amber-200/40 hover:from-amber-800 hover:to-yellow-500 transition-all duration-200"
      >
        Go Home
      </Link>
    </div>
  )
}
