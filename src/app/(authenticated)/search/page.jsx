import ProductCard from "@/components/ProductCard";
import DetailProductCard from "@/components/DetailProductCard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function SearchPage({ searchParams }) {
  const supabase = createSupabaseServerClient();

  const sp = await searchParams;

  const idParam = Array.isArray(sp?.id) ? sp.id[0] : sp?.id ?? null;

  const categoryParam = Array.isArray(sp?.category)
    ? sp.category[0]
    : sp?.category ?? null;

  // Search by ID
  if (idParam) {
    const id = Number(idParam);

    const { data: item, error } = await supabase
      .from("items")
      .select("id, category, available, price, img")
      .eq("id", id)
      .maybeSingle();

    if (error) console.error(error);

    if (!item) {
      return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center">No item found with id {id}.</p>
        </div>
      );
    }

    const product = {
      id: item.id,
      name: `Item ${item.id}`,
      price: item.price ?? 0,
      image: `/items/item${item.img}.png`,
      available: item.available,
    };

    return <DetailProductCard product={product} />;
  }

  // Search by Category
  if (categoryParam) {
    const category = Number(categoryParam);

    const { data, error } = await supabase.rpc("get_items_by_category", {
      p_category: category,
    });

    if (error) console.error(error);

    const products =
      (data ?? []).map((item) => ({
        id: item.id,
        name: `Item ${item.id}`,
        price: item.price ?? 0,
        image: `/items/item${item.img}.png`,
        available: item.available,
      })) ?? [];

    if (products.length === 0) {
      return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            CATEGORY {category}
          </h1>
          <p>No items in this category.</p>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          CATEGORY {category}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <p className="text-center">
        Use the search bar (by id) or pick a category.
      </p>
    </div>
  );
}
