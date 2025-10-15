"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight } from "lucide-react";
import { useCart } from "./CartProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { recordEvent, getNextTransactionId } from "@/lib/utils";

export default function CartTotal() {
  const { items, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const router = useRouter();

  const { subtotal, shipping, discount, tax, total } = useMemo(() => {
    const sub = (items || []).reduce(
      (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0),
      0
    );

    const shipping = 0,
      discount = 0,
      tax = 0;

    return {
      subtotal: sub,
      shipping,
      discount,
      tax,
      total: sub + tax - discount + shipping,
    };
  }, [items]);

  const formatR = (n) => `R${Number(n || 0).toFixed(2)}`;

  const handleCheckout = async () => {
    if (!items?.length) return;

    setIsCheckingOut(true);

    try {
      const supabase = createSupabaseBrowserClient();

      const txId = await getNextTransactionId(supabase);

      await Promise.all(
        items.map((it) =>
          recordEvent(supabase, {
            event: "transaction",
            itemId: Number(it.id),
            transactionId: txId,
          })
        )
      );

      await clearCart().catch(() => {});
      router.push("/");
    } catch (e) {
      console.error("Checkout failed", e);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-fit">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        Cart Totals
      </h2>

      <div className="space-y-3 text-gray-600 dark:text-gray-300">
        <div className="flex justify-between">
          <span>Sub-total</span>
          <span>{formatR(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{shipping === 0 ? "Free" : formatR(shipping)}</span>
        </div>
        <div className="flex justify-between">
          <span>Discount</span>
          <span>{formatR(discount)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>{formatR(tax)}</span>
        </div>
        <Separator className="my-3" />
        <div className="flex justify-between text-lg font-bold text-gray-800 dark:text-white">
          <span>Total</span>
          <span>{formatR(total)}</span>
        </div>
      </div>

      <Button
        className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white"
        onClick={handleCheckout}
        disabled={isCheckingOut || (items || []).length === 0}
      >
        {isCheckingOut ? "PROCESSING..." : "PROCEED TO CHECKOUT"}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
