import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIAssistant from "@/components/AIAssistant";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Venta Gamingg - Domina el Mercado de FC 26",
  description: "Monedas, Account Boosting y Cuentas Premium. El servicio más rápido y seguro del mercado.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#0A0A0A",
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#FAFAFA] text-[#1A1A1A] dark:bg-[#0A0A0A] dark:text-white min-h-screen relative transition-colors duration-300`}>
        {/* Elite Background Gradients */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-50">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-neon-light)]/5 dark:bg-[var(--color-neon)]/5 blur-[120px] rounded-full transition-colors" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-[var(--color-neon-light)]/5 dark:bg-[var(--color-neon)]/5 blur-[100px] rounded-full transition-colors" />
        </div>

        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <NextIntlClientProvider messages={messages}>
            <Navbar />
            {children}
            <AIAssistant />
            <Footer />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}