import { serve } from "std/http/server.ts";

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
        from: "OnlineClass <admin@janiru.online>", 
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
                    background-color: #f4f4f4;
                    color: #333333;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
                    border: 1px solid #eaeaea;
                }
                .header {
                    background-color: #ffffff;
                    padding: 40px 20px 20px 20px;
                    text-align: center;
                    border-bottom: 3px solid #7b2cbf;
                }
                .logo {
                    width: 180px;
                    height: auto;
                    margin-bottom: 10px;
                }
                .header h1 {
                    display: none; /* Logo contains text usually, or remove this line to show text below logo */
                }
                .content {
                    padding: 40px;
                    text-align: center;
                    background-color: #ffffff;
                }
                .welcome-text {
                    font-size: 20px;
                    margin-bottom: 20px;
                    color: #4a4a4a;
                    font-weight: 500;
                }
                h2 {
                    color: #7b2cbf;
                    margin-bottom: 15px;
                    font-size: 24px;
                }
                .role-badge {
                    display: inline-block;
                    background-color: #ffffff;
                    color: #8e24aa;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    margin-bottom: 30px;
                    text-transform: capitalize;
                    border: 1px solid #8e24aa;
                    font-size: 14px;
                }
                .button {
                    display: inline-block;
                    background-color: #8e24aa;
                    color: #ffffff;
                    padding: 14px 40px;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: bold;
                    font-size: 16px;
                    margin-top: 20px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 6px rgba(142, 36, 170, 0.2);
                    border: none;
                }
                .button:hover {
                    background-color: #7b1fa2;
                    box-shadow: 0 6px 15px rgba(142, 36, 170, 0.3);
                    transform: translateY(-2px);
                }
                .footer {
                    background-color: #fafafa;
                    padding: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #888;
                    border-top: 1px solid #eaeaea;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="https://janiru.online/icons/logo-purple.png" alt="OnlineClass" class="logo">
                </div>
                <div class="content">
                    <h2>Registration Successful!</h2>
                    <p class="welcome-text">Hi ${name}, welcome to the future of learning.</p>
                    
                    <div class="role-badge">
                        Registered as ${role}
                    </div>
                    
                    <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
                        Your account has been successfully approved by our administrators. <br>
                        You can now access your dashboard, explore courses, and start learning.
                    </p>
                    
                    <a href="https://janiru.online/login" class="button">Go to Dashboard</a>
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
    console.log("Resend Response:", JSON.stringify(data));
    
    if (!res.ok) {
        console.error("Resend Error:", data);
        return new Response(JSON.stringify(data), { status: res.status, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

serve(handler);
