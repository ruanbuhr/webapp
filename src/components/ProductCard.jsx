"use client";

import Link from "next/link";
import { useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { recordView, recordAddToCart, getIntegerUserId } from "@/lib/utils";

export default function ProductCard({ product }) {
  const { id, name, price, image, available } = product;
  const [isPending, startTransition] = useTransition();

  const handleView = async () => {
    const supabase = createSupabaseBrowserClient();
    recordView(supabase, id).catch(() => {});
  };

  // Add one instance of item to the cart
  const handleAddToCart = async () => {
    const supabase = createSupabaseBrowserClient();

    const integerUserId = await getIntegerUserId(supabase);
    if (!integerUserId) return;

    startTransition(async () => {
      const { data: existingItem } = await supabase
        .from("cart")
        .select("quantity")
        .eq("user_id", integerUserId)
        .eq("item_id", id)
        .maybeSingle();

      if (existingItem) {
        const { error } = await supabase
          .from("cart")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("user_id", integerUserId)
          .eq("item_id", id);

        if (error) console.error("Error updating cart:", error);
      } else {
        const { error } = await supabase.from("cart").insert({
          user_id: integerUserId,
          item_id: id,
          quantity: 1,
        });

        if (error) console.error("Error inserting item:", error);
      }

      try {
        await recordAddToCart(supabase, id);
      } catch {}
    });
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out bg-white">
      <Link href={`/product/${id}`} onMouseDown={handleView}>
        <div className="block">
          <img
            src={image}
            alt={`Image of ${name}`}
            className="w-full h-48 object-contain"
          />
        </div>
      </Link>
      <div className="p-4">
        <h3 className="text-sm text-gray-600">{`Product: ${id}`}</h3>
        <p className="text-lg font-bold text-red-500 mt-1">{`R ${price.toFixed(
          2
        )}`}</p>
        <p
          className={`mt-2 text-xs font-bold uppercase leading-none h-4 ${
            available ? "invisible" : "text-red-600"
          }`}
        >
          NOT AVAILABLE
        </p>

        <Button
          onClick={handleAddToCart}
          disabled={isPending || !available}
          className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isPending ? "ADDING..." : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
