// 11+ Quest - Start subscription with 30-day free trial v3
import Stripe from "npm:stripe@14";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });

const HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default async function handler(req: Request) {
  if (req.method === "OPTIONS") return new Response(null, { headers: HEADERS });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: HEADERS });

  try {
    const body = await req.json().catch(() => ({}));
    const { userId = "", email = "" } = body;

    const sessionParams: any = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: "price_1THtd9BdOOgIWZNFFb3Fpr6W", quantity: 1 }],
      subscription_data: {
        trial_period_days: 30,
        metadata: { userId },
      },
      allow_promotion_codes: true,
      success_url: "https://11-quest-uk.base44.app/Home?subscribed=true",
      cancel_url: "https://11-quest-uk.base44.app/Home?cancelled=true",
      metadata: { userId },
    };

    if (email) sessionParams.customer_email = email;

    const session = await stripe.checkout.sessions.create(sessionParams);
    console.log("Checkout session created:", session.id, "for user:", userId);

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), { headers: HEADERS });
  } catch (err: any) {
    console.error("Stripe checkout error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: HEADERS });
  }
}
