"use server";

import { redirect } from "next/navigation";
import { backendFetch } from "@/lib/server/backend";
import { clearSession, getSession, setSession } from "@/lib/server/session";

const NETWORK_ERROR = "Tidak dapat menghubungi server. Coba lagi nanti.";
const GMAIL_ONLY = "Gunakan alamat Gmail, contoh: nama@gmail.com.";

// BE menyimpan email dalam huruf kecil; disamakan di sini supaya pesan dan
// nilai yang dikembalikan ke form konsisten.
const normalizeEmail = (value) => String(value ?? "").trim().toLowerCase();
const isGmail = (email) => /^[^\s@]+@gmail\.com$/.test(email);

async function authRequest(path, payload, messagesByStatus = {}) {
  let response;
  try {
    response = await backendFetch(path, { method: "POST", body: JSON.stringify(payload) });
  } catch {
    return { ok: false, message: NETWORK_ERROR };
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return {
      ok: false,
      message: messagesByStatus[response.status] ?? data?.message ?? `Error ${response.status}`,
      fieldErrors: data?.errors ?? {},
    };
  }
  return { ok: true, data };
}

export async function login(_prevState, formData) {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const values = { email };

  if (!email || !password) {
    return { message: "Email dan kata sandi wajib diisi.", values };
  }

  const result = await authRequest(
    "/auth/login",
    { email, password },
    { 401: "Email atau kata sandi salah." },
  );
  if (!result.ok) return { ...result, values };

  await setSession(result.data);
  redirect("/homepage");
}

export async function register(_prevState, formData) {
  const values = {
    username: String(formData.get("username") ?? "").trim(),
    email: normalizeEmail(formData.get("email")),
    dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
  };
  const password = String(formData.get("password") ?? "");

  if (!isGmail(values.email)) {
    return { fieldErrors: { email: [GMAIL_ONLY] }, values };
  }

  const result = await authRequest(
    "/auth/register",
    { ...values, password, dateOfBirth: values.dateOfBirth || undefined },
    { 409: "Email atau username sudah terdaftar." },
  );
  if (!result.ok) return { ...result, values };

  // BE langsung memberi token saat register, jadi user tidak perlu login lagi.
  await setSession(result.data);
  redirect("/homepage");
}

export async function logout() {
  const { refreshToken } = await getSession();

  if (refreshToken) {
    try {
      await backendFetch("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Cookie tetap dihapus walau BE gagal dihubungi; sesinya kedaluwarsa sendiri.
    }
  }

  await clearSession();
  redirect("/");
}
