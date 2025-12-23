"use client";

import { error } from "console";
import { supabase } from "./supabaseClient";

type apiOPtions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE as string;

if (!API_BASE) {
  throw new Error("Missing NEXT_PUBLIC_API_BASE from env variable");
}

export async function apiFetch<T = any>(
  path: string,
  options: apiOPtions = {}
): Promise<T> {
  const { method = "GET", body } = options;

  {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;

    const headers: Record<string, string> = {
      Content_Type: "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const result = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const json: unknown = await result.json().catch(() => null);

    // let fileJSon;

    // try {
    //   fileJSon = await result.json();
    // } catch {
    //   fileJSon = null;
    // }

    if (!result.ok) {
      // throw new Error(fileJSon.Error || result.statusText);
      if (json && typeof json === "object" && "error" in json) {
        throw new Error();
      }
      throw new Error();
    }

    return json as T;
  }
}
