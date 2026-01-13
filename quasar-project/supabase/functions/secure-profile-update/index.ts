
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

serve(async (req) => {
    // CORS Headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Setup Supabase Clients
        // Admin user for privileged updates
        const supabaseAdmin = createClient(
            SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // User client for verifying the caller
        const authHeader = req.headers.get('Authorization')!
        const supabaseClient = createClient(
            SUPABASE_URL,
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        // 2. Auth Check: Who is calling?
        const { data: { user: requester }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !requester) throw new Error('Unauthorized')

        // 3. Parse Request
        const { id, email, password, full_name, role } = await req.json()

        if (!id) throw new Error('Target User ID is required')

        // 4. Permission Check: Self-Update or Admin
        let isAllowed = false;
        if (requester.id === id) {
            isAllowed = true; // Self-update
        } else {
             // Check if requester is admin
             const { data: requesterProfile } = await supabaseAdmin.from('profiles').select('role').eq('id', requester.id).single()
             if (requesterProfile?.role === 'admin') isAllowed = true;
        }

        if (!isAllowed) {
            return new Response(JSON.stringify({ error: 'Unauthorized: You can only update your own profile.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 403,
            })
        }

        // 5. Get Current User Data (For email notification target)
        const { data: { user: currentUserData }, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(id)
        if (fetchError || !currentUserData) throw new Error('User not found')

        const oldEmail = currentUserData.email;

        // 6. Prepare Updates
        const authUpdates: any = {}
        const changes: string[] = []

        if (email && email !== oldEmail) {
            authUpdates.email = email
            authUpdates.email_confirm = true // BYPASS VERIFICATION LINK
            changes.push(`Email changed from ${oldEmail} to ${email}`)
        }
        if (password) {
            authUpdates.password = password
            changes.push('Password updated')
        }
        
        // 7. Execute Auth Updates
        if (Object.keys(authUpdates).length > 0) {
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(id, authUpdates)
            if (updateError) throw updateError
        }

        // 8. Execute Profile Updates
        const profileUpdates: any = {}
        if (full_name) profileUpdates.full_name = full_name
        if (role && requester.id !== id) profileUpdates.role = role // Only admins can change roles for others, ignore for self? 
        // Actually, let's strictly control role updates. 
        // If self-update, do NOT allow role change unless you are already admin? 
        // For now, let's assume the frontend protects this, but backend should too.
        // We will skip role update here if self-update to be safe, unless explicit logic added.
        // But the prompt was about email/password. Let's stick to that.
        
        if (email) profileUpdates.email = email // Sync email to profile

        if (Object.keys(profileUpdates).length > 0) {
             const { error: profError } = await supabaseAdmin.from('profiles').update(profileUpdates).eq('id', id)
             if (profError) throw profError
        }

        // 9. Send Security Notice Email
        if (changes.length > 0 && RESEND_API_KEY && oldEmail) {
            console.log(`Sending security notice to ${oldEmail} for changes: ${changes.join(', ')}`);
            
            await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                    from: "OnlineClass Security <security@janiru.online>", 
                    to: [oldEmail], 
                    subject: "Security Notice: Account Details Updated",
                    html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #d32f2f;">Security Alert</h2>
                        <p>Hello,</p>
                        <p>Review the following changes made to your OnlineClass account just now:</p>
                        <ul>
                            ${changes.map(c => `<li><strong>${c}</strong></li>`).join('')}
                        </ul>
                        <p>If you made these changes, you can safely ignore this email.</p>
                        <p style="margin-top: 20px; font-weight: bold;">If you did NOT make this change, please contact support immediately to lock your account.</p>
                        <hr>
                        <p style="font-size: 12px; color: #777;">This is an automated security notice.</p>
                    </div>
                    `
                }),
            });
        }

        return new Response(JSON.stringify({ message: 'Profile updated successfully', changes }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error("Update Error:", errorMessage)
        return new Response(JSON.stringify({ error: errorMessage }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
