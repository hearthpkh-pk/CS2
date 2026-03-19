import type { Metadata } from "next";
import { Outfit, Noto_Sans_Thai, Inter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ 
  subsets: ["latin"], 
  variable: "--font-outfit" 
});

const notoThai = Noto_Sans_Thai({ 
  subsets: ["thai"], 
  variable: "--font-noto-thai" 
});

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter" 
});

export const metadata: Metadata = {
  title: "Creator Dashboard",
  description: "Next-gen Creator Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${outfit.variable} ${notoThai.variable} ${inter.variable}`}>
      <body className="font-noto antialiased bg-[#fefefe] text-[#1e293b]">
        {children}
      </body>
    </html>
  );
}
