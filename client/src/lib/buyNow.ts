export function handleBuyNow(productId: string, quantity: number = 1, navigate: (path: string) => void, toast: any) {
  const token = localStorage.getItem("token");
  if (!token) {
    toast({ title: "Please login to proceed with Buy Now", variant: "destructive" });
    navigate("/login");
    return;
  }
  navigate(`/product/${productId}`);
}
