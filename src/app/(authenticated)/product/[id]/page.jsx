import DetailProductCard from "@/components/DetailProductCard";
import ProductsSlider from "@/components/ProductsSlider";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { getRecommendations } from "@/lib/utils"

export default async function getProductData({ params }) {
  const { id } = await params;

  const supabase = createSupabaseServerClient();

  const { data: product, error } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !product) notFound();

  const productWithDetails = {
    ...product,
    image: `/items/item${product.img}.png`,
  };

  let recommendedProducts = [];
  recommendedProducts = await getRecommendations(supabase);

  return (
    <div className="my-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <DetailProductCard product={productWithDetails} />
        <ProductsSlider
          products={recommendedProducts}
          title="YOU MAY ALSO LIKE"
        />
      </div>
    </div>
  );
}
