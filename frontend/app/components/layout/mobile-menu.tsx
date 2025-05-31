import { LogOut, UserCircle, RefreshCw, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { ThemeSwitcher } from "@/app/components/theme/theme-switcher";
import { Badge } from "@/components/ui/badge";
import useCartStore from "@/app/hooks/useCart";

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  navLinks: { href: string; label: string; icon: React.ElementType }[];
  activeLinks: { href: string; label: string; icon: React.ElementType }[];
  isAuthenticated: boolean;
  user: any;
  pathname: string;
  handleLogout: () => void;
  handleRefreshUserData: () => void;
  isRefreshing: boolean;
}

export default function MobileMenu({
  isOpen,
  setIsOpen,
  navLinks,
  activeLinks,
  isAuthenticated,
  user,
  pathname,
  handleLogout,
  handleRefreshUserData,
  isRefreshing
}: MobileMenuProps) {
  if (!isOpen) return null;
  
  // Sepet bilgilerini al
  const { items } = useCartStore();

  return (
    <div className="fixed inset-0 z-10 sm:hidden">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" aria-hidden="true"></div>

      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-background shadow-lg transition transform duration-300 ease-in-out">
        <div className="flex flex-col h-full overflow-y-auto pt-16 pb-6">
          <div className="px-4">
            <div className="space-y-1 py-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block py-3 px-4 rounded-md text-base font-medium transition-all duration-200 ease-in-out ${pathname === link.href
                      ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary shadow-md"
                      : "text-foreground hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/30 hover:shadow-sm"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {isAuthenticated && (
            <div className="mt-6 px-4">
              <div className="flex items-center mb-4 p-4 rounded-md bg-gradient-to-br from-primary/5 to-background shadow-sm">
                <UserCircle className="h-10 w-10 text-primary mr-3" />
                <div>
                  <div className="font-medium">{user?.username || user?.attributes?.username || "Kullanıcı"}</div>
                  <div className="text-sm text-muted-foreground">{user?.email || user?.attributes?.email || "E-posta yok"}</div>
                </div>
              </div>

              <div className="space-y-1">
                <button
                  onClick={handleRefreshUserData}
                  disabled={isRefreshing}
                  className="w-full flex items-center py-3 px-4 rounded-md text-base font-medium transition-all duration-200 ease-in-out hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/30 hover:shadow-sm"
                >
                  <RefreshCw className={`mr-3 h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Kullanıcı Bilgilerini Güncelle
                </button>

                {activeLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center py-3 px-4 rounded-md text-base font-medium transition-all duration-200 ease-in-out ${pathname === link.href
                        ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary shadow-md"
                        : "text-foreground hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/30 hover:shadow-sm"
                      }`}
                  >
                    <link.icon className="mr-3 h-5 w-5" />
                    {link.label}
                  </Link>
                ))}

                {/* Sepeti sadece admin olmayan kullanıcılara göster */}
                {isAuthenticated && user && user.role !== "admin" && (
                  <Link href="/cart" className="w-full" onClick={() => setIsOpen(false)}>
                    <div className={`flex items-center py-3 px-4 rounded-md text-base font-medium transition-all duration-200 ease-in-out ${pathname === "/cart" ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary shadow-md" : ""}`}>
                      <ShoppingCart className="mr-3 h-5 w-5" />
                      <span>Sepetim</span>
                      {items.length > 0 && (
                        <Badge className="ml-2 px-2">{items.length}</Badge>
                      )}
                    </div>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center py-3 px-4 rounded-md text-base font-medium transition-all duration-200 ease-in-out text-foreground hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/30 hover:shadow-sm"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Çıkış Yap
                </button>
              </div>
            </div>
          )}

          {!isAuthenticated && (
            <div className="mt-6 px-4">
              <div className="space-y-3">
                <Link
                  href="/auth/login"
                  className="flex justify-center items-center py-3 px-4 rounded-md text-base font-medium shadow-sm bg-gradient-to-r from-primary/20 to-background hover:from-primary/30 hover:to-primary/10 transition-all duration-200 ease-in-out"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/auth/register"
                  className="flex justify-center items-center py-3 px-4 rounded-md text-base font-medium shadow-sm bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 transition-all duration-200 ease-in-out"
                >
                  Kayıt Ol
                </Link>
              </div>
            </div>
          )}

          <div className="mt-auto pt-6 px-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Tema</div>
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}