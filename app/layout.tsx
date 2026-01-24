import type React from "react"
import type { Metadata } from "next"
import { Geist_Mono as GeistMono } from "next/font/google"
// @ts-ignore TS(7016): Could not find a declaration file for module './globals.css'.
import "./globals.css"

const geistMono = GeistMono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI-powered Carreer Preparation Platform",
  description: "Optimize your career journey with AI Tutor",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${geistMono.className} bg-black text-white antialiased`} suppressHydrationWarning>{children}</body>
    </html>
  )
}
