"use client";
import { useState, useEffect, useMemo } from "react";
import { apiFetch } from "@/src/lib/apiClient";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  stock: number;
  image_url: string;
};

type SortOptions =
  | "name-Ascending"
  | "name-Descending"
  | "price-Ascending"
  | "price-Descending";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [addId, setAddId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortOptions, setSortOPtions] = useState<SortOptions>("name-Ascending");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isStock, setIsStock] = useState<boolean>(false);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  // const [itemPerPage, setItemPerPage] = useState<number>(12);
  // const [sortedProduct, setSortedProduct] = useState<number>(1);
  const router = useRouter();
  const params = useParams();

  const itemPerPage = 12;

  const totalPageCount = Math.max(1, Math.ceil(products.length / itemPerPage));

  const filteredProduct = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const min = minPrice.trim() === "" ? null : Number(minPrice);
    const max = maxPrice.trim() === "" ? null : Number(maxPrice);
    if (!query) return products;

    return products.filter((product) => {
      if (isStock && product.stock <= 0) return false;
      if (min != null && !Number.isNaN(min) && product.price < min) {
        return false;
      }
      if (max != null && !Number.isNaN(max) && product.price > max) {
        return false;
      }
      if (!query) return products;
      const nameMatch = product.name.toLowerCase().includes(query);
      const descMatch = product.description.toLowerCase().includes(query);
      return nameMatch || descMatch;
    });
  }, [products, searchQuery, minPrice, maxPrice, isStock]);

  const sortedProduct = useMemo(() => {
    const item = [...filteredProduct];
    switch (sortOptions) {
      case "name-Ascending":
        return item.sort((a, b) => a.name.localeCompare(b.name));
      case "name-Descending":
        return item.sort((a, b) => b.name.localeCompare(a.name));
      case "price-Ascending":
        return item.sort((a, b) => a.price - b.price);
      case "price-Descending":
        return item.sort((a, b) => b.price - a.price);
      default:
        return item;
    }
  }, [filteredProduct, sortOptions]);

  console.log(sortedProduct, "ini sorted");

  const pageProduct = useMemo(() => {
    const start = (currentPage - 1) * itemPerPage;
    return products.slice(start, start + itemPerPage);
  }, [sortedProduct, currentPage]);

  console.log(pageProduct, "ini page product");

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
            : "Failed to fetch Products from Supabase",
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
    <div className="flex flex-col justify-center bg-">
      {/* {products.length === 0 ? (
        <p>no products avaible.</p>
      ) : ( */}
      <div>
        <div className="flex gap-3">
          <label htmlFor="">Filter</label>
          <label htmlFor="">
            <input
              type="checkbox"
              checked={isStock}
              onChange={(e) => setIsStock(e.target.checked)}
            />
            Stock Only
          </label>
          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="bg-slate-300"
          />
          <input
            type="number"
            max="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="bg-slate-300"
          />
        </div>
        <div className="flex gap-2">
          <label htmlFor="">Sorted by</label>
          <select
            name=""
            id=""
            value={sortOptions}
            onChange={(e) => setSortOPtions(e.target.value as SortOptions)}
            className="border rounded-md"
          >
            <option value="name-Ascending" className="">
              A-Z
            </option>
            <option value="name-Descending">Z-A</option>
            <option value="price-Ascending">Cheap-Expensive</option>
            <option value="price-Descending">Expensive-Cheap</option>
          </select>
        </div>
      </div>
      <div className="flex justify-center gap-3">
        <button
          onClick={() => setCurrentPage((e) => Math.max(1, e - 1))}
          disabled={currentPage === 1}
          className="hover:cursor-pointer disabled:text-slate-400"
        >
          Prev
        </button>
        <h1>{`${currentPage} / ${totalPageCount}`}</h1>
        <button
          onClick={() => setCurrentPage((e) => Math.max(1, e + 1))}
          disabled={currentPage === totalPageCount}
          className="hover:cursor-pointer disabled:text-slate-400"
        >
          Next
        </button>
      </div>
      <div className="grid grid-cols-4 p-4 gap-10 mx-auto">
        {pageProduct.map((product) => (
          <div
            key={product.id}
            className="bg-white max-w-56 rounded-md drop-shadow-lg transition-shadow mt-5"
          >
            <div className="rounded-b-lg h-40 flex items-center justify-center rounded-md bg-gray-200">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  width={80}
                  height={80}
                  alt={product.name}
                  className="object-cover"
                />
              ) : null}
              {/* <img
                className="rounded-b-lg flex items-center justify-center rounded-md w-full h-full object-contain"
                src={product.image_url}
                alt={product.name}
              /> */}
            </div>
            <div className="m-3">
              <h2 className="capitalize">{product.name}</h2>
              <p className="text-sm text-slate-500 capitalize">
                {product.description}
              </p>
              <h2 className="capitalize">
                Rp {product.price.toLocaleString("id")}
              </h2>
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
                <button
                  onClick={() => router.push(`/products/${product.id}`)}
                  className="border border-blue-400 px-4 py-2 rounded-xl text-sm"
                >
                  Lihat Detail
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
