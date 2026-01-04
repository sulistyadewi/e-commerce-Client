"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "@/src/lib/apiClient";
import { useRouter } from "next/navigation";
import Navbar from "@/src/components/navbar";

type CartRow = {
  id: string;
  quantity: number;
  products: {
    name: string;
    image_url: string;
    stock: number;
    price: number;
  } | null;
};

export default function Carts() {
  const [items, setItems] = useState<CartRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [coLoading, setCoLoading] = useState<boolean>(false);

  const router = useRouter();

  const fetchCart = async () => {
    try {
      const data = await apiFetch<CartRow[]>("/cart");
      setItems(data);
      setLoading(false);
      console.log(data[0].products);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed fetch cart");
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (cartId: string) => {
    try {
      await apiFetch(`/cart/${cartId}`, { method: "DELETE" });
      await fetchCart();
    } catch (err) {
      console.log(err);
    }
  };

  const updateQuantity = async (cartId: string, quantity: number) => {
    if (quantity <= 0) return;
    try {
      await apiFetch(`/cart/${cartId}`, {
        method: "PATCH",
        body: { quantity },
      });
      await fetchCart();
    } catch (err) {
      console.log(err);
    }
  };

  const total = items.reduce((sum, item) => {
    const price = item.products?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  const handleCheckout = async () => {
    try {
      setCoLoading(true);
      const data = await apiFetch<{ order_id: string; total_amount: number }>(
        "/order",
        { method: "POST" }
      );
      alert("checkout berhasil");
      console.log(data, "data orders");
      router.push("/orders");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="">
      <Navbar />
      <div className="">
        <h1 className="font-semibold text-3xl m-5 text-center">My Cart</h1>
        <div className="max-w-lg bg-blue-300 mx-auto p-4 rounded-md mb-10">
          <h1 className="text-left text-lg font-bold">Cart</h1>
          {items.length === 0 ? (
            "Your Cart is Empty"
          ) : (
            <div className="flex flex-col justify-center max-w-lg mx-auto">
              {items.map((item, index) => (
                <div key={index} className="my-4 ">
                  <div className="flex justify-between">
                    <div className="flex gap-3">
                      <img
                        src={item.products?.image_url}
                        alt={item.products?.name}
                        className="w-28 h-28 object-contain bg-white py-2 rounded-lg border "
                      />
                      <div className="grid flex-col content-between">
                        <div>
                          <h3 className="text-sm font-semibold mb-1 capitalize">
                            {item.products?.name}
                          </h3>
                          <h4 className="capitalize text-xs">
                            Category:
                            <span className="text-white "> ...</span>
                          </h4>
                          <h4 className="text-xs">
                            Price:{" "}
                            <span className="text-white ">
                              Rp{item.products?.price}
                            </span>
                          </h4>
                        </div>
                        <div className="border mt-5 rounded-full flex gap-2 justify-center w-20">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 0}
                            className="font-semibold"
                          >
                            -
                          </button>
                          <span className="border-x px-2 border-slate-500">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={
                              (item.products?.stock ?? 0) > 0 &&
                              item.quantity >= (item.products?.stock ?? 0)
                            }
                            title="Out of stock"
                            className="font-semibold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className=" flex-col content-between grid">
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                      <h2 className="font-semibold text-lg"></h2>
                    </div>
                  </div>
                  <div className="border border-gray-50 w-full rounded-full mt-5"></div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between">
            <h1 className="font-semibold text-lg">Grand Total: {total}</h1>
            <button
              onClick={() => handleCheckout()}
              className="bg-white rounded-md px-2 py-2"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
