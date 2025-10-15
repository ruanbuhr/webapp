import ProductsSlider from "@/components/ProductsSlider";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getRecommendations } from "@/lib/utils"

export default async function HomePage() {
  const supabase = createSupabaseServerClient();

  let recommendedProducts = [];
  recommendedProducts = await getRecommendations(supabase);

  // Fetch dynamic category data from Supabase
  const { data: items, error } = await supabase.rpc(
    "get_random_category_items"
  );

  if (error) {
    console.error("Error fetching items:", error);
    // Potential error component rendering
  }

  // Group the array from RPC by category id.
  const categories = items?.reduce((acc, item) => {
    const categoryKey = item.category;

    if (!acc[categoryKey]) {
      acc[categoryKey] = [];
    }

    acc[categoryKey].push({
      ...item,
      image: `/items/item${item.img}.png`, // image path
    });

    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProductsSlider title="RECOMMENDED" products={recommendedProducts} />

      {error && (
        <p className="text-center text-red-500">Could not load products.</p>
      )}

      {categories &&
        Object.entries(categories).map(([categoryId, products]) => (
          <ProductsSlider
            key={categoryId}
            title={`CATEGORY ${categoryId}`}
            products={products}
          />
        ))}
    </div>
  );
}
