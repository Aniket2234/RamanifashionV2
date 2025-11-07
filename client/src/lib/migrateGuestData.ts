import { localStorageService } from "./localStorage";
import { apiRequest } from "./queryClient";

export async function migrateGuestDataToServer() {
  try {
    const guestCart = localStorageService.getCart();
    const guestWishlist = localStorageService.getWishlist();

    for (const item of guestCart.items) {
      try {
        await apiRequest("/api/cart", "POST", {
          productId: item.productId,
          quantity: item.quantity,
        });
      } catch (error) {
        console.error("Failed to migrate cart item:", error);
      }
    }

    for (const productId of guestWishlist.products) {
      try {
        await apiRequest(`/api/wishlist/${productId}`, "POST");
      } catch (error) {
        console.error("Failed to migrate wishlist item:", error);
      }
    }

    localStorageService.clearCart();
    localStorageService.clearWishlist();
  } catch (error) {
    console.error("Failed to migrate guest data:", error);
  }
}
