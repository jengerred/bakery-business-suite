/* -------------------------------------------------------
   💳 Stripe Checkout Redirect API Route
   This route creates a Stripe Checkout Session using
   Stripe’s *hosted payment page*.

   ⭐ WHY THIS IS USEFUL
   - Great for testing your Stripe connection quickly
   - Lets you confirm your API keys, webhooks, and account
   - Useful BEFORE building your own custom card form
   - Helps isolate Stripe issues from UI issues

   In our POS, we now use Stripe Elements + PaymentIntents
   for manual card entry — but this route is still helpful
   for debugging or verifying Stripe setup.
------------------------------------------------------- */

import Stripe from "stripe";
import { NextResponse } from "next/server";

/* -------------------------------------------------------
   🔐 Initialize Stripe with Secret Key
------------------------------------------------------- */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/* -------------------------------------------------------
   📨 POST /api/create-checkout-session
   Expects: { amount: number } in cents
   Returns: { url } → Stripe-hosted checkout page
------------------------------------------------------- */
export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    /* ------------------------------
       💳 Create Checkout Session
       This uses Stripe's hosted UI instead of your own form.
    ------------------------------ */
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "POS Order" },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: "http://localhost/pos?success=true",
      cancel_url: "http://localhost/pos?canceled=true",
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Checkout error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
