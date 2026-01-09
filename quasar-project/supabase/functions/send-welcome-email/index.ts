import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { record } = await req.json();
    const email = record.email;
    // Use full_name from public.profiles
    const name = record.full_name || "Student";
    const role = record.role || "Student";

    if (!RESEND_API_KEY) {
      console.error("No RESEND_API_KEY found");
      return new Response(JSON.stringify({ error: "Missing Resend API Key" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "OnlineClass <admin@onlineclass.edu.lk>", 
        to: [email],
        subject: "Welcome to OnlineClass!",
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #121212;
                    color: #ffffff;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #1e1e1e;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
                }
                .header {
                    background: linear-gradient(135deg, #FFD700 0%, #FF8C00 100%);
                    padding: 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    color: #000;
                    font-size: 28px;
                    font-weight: 800;
                }
                .content {
                    padding: 40px;
                    text-align: center;
                }
                .welcome-text {
                    font-size: 20px;
                    margin-bottom: 20px;
                    color: #E0E0E0;
                }
                .role-badge {
                    display: inline-block;
                    background-color: rgba(255, 215, 0, 0.15);
                    color: #FFD700;
                    padding: 8px 16px;
                    border-radius: 50px;
                    font-weight: 600;
                    margin-bottom: 30px;
                    text-transform: capitalize;
                    border: 1px solid rgba(255, 215, 0, 0.3);
                }
                .button {
                    display: inline-block;
                    background: linear-gradient(90deg, #FFD700 0%, #FF8C00 100%);
                    color: #000000;
                    padding: 14px 32px;
                    border-radius: 50px;
                    text-decoration: none;
                    font-weight: bold;
                    font-size: 16px;
                    margin-top: 20px;
                    transition: all 0.3s ease;
                }
                .footer {
                    background-color: #121212;
                    padding: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                    border-top: 1px solid #333;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>OnlineClass</h1>
                </div>
                <div class="content">
                    <h2 style="color: #fff; margin-bottom: 10px;">Registration Successful!</h2>
                    <p class="welcome-text">Hi ${name}, welcome to the future of learning.</p>
                    
                    <div class="role-badge">
                        Registered as ${role}
                    </div>
                    
                    <p style="color: #bbb; line-height: 1.6; margin-bottom: 30px;">
                        Your account has been successfully created. You can now access your dashboard, 
                        explore courses, and start your journey with us.
                    </p>
                    
                    <a href="https://onlineclass.edu.lk/login" class="button">Go to Dashboard</a>
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} OnlineClass.edu.lk. All rights reserved.
                </div>
            </div>
        </body>
        </html>
        `,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

serve(handler);
