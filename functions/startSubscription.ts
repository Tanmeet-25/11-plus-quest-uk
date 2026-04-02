// 11+ Quest - Start subscription with 30-day free trial
import Stripe from "npm:stripe@14";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });

const H = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async function handler(req: Request) {
  if (req.method === "OPTIONS") return new Response(null, { headers: H });
  try {
    const { userId, email } = await req.json().catch(() => ({}));
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: "price_1THtd9BdOOgIWZNFFb3Fpr6W", quantity: 1 }],
      subscription_data: { trial_period_days: 30, metadata: { userId: userId || "" } },
      customer_email: email || undefined,
      success_url: "https://11-quest-uk.base44.app/Home?subscribed=true",
      cancel_url: "https://11-quest-uk.base44.app/Home?cancelled=true",
      metadata: { userId: userId || "" },
    });
    return new Response(JSON.stringify({ url: session.url }), { headers: H });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: H });
  }
}
