// Setup via: https://supabase.com/docs/guides/functions
import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";
import { crypto } from "std/crypto/mod.ts";
import { encode } from "std/encoding/hex.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper for hashing
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

    // 1. Get User from JWT (Auth Guard)
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action } = await req.json();

    // 2. Generate 6-digit code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await hashPin(otp);
    
    // Expiry: 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // 3. Save to Profiles
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        verification_hash: otpHash,
        verification_expires: expiresAt
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    // 4. Send Email
    if (!RESEND_API_KEY) {
      console.log(`[DEV MODE] OTP for ${user.email}: ${otp}`); // Fallback for local dev
      return new Response(JSON.stringify({ message: "OTP Sent (Dev Mode)", dev_code: otp }), { // Remove dev_code in prod
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "OnlineClass Security <security@janiru.online>", 
          to: [user.email],
          subject: "Your Verification Code - OnlineClass",
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
                <h2 style="color: #7b2cbf; text-align: center;">Verification Required</h2>
                <p>Hello,</p>
                <p>You requested a verification code for: <strong>${action || 'Account Action'}</strong></p>
                <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 5px; font-weight: bold; border-radius: 8px; margin: 20px 0;">
                    ${otp}
                </div>
                <p style="color: #666; font-size: 12px;">This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
            </div>
          `
        }),
      });
  
      if (!res.ok) {
          const data = await res.json();
          throw new Error(`Resend Error: ${JSON.stringify(data)}`);
      }

    return new Response(JSON.stringify({ message: "OTP Sent Successfully" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
