import { Inter } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/context/ThemeContext";
import AuthProvider from "@/context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

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
        <GoogleOAuthProvider clientId="921592816077-j36p32makvilta8i9tfkg9kcmkjfaslt.apps.googleusercontent.com">
          <AuthProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}

