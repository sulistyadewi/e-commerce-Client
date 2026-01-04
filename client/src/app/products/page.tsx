"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "@/src/lib/apiClient";
import Navbar from "@/src/components/navbar";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  stock: number;
  image_url: string;
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [addId, setAddId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await apiFetch<Product[]>("/product");
        setProducts(data);
        console.log(data, "ini data dari products");
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch Products from Supabase"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  console.log(products, "ini products");

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    <div>{error}</div>;
  }

  const handleAddToCart = async (productId: string) => {
    try {
      setAddId(productId);
      await apiFetch("/cart", {
        method: "POST",
        body: { product_id: productId, quantity: 1 },
      });
      alert("Add to cart");
    } catch (err) {
      alert(err instanceof Error ? err.message : "failed add to cart");
    }
  };

  return (
    <div className="bg-">
      <Navbar />
      {/* {products.length === 0 ? (
        <p>no products avaible.</p>
      ) : ( */}
      <div className="grid grid-cols-5 p-4 gap-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white max-w-56 rounded-md drop-shadow-lg transition-shadow"
          >
            <div className="rounded-b-lg h-40 flex items-center justify-center rounded-md">
              <img
                className="rounded-b-lg flex items-center justify-center rounded-md w-full h-full object-contain"
                src={product.image_url}
                alt={product.name}
              />
            </div>
            <div className="m-3">
              <h2 className="capitalize">{product.name}</h2>
              <p className="text-sm text-slate-500 capitalize">
                {product.description}
              </p>
              <h2 className="capitalize">Rp {product.price}</h2>
              <h3 className="text-sm text-slate-500">{product.stock}</h3>
              <div className="flex gap-2 mt-3 justify-between">
                <button className="border border-blue-400 px-4 py-2 rounded-xl text-sm">
                  Buy now
                </button>
                <button
                  onClick={() => handleAddToCart(product.id)}
                  disabled={product.stock === 0 || addId === product.id}
                  className="bg-blue-400 px-4 py-1 rounded-xl text-sm"
                >
                  {addId === product.id ? "Adding" : "Add to cart"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* )} */}
    </div>
  );
}
