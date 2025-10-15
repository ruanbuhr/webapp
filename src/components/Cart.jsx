"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "./CartProvider";

export default function Cart() {
  const { items, changeQty, loading, refresh } = useCart();
  const [pendingId, setPendingId] = useState(null);
  const router = useRouter();

  const formatR = (n) => `R${Number(n || 0).toFixed(2)}`;

  const adjust = async (itemId, delta) => {
    setPendingId(itemId);

    try {
      await changeQty(itemId, delta);
    } finally {
      setPendingId(null);
      router.refresh();
    }
  };

  return (
    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
        Shopping Cart
      </h1>

      <div className="hidden md:grid grid-cols-5 gap-4 mb-4 text-sm font-medium text-gray-500 dark:text-gray-400">
        <h2 className="col-span-2">PRODUCTS</h2>
        <h2 className="text-center">PRICE</h2>
        <h2 className="text-center">QUANTITY</h2>
        <h2 className="text-right">SUB-TOTAL</h2>
      </div>
      <Separator className="mb-4" />

      {loading ? (
        <p className="text-gray-600 dark:text-gray-300">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">Your cart is empty.</p>
      ) : (
        <div className="space-y-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-3 md:grid-cols-5 gap-4 items-center"
            >
              <div className="col-span-3 md:col-span-2 flex items-center gap-4">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-2">
                  <Image
                    src={item.image}
                    alt={`Product ${item.id}`}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {item.name || `Product: ${item.id}`}
                  </p>
                  <p className="md:hidden text-sm text-gray-600 dark:text-gray-300">
                    {formatR(item.price)}
                  </p>
                </div>
              </div>

              <div className="hidden md:flex justify-center">
                <p className="text-gray-800 dark:text-gray-300">
                  {formatR(item.price)}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => adjust(item.id, -1)}
                  disabled={pendingId === item.id}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="text"
                  readOnly
                  value={(item.quantity ?? 0).toString().padStart(2, "0")}
                  className="w-12 h-8 text-center bg-transparent"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => adjust(item.id, +1)}
                  disabled={pendingId === item.id}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-right font-medium text-gray-800 dark:text-white">
                <p>{formatR((item.price || 0) * (item.quantity || 0))}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> RETURN TO SHOP
          </Link>
        </Button>
      </div>
    </div>
  );
}
