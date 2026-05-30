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
          <h1 className="">Store</h1>
        </div>
        <div className="flex gap-8">
          <div className="flex gap-3 items-center font-semibold text-emerald-50 ">
            <Link
              href={"/products"}
              className="hover:underline hover:text-emerald-200"
            >
              Products
            </Link>
            <Link
              href={"/carts"}
              className="hover:underline hover:text-emerald-200"
            >
              Cart
            </Link>
            <Link
              href={"/admin/products"}
              className="hover:underline hover:text-emerald-200"
            >
              Admin
            </Link>
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
