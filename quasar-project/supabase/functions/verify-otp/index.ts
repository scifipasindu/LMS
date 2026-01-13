import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";
import { crypto } from "std/crypto/mod.ts";
import { encode } from "std/encoding/hex.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function hashPin(pin: string): Promise<string> {
  const message = new TextEncoder().encode(pin);
  const hash = await crypto.subtle.digest("SHA-256", message);
  return new TextDecoder().decode(encode(new Uint8Array(hash)));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Auth Check
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { code, action } = await req.json();

    if (!code) throw new Error("Code is required");

    // 2. Fetch Stored Hash
    const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('verification_hash, verification_expires')
        .eq('id', user.id)
        .single();
    
    if (fetchError || !profile) throw new Error("Could not fetch profile verification data");

    // 3. Check Expiry
    if (!profile.verification_expires || new Date() > new Date(profile.verification_expires)) {
        throw new Error("Verification code has expired");
    }

    // 4. Check Hash
    const inputHash = await hashPin(code);
    if (inputHash !== profile.verification_hash) {
        throw new Error("Invalid Verification Code");
    }

    // 5. Success Actions
    const updates: any = {
        verification_hash: null, // Consume code
        verification_expires: null
    };

    if (action === 'login') {
        updates.last_verification_date = new Date().toISOString();
    }

    await supabase.from('profiles').update(updates).eq('id', user.id);

    return new Response(JSON.stringify({ success: true, message: "Verified Successfully" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
