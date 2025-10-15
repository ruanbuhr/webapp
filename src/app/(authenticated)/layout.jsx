import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AuthenticatedLayout({ children }) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: categories, error } = await supabase
    .from("categories")
    .select("category")
    .order("category", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar categories={categories} />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
