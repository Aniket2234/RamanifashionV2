import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal, X } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useLocation } from "wouter";

export default function Products() {
  const [location] = useLocation();
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [priceRange, setPriceRange] = useState([500, 50000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(["categories", "price", "fabric"]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    const categoryParam = urlParams.get('category');
    setSelectedCategories(categoryParam ? categoryParam.split(',') : []);
    
    const occasionParam = urlParams.get('occasion');
    setSelectedOccasions(occasionParam ? occasionParam.split(',') : []);
    
    const colorParam = urlParams.get('color');
    setSelectedColors(colorParam ? colorParam.split(',') : []);
    
    const fabricParam = urlParams.get('fabric');
    setSelectedFabrics(fabricParam ? fabricParam.split(',') : []);
    
    setPage(1);
  }, [location]);

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  // Build query params
  const queryParams = new URLSearchParams({
    sort: sortBy,
    order,
    page: page.toString(),
    limit: "12",
    minPrice: priceRange[0].toString(),
    maxPrice: priceRange[1].toString(),
  });

  if (selectedCategories.length > 0) {
    queryParams.append("category", selectedCategories.join(","));
  }
  if (selectedFabrics.length > 0) {
    queryParams.append("fabric", selectedFabrics.join(","));
  }
  if (selectedColors.length > 0) {
    queryParams.append("color", selectedColors.join(","));
  }
  if (selectedOccasions.length > 0) {
    queryParams.append("occasion", selectedOccasions.join(","));
  }
  if (inStockOnly) {
    queryParams.append("inStock", "true");
  }

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["/api/products", queryParams.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/products?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  const { data: filtersData } = useQuery({
    queryKey: ["/api/filters"],
  });

  const products = productsData?.products || [];
  const pagination = productsData?.pagination || { total: 0, pages: 1 };

  const categories = filtersData?.categories || ["Silk Sarees", "Cotton Sarees", "Designer Sarees", "Bridal Sarees", "Party Wear", "Casual Wear"];
  const fabrics = filtersData?.fabrics || ["Silk", "Cotton", "Georgette", "Chiffon", "Net", "Crepe", "Chanderi", "Linen"];
  const colors = filtersData?.colors || ["Red", "Blue", "Green", "Pink", "Yellow", "Black", "White", "Purple", "Maroon", "Grey"];
  const occasions = filtersData?.occasions || ["Wedding", "Party", "Festival", "Casual", "Office"];

  const handleSortChange = (value: string) => {
    const [newSort, newOrder] = value.split("-");
    setSortBy(newSort);
    setOrder(newOrder || "desc");
    setPage(1);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
    setPage(1);
  };

  const toggleFabric = (fabric: string) => {
    setSelectedFabrics(prev =>
      prev.includes(fabric) ? prev.filter(f => f !== fabric) : [...prev, fabric]
    );
    setPage(1);
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
    setPage(1);
  };

  const toggleOccasion = (occasion: string) => {
    setSelectedOccasions(prev =>
      prev.includes(occasion) ? prev.filter(o => o !== occasion) : [...prev, occasion]
    );
    setPage(1);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedFabrics([]);
    setSelectedColors([]);
    setSelectedOccasions([]);
    setPriceRange([500, 50000]);
    setInStockOnly(false);
    setPage(1);
  };

  const activeFiltersCount = selectedCategories.length + selectedFabrics.length + selectedColors.length + selectedOccasions.length + (inStockOnly ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <nav className="text-sm text-muted-foreground mb-4" data-testid="breadcrumb">
            <a href="/" className="hover:text-foreground">Home</a>
            <span className="mx-2">/</span>
            <span className="text-foreground">All Sarees</span>
          </nav>
          
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold mb-1" data-testid="text-page-title">
                All Sarees
              </h1>
              <p className="text-muted-foreground" data-testid="text-results-count">
                {pagination.total} products
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="lg:hidden"
                onClick={() => setShowFilters(!showFilters)}
                data-testid="button-toggle-filters"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </Button>
              
              <Select value={`${sortBy}-${order}`} onValueChange={handleSortChange}>
                <SelectTrigger className="w-48" data-testid="select-sort">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">What's New</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating-desc">Customer Rating</SelectItem>
                  <SelectItem value="reviewCount-desc">Most Reviews</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedCategories.map(cat => (
                <Button
                  key={cat}
                  size="sm"
                  variant="secondary"
                  onClick={() => toggleCategory(cat)}
                  data-testid={`filter-tag-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {cat} <X className="h-3 w-3 ml-1" />
                </Button>
              ))}
              {selectedFabrics.map(fab => (
                <Button
                  key={fab}
                  size="sm"
                  variant="secondary"
                  onClick={() => toggleFabric(fab)}
                >
                  {fab} <X className="h-3 w-3 ml-1" />
                </Button>
              ))}
              {selectedColors.map(col => (
                <Button
                  key={col}
                  size="sm"
                  variant="secondary"
                  onClick={() => toggleColor(col)}
                >
                  {col} <X className="h-3 w-3 ml-1" />
                </Button>
              ))}
              {selectedOccasions.map(occ => (
                <Button
                  key={occ}
                  size="sm"
                  variant="secondary"
                  onClick={() => toggleOccasion(occ)}
                >
                  {occ} <X className="h-3 w-3 ml-1" />
                </Button>
              ))}
              <Button size="sm" variant="ghost" onClick={clearAllFilters} data-testid="button-clear-all">
                Clear all
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-6">
          <aside className={`w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="space-y-4 p-4 bg-card rounded-md sticky top-24" data-testid="sidebar-filters">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Filters</h3>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters} data-testid="button-clear-filters">
                    Clear All
                  </Button>
                )}
              </div>

              <Collapsible open={openSections.includes("categories")}>
                <CollapsibleTrigger 
                  className="flex items-center justify-between w-full py-2 hover-elevate px-2 rounded-md"
                  onClick={() => toggleSection("categories")}
                  data-testid="button-toggle-categories"
                >
                  <span className="font-medium">Categories</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes("categories") ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 pt-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox 
                        id={category} 
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                        data-testid={`checkbox-category-${category.toLowerCase().replace(/\s+/g, '-')}`} 
                      />
                      <Label htmlFor={category} className="text-sm cursor-pointer">
                        {category}
                      </Label>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              <Collapsible open={openSections.includes("price")}>
                <CollapsibleTrigger 
                  className="flex items-center justify-between w-full py-2 hover-elevate px-2 rounded-md"
                  onClick={() => toggleSection("price")}
                  data-testid="button-toggle-price"
                >
                  <span className="font-medium">Price Range</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes("price") ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 space-y-4">
                  <Slider
                    value={priceRange}
                    onValueChange={(val) => {
                      setPriceRange(val);
                      setPage(1);
                    }}
                    min={500}
                    max={50000}
                    step={500}
                    data-testid="slider-price-range"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span data-testid="text-price-min">₹{priceRange[0]}</span>
                    <span data-testid="text-price-max">₹{priceRange[1]}</span>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible open={openSections.includes("fabric")}>
                <CollapsibleTrigger 
                  className="flex items-center justify-between w-full py-2 hover-elevate px-2 rounded-md"
                  onClick={() => toggleSection("fabric")}
                  data-testid="button-toggle-fabric"
                >
                  <span className="font-medium">Fabric Type</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes("fabric") ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 pt-2">
                  {fabrics.map((fabric) => (
                    <div key={fabric} className="flex items-center space-x-2">
                      <Checkbox 
                        id={fabric} 
                        checked={selectedFabrics.includes(fabric)}
                        onCheckedChange={() => toggleFabric(fabric)}
                        data-testid={`checkbox-fabric-${fabric.toLowerCase()}`} 
                      />
                      <Label htmlFor={fabric} className="text-sm cursor-pointer">
                        {fabric}
                      </Label>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              <Collapsible open={openSections.includes("occasion")}>
                <CollapsibleTrigger 
                  className="flex items-center justify-between w-full py-2 hover-elevate px-2 rounded-md"
                  onClick={() => toggleSection("occasion")}
                  data-testid="button-toggle-occasion"
                >
                  <span className="font-medium">Occasion</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes("occasion") ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 pt-2">
                  {occasions.map((occasion) => (
                    <div key={occasion} className="flex items-center space-x-2">
                      <Checkbox 
                        id={occasion} 
                        checked={selectedOccasions.includes(occasion)}
                        onCheckedChange={() => toggleOccasion(occasion)}
                        data-testid={`checkbox-occasion-${occasion.toLowerCase()}`} 
                      />
                      <Label htmlFor={occasion} className="text-sm cursor-pointer">
                        {occasion}
                      </Label>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              <Collapsible open={openSections.includes("color")}>
                <CollapsibleTrigger 
                  className="flex items-center justify-between w-full py-2 hover-elevate px-2 rounded-md"
                  onClick={() => toggleSection("color")}
                  data-testid="button-toggle-color"
                >
                  <span className="font-medium">Color</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes("color") ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <div className="grid grid-cols-5 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 hover-elevate ${
                          selectedColors.includes(color) ? 'border-primary ring-2 ring-primary' : 'border-border'
                        }`}
                        style={{ backgroundColor: color.toLowerCase() }}
                        onClick={() => toggleColor(color)}
                        title={color}
                        data-testid={`button-color-${color.toLowerCase()}`}
                      />
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <div className="pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="inStock"
                    checked={inStockOnly}
                    onCheckedChange={(checked) => {
                      setInStockOnly(checked as boolean);
                      setPage(1);
                    }}
                    data-testid="checkbox-in-stock"
                  />
                  <Label htmlFor="inStock" className="text-sm cursor-pointer">
                    In Stock Only
                  </Label>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            {isLoading ? (
              <div className="text-center py-12">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No products found matching your filters.</p>
                <Button onClick={clearAllFilters} className="mt-4" data-testid="button-clear-filters-empty">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map((product: any) => {
                    const discount = product.originalPrice 
                      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                      : 0;

                    return (
                      <ProductCard
                        key={product._id}
                        id={product._id}
                        name={product.name}
                        image={product.images?.[0] || "/api/placeholder/400/600"}
                        secondaryImage={product.images?.[1]}
                        price={product.price}
                        originalPrice={product.originalPrice}
                        discount={discount || undefined}
                        rating={product.rating}
                        reviewCount={product.reviewCount}
                        isNew={product.isNew}
                        isBestseller={product.isBestseller}
                      />
                    );
                  })}
                </div>

                {pagination.pages > 1 && (
                  <div className="flex justify-center mt-8 gap-2">
                    <Button 
                      variant="outline" 
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                      data-testid="button-page-prev"
                    >
                      Previous
                    </Button>
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          onClick={() => setPage(pageNum)}
                          data-testid={`button-page-${pageNum}`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button 
                      variant="outline" 
                      disabled={page === pagination.pages}
                      onClick={() => setPage(p => p + 1)}
                      data-testid="button-page-next"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
