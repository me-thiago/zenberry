"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  User,
  Search,
  Bell,
  PackageOpen,
  /* HeartHandshake, */
  BookOpenCheck,
  ShoppingBag,
  Heart,
  Loader2,
  LogIn,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "next/navigation";
import { useCart } from "@/src/contexts/cart-context";
import { useAuthContext } from "@/src/contexts/auth-context";
import { NotificationsDrawer } from "@/src/components/notifications/notifications-drawer";
import { SearchModal } from "@/src/components/search-modal/search-modal";
import { toast } from "sonner";

function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuthContext();
  const { cartCount, setIsCartOpen } = useCart();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleRedirectUserMenu = () => {
    if (isAuthenticated) {
      router.push("/profile");
    } else {
      router.push("/auth");
    }
  };

  const handleNavigateToOrders = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Você precisa estar logado para acessar seus pedidos");
      router.push("/auth");
      return;
    }
    router.push("/orders");
  };

  const handleNavigateToFavorites = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Você precisa estar logado para acessar seus favoritos");
      router.push("/auth");
      return;
    }
    router.push("/favorites");
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Bar with Glass Effect */}
      <div className="backdrop-blur-xl bg-[#555555]/40 border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/logo-zenberry.webp"
                alt="Zenberry"
                width={160}
                height={35}
                priority
                className="hidden sm:block"
              />

              <Image
                src="/logo-zenberry-icon.webp"
                alt="Zenberry"
                width={40}
                height={35}
                priority
                className="block sm:hidden"
              />
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="relative w-full flex items-center px-5 py-2 bg-white/30 border border-white/30 rounded-full hover:bg-white/50 transition-all"
              >
                <Search className="h-6 w-6 text-white mr-3" />
                <span className="text-white">Search</span>
              </button>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Icon - Mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:bg-white/50"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-5 w-5" color="white" />
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-white/50"
                onClick={() => setIsNotificationsOpen(true)}
              >
                <Bell className="h-5 w-5" color="white" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-theme-accent-primary rounded-full"></span>
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-white/50"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" color="white" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-theme-accent-primary text-theme-text-primary text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-md">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Button>

              {/* User Profile */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRedirectUserMenu}
                className="hover:bg-white/50"
                aria-label={isAuthenticated ? "Go to Profile" : "Sign In"}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" color="white" />
                ) : isAuthenticated ? (
                  <User className="h-5 w-5" color="white" />
                ) : (
                  <LogIn className="h-5 w-5" color="white" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Green Navigation Bar */}
      <div className="bg-theme-accent-primary">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-12">
            {/* Left Navigation */}
            <nav className="flex items-center gap-3 md:gap-8 overflow-x-auto scrollbar-hide">
              <Link
                href="/products"
                className={`flex items-center gap-1 md:gap-2 hover:text-black/60 transition-colors whitespace-nowrap text-sm md:text-base ${
                  pathname === "/products" && "font-semibold"
                }`}
              >
                <PackageOpen className="h-5 w-5 shrink-0" />
                <span className="hidden sm:inline">Products</span>
              </Link>
              {/* <div className="h-4 md:h-6 w-px bg-black/30 shrink-0" />
              <Link
                href="/benefits"
                className="flex items-center gap-1 md:gap-2 hover:text-black/60 transition-colors whitespace-nowrap text-sm md:text-base"
              >
                <HeartHandshake className="h-5 w-5 shrink-0" />
                <span className="hidden sm:inline">Benefit</span>
              </Link> */}
              <div className="h-4 md:h-6 w-px bg-black/30 shrink-0" />
              <Link
                href="/about"
                className={`flex items-center gap-1 md:gap-2 hover:text-black/60 transition-colors whitespace-nowrap text-sm md:text-base ${
                  pathname === "/about" && "font-semibold"
                }`}
              >
                <BookOpenCheck className="h-5 w-5 shrink-0" />
                <span className="hidden sm:inline">About</span>
              </Link>
            </nav>

            {/* Right Dropdowns */}
            <div className="flex items-center gap-3 md:gap-6">
              <a
                href="/orders"
                onClick={handleNavigateToOrders}
                className={`flex items-center gap-1 md:gap-2 hover:text-black/60 transition-colors whitespace-nowrap text-sm md:text-base cursor-pointer ${
                  pathname === "/orders" && "font-semibold"
                }`}
              >
                <ShoppingBag className="h-5 w-5 shrink-0" />
                <span className="hidden sm:inline">Orders</span>
              </a>
              <div className="h-4 md:h-6 w-px bg-black/30 shrink-0" />
              <a
                href="/favorites"
                onClick={handleNavigateToFavorites}
                className={`flex items-center gap-1 md:gap-2 hover:text-black/60 transition-colors whitespace-nowrap text-sm md:text-base cursor-pointer ${
                  pathname === "/favorites" && "font-semibold"
                }`}
              >
                <Heart className="h-5 w-5 shrink-0" />
                <span className="hidden sm:inline">Favorites</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        setIsOpen={setIsNotificationsOpen}
      />
    </header>
  );
}

export { Header };
