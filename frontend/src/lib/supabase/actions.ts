"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("email")) {
      return { field: "email" as const, error: error.message };
    }
    if (msg.includes("password")) {
      return { field: "password" as const, error: error.message };
    }
    return { field: "general" as const, error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const secret = formData.get("secret") as string;

  if (secret !== process.env.SIGNUP_SECRET) {
    return { field: "secret" as const, error: "Invalid signup secret." };
  }

  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirm-password") as string;

  if (password !== confirmPassword) {
    return { field: "password" as const, error: "Passwords do not match." };
  }

  if (password.length < 8) {
    return {
      field: "password" as const,
      error: "Password must be at least 8 characters long.",
    };
  }

  const data = {
    email: formData.get("email") as string,
    password,
    options: {
      data: {
        full_name: formData.get("name") as string,
      },
    },
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    // Map common Supabase errors to the relevant field
    const msg = error.message.toLowerCase();
    if (msg.includes("email")) {
      return { field: "email" as const, error: error.message };
    }
    if (msg.includes("password")) {
      return { field: "password" as const, error: error.message };
    }
    return { field: "general" as const, error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
