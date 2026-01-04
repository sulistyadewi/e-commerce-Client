"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/src/lib/apiClient";

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
    };
  };
};

export default function Orders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

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

  return (
    <div>
      <h1>Orders</h1>
      {loading ? (
        <div>Loading...</div>
      ) : orders.length === 0 ? (
        <div>kamu belum punya order</div>
      ) : (
        <div className="">
          {orders.map((order, index) => (
            <div key={order.id}>
              <h1>{order.id}</h1>
              {/* {order.order_items?.slice(0, 2).map((item, index) => ( */}
              <div>
                <h2></h2>
                <h2></h2>
                <h2>price</h2>
              </div>
              {/* ))} */}

              <h2>{order.status}</h2>
              <h2>{order.payment_method}</h2>
              <h1>{order.total_amount}</h1>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
