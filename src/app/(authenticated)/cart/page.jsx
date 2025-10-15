import Cart from "@/components/Cart";
import CartTotal from "@/components/CartTotal";
import { CartProvider } from "@/components/CartProvider";

export default function CartPage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <CartProvider>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Cart />
            <CartTotal />
          </div>
        </CartProvider>
      </div>
    </div>
  );
}
