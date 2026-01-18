"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "@/src/lib/apiClient";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabaseClient";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  rating: number | null;
  image_url: string | null;
  category_id: string | null;
};

type ProductForm = {
  name: string;
  description: string;
  price: string;
  stock: string;
  rating: string | null;
  image_url: string | null;
  category_id: string | null;
};

const EmptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  rating: "",
  image_url: "",
  category_id: "",
};

export default function ProductAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>(EmptyForm);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      const role = data.user?.user_metadata?.role ?? "customer";
      setIsAdmin(role === "admin");
    };
    loadUser();
  }, []);

  return (
    <div>
      {isAdmin === false ? (
        <div>Halaman ini hanya untuk Admin</div>
      ) : (
        <div>
          <form action="">
            <div>
              <label htmlFor="">Product Name</label>
              <input type="text" />
            </div>
            <div>
              <label htmlFor="">Description</label>
              <textarea name="" id=""></textarea>
            </div>
            <div>
              <label htmlFor="">Price</label>
              <input type="text" />
            </div>{" "}
            <div>
              <label htmlFor="">Stock</label>
              <input type="text" />
            </div>{" "}
            <div>
              <label htmlFor="">Image Link</label>
              <input type="text" />
            </div>{" "}
            <div>
              <label htmlFor="">Rating</label>
              <input type="text" />
            </div>{" "}
            <div>
              <label htmlFor="">Category</label>
              <input type="text" />
            </div>{" "}
          </form>
        </div>
      )}
    </div>
  );
}
