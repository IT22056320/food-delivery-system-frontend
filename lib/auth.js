"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function logout() {
  cookies().delete("token");
  return redirect("/login");
}

export { logout };
