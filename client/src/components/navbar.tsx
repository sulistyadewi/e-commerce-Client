"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

type userInfo = {
  email: string;
  role: string;
};

export default function Navbar() {
  const [user, setUser] = useState<userInfo | null>();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        setUser({
          email: data.user.email ?? "",
          role: data.user.user_metadata?.role ?? "customer",
        });
      }
    };
    getUser();
  }, []);

  const handleLogout = () => {
    supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div>
      <div className="w-full h-14 bg-emerald-600 flex justify-between px-5 items-center-safe">
        <div>
          <h1>Store</h1>
        </div>
        <div className="flex gap-5">
          <div className="flex gap-3">
            <Link href={"/products"}>Products</Link>
            <Link href={"/carts"}>Cart</Link>
          </div>
          <div className="flex flex-col">
            <h2 className="text-white text-sm">{user?.email}</h2>
            <h2 className="text-white text-sm text-right capitalize">
              {user?.role}
            </h2>
          </div>
          <button onClick={handleLogout} className="bg-red-500 px-2 rounded-lg">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
