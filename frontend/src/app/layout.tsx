import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ask The Tarot - AI Powered Tarot Reading",
  description: "ถามแม่หมอ AI ไพ่ทาโรต์ที่จะช่วยแนะนำทางเลือกและคำตอบสำหรับคำถามของคุณ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
