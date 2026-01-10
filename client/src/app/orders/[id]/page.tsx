"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/src/lib/apiClient";

type OrderItems = {
  price: number;
  quantity: number;
  products: {
    name: string;
  } | null;
};

type OrderDetail = {
  id: string;
  total_amount: number;
  status: string;
  payment_method: string | null;
  created_at: string;
  order_items: OrderItems[];
};

export default function OrderID() {
  const [orders, setOrders] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const params = useParams();

  const orderId = Array.isArray(params.id)
    ? params.id[0]
    : (params.id as string) || undefined;

  useEffect(() => {
    if (!orderId) return;
    const loadOrder = async () => {
      setLoading(true);
      try {
        const data = await apiFetch<OrderDetail>(`/order/${orderId}`);
        setOrders(data);
        console.log(data, "ini dari order id");
      } catch (err) {
        console.log(err);
      }
    };
    loadOrder();
  }, [orderId]);

  return (
    <div>
      <div>ini order id</div>
    </div>
  );
}
