import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

let debug = false;

let cache = {
  userId: null,
  events: [],
  lastLoadedAt: 0,
  ttlMs: 60_000,
  limit: 50,
};

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** place normalizeEvent before any calls to it */
function normalizeEvent(e, userId) {
  return {
    timestamp: Number(e.timestamp),
    user_id: Number(e.user_id ?? e.visitor_id ?? userId),
    event: String(e.event),
    item_id: e.item_id == null ? null : Number(e.item_id),
    transaction_id: e.transaction_id ?? null,
    available: e.available ?? true,
    category_id: e.category_id ? String(e.category_id) : undefined,
  };
}

export async function getIntegerUserId(supabase) {
  if (cache.userId) {
    if (debug) console.log("[utils] getIntegerUserId: cache hit ->", cache.userId);
    return cache.userId;
  }
  if (debug) console.time("[utils] getIntegerUserId");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    if (debug) console.warn("[utils] getIntegerUserId: no auth user");
    if (debug) console.timeEnd("[utils] getIntegerUserId");
    return null;
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (debug) console.timeEnd("[utils] getIntegerUserId");

  if (error) {
    if (debug) console.error("[utils] getIntegerUserId error:", error);
    return null;
  }

  cache.userId = profile?.id ?? null;
  if (debug) console.log("[utils] getIntegerUserId: loaded ->", cache.userId);
  return cache.userId;
}

export async function getNextTransactionId(supabase) {
  if (debug) console.time("[utils] next_transaction_id");
  const { data, error } = await supabase.rpc("next_transaction_id");
  if (debug) console.timeEnd("[utils] next_transaction_id");
  if (error) {
    if (debug) console.error("[utils] next_transaction_id error:", error);
    throw error;
  }
  return data;
}

export async function recordEvent(
  supabase,
  { event, itemId = null, transactionId = null }
) {
  const visitorId = await getIntegerUserId(supabase);
  if (!visitorId) {
    if (debug) console.warn("[utils] recordEvent: no visitorId, skipping");
    return;
  }

  const row = {
    timestamp: Date.now(),
    visitor_id: visitorId,
    item_id: itemId,
    transaction_id: transactionId,
    event,
  };

  if (debug) console.time("[utils] insert_event");
  const { error } = await supabase.from("events").insert(row);
  if (debug) console.timeEnd("[utils] insert_event");

  if (error) {
    if (debug) console.error("[utils] recordEvent insert error:", error);
    throw error;
  }

  // update local cache immediately (unshift = front)
  cache.events.unshift(
    normalizeEvent({ ...row, user_id: visitorId }, visitorId)
  );
  if (cache.events.length > cache.limit) cache.events.length = cache.limit;

  if (debug) console.log(
    "[utils] recordEvent cached:",
    event,
    "item:",
    itemId,
    "events_cached=",
    cache.events.length
  );
}

export const recordView = (supabase, itemId) =>
  recordEvent(supabase, { event: "view", itemId });

export const recordAddToCart = (supabase, itemId) =>
  recordEvent(supabase, { event: "addtocart", itemId });

export async function recordTransaction(supabase) {
  const txId = await getNextTransactionId(supabase);
  await recordEvent(supabase, { event: "transaction", transactionId: txId });
  return txId;
}

async function loadEventsIfStale(supabase, limit = cache.limit) {
  const now = Date.now();
  const age = now - cache.lastLoadedAt;

  if (cache.events.length && age < cache.ttlMs) {
    if (debug) console.log(
      "[utils] loadEventsIfStale: cache fresh, age=",
      age,
      "ms, size=",
      cache.events.length
    );
    return;
  }

  const userId = await getIntegerUserId(supabase);
  if (!userId) {
    if (debug) console.warn("[utils] loadEventsIfStale: no userId");
    cache.events = [];
    cache.lastLoadedAt = now;
    return;
  }

  if (debug) console.time("[utils] rpc:get_latest_events_by_id");
  const { data, error } = await supabase.rpc("get_latest_events_by_id", {
    user_id: userId,
    limit_count: limit,
  });
  if (debug) console.timeEnd("[utils] rpc:get_latest_events_by_id");

  if (error) {
    if (debug) console.error("[utils] loadEventsIfStale RPC error:", error);
    throw error;
  }

  cache.events = (data ?? []).map((e) => normalizeEvent(e, userId));
  cache.lastLoadedAt = now;
  if (cache.events.length > cache.limit) cache.events.length = cache.limit;

  if (debug) console.log(
    "[utils] loadEventsIfStale: loaded",
    cache.events.length,
    "events"
  );
}

export async function getRecommendations(supabase, opts = {}) {
  const k = opts.k ?? 10;
  const limit = opts.limit ?? 25;
  if (debug) console.log("[utils] getRecommendations k=", k, "limit=", limit);

  await loadEventsIfStale(supabase, limit);
  const events = cache.events.slice(0, limit);
  if (debug) console.log("[utils] events used for recs:", events.length);
  if (!events.length) return [];

  const url =
    typeof window === "undefined"
      ? process.env.RECS_API_URL
      : process.env.NEXT_PUBLIC_RECS_API_URL;
  if (debug) console.log("[utils] recs url:", url);
  if (!url) throw new Error("RECS API URL missing");

  if (debug) console.time("[utils] recs_api");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ events, k, filter_viewed: true }),
    cache: "no-store",
  });
  if (debug) console.timeEnd("[utils] recs_api");

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    if (debug) console.error("[utils] recs_api error:", res.status, msg);
    throw new Error(`Recs API error: ${res.status} ${msg}`);
  }

  const { recommendations = [] } = await res.json();
  if (debug) console.log("[utils] recommendations:", recommendations.length);

  const ids = recommendations.map((r) => r.item_id);
  if (!ids.length) {
    if (debug) console.warn("[utils] no ids from recommendations");
    return [];
  }

  if (debug) console.time("[utils] rpc:get_items_by_ids");
  const { data: items, error: itemsErr } = await supabase.rpc(
    "get_items_by_ids",
    { ids }
  );
  if (debug) console.timeEnd("[utils] rpc:get_items_by_ids");

  if (itemsErr) {
    if (debug) console.error("[utils] get_items_by_ids error:", itemsErr);
    throw itemsErr;
  }

  const byId = new Map((items ?? []).map((r) => [r.id, r]));
  if (debug) console.log("[utils] items fetched:", byId.size);

  const hydrated = recommendations
    .slice()
    .sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity))
    .map((r) => {
      const it = byId.get(r.item_id);
      if (!it) {
        if (debug) console.warn("[utils] missing item for", r.item_id);
        return null;
      }
      return {
        id: String(it.id),
        price: it.price,
        image: `/items/item${it.img}.png`,
        available: it.available,
        category_id: String(it.category),
        // score: r.score,
        // rank: r.rank,
      };
    })
    .filter(Boolean);

  if (debug) console.log("[utils] hydrated recs:", hydrated.length);
  return hydrated;
}
