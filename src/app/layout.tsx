import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import ClientWrapper from "./ClientWrapper";

const montserrat = Montserrat({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700", "800"]
});

export const metadata: Metadata = {
  title: "Hokiindo Raya - Your Trusted Solution Partner",
  description: "Distributor resmi produk Siemens terlengkap di Indonesia. Automation, Power Distribution, Motor & Drives, Safety Systems. Your trusted solution partner for electrical and industrial needs.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
      </head>
      <body className={`${montserrat.variable} font-sans antialiased`}>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
