import { createClient } from "@supabase/supabase-js";
import { isPlaceholderSecret, readServerEnv } from "../server/env";

export class SupabaseAdminConfigError extends Error {
  readonly missingEnv: string[];

  constructor(missingEnv: string[]) {
    super(
      "注册服务缺少 Supabase 管理密钥。请在 Netlify 当前站点配置 SUPABASE_SERVICE_ROLE_KEY。",
    );
    this.name = "SupabaseAdminConfigError";
    this.missingEnv = missingEnv;
  }
}

export function createSupabaseAdminClient() {
  const supabaseUrl =
    readServerEnv("SUPABASE_URL") || readServerEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = readServerEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (
    !supabaseUrl ||
    !serviceRoleKey ||
    isPlaceholderSecret(serviceRoleKey)
  ) {
    throw new SupabaseAdminConfigError(
      [
        !supabaseUrl ? "SUPABASE_URL" : "",
        !serviceRoleKey || isPlaceholderSecret(serviceRoleKey)
          ? "SUPABASE_SERVICE_ROLE_KEY"
          : "",
      ].filter(Boolean),
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createSupabaseServerClient() {
  const supabaseUrl =
    readServerEnv("SUPABASE_URL") || readServerEnv("NEXT_PUBLIC_SUPABASE_URL");
  const publishableKey =
    readServerEnv("SUPABASE_PUBLISHABLE_KEY") ||
    readServerEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  if (!supabaseUrl || !publishableKey) {
    throw new Error("Supabase server environment variables are missing.");
  }

  return createClient(supabaseUrl, publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
