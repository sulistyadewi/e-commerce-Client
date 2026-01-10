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
        <div className="flex flex-col justify-center">
          {orders.map((order, index) => (
            <div key={index} className="border max-w-lg bg-blue-300">
              <button onClick={() => router.push(`/orders/${order.id}`)}>
                <div>
                  <h1>Order ID: #{order.id.slice(0, 7)}</h1>
                  <h1>{formattedDate(order.created_at)}</h1>
                  <h2>{order.status}</h2>
                  <h2>{order.payment_method}</h2>
                  <h1>{formattedCurrency(order.total_amount)}</h1>
                  <p>{order.order_items.length}</p>
                </div>
                <div>
                  {order.order_items.slice(0, 2).map((item, idx) => (
                    <div key={idx}>
                      <h2>{item.products?.name}</h2>
                      <h2>{item.quantity}</h2>
                      <h2>{item.price}</h2>
                      <h2>{item.price * item.quantity}</h2>
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
