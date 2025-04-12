// app/layout.tsx
import type { Metadata } from "next";
// 1. Import your chosen fonts using next/font/google
import { Inter, EB_Garamond } from "next/font/google"; // Removed Geist, kept EB_Garamond
import "./globals.css";
import Providers from './providers';

// 2. Configure Inter with a CSS variable
const inter = Inter({
  subsets: ["latin"],
  display: 'swap', // Ensures text remains visible while font loads
  variable: "--font-inter", // The CSS variable name we'll use
});

// 3. Configure EB Garamond with a CSS variable (Best Practice)
const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  style: ['normal', 'italic'], // Include styles you need
  weight: ['400', '500', '600'], // Include weights you need
  display: 'swap',
  variable: '--font-eb-garamond' // CSS variable for serif
});


import { Fira_Code } from 'next/font/google';
const firaCode = Fira_Code({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-fira-code'
});


export const metadata: Metadata = {
  title: "SourceLens - Primary Source Analysis Tool",
  description: "Analyze primary sources with AI-powered perspectives",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 4. Add the new font variables to the <html> or <body> class
    //    Using <html> might be slightly preferred for variable availability
    <html lang="en" className={`${inter.variable} ${ebGaramond.variable} ${firaCode.variable}`}>
      <head>
        {/* 5. REMOVE the old <link> tag for Google Fonts */}
        {/* <link
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap"
          rel="stylesheet"
        /> */}
      </head>
      {/* Apply antialiased directly here or keep it on body if preferred */}
      <body className={`antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}