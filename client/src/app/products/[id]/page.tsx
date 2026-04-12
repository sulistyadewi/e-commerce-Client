"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { apiFetch } from "@/src/lib/apiClient";

type ProductDetail = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  rating: number | null;
  image_url: string;
  category_id: string;
};

export default function ProductDetail() {
  const [product, setProduct] = useState<ProductDetail | null>(null);

  const router = useRouter();
  const params = useParams();

  const productId = Array.isArray(params.id)
    ? params.id[0]
    : (params.id as string) || undefined;

  useEffect(() => {
    if (!productId) {
      <div>product id tidak ditemukan</div>;
    }

    const loadProductDetail = async () => {
      try {
        const data = await apiFetch<ProductDetail>(`/product/${productId}`);
        setProduct(data);
      } catch {
        const data = await apiFetch<ProductDetail[]>("/product");
        const filterProduct =
          data.find((item) => item.id === productId) ?? null;
        setProduct(filterProduct);
        if (!filterProduct) {
          console.log("product tidak ditemukan");
          return;
        }
      }
    };
    loadProductDetail();
  }, [productId]);

  if (!product) {
    return (
      <div>
        <button onClick={() => router.push("/products")}>Back</button>
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div className=" w-full flex justify-center flex-col  p-10">
      <div className="flex justify-center flex-col  w-2xl mx-auto">
        <div className="flex justify-center gap-4 ">
          <div className="max-w-lg">
            <Image
              src={product.image_url}
              alt={product.name}
              width={1000}
              height={1000}
              className="w-72 h-72 object-cover"
            />
          </div>
          <div>
            <h2 className="font-semibold text-xl">{product.name}</h2>
            <p className="text-slate-500 text-sm">
              Description: {product.description}
            </p>
            <h4 className="">Rp {product.price}</h4>
            <h4 className="">Stock: {product.stock}</h4>
            <h4 className="">{product.rating}</h4>
            <div className="">
              <button
                className="bg-green-600 text-white px-2 py-2 rounded"
                onClick={() => router.push("/products")}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
