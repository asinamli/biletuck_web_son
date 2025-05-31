'use client';

import { Navbar } from '@/app/components/layout/navbar'
import { Toaster } from "react-hot-toast"
import "./globals.css"
import useAuthStore from "./hooks/useAuth";
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Footer } from './components/layout/footer';
import { ThemeProvider } from './components/theme/theme-provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, refreshUserData, user, getJwt } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  // Korumalı sayfalar listesi
  const protectedRoutes = ['/profile', '/admin', '/tickets', '/cart', '/organizer'];

  // Auth kontrolü ve token doğrulama
  useEffect(() => {
    const token = getJwt();
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // Korumalı sayfa ve token varsa
    if (isProtectedRoute) {
      // Giriş yapılmamışsa login sayfasına yönlendir
      if (!isAuthenticated) {
        console.log("Korumalı sayfa erişimi - giriş yapılmamış");
        router.replace('/auth/login');
        return;
      }

      // Token var ve authenticated ama user bilgileri yoksa veya yenilenmesi gerekiyorsa
      if (isAuthenticated && token) {
        console.log("Kullanıcı bilgileri yenileniyor");
        refreshUserData().catch((err) => {
          console.error("Token doğrulama hatası:", err);
        });
      }
    }
  }, [pathname, isAuthenticated, refreshUserData, router, getJwt]);

  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={` antialiased min-h-screen flex flex-col`}>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
