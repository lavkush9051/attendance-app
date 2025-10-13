
// import type React from "react"
// import type { Metadata } from "next"
// import { Inter } from "next/font/google"
// import "./globals.css"
// import RouteGuard from "@/components/route-guard" // ✅ add this

// const inter = Inter({ subsets: ["latin"] })

// export const metadata: Metadata = {
//   title: "AttendEase - Attendance & Leave Management",
//   description: "Modern attendance and leave management system for employees",
//   manifest: "/manifest.json",
//   themeColor: "#2563eb",
//   viewport: "width=device-width, initial-scale=1, maximum-scale=1",
//   generator: "v0.dev",
// }

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="en">
//       <head>
//         {/* <link rel="icon" href="/favicon.ico" />
//         <link rel="apple-touch-icon" href="/icon-192x192.png" />
//         <meta name="apple-mobile-web-app-capable" content="yes" />
//         <meta name="apple-mobile-web-app-status-bar-style" content="default" />
//         <meta name="apple-mobile-web-app-title" content="AttendEase" /> */}

//         <link rel="manifest" href="/manifest.json" />

//         <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
//         <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
//         <link rel="shortcut icon" href="/favicon.ico" />
//         <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
//         <link rel="manifest" href="/site.webmanifest" />
//       </head>
//       <body className={inter.className}>
//         {/* 👇 everything except /login will be protected */}
//         <RouteGuard>{children}</RouteGuard>
//       </body>
//     </html>
//   )
// }

import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RouteGuard from "@/components/route-guard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AttendEase - Attendance & Leave Management",
  description: "Modern attendance and leave management system for employees",
  applicationName: "AttendEase",
  manifest: "/manifest.json",                 // ✅ one manifest (keep file in /public)
  themeColor: "#2563eb",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  // Prefer Metadata API over manual <link> tags:
  icons: {
    icon: [
      // { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      // { url: "/favicon.svg", type: "image/svg+xml" },
      // { url: "/favicon.ico" },
      { url: "/ameisetech-favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/ameisetech-favicon.ico" },
    ],
    apple: [{ url: "/ameisetech-apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AttendEase",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* No need for manual <head> links—Metadata injects them */}
      <body className={inter.className}>
        <RouteGuard>{children}</RouteGuard>
      </body>
    </html>
  );
}
