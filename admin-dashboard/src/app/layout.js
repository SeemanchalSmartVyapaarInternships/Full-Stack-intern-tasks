import { Inter } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/context/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "SmartVyapar Admin Dashboard",
  description:
    "Production-grade Admin Dashboard for Seemanchal SmartVyapaar Consultancy — ERP management, analytics, and business operations.",
  keywords: ["admin", "dashboard", "ERP", "SmartVyapar", "management"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className="h-full antialiased font-sans" style={{ backgroundColor: "var(--content-bg)" }}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
