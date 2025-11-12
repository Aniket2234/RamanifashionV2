import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Heart, ShoppingBag, Truck, Shield, RotateCcw, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { localStorageService } from "@/lib/localStorage";
import ProductCard from "@/components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [similarSort, setSimilarSort] = useState("rating-desc");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedImage(0);
  }, [id]);

  const { data: product, isLoading } = useQuery({
    queryKey: ["/api/products", id],
    queryFn: async () => {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) throw new Error("Failed to fetch product");
      return response.json();
    },
  });

  const { data: similarProducts } = useQuery({
    queryKey: ["/api/products", "similar", product?.category, id, similarSort],
    queryFn: async () => {
      if (!product?.category) return [];
      const [sortField, sortOrder] = similarSort.split("-");
      const response = await fetch(
        `/api/products?category=${encodeURIComponent(product.category)}&sort=${sortField}&order=${sortOrder}&limit=8`
      );
      if (!response.ok) return [];
      const data = await response.json();
      return data.products?.filter((p: any) => p._id !== id).slice(0, 8) || [];
    },
    enabled: !!product?.category,
  });

  const addToCartMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/cart", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ title: "Added to cart successfully!" });
    },
    onError: () => {
      const token = localStorage.getItem("token");
      if (!token) {
        localStorageService.addToCart(product._id, quantity);
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
        toast({ title: "Added to cart successfully!" });
      } else {
        toast({ title: "Failed to add to cart", variant: "destructive" });
      }
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: (productId: string) => apiRequest(`/api/wishlist/${productId}`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({ title: "Added to wishlist!" });
    },
    onError: () => {
      const token = localStorage.getItem("token");
      if (!token) {
        localStorageService.addToWishlist(product._id);
        queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
        toast({ title: "Added to wishlist!" });
      } else {
        toast({ title: "Failed to add to wishlist", variant: "destructive" });
      }
    },
  });

  const buyNowMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/cart", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      setLocation("/checkout");
    },
    onError: () => {
      toast({ title: "Failed to proceed with Buy Now", variant: "destructive" });
    },
  });

  const handleBuyNow = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({ title: "Please login to proceed with Buy Now", variant: "destructive" });
      setLocation("/login");
      return;
    }
    buyNowMutation.mutate({ productId: product._id, quantity });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          Loading product details...
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          Product not found
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : ["/api/placeholder/600/800"];

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav className="text-sm text-muted-foreground mb-6" data-testid="breadcrumb">
          <a href="/" className="hover:text-foreground">Home</a>
          <span className="mx-2">/</span>
          <a href="/products" className="hover:text-foreground">Products</a>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="flex flex-col lg:flex-row gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex flex-row lg:flex-col gap-2 order-2 lg:order-1 lg:max-w-[100px]">
              {images.slice(0, 4).map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`border-2 rounded-md overflow-hidden hover-elevate flex-shrink-0 ${
                    selectedImage === idx ? 'border-primary' : 'border-border'
                  }`}
                  data-testid={`button-thumbnail-${idx}`}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full aspect-square object-cover" />
                </button>
              ))}
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedImage}
                className="flex-1 bg-card rounded-md overflow-hidden order-1 lg:order-2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <img 
                  src={images[selectedImage]} 
                  alt={product.name}
                  className="w-full h-auto aspect-[2/3] object-cover"
                  data-testid="img-product-main"
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-['Inter',sans-serif]"
          >
            <div className="flex gap-2 mb-2">
              {product.isBestseller && <Badge variant="secondary" data-testid="badge-bestseller">Bestseller</Badge>}
            </div>

            <h1 className="text-3xl font-bold mb-4 text-foreground" data-testid="text-product-name">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating || 0)
                        ? 'fill-yellow-500 text-yellow-500'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-foreground font-medium" data-testid="text-rating">
                {product.rating?.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-bold text-primary" data-testid="text-price">
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through" data-testid="text-original-price">
                    ₹{product.originalPrice}
                  </span>
                  <span className="text-lg text-primary font-semibold" data-testid="text-discount">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              {product.category && (
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <span className="ml-2 font-medium text-foreground">{product.category}</span>
                </div>
              )}
              {product.fabric && (
                <div>
                  <span className="text-muted-foreground">Fabric:</span>
                  <span className="ml-2 font-medium text-foreground">{product.fabric}</span>
                </div>
              )}
              {product.color && (
                <div>
                  <span className="text-muted-foreground">Color:</span>
                  <span className="ml-2 font-medium text-foreground">{product.color}</span>
                </div>
              )}
              {product.occasion && (
                <div>
                  <span className="text-muted-foreground">Occasion:</span>
                  <span className="ml-2 font-medium text-foreground">{product.occasion}</span>
                </div>
              )}
              {product.sareeLength && (
                <div>
                  <span className="text-muted-foreground">Length:</span>
                  <span className="ml-2 font-medium text-foreground">{product.sareeLength}</span>
                </div>
              )}
              {product.blousePiece !== undefined && (
                <div>
                  <span className="text-muted-foreground">Blouse Piece:</span>
                  <span className="ml-2 font-medium text-foreground">{product.blousePiece ? 'Yes' : 'No'}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  data-testid="button-quantity-decrease"
                >
                  -
                </Button>
                <span className="px-4 font-medium" data-testid="text-quantity">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(q => q + 1)}
                  data-testid="button-quantity-increase"
                >
                  +
                </Button>
              </div>

              {product.inStock ? (
                <Badge variant="secondary" className="text-green-600" data-testid="badge-stock">
                  In Stock
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-red-600" data-testid="badge-out-of-stock">
                  Out of Stock
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              <Button
                className="flex-1 min-w-[140px] rounded-full"
                disabled={!product.inStock || addToCartMutation.isPending}
                onClick={() => addToCartMutation.mutate({ productId: product._id, quantity })}
                data-testid="button-add-to-cart"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <Button
                className="flex-1 min-w-[140px] rounded-full bg-white dark:bg-card border-2 border-primary text-primary hover:bg-primary/10 dark:hover:bg-primary/10"
                variant="outline"
                disabled={!product.inStock || buyNowMutation.isPending}
                onClick={handleBuyNow}
                data-testid="button-buy-now"
              >
                <Zap className="h-4 w-4 mr-2" />
                Buy Now
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() => addToWishlistMutation.mutate(product._id)}
                disabled={addToWishlistMutation.isPending}
                data-testid="button-add-to-wishlist"
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <Truck className="h-6 w-6 text-primary mb-2" />
                  <span className="text-sm font-medium">Free Delivery</span>
                  <span className="text-xs text-muted-foreground">On orders above ₹999</span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <RotateCcw className="h-6 w-6 text-primary mb-2" />
                  <span className="text-sm font-medium">Easy Returns</span>
                  <span className="text-xs text-muted-foreground">7 days return policy</span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <Shield className="h-6 w-6 text-primary mb-2" />
                  <span className="text-sm font-medium">Secure Payment</span>
                  <span className="text-xs text-muted-foreground">100% secure</span>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </motion.div>

        <div className="mb-8 max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="description">
              <AccordionTrigger 
                className="text-lg font-bold text-[#6B4423] dark:text-[#D4A373] hover:no-underline"
                data-testid="button-accordion-description"
              >
                PRODUCT DESCRIPTION
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>{product.description || "Beautiful and elegant saree perfect for any occasion."}</p>
              </AccordionContent>
            </AccordionItem>

            {product.specifications && (
              <AccordionItem value="specifications">
                <AccordionTrigger 
                  className="text-lg font-bold text-[#6B4423] dark:text-[#D4A373] hover:no-underline"
                  data-testid="button-accordion-specification"
                >
                  PRODUCT SPECIFICATION
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {product.specifications.fabricComposition && (
                      <div>
                        <span className="font-semibold text-foreground">Fabric Composition: </span>
                        <span className="text-muted-foreground">{product.specifications.fabricComposition}</span>
                      </div>
                    )}
                    {product.specifications.dimensions && (
                      <div>
                        <span className="font-semibold text-foreground">Dimensions: </span>
                        <span className="text-muted-foreground">{product.specifications.dimensions}</span>
                      </div>
                    )}
                    {product.specifications.weight && (
                      <div>
                        <span className="font-semibold text-foreground">Weight: </span>
                        <span className="text-muted-foreground">{product.specifications.weight}</span>
                      </div>
                    )}
                    {product.specifications.careInstructions && (
                      <div className="md:col-span-2">
                        <span className="font-semibold text-foreground">Care Instructions: </span>
                        <span className="text-muted-foreground">{product.specifications.careInstructions}</span>
                      </div>
                    )}
                    {product.specifications.countryOfOrigin && (
                      <div>
                        <span className="font-semibold text-foreground">Country of Origin: </span>
                        <span className="text-muted-foreground">{product.specifications.countryOfOrigin}</span>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            <AccordionItem value="return">
              <AccordionTrigger 
                className="text-lg font-bold text-[#6B4423] dark:text-[#D4A373] hover:no-underline"
                data-testid="button-accordion-return"
              >
                RETURN & EXCHANGE
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p>Easy 7-day return and exchange policy.</p>
                <p>Items must be unused and in original packaging with all tags attached.</p>
                <p>Refunds will be processed within 5-7 business days.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="shipping">
              <AccordionTrigger 
                className="text-lg font-bold text-[#6B4423] dark:text-[#D4A373] hover:no-underline"
                data-testid="button-accordion-shipping"
              >
                SHIPPING & DELIVERY
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p>Free delivery on orders above ₹999.</p>
                <p>Standard delivery takes 5-7 business days.</p>
                <p>Express delivery available in select locations (2-3 business days).</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="manufacturer">
              <AccordionTrigger 
                className="text-lg font-bold text-[#6B4423] dark:text-[#D4A373] hover:no-underline"
                data-testid="button-accordion-manufacturer"
              >
                MANUFACTURED BY
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>Ramani Fashion</p>
                <p>Quality assured traditional and contemporary sarees</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="care">
              <AccordionTrigger 
                className="text-lg font-bold text-[#6B4423] dark:text-[#D4A373] hover:no-underline"
                data-testid="button-accordion-care"
              >
                CUSTOMER CARE
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p>Contact us for any queries or support.</p>
                <p>Email: support@ramanifashion.com</p>
                <p>Phone: +91-XXXX-XXXXXX</p>
                <p>Available: Monday to Saturday, 10 AM - 6 PM</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {similarProducts && similarProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Similar Products</h2>
              <Select value={similarSort} onValueChange={setSimilarSort}>
                <SelectTrigger className="w-48" data-testid="select-similar-sort">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating-desc">Highest Rated</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="reviewCount-desc">Most Reviewed</SelectItem>
                  <SelectItem value="createdAt-desc">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <motion.div 
              className="grid grid-cols-2 lg:grid-cols-4 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {similarProducts.map((similarProduct: any, index: number) => (
                <motion.div
                  key={similarProduct._id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <ProductCard
                    id={similarProduct._id}
                    name={similarProduct.name}
                    price={similarProduct.price}
                    originalPrice={similarProduct.originalPrice}
                    image={similarProduct.images?.[0] || "/api/placeholder/400/600"}
                    rating={similarProduct.rating}
                    reviewCount={similarProduct.reviewCount}
                    isNew={similarProduct.isNew}
                    isBestseller={similarProduct.isBestseller}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}
