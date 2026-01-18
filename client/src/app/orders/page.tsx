"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/src/lib/apiClient";
import Navbar from "@/src/components/navbar";

type OrderRow = {
  id: string;
  total_amount: number;
  status: string;
  payment_method: string | null;
  created_at: string;
  order_items: {
    quantity: number;
    price: number;
    products: {
      name: string;
    } | null;
  }[];
};

export default function Orders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const statusShipping = (status: string) => {
    const normalLize = status.toLowerCase();
    if (normalLize.includes("paid")) {
      return;
    }
  };

  const fetchOrder = async () => {
    try {
      const data = await apiFetch<OrderRow[]>("/order");
      setOrders(data);
      console.log(data[0].order_items, "ini data orders");
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  const formattedDate = (value: string) =>
    new Date(value).toLocaleString("id-ID");

  const formattedCurrency = (value: number) =>
    `Rp ${value.toLocaleString("id-ID")}`;

  return (
    <div>
      <h1>Orders</h1>
      {loading ? (
        <div>Loading...</div>
      ) : orders.length === 0 ? (
        <div>kamu belum punya order</div>
      ) : (
        <div className="flex justify-center">
          {orders.map((order, index) => (
            <div
              key={index}
              className="w-lg bg-gray-200 rounded-lg shadow-md shadow-gray-400"
            >
              <button
                onClick={() => router.push(`/orders/${order.id}`)}
                className="w-full"
              >
                <div className="flex justify-between gap-5">
                  <div>
                    <h1>Order ID: #{order.id.slice(0, 7)}</h1>
                  </div>
                  <div className="flex flex-col text-left">
                    <h1>{formattedDate(order.created_at)}</h1>
                    <h2>Status: {order.status}</h2>
                    <h2>Payment: {order.payment_method}</h2>
                    <h1>
                      Grand Total: {formattedCurrency(order.total_amount)}
                    </h1>
                    <p>Total Items: {order.order_items.length}</p>
                  </div>
                </div>
                <div className="">
                  {order.order_items.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <h2>{item.products?.name}</h2>
                      <div>
                        <div className="flex gap-2">
                          <h2>{item.quantity}</h2>
                          <span>x</span>
                          <h2>{item.price}</h2>
                        </div>
                        <h2>{item.price * item.quantity}</h2>
                      </div>
                    </div>
                  ))}
                </div>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
