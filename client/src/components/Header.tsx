import { ShoppingBag, Heart, User, Search, Menu, LogOut } from "lucide-react";
import { SiInstagram, SiFacebook, SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoImage from "@assets/PNG__B_ LOGO_1762442171742.png";

interface HeaderProps {
  cartCount?: number;
  wishlistCount?: number;
  onMenuClick?: () => void;
}

export default function Header({ cartCount = 0, wishlistCount = 0, onMenuClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);

  const { data: cart } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const actualCartCount = (cart as any)?.items?.length || cartCount;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    // Clear cart and other user-specific query caches
    queryClient.removeQueries({ queryKey: ["/api/cart"] });
    queryClient.removeQueries({ queryKey: ["/api/wishlist"] });
    queryClient.removeQueries({ queryKey: ["/api/addresses"] });
    queryClient.removeQueries({ queryKey: ["/api/orders"] });
    setLocation("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 items-center gap-6">
          <div className="flex items-start gap-3">
            <Button
              size="icon"
              variant="ghost"
              className="md:hidden"
              onClick={onMenuClick}
              data-testid="button-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="hidden md:flex flex-col gap-2">
              <a 
                href="https://instagram.com/ramanifashion" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-pink-600 hover:text-pink-700 transition-colors group"
                data-testid="link-instagram"
              >
                <SiInstagram className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">@ramanifashion</span>
              </a>
              <a 
                href="https://facebook.com/ramanifashion" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors group"
                data-testid="link-facebook"
              >
                <SiFacebook className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">@ramanifashion</span>
              </a>
              <a 
                href="https://wa.me/915555555555" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors group"
                data-testid="link-whatsapp"
              >
                <SiWhatsapp className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">+91 5555555555</span>
              </a>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <a href="/" className="flex items-center justify-center">
              <img 
                src={logoImage}
                alt="Ramani Fashion" 
                className="h-16 md:h-20 lg:h-24 w-auto object-contain"
                data-testid="img-logo"
              />
            </a>
          </div>

          <div className="flex items-center justify-end gap-4">
            <div className="hidden md:flex items-center relative">
              <Search className="absolute left-4 h-6 w-6 text-gray-400" />
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-3 w-80 text-base bg-gray-50 border-gray-200 rounded-full focus:bg-white transition-colors"
                data-testid="input-search"
              />
            </div>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-11 w-11 hover:bg-gray-100" data-testid="button-account">
                    <User className="h-7 w-7" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-sm font-semibold">
                    {user.name}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation("/profile")} data-testid="menu-profile">
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/orders")} data-testid="menu-orders">
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/wishlist")} data-testid="menu-wishlist">
                    My Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" className="h-11 w-11 hover:bg-gray-100" onClick={() => setLocation("/login")} data-testid="button-login">
                <User className="h-7 w-7" />
              </Button>
            )}
            
            <Button variant="ghost" size="icon" className="relative h-11 w-11 hover:bg-gray-100" onClick={() => setLocation("/wishlist")} data-testid="button-wishlist">
              <Heart className="h-7 w-7" />
              {wishlistCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  data-testid="badge-wishlist-count"
                >
                  {wishlistCount}
                </Badge>
              )}
            </Button>
            
            <Button variant="ghost" size="icon" className="relative h-11 w-11 hover:bg-gray-100" onClick={() => setLocation("/cart")} data-testid="button-bag">
              <ShoppingBag className="h-7 w-7" />
              {actualCartCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  data-testid="badge-cart-count"
                >
                  {actualCartCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      <nav className="hidden md:block bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center justify-center gap-12 py-4 text-base font-medium">
            <li><a href="/" className="hover-elevate px-4 py-2 rounded-md tracking-wide" data-testid="link-home">HOME</a></li>
            <li><a href="/new-arrivals" className="hover-elevate px-4 py-2 rounded-md tracking-wide" data-testid="link-new-arrivals">NEW ARRIVALS</a></li>
            <li><a href="/categories" className="hover-elevate px-4 py-2 rounded-md tracking-wide" data-testid="link-categories">CATEGORIES</a></li>
            <li><a href="/sale" className="text-destructive hover-elevate px-4 py-2 rounded-md tracking-wide" data-testid="link-sale">SALE</a></li>
            <li><a href="/about" className="hover-elevate px-4 py-2 rounded-md tracking-wide" data-testid="link-about">ABOUT US</a></li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
