"use client";
import { supabase } from "@/src/lib/supabaseClient";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert("Ada error");
      return;
    }

    router.push("/products");
  };

  return (
    <div className="h-screen">
      {/* <div className="bg-blue-300 max-w-lg flex flex-col items-center justify-center ">
        testing
      </div> */}
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="font-semibold text-3xl">Login</h1>
        <form
          onSubmit={handleLogin}
          className="bg-slate-200 p-6 rounded-lg shadow-lg w-80 mt-8"
        >
          <div className="flex flex-col">
            <label
              htmlFor=""
              className="text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-500 rounded bg-slate-300"
            />
          </div>
          <div className="flex flex-col mt-3">
            <label
              htmlFor=""
              className="text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-500 rounded bg-slate-300"
            />
          </div>
          <div className="mt-4">
            <button
              type="submit"
              className="w-full bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500 transition-colors"
            >
              {loading ? "Processing..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
