import { ShoppingCart, Heart, User, Search, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    setLocation("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b">
      <div className="bg-primary text-primary-foreground text-center py-2 text-sm">
        Free shipping on orders above ₹999 | Easy Returns | Customer Support
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            onClick={onMenuClick}
            data-testid="button-menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <a href="/" className="flex items-center">
            <h1 className="font-script text-2xl md:text-3xl font-bold text-primary" data-testid="text-logo">
              Ramani Fashion
            </h1>
          </a>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for sarees..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-account">
                    <User className="h-5 w-5" />
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
              <Button variant="ghost" size="icon" onClick={() => setLocation("/login")} data-testid="button-login">
                <User className="h-5 w-5" />
              </Button>
            )}
            
            <Button variant="ghost" size="icon" className="relative" onClick={() => setLocation("/wishlist")} data-testid="button-wishlist">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  data-testid="badge-wishlist-count"
                >
                  {wishlistCount}
                </Badge>
              )}
            </Button>
            
            <Button variant="ghost" size="icon" className="relative" onClick={() => setLocation("/cart")} data-testid="button-cart">
              <ShoppingCart className="h-5 w-5" />
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

        <div className="md:hidden mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for sarees..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-mobile"
            />
          </div>
        </div>
      </div>

      <nav className="hidden md:block border-t">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center justify-center gap-8 py-3 text-sm">
            <li><a href="/" className="hover-elevate px-3 py-2 rounded-md" data-testid="link-home">Home</a></li>
            <li><a href="/new-arrivals" className="hover-elevate px-3 py-2 rounded-md" data-testid="link-new-arrivals">New Arrivals</a></li>
            <li><a href="/categories" className="hover-elevate px-3 py-2 rounded-md" data-testid="link-categories">Categories</a></li>
            <li><a href="/occasions" className="hover-elevate px-3 py-2 rounded-md" data-testid="link-occasions">Occasions</a></li>
            <li><a href="/collections" className="hover-elevate px-3 py-2 rounded-md" data-testid="link-collections">Collections</a></li>
            <li><a href="/sale" className="text-destructive hover-elevate px-3 py-2 rounded-md" data-testid="link-sale">Sale</a></li>
            <li><a href="/about" className="hover-elevate px-3 py-2 rounded-md" data-testid="link-about">About Us</a></li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
