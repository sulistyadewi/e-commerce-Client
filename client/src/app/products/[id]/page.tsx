"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

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
  });

  return (
    <div>
      <div>tes</div>
    </div>
  );
}
