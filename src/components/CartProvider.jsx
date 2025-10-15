"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const CartCtx = createContext(null);

export function CartProvider({ children }) {
  const supabase = createSupabaseBrowserClient();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const getUserId = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .maybeSingle();

    return profile?.id ?? null;
  }, [supabase]);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const userId = await getUserId();

      if (!userId) {
        setItems([]);
        return;
      }

      const { data, error } = await supabase
        .from("cart")
        .select(
          `
          item_id,
          quantity,
          items:items ( id, price, img, available )
        `
        )
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching cart items", error);
        setItems([]);
        return;
      }

      const next = (data ?? []).map((row) => {
        const pid = Number(row.item_id);
        const p = row.items || {};

        return {
          id: pid,
          name: `Product ${pid}`,
          price: Number(p.price || 0),
          image: `/items/item${p.img}.png`,
          available: p.available,
          quantity: Number(row.quantity || 0),
        };
      });

      setItems(next);
    } finally {
      setLoading(false);
    }
  }, [getUserId, supabase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const changeQty = useCallback(
    async (itemId, delta) => {
      const userId = await getUserId();

      if (!userId) return;

      const targetId = Number(itemId);
      const current = items.find((i) => Number(i.id) === targetId);
      const nextQty = (current?.quantity || 0) + delta;

      if (nextQty <= 0) {
        const { error } = await supabase
          .from("cart")
          .delete()
          .eq("user_id", userId)
          .eq("item_id", targetId);

        if (!error) {
          setItems((prev) => prev.filter((i) => Number(i.id) !== targetId));
        }
      } else {
        const { error } = await supabase
          .from("cart")
          .update({ quantity: nextQty })
          .eq("user_id", userId)
          .eq("item_id", targetId);

        if (!error) {
          setItems((prev) =>
            prev.map((i) =>
              Number(i.id) === targetId ? { ...i, quantity: nextQty } : i
            )
          );
        }
      }
    },
    [getUserId, items, supabase]
  );

  const addOne = useCallback(
    async (itemId) => {
      const userId = await getUserId();

      if (!userId) return;

      const targetId = Number(itemId);

      const { data: existing } = await supabase
        .from("cart")
        .select("quantity")
        .eq("user_id", userId)
        .eq("item_id", targetId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("cart")
          .update({ quantity: Number(existing.quantity || 0) + 1 })
          .eq("user_id", userId)
          .eq("item_id", targetId);

        if (!error) {
          setItems((prev) =>
            prev.map((i) =>
              Number(i.id) === targetId ? { ...i, quantity: i.quantity + 1 } : i
            )
          );
        }
      } else {
        const { error } = await supabase
          .from("cart")
          .insert({ user_id: userId, item_id: targetId, quantity: 1 });

        if (!error) await refresh();
      }
    },
    [getUserId, supabase, refresh]
  );

  const clearCart = useCallback(async () => {
    const userId = await getUserId();

    if (!userId) return;

    const { error } = await supabase
      .from("cart")
      .delete()
      .eq("user_id", userId);

    if (!error) setItems([]);
  }, [getUserId, supabase]);

  return (
    <CartCtx.Provider
      value={{ items, loading, refresh, changeQty, addOne, clearCart }}
    >
      {children}
    </CartCtx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
