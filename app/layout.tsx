import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { authOptions } from "@/lib/auth";
import { AppNavbar } from "@/components/app-navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Simple Finance",
  description: "Make finance simple",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-[Soehne,_Manrope,_Avenir_Next,_Segoe_UI,_sans-serif] antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppNavbar
            isAuthenticated={Boolean(session?.user?.id)}
            userName={session?.user?.name}
          />
          <main>{children}</main>
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
