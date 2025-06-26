import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Tugas Besar Komputasi Awan 2025",
  description: "Aplikasi Todo List Frontend untuk Tugas Besar Mata Kuliah Komputasi Awan 2025",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
