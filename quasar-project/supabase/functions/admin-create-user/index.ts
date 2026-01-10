
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
        const { email, full_name, role } = await req.json()

        if (!email || !role) {
            throw new Error('Missing required fields')
        }

        // 3. Invite User (Sends Email automatically)
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            data: { full_name, role }
        })

        if (createError) throw createError

        // 4. Update Profile (Explicitly ensure role is set)
        if (newUser.user) {
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .upsert({
                    id: newUser.user.id,
                    full_name: full_name,
                    role: role,
                    email: email
                })

            if (profileError) {
                console.error('Profile creation failed', profileError)
            }
        }

        return new Response(JSON.stringify({ user: newUser.user, message: 'User invited successfully' }), {
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
