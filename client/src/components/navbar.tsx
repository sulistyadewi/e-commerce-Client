"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import { useRouter } from "next/navigation";

type userInfo = {
  email: string;
  role: string;
};

export default function Navbar() {
  const [user, setUser] = useState<userInfo | null>();
  const router = useRouter;

  const handleLogout = () => {
    supabase.auth.signOut;
    router.push("/login");
  };

  return (
    <div>
      <div className="w-full h-14 bg-emerald-600 flex justify-between px-5 items-center-safe">
        <div>
          <h1>Store</h1>
        </div>
        <div className="flex gap-5">
          <div className="flex flex-col">
            <h2>Email</h2>
            <h2>Role</h2>
          </div>
          <button onClick={handleLogout} className="bg-red-500 px-2 rounded-lg">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
