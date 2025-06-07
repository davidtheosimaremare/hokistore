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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${montserrat.variable} font-sans antialiased`}>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
