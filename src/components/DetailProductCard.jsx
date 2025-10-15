"use client";

import { useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { recordAddToCart, getIntegerUserId } from "@/lib/utils";

export default function DetailProductCard({ product }) {
  const { id, price, image, available } = product;
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();

  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  // Add item to the database
  const handleAddToCart = async () => {
    const supabase = createSupabaseBrowserClient();

    const integerUserId = await getIntegerUserId(supabase);
    if (!integerUserId) return;

    startTransition(async () => {
      const { data: existingItem, error: fetchError } = await supabase
        .from("cart")
        .select("quantity")
        .eq("user_id", integerUserId)
        .eq("item_id", id)
        .maybeSingle();

      if (existingItem) {
        const { error } = await supabase
          .from("cart")
          .update({ quantity: existingItem.quantity + quantity })
          .eq("user_id", integerUserId)
          .eq("item_id", id);

        if (error) console.error("Error updating cart:", error);
      } else {
        const { error } = await supabase.from("cart").insert({
          user_id: integerUserId,
          item_id: id,
          quantity: quantity,
        });

        if (error) console.error("Error inserting item:", error);
      }

      try {
        await recordAddToCart(supabase, id);
      } catch {}
    });
  };

  return (
    <div className="container mx-auto my-12 p-6">
      <div className="max-w-4xl mx-auto border rounded-lg shadow-xl bg-white p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <img
              src={image}
              alt={`Image of ${id}`}
              className="w-full h-auto rounded-lg object-cover"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">{`Product: ${id}`}</h2>
            <p className="text-3xl font-bold text-red-500 mb-6">{`R ${price.toFixed(
              2
            )}`}</p>
            <p
              className={`mt-2 text-xs font-bold uppercase leading-none h-4 ${
                available ? "invisible" : "text-red-600"
              }`}
            >
              NOT AVAILABLE
            </p>

            <div className="flex items-center mb-6">
              <Button
                variant="outline"
                size="icon"
                onClick={decrement}
                className="rounded-full"
                disabled={isPending || !available}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="mx-4 text-lg font-semibold">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={increment}
                className="rounded-full"
                disabled={isPending || !available}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              size="lg"
              className="w-full text-white bg-red-500 hover:bg-red-600 transition-colors"
              onClick={handleAddToCart}
              disabled={isPending || !available}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {isPending ? "ADDING..." : "ADD TO CART"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
