"use client";
import React, { useState, useEffect, useMemo } from "react";
import { apiFetch } from "@/src/lib/apiClient";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabaseClient";
import { IoClose } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";

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

type SortOptions =
  | "name-ascending"
  | "name-descending"
  | "price-ascending"
  | "price-descending";

export default function ProductAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductForm>(EmptyForm);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [sortOptions, setSortOptions] = useState<SortOptions>("name-ascending");
  const [selectCategory, setSelectCategory] = useState<string>("");
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
      setIsFormOpen(false);
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
    setIsFormOpen(true);
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

  const itemPerPage = 5;

  const filterProduct = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchCategory =
        selectCategory === "" || product.category_id === selectCategory;
      const matchSearch =
        query === "" ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);
      return matchCategory && matchSearch;
    });
  }, [products, searchQuery, selectCategory]);

  const sortedProduct = useMemo(() => {
    const item = [...filterProduct];
    switch (sortOptions) {
      case "name-ascending":
        return item.sort((a, b) => a.name.localeCompare(b.name));
      case "name-descending":
        return item.sort((a, b) => b.name.localeCompare(a.name));
      case "price-ascending":
        return item.sort((a, b) => a.price - b.price);
      case "price-descending":
        return item.sort((a, b) => b.price - a.price);
      default:
        return item;
    }
  }, [filterProduct, sortOptions]);

  const totalPageCount = Math.max(
    1,
    Math.ceil(sortedProduct.length / itemPerPage),
  );

  const pageProductAdmin = useMemo(() => {
    const start = (currentPage - 1) * itemPerPage;
    return sortedProduct.slice(start, start + itemPerPage);
  }, [sortedProduct, currentPage, itemPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectCategory, sortOptions]);

  return (
    <div>
      {isAdmin === false ? (
        <div>Halaman ini hanya untuk Admin</div>
      ) : (
        <div>
          {isFormOpen && (
            <div className="fixed inset-0 flex flex-col justify-center items-center bg-black/50">
              <div className="fixed mb-116 ml-108">
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="bg-red-600 rounded-full w-8 h-8 font-semibold"
                >
                  <IoClose
                    aria-hidden="true"
                    className="text-white mx-auto text-2xl"
                  />
                </button>
              </div>
              <form
                onSubmit={handleSubmit}
                className="bg-green-300 max-w-md flex flex-col justify-center p-4 rounded-lg"
              >
                {/* =====NAME===== */}
                <div className="flex flex-col">
                  <label htmlFor="">Product Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="bg-white p-2 rounded-md"
                  />
                </div>
                {/* ======DESCRIPTION====== */}
                <div className="flex flex-col mt-2">
                  <label htmlFor="">Description</label>
                  <textarea
                    name=""
                    id=""
                    value={form.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    className="bg-white p-2 rounded-md"
                  />
                </div>
                {/* ======IMAGE====== */}
                <div className="flex flex-col mt-2">
                  <label htmlFor="">Image Link</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                    className="bg-white p-2 rounded-md"
                  />
                </div>{" "}
                {/* ======PRICE & STOCK====== */}
                <div className="flex gap-3 mt-2">
                  {/* =====PRICE===== */}
                  <div className="flex flex-col">
                    <label htmlFor="">Price</label>
                    <input
                      type="text"
                      value={form.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                      className="bg-white p-2 rounded-md"
                    />
                  </div>{" "}
                  {/* =====STOCK===== */}
                  <div className="flex flex-col">
                    <label htmlFor="">Stock</label>
                    <input
                      type="text"
                      value={form.stock}
                      onChange={(e) => handleChange("stock", e.target.value)}
                      className="bg-white p-2 rounded-md"
                    />
                  </div>{" "}
                </div>
                {/* ======RATING & CATEGORY====== */}
                <div className="flex gap-3 mt-2">
                  {/* ====RATING==== */}
                  <div className="flex flex-col">
                    <label htmlFor="">Rating</label>
                    <input
                      type="text"
                      value={form.rating}
                      onChange={(e) => handleChange("rating", e.target.value)}
                      className="bg-white p-2 rounded-md"
                    />
                  </div>{" "}
                  {/* =====CATEGORY===== */}
                  <div className="flex flex-col">
                    <label htmlFor="">Category</label>
                    <select
                      id=""
                      value={form.category_id}
                      onChange={(e) =>
                        handleChange("category_id", e.target.value)
                      }
                      className="bg-white p-2 p rounded-md"
                    >
                      <option value="">Pilih Category</option>
                      {category.map((item, id) => (
                        <option value={item.id} key={id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>{" "}
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-2 py-2 bg-green-800 rounded mt-5 w-full text-white"
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
          )}

          <div className="flex justify-between p-4 mt-4">
            <div className="flex justify-start gap-3">
              <div className="">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border p-2 rounded-lg w-64"
                />
              </div>

              <div className="">
                <select
                  name=""
                  id=""
                  value={sortOptions}
                  onChange={(e) =>
                    setSortOptions(e.target.value as SortOptions)
                  }
                  className="border rounded-md p-2"
                >
                  <option value="name-ascending">Name A-Z</option>
                  <option value="name-descending">Name Z-A</option>
                  <option value="price-ascending">Termurah-Termahal</option>
                  <option value="price-descending">Termahal-Termurah</option>
                </select>
              </div>

              <div>
                <select
                  name=""
                  id=""
                  value={selectCategory}
                  onChange={(e) => setSelectCategory(e.target.value)}
                  className="border rounded-md p-2"
                >
                  <option value="">Select Category</option>
                  {category.map((item) => (
                    <option value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="">
              <button
                onClick={() => setIsFormOpen(true)}
                className="mx-auto bg-green-600 w-10 h-10 rounded-full"
              >
                <IoMdAdd className="mx-auto text-white text-2xl font-semibold" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto shadow-xs rounded-md border  border-emerald-500 mx-3 mt-2">
            <table className="w-full text-sm text-left rtl:text-right rounded">
              <thead className="text-sm bg-emerald-500 rounded-md">
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
              <tbody className="">
                {pageProductAdmin.map((product, index) => (
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
                    <td className="px-6 py-4">
                      Rp {product.price.toLocaleString("id")}
                    </td>
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
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage((e) => Math.max(1, e - 1))}
              disabled={currentPage === 1}
              className="hover:cursor-pointer disabled:text-slate-400"
            >
              Prev
            </button>
            <h1>{` ${currentPage} / ${totalPageCount} `}</h1>
            <button
              onClick={() => setCurrentPage((e) => Math.max(1, e + 1))}
              disabled={currentPage === totalPageCount}
              className="hover:cursor-pointer disabled:text-slate-400"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
