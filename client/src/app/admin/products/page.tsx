"use client";
import React, { useState, useEffect } from "react";
import { apiFetch } from "@/src/lib/apiClient";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabaseClient";
import { log } from "console";

type Category = {
  id: string;
  name: string;
  description: string;
};

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
  rating: string;
  category_id: string;
};

const EmptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  rating: "",
  category_id: "",
};

export default function ProductAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductForm>(EmptyForm);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      const role = data.user?.user_metadata?.role ?? "customer";
      setIsAdmin(role === "admin");
    };
    loadUser();
  }, []);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<Product[]>("/product");
      console.log(data, "dari admin");
      setProducts(data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchCategory = async () => {
    try {
      const data = await apiFetch<Category[]>("/category");
      console.log(data, "ini data category");
      setCategory(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      Promise.all([fetchProduct(), fetchCategory()]).catch(() => {});
    } else if (isAdmin === false) {
      setLoading(false);
    }
  }, [isAdmin]);

  const resetForm = () => {
    setForm(EmptyForm);
    setEditId(null);
    setImageFile(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name || !form.price || !form.stock || !form.category_id) {
      setError("name, price, stock, category tidak boleh kosong");
    }
    setError(null);
    let imageUrl: string | null = null;
    try {
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const fileName = `${Date.now()} - ${Math.random().toString(36).slice(2)}.${ext}`;
        const filePath = `productImage/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from("productImage")
          .upload(filePath, imageFile, { contentType: imageFile.type });
        if (uploadError) {
          console.log(uploadError);
          throw uploadError;
        }
        const { data } = supabase.storage
          .from("productImage")
          .getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }
      if (!imageFile && !imageUrl && !editId) {
        let existingForm = products.find((item) => item.id === editId);
        imageUrl = existingForm?.image_url ?? null;
      }
      const payLoad: {
        name: string;
        description: string;
        price: number;
        stock: number;
        rating: number | null;
        category_id: string;
        image_url?: string | null;
      } = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        rating: form.rating ? Number(form.rating) : null,
        // image_url: imageUrl || null,
        category_id: form.category_id,
      };
      if (imageUrl) {
        payLoad.image_url = imageUrl;
      }

      if (editId) {
        await apiFetch(`/product/${editId}`, { method: "PUT", body: payLoad });
      } else {
        await apiFetch("/product", { method: "POST", body: payLoad });
      }
      await fetchProduct();
      resetForm();
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (key: keyof ProductForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleEdit = async (product: Product) => {
    setEditId(product.id);
    setForm({
      name: product.name ?? "",
      description: product.description ?? "",
      price: String(product.price) ?? "",
      stock: String(product.stock) ?? "",
      image_url: product.image_url ?? "",
      rating: product.rating ? String(product.rating) : "",
      category_id: product.category_id ?? "",
    });
    setImageFile(null);
  };

  const handleDelete = async (productId: string) => {
    const confirmDelete = window.confirm("Apakah Produk ingin dihapus?");
    if (!confirmDelete) return;
    try {
      await apiFetch(`/product/${productId}`, { method: "DELETE" });
      await fetchProduct();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      {isAdmin === false ? (
        <div>Halaman ini hanya untuk Admin</div>
      ) : (
        <div>
          <div className="flex flex-col justify-center">
            <form
              onSubmit={handleSubmit}
              className="bg-gray-200 max-w-md flex flex-col justify-center p-2"
            >
              <div className="flex flex-col">
                <label htmlFor="">Product Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="bg-white p-2"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="">Description</label>
                <textarea
                  name=""
                  id=""
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="bg-white p-2"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="">Price</label>
                <input
                  type="text"
                  value={form.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  className="bg-white p-2"
                />
              </div>{" "}
              <div className="flex flex-col">
                <label htmlFor="">Stock</label>
                <input
                  type="text"
                  value={form.stock}
                  onChange={(e) => handleChange("stock", e.target.value)}
                  className="bg-white p-2"
                />
              </div>{" "}
              <div className="flex flex-col">
                <label htmlFor="">Image Link</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  className="bg-white p-2"
                />
              </div>{" "}
              <div className="flex flex-col">
                <label htmlFor="">Rating</label>
                <input
                  type="text"
                  value={form.rating}
                  onChange={(e) => handleChange("rating", e.target.value)}
                  className="bg-white p-2"
                />
              </div>{" "}
              {/* CATEGORY */}
              <div className="flex flex-col">
                <label htmlFor="">Category</label>
                <select
                  id=""
                  value={form.category_id}
                  onChange={(e) => handleChange("category_id", e.target.value)}
                  className="bg-white"
                >
                  <option value="">Pilih Category</option>
                  {category.map((item, id) => (
                    <option value={item.id} key={id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>{" "}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-2 py-2 bg-blue-500 rounded mt-5"
                >
                  {saving ? "Saving..." : editId ? "Edit" : "Create"}
                </button>
                {editId ? (
                  <button className=" px-2 py-2 bg-red-500 text-white rounded mt-5">
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </div>

          <div className="overflow-x-auto shadow-xs rounded-base border px-5">
            <table className="w-full text-sm text-left rtl:text-right ">
              <thead className="text-sm bg-slate-300">
                <tr>
                  {/* <th scope="col" className="px-6 py-3 font-medium">
                    Image
                  </th> */}
                  <th scope="col" className="px-6 py-3 font-medium">
                    Product Name
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Stock
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr
                    key={index}
                    className="bg-neutral-primary-soft border-b border-default hover:bg-neutral-secondary-medium"
                  >
                    {/* <th
                      scope="row"
                      className="px-6 py-4 font-medium text-heading whitespace-nowrap w-20 h-20"
                    >
                      <img src={product.image_url} alt={product.name} />
                    </th> */}
                    <td className="px-6 py-4">{product.name}</td>
                    <td className="px-6 py-4">{product.description}</td>
                    <td className="px-6 py-4">{product.price}</td>
                    <td className="px-6 py-4">{product.stock}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-400 hover:underline mx-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
