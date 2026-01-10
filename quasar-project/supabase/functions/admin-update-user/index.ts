
import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
    // CORS Headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Create Supabase Client (Admin Context)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // Create Supabase Client (User Context for Auth Check)
        const authHeader = req.headers.get('Authorization')!
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        // 1. Check if requester is Admin
        const { data: { user: requestUser }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !requestUser) throw new Error('Unauthorized')

        // Fetch requester profile role
        const { data: requesterProfile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', requestUser.id)
            .single()

        if (requesterProfile?.role !== 'admin') {
            return new Response(JSON.stringify({ error: 'Unauthorized: Admins only' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 403,
            })
        }

        // 2. Parse Input
        const { id, email, password, full_name, role } = await req.json()

        if (!id) {
            throw new Error('User ID is required')
        }

        // 3. Update Auth User (Email/Password)
        const authUpdates: {
            email?: string;
            password?: string;
            user_metadata?: { full_name?: string; role?: string };
        } = {}
        if (email) authUpdates.email = email
        if (password) {
            console.log(`Updating password for user ${id} (Length: ${password.length})`)
            authUpdates.password = password
        }
        // Sync metadata if needed
        if (full_name || role) {
            authUpdates.user_metadata = { full_name, role }
        }

        if (Object.keys(authUpdates).length > 0) {
            const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, authUpdates)
            if (authError) throw authError
        }

        // 4. Update Profile
        const profileUpdates: Record<string, string> = {}
        if (full_name) profileUpdates.full_name = full_name
        if (role) profileUpdates.role = role
        // Note: 'email' is in profiles now? Yes, we added it.
        if (email) profileUpdates.email = email

        if (Object.keys(profileUpdates).length > 0) {
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .update(profileUpdates)
                .eq('id', id)

            if (profileError) throw profileError
        }

        return new Response(JSON.stringify({ message: 'User updated successfully' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        return new Response(JSON.stringify({ error: errorMessage }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
