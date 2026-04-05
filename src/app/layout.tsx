import type { Metadata } from "next";
import { Outfit, Noto_Sans_Thai, Kanit, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { GlobalAnnouncement } from "@/features/company/components/GlobalAnnouncement";

const outfit = Outfit({ 
  subsets: ["latin"], 
  variable: "--font-outfit" 
});

const notoThai = Noto_Sans_Thai({ 
  subsets: ["thai"], 
  variable: "--font-noto-thai" 
});

const kanit = Kanit({ 
  subsets: ["thai"], 
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-kanit" 
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
    <html lang="th" className={`${outfit.variable} ${notoThai.variable} ${kanit.variable} ${inter.variable}`}>
      <body className="font-noto antialiased bg-[#fefefe] text-[#1e293b]">
        <AuthProvider>
          <GlobalAnnouncement />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
