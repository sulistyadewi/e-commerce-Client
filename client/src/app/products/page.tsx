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
  image_url: string | null;
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await apiFetch<Product[]>("/products");
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

  return (
    <div className="h-screen">
      <Navbar />
      {/* {products.length === 0 ? (
        <p>no products avaible.</p>
      ) : ( */}
      <div className="grid grid-cols-5 p-4 gap-3">
        <div className="bg-white max-w-56 rounded-md drop-shadow-lg transition-shadow">
          <div className="rounded-b-lg bg-gray-200 h-40 flex items-center justify-center rounded-md">
            Image
          </div>
          <div className="m-3">
            <h2 className="">Product Name</h2>
            <p className="text-sm text-slate-500">Description</p>
            <h2 className="">Price</h2>
            <h3 className="text-sm text-slate-500">Stock</h3>
            <div className="flex justify-center gap-4 mt-3">
              <button className="outline-1 outline-blue-400 px-3 py-2 rounded-xl">
                Buy now
              </button>
              <button className="bg-blue-400 px-2 py-1 rounded-xl">
                Add to cart
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* )} */}
    </div>
  );
}
